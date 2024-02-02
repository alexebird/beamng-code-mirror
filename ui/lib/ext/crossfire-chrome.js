const navigableElements =
  "[bng-nav-item],[ng-click],[href],[bng-all-clicks],[bng-all-clicks-no-nav]," +
  "[ui-sref],input,textarea,button,md-option,md-slider,md-select,md-checkbox";

// use bng-no-nav="true" to disable elements from navigation

/// Gamepad scroll (GE-3992)
// To allow something to scroll, add to that element "bng-nav-scroll" attribute.
// To enforce scroll on a non-parent element, add the "bng-nav-scroll-force" attribute to a target element. Multiple elements with this attribute can co-exist at once, but only the first scrollable will be scrolled.
// They both can be safely defined on a single element.
// To dynamically enable/disable scrolling, use bng-nav-scroll="false" (on both normal and forced).
/// Behaviour notes:
// - When there's nothing to scroll in an element, it does not catch the bindings.
// - If an element can't be scrolled, it tries to search for another one (inc. areas with "bng-nav-scroll-force" attr).
// - When focused inside an element with "bng-nav-scroll" attr and it has something to scroll, it is prioritised over an element with "bng-nav-scroll-force".
const navigableScroll = "bng-nav-scroll"; // attribute name that allows scrolling with a right thumbstick
const navigableScrollForce = "bng-nav-scroll-force"; // attribute name that enforces scrolling in that area regardless of what focused but respecting the focused navigableScroll


function getNavigateableElements(root=null) {
  let res = Array.from((root || document.body).querySelectorAll(navigableElements))
    .filter(elem => {
      let noNav = elem.attributes.getNamedItem("bng-no-nav");
      return !noNav || noNav.value !== "true";
    });
  //console.log('getNavigateableElements', res);
  return res;
}

function isNavigatable(elm) {
  if (elm.classList.contains("menu-navigation"))
    return true;
  const parent = elm.parentNode;
  if (!parent)
    return false;
  const children = getNavigateableElements(parent);
  for (let child of children)
    if (child === elm)
      return true;
  return false;
}

function uncollectRects() {
  const ns = getNavigateableElements();
  for (let node of ns) {
    node.classList.remove("menu-navigation");
  }
}

function collectRects(direction) {
  const links = {};
  if (direction) {
    links[direction] = [];
  } else {
    links.up    = [];
    links.down  = [];
    links.left  = [];
    links.right = [];
  }
  const ns = getNavigateableElements();
  for (let node of ns) {
    // prevent invisible navigation
    if (!isAvailable(node)) {
      node.classList.remove("menu-navigation");
      continue;
    }
    const rect = node.getBoundingClientRect(); // TODO: cache these (read=all of these DOM calls, as they force a reflow=expensive), as they are super expensive
    // prevent offscreen navigation
    if (rect.right < 0 || rect.bottom < 0 || rect.left > screen.width || rect.top > screen.height) {
      node.classList.remove("menu-navigation");
      continue;
    }
    node.classList.add("menu-navigation");
    node.tabIndex = 0; // make element focusable
    const lnk = { dom: node, rect };
    if (links.up)    links.up.push(lnk);
    if (links.down)  links.down.push(lnk);
    if (links.left)  links.left.push(lnk);
    if (links.right) links.right.push(lnk);
  }
  if (links.up)    links.up.sort((a,b)    => a.rect.top    - b.rect.top   );
  if (links.down)  links.down.sort((a,b)  => a.rect.botton - b.rect.bottom);
  if (links.left)  links.left.sort((a,b)  => a.rect.left   - b.rect.left  );
  if (links.right) links.right.sort((a,b) => a.rect.right  - b.rect.right );
  //console.log(links);
  return links;
}

function isVisibleFast(node) {
  return node.offsetWidth > 0 && node.offsetHeight > 0;
}

function isVisible(node, _style=null) {
  let tmp = node;
  if (!_style)
    _style = document.defaultView.getComputedStyle(tmp, null);
  while (tmp.tagName !== "HTML") {
    if (!tmp.isConnected || tmp.nodeType !== Node.ELEMENT_NODE)
      return false;
    _style = document.defaultView.getComputedStyle(tmp, null);
    if (_style.display === "none" || _style.visibility === "hidden" || _style.opacity === "0")
      return false;
    tmp = tmp.parentNode;
  }
  return true;
}

function isAvailable(node) {
  if (!isVisibleFast(node))
    return false;
  const style = document.defaultView.getComputedStyle(node, null);
  if (style["pointer-events"] === "none")
    return false;
  if (!isVisible(node, style))
    return false;
  const rects = node.getClientRects();
  for (let rect of rects) {
    if (!isOccluded(node, rect))
      return true;
  }
  return false;
}

function isOccluded(element, r, dontIgnoreOffscreen) {
  // returns true only when element is on viewport AND other HTML element is occluding it on screen (preventing user from seeing/clicking it)
  // "dontIgnoreOffscreen" - if we should not assume it's visible (not occluded) when offscreen
  const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
  const topElement = document.elementFromPoint(x, y);
  if (!topElement) // outside viewport
    return !!dontIgnoreOffscreen;
  let tmp = topElement;
  while (tmp.tagName !== "HTML") { // check if we clicked on our desired element, or any of its ancestors
    if (tmp == element)
      return false;
    if (tmp.tagName === "MD-TOOLTIP") // nasty tooltips...
      return false;
    tmp = tmp.parentNode;
  }
  return true;
}

function isTarget(curr, goal, direction) {
  let dx = Math.min(goal.right, curr.right) - Math.max(goal.left, curr.left);
  let dy = Math.min(goal.bottom, curr.bottom) - Math.max(goal.top, curr.top);

  if (dx === goal.right - goal.left)
    dx = curr.right - goal.left;
  if (dy === goal.bottom - goal.top)
    dy = curr.bottom - goal.top;

  if (direction === "down" && goal.bottom > curr.bottom)
    return Math.max(0, goal.bottom - curr.top) - dx;
  else if (direction === "up" && goal.top < curr.top)
    return Math.max(0, curr.top - goal.bottom) - dx;
  else if (direction === "right" && goal.right > curr.right)
    return Math.max(0, goal.left - curr.right) - dy;
  else if (direction === "left" && goal.left < curr.left)
    return Math.max(0, curr.left - goal.right) - dy;

  return Infinity;
}

function navigate(links, direction) {
  if(links[direction])
    navigateNext(links[direction], direction);
}

function navigateNext(links, direction) {
  const active = document.activeElement;
  if (active.nodeName === "BODY") {
    setTimeout(() => {
      //locate first button (closest to topleft corner), and set its focus
      let firstLink = null;
      let firstElementDistance = Number.MAX_SAFE_INTEGER;
      for (let link of links) {
        const distance = link.rect.top  * link.rect.top
                       + link.rect.left * link.rect.left;
        if (distance > firstElementDistance)
          continue;
        firstElementDistance = distance;
        firstLink = link;
      }
      if (!firstLink) {
        console.log("Couldn't locate any button anywhere. Menu navigation won't work");
        return;
      }
      // console.log("Focusing on a first button:", firstLink);
      firstLink.dom.focus();
      scrollFix(firstLink, direction);
    }, 0);
    return;
  }

  //If a list item has arrow elements navigate to those with left and right
  // if (active.nodeName === "MD-LIST-ITEM" && (direction === "left" || direction === "right")) {
    // for (let i = 0; i < links.length; i += 1) {
      // if (active.contains( links[i].dom )) {
        // if (direction === "left" && links[i].dom.classList.contains("left")) {
          // links[i].dom.focus();
          // scrollFix(links[i], direction);
          // return;
        // } else if (direction === "right" && links[i].dom.classList.contains("right")) {
          // links[i].dom.focus();
          // scrollFix(links[i], direction);
          // return;
        // }
      // }
    // }
  // }

  if (
    (active.nodeName === "MD-SLIDER" && (direction === "left" || direction === "right")) ||
    (active.nodeName === "MD-OPTION" && (direction === "up" || direction === "down")) ||
    (active.nodeName === "INPUT" && active.type === "range" && (direction === "left" || direction === "right"))
  ) return fireKey(active, direction);

  let activeRect = active.getBoundingClientRect();
  let fixScroll = true;

  if (isScrolling(direction) && isOccluded(active, activeRect, true)) {
    // changes nav behaviour for occluded elements if we're scrolling with gamepad
    if (direction === "up" || direction === "down") {
      const bounds = navScrolling.vertical.area.bounds;
      const isAbove = activeRect.bottom < bounds[0];
      activeRect = {
        left: activeRect.left,
        right: activeRect.right,
      };
      activeRect.top = activeRect.bottom = bounds[isAbove ? 0 : 1];
    } else { // left/right
      const bounds = navScrolling.horizontal.area.bounds;
      const isAbove = activeRect.right < bounds[0];
      activeRect = {
        top: activeRect.top,
        bottom: activeRect.bottom,
      };
      activeRect.left = activeRect.right = bounds[isAbove ? 0 : 1];
    }
    fixScroll = false;
  }

  const dir = direction === "right" || direction === "down" ? 1 : -1;
  const len = links.length;
  const start = dir === 1 ? 0 : len - 1;
  let minDistance = Infinity;
  let nearestLink = null;
  for (let i = start; 0 <= i && i < len; i += dir) {
    if (links[i].dom === active) // don't navigate to current element again
      continue;
    const distance = isTarget(activeRect, links[i].rect, direction);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLink = links[i];
    }
  }
  if (nearestLink) {
    // console.log("Focussing on a button:", nearestLink);
    nearestLink.dom.focus();
    if (fixScroll)
      scrollFix(nearestLink, direction);
  }
}

const navScrollingController = true; // enable/disable right thumbstick catch (see menu.json action map)
const navScrolling = { // runtime variables, compatible with crossfire's "link" object
  running: false,
  listening: { vertical: false, horizontal: false },
  dom: null,
  rect: null,
  vertical: { active: false, amount: 0, area: null },
  horizontal: { active: false, amount: 0, area: null },
  hint: { show: false },
};
function drawScrollHint() {
  const show = isScrolling();
  if (navScrolling.hint.show === show)
    return;
  navScrolling.hint.show = show;
  let elm = document.getElementById("xf_scroll"); // not caching just in case
  if (elm)
    elm.style.display = show ? "" : "none";
}
// this function is called on thumbstick event
function navigateScroll(axis, amount) {
  // navScrolling[axis].active = Math.abs(amount) > 0.2;
  // if (!navScrolling[axis].active) {
  //   navScrolling[axis].area = null;
  //   return;
  // }
  if (axis === "vertical")
    amount = -amount;
  navScrolling[axis].amount = amount * 15;
  if (Math.abs(navScrolling[axis].amount) < 1) {
    navScrolling[axis].active = false;
    return;
  }
  navScrolling[axis].active = true;
  const dom = document.activeElement;
  if (navScrolling.dom !== dom) {
    navScrolling.dom = dom;
    navScrolling.rect = dom.getBoundingClientRect();
    navScrolling[axis === "horizontal" ? "vertical" : "horizontal"].active = false;
  }
  const area = findScrollable(navScrolling, axis, true);
  navScrolling[axis].area = area;
  if (!area) {
    navScrolling[axis].active = false;
    return;
  }
  if (navScrolling.running)
    return;
  window.requestAnimationFrame(function scrl() {
    let set = {};
    for (let axis of ["vertical", "horizontal"]) {
      const cur = navScrolling[axis];
      if (!cur.active || !cur.area)
        continue;
      let pos = cur.area.parent[cur.area.readby] + navScrolling[axis].amount;
      if (pos > cur.area.fullsize)
        cur.active = false;
      else
        set[cur.area.moveby] = pos;
    }
    navScrolling.running = Object.keys(set).length > 0;
    if (navScrolling.running) {
      area.parent.scrollTo({ ...set, behavior: "instant" });
      document.dispatchEvent(new CustomEvent("mdtooltiphide")); // to hide opened tooltips (see angular-material.js)
      window.requestAnimationFrame(scrl);
    }
  });
}
function scrollCatch(axis, enable) {
  if (navScrolling.listening[axis] === enable)
    return;
  // console.log(`want to ${enable ? "enable" : "disable"} ${axis} scroll catch...`);
  const cur = isScrolling();
  navScrolling.listening[axis] = enable;
  if (cur === isScrolling())
    return;
  // this will hook the events to UI only, preventing the camera from moving
  bngApi.engineLua(`local o = scenetree.findObject("MenuScrollActionMap"); if o then o:${enable ? "push" : "pop"}() end`);
  // console.log(`scroll catch ${enable ? "enabled" : "disabled"} (called by ${axis} scroll event)`);
}
function isScrolling(direction) {
  let scrolling = false;
  if (!direction)
    scrolling = navScrolling.listening.horizontal || navScrolling.listening.vertical;
  else if (direction === "up" || direction === "down")
    scrolling = navScrolling.listening.vertical;
  else if (direction === "left" || direction === "right")
    scrolling = navScrolling.listening.horizontal;
  return scrolling;
}

function findScrollable(link, axis, thumbstick) { // default axis is vertical
  if (axis !== "vertical" && axis !== "horizontal")
    axis = "vertical";
  const opts = axis === "horizontal" ?
    { moveby: "left", readby: "scrollLeft", size: "width", scroll: "scrollWidth", client: "clientWidth", overflow: "overflow-x" } :
    { moveby: "top", readby: "scrollTop", size: "height", scroll: "scrollHeight", client: "clientHeight", overflow: "overflow-y" };
  let forced = false;
  // find scrollable parent
  let parent, fullsize, size;
  let node = link.dom.parentNode;
  function setParent(node) {
    if (!node)
      return;
    if (thumbstick) {
      let noNav = node.attributes.getNamedItem(navigableScroll);
      if (noNav && noNav.value === "false")
        return;
    }
    const styles = document.defaultView.getComputedStyle(node, null);
    // console.log(styles.position, node, node.getBoundingClientRect());
    if (styles[opts.overflow] === "auto" || styles[opts.overflow] === "scroll") {
      fullsize = node[opts.scroll];
      size = node[opts.client];
      // console.log(fullsize, size, node);
      if (fullsize > size)
        parent = node;
    }
  }
  while (node.isConnected && node.nodeType === Node.ELEMENT_NODE) {
    if (!thumbstick || node.attributes.hasOwnProperty(navigableScroll)) {
      setParent(node);
      if (parent)
        break;
    }
    node = node.parentNode;
  }
  if (!parent) {
    const elms = document.querySelectorAll(`[${navigableScrollForce}]`);
    for (let elm of elms) {
      setParent(elm);
      if (parent) {
        forced = true;
        break;
      }
    }
  }
  scrollCatch(axis, !!parent);
  drawScrollHint();
  if (!parent)
    return null;
  let start = 0;
  const styles = document.defaultView.getComputedStyle(parent, null);
  if (["relative", "absolute", "static"].includes(styles.position))
    start += parent.getBoundingClientRect()[opts.moveby];
  // calculate the size of view bounds to ensure items visibility
  const pad = Math.max(size / 4, link.rect[opts.size]);
  const bounds = [start + pad, start + size - pad];
  /// DEBUG
  // const id = `xfline_dbg`;
  // let elm = document.getElementById(id);
  // if (!elm) {
  //   elm = document.createElement("div");
  //   elm.setAttribute("id", id);
  //   elm.style.position = "absolute";
  //   elm.style.pointerEvents = "none";
  //   elm.style.zIndex = 1000000;
  //   document.body.appendChild(elm);
  // }
  // if (axis === "horizontal") {
  //   elm.style.top = elm.style.bottom = 0;
  //   elm.style.left = `${parent.style.left + bounds[0]}px`;
  //   elm.style.width = `${bounds[1] - bounds[0]}px`;
  // } else {
  //   elm.style.left = elm.style.right = 0;
  //   elm.style.top = `${parent.style.top + bounds[0]}px`;
  //   elm.style.height = `${bounds[1] - bounds[0]}px`;
  // }
  // elm.style[axis === "horizontal" ? "borderLeft" : "borderTop"] =
  //   elm.style[axis === "horizontal" ? "borderRight" : "borderBottom"] =
  //   "2px dashed magenta";
  /// /DEBUG
  return {
    parent,
    moveby: opts.moveby,
    readby: opts.readby,
    bounds,
    fullsize,
    start: 0,
    finish: fullsize - size,
    forced
  };
}

// scrolls the items into a narrower view
function scrollFix(link, direction) {
  const area = findScrollable(link, direction === "up" || direction === "down" ? "vertical" : "horizontal");
  if (!area) {
    // find if there are something else for thumbstick scroll
    if (document.querySelector(`[${navigableScroll}], [${navigableScrollForce}]`))
      findScrollable(link, direction === "left" || direction === "right" ? "vertical" : "horizontal");
    return;
  }
  if (area.forced) // prevent scrolling forced area with focus on a different element
    return;
  let mov = -1;
  if (direction === "up" || direction === "down") {
    if (link.rect.top < area.bounds[0])
      mov = Math.max(area.parent.scrollTop - area.bounds[0] + link.rect.top, area.start);
    else if (link.rect.bottom > area.bounds[1])
      mov = Math.min(area.parent.scrollTop - area.bounds[1] + link.rect.bottom, area.finish);
  } else {
    if (link.rect.left < area.bounds[0])
      mov = Math.max(area.parent.scrollLeft - area.bounds[0] + link.rect.left, area.start);
    else if (link.rect.right > area.bounds[1])
      mov = Math.min(area.parent.scrollLeft - area.bounds[1] + link.rect.right, area.finish);
  }
  // console.log(JSON.stringify({direction, /*fullheight, height, top, pad,*/ scrolled: area.parent.scrollTop, area.bounds, l_top: link.rect.top, l_bottom: link.rect.bottom, movy}, null, 2));
  if (mov > -1)
    area.parent.scrollTo({ [area.moveby]: mov, behavior: "instant" }); // smooth|instant
}

function fireKey(element, direction) {
  let key = null;
  switch (direction) {
    case "left":  key = 37; break;
    case "up":    key = 38; break;
    case "right": key = 39; break;
    case "down":  key = 40; break;
    default:               return;
  }
  element.dispatchKey(key);
}
