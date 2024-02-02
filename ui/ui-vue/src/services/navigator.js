// Navigation screens related code

export class bngNavigator {

  // default options
  opts = {
    // elements or their selector
    root: null,
    container: null,
    bootscreen: null,
    north: null,
    clock: null,
    // colours
    backgroundRgb: [50, 50, 50], // background colour
    roadColors: ["#FFFFFFFF", "#A6A678FF", "#A67854FF"], // from most driveable to least
    routeColor: "#3388EEFF", // default route colour if not specified in data
    markerColor: "#2C5CFF", // POI
    // additional renderers
    routes: false, // enable routes rendering
    markers: false, // enable POI rendering
    vehicles: false, // enable vehicles rendering
    // vehicle marker svg definition id
    vehicleMarker: null,
    cameraColor: "#FD6A00", // player shape colour
    vehicleColor: "#A3D39C", // other vehicles colour
    // view
    rotate: true, // should the map rotate with vehicle turn
    // scale, sizes
    scale: 1.0, // base scale
    pitch: 0, // base pitch in deg
    offsetX: 128, // center offset in px
    offsetY: 64, // center offset in px
    resolution: 4096,
    // speed effects
    speedZoom: false, // enables zoom-out effect with speed
    speedOffset: 0, // moves the viewpoint down with speed
    speedPitch: true, // adds a perspective effect with speed (note: "rotate" must be turned on)
    // for how much speed should affect the scale
    speedZoomIncrements: 1,
    speedZoomMultiplier: 2,
    speedZoomMax: 200, // max perspective effect
    speedZoomEffect: 0.15, // strength of zoom effect
    // misc
    hideBootscreen: false, // FIXME: is this really needed? this was used in cherrier dash only
  };

  elms = {
    root: document,
  };

  mapScale = 1;
  startup = true;
  startupFallback = true;

  layers = {};
  layersLoadOrder = [
    bngNavLayerMap,
    bngNavLayerRoute,
    bngNavLayerMarkers,
    bngNavLayerVehicles,
    bngNavLayerElements,
    bngNavLayerBootscreen,
  ];

  // override options if provided
  setOptions(options) {
    if (typeof options !== "object" || Array.isArray(options))
      return;
    for (let key in this.opts) {
      if (options.hasOwnProperty(key))
        this.opts[key] = options[key];
    }
    // apply to layers
    for (const name in this.layers) {
      const layer = this.layers[name];
      if (typeof layer.setOptions === "function")
        layer.setOptions(this.opts);
    }
  }

  constructor(options) {
    this.setOptions(options);

    // elements
    const elmseq = [
      // main
      "root", // must go first
      "container", // map container, where svg lives
      // elements layer
      "clock",
      "north",
      // bootscreen layer
      "bootscreen",
    ];
    // resolve elements
    for (let key of elmseq) {
      let elm;
      if (typeof this.opts[key] === "string")
        elm = this.elms.root.querySelector(this.opts[key]);
      else if (this.opts[key])
        elm = this.opts[key];
      if (elm && (elm instanceof HTMLElement || elm instanceof SVGElement))
        this.elms[key] = elm;
    }
    if (!this.elms.root)
      throw new Error("Cannot find map root element");
    if (!this.elms.container)
      throw new Error("Cannot find map container element");

    // add svg element
    this.elms.svg = new bngNavSVG(this.elms.container.children[0]);

    // load subsystems
    for (const cls of this.layersLoadOrder) {
      const elms = cls.name === "map" ? this.elms : {
        ...this.elms, cvs: this.layers.map.cvs, routes: [
          this.layers.map.rwrapper,
          this.layers.map.rcanvas,
          this.layers.map.rcanvasCtx,
        ],
      };
      if (cls.canInit(elms, this.opts)) {
        const dim = cls.name === "map" ? this.mapScale : this.layers.map.dimensions;
        const layer = new cls(elms, this.opts, dim);
        if (layer && layer.name)
          this.layers[layer.name] = layer;
      }
    }
    this.layersLoadOrder = null;
    // console.log("Layers loaded: " + Object.keys(this.layers).join(", "));

    // expose methods
    const expose = (layer, method, name = null) => {
      // if layer is not defined, empty procedure will take its place
      // but the method itself must exist, no need to add a check for that
      this[name || method] = layer ? layer[method].bind(layer) : () => { };
    };
    expose(this.layers.map, "setRotation");
    expose(this.layers.map, "setLocation");
    expose(this.layers.map, "setZoom");
    expose(this.layers.map, "setScale");
    expose(this.layers.map, "setSpeed");
    expose(this.layers.map, "setOpacity");
    expose(this.layers.route, "update", "setRoute");
    expose(this.layers.markers, "update", "setMarkers");
    expose(this.layers.bootscreen, "setImage", "setBootscreenImage");

    /// methods expected by dash:
    //   updateData
    //   setData
    //   setRotation
    //   setLocation
    //   setBootscreenImage
    // see \lua\ge\extensions\ui\uiNavi.lua
    // and \lua\vehicle\controller\beamNavigator.lua
    // (may be more files involved)
  }

  update(data) {
    if (data)
      this.setup(data);
    this.layers.map.update();
    if (this.layers.elements)
      this.layers.elements.update(this.layers.map.state);
    this.layers.map.render();
  }

  setup(data) {
    // lua fix
    if (typeof data.terrainTiles === "object" && !Array.isArray(data.terrainTiles)) {
      data.terrainTiles = [];
    }
    // setMapSize attempts to set map size variables (dimensions)
    if (this.layers.map.setMapSize(data) && this.startupFallback) {
      // got terrain size
      this.startupFallback = false;
      this.startup = true;
    } else if (!this.startup) {
      // no terrain size, default was set
      this.startupFallback = true;
    }
    if (this.startup) { // if it's the first time, setup the map
      this.startup = false;
      // set map size
      this.layers.map.applyMapSize(); // takes dimensions from current instance (set above)
      // render the map
      this.layers.map.renderMap(data);
    }
  }

  setData(data) {
    if (!data || Object.keys(data).length === 0) {
      console.log("Received empty map data");
      return;
    }
    if (this.layers.vehicles)
      this.layers.vehicles.update(data);
    this.update(data);
    if (this.opts.hideBootscreen && this.layers.bootscreen)
      this.layers.bootscreen.hide();
  }

  updateData(data) {
    if (typeof data !== "object")
      return;
    if (data.hasOwnProperty("x") && data.hasOwnProperty("y"))
      this.layers.map.setLocation(data.x, data.y, false);
    if (data.hasOwnProperty("rotation"))
      this.layers.map.setRotation(data.rotation, false);
    if (data.hasOwnProperty("speed"))
      this.layers.map.setSpeed(data.speed, false); // new
    // if (data.hasOwnProperty("zoom"))
    //     this.layers.map.setZoom(data.zoom, false); // old
    // if (data.hasOwnProperty("time"))
    //     this.layers.map.setTime(data.time); // unused
    if (data.hasOwnProperty("ignitionLevel") && this.layers.bootscreen)
      this.layers.bootscreen.toggle(data.ignitionLevel < 2);
    this.update();
  }
}


class bngNavUtils {
  // truncate decimals
  static truncDec(num, dec = 2) {
    const d = 10 ** dec;
    return ~~(num * d) / d;
  }
  // set styles in bulk
  static setStyle(node, style) {
    for (let name in style)
      node.style[name] = style[name];
  }
}


class bngNavSVG {
  ns = {
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink",
  };
  root;
  constructor(root) {
    if (!root || !root.tagName || root.tagName.toLowerCase() !== "svg")
      throw new Error("Cannot access svg in a container");
    this.root = root;
  }
  setViewBox(viewBox) {
    this.root.setAttributeNS(null, "viewBox", viewBox);
  }
  // createNode(tag)
  // createNode(tag, parent)
  // createNode(tag, attrs)
  // createNode(tag, attrs, parent)
  createNode(tag, ...args) {
    let [attrs, parent] = args;
    if (!parent) {
      if (attrs && attrs instanceof SVGElement) {
        // in case of createNode(tag, parent)
        parent = attrs;
        attrs = null;
      } else {
        parent = this.root;
      }
    }
    const node = document.createElementNS(this.ns.svg, tag);
    if (attrs)
      this.setAttrs(node, attrs);
    parent.appendChild(node);
    return node;
  }
  removeNode(node) {
    if (node && node.parentNode)
      node.parentNode.removeChild(node);
  }
  setAttrs(node, attrs) {
    for (let name in attrs) {
      const ns = name.startsWith("xlink:") ? this.ns.xlink : null;
      node.setAttributeNS(ns, name, attrs[name]);
    }
  }
  clearNode(node) { // clears the contents of that node
    let elm;
    while (elm = node.children[0])
      node.removeChild(elm);
  }
  setStyle = bngNavUtils.setStyle;
  createCanvas(resolution) {
    const fo = this.createNode("foreignObject");
    this.setStyle(fo, {
      position: "absolute",
      x: "0",
      y: "0",
      width: "100%",
      height: "100%",
    });
    const cvs = document.createElement("canvas");
    cvs.width = resolution;
    cvs.height = resolution;
    fo.appendChild(cvs);
    return [fo, cvs, cvs.getContext("2d")];
  }
}


class bngNavLayerMap {
  static name = "map";

  dimensions = {
    ver: 0, // increases on center/size change
    offset: 512, // border offsets
    scale: 1,
    centerX: 1024,
    centerY: 1024,
    width: 2048,
    height: 2048,
  };

  state = {
    x: 0,
    y: 0,
    speed: 0,
    scale: 1,
    zoom: 1,
    speedZoom: 0,
    rotation: 0,
    focusX: 0,
    focusY: 0,
    offsetX: 0,
    offsetY: 0,
    // time: 0, // unused
  };

  // for sizing
  container;
  svg;
  // main canvas
  wrapper;
  canvas;
  canvasCtx;
  rwrapper;
  rcanvas;
  rcanvasCtx;
  cvs;
  // render sources
  renders = [];
  // offscreen canvas data
  rendered = {
    terrainCvs: null,
    terrainCtx: null,
    roadsCvs: null,
    roadsCtx: null,
  };
  terrainOpacity = 1.0;
  // grid under map
  gridGap = 50;
  gridColour = "#cccccccc"; // #ffffff55

  // options
  roadColors;
  resolution = 2048;
  offsetX;
  offsetY;
  rotate;
  speedZoom;
  scale;
  pitch;
  speedPitch;
  speedOffset;
  speedZoom;
  speedZoomIncrements;
  speedZoomMultiplier;
  speedZoomMax;
  speedZoomEffect;

  static canInit(elms, opts) {
    return true;
  }

  constructor({ container, svg }, opts, mapScale) {
    this.name = this.constructor.name;
    this.container = container;
    this.svg = svg;

    // canvases
    [ // terrain and roads
      this.wrapper,
      this.canvas,
      this.canvasCtx,
    ] = svg.createCanvas(opts.resolution);
    [ // routes
      this.rwrapper,
      this.rcanvas,
      this.rcanvasCtx,
    ] = svg.createCanvas(opts.resolution);

    // static offscreen canvases
    const that = this;
    this.rendered.terrainCvs = window.OffscreenCanvas ? new window.OffscreenCanvas(1, 1) : document.createElement("canvas");
    this.rendered.terrainCtx = this.rendered.terrainCvs.getContext("2d");
    this.addRenderSource({
      passive: true,
      source: this.rendered.terrainCvs,
      get alpha() { return that.terrainOpacity; },
    });
    this.rendered.roadsCvs = window.OffscreenCanvas ? new window.OffscreenCanvas(1, 1) : document.createElement("canvas");
    this.rendered.roadsCtx = this.rendered.roadsCvs.getContext("2d");
    this.addRenderSource({
      passive: true,
      source: this.rendered.roadsCvs,
    });

    // options
    this.dimensions.scale = mapScale;
    this.setOptions(opts);
    this.setOpacity(1.0);
  }

  setOptions(opts) {
    this.bgRgb = opts.backgroundRgb.join(", ");
    this.roadColors = opts.roadColors;
    this.resolution = opts.resolution;
    this.offsetX = opts.offsetX;
    this.offsetY = opts.offsetY;
    this.rotate = opts.rotate;
    this.scale = opts.scale;
    this.state.scale = this.scale * this.state.zoom;
    this.pitch = opts.pitch;
    this.speedPitch = opts.speedPitch;
    this.speedOffset = opts.speedOffset;
    this.speedZoom = opts.speedZoom;
    this.speedZoomIncrements = opts.speedZoomIncrements;
    this.speedZoomMultiplier = opts.speedZoomMultiplier;
    this.speedZoomMax = opts.speedZoomMax;
    this.speedZoomEffect = opts.speedZoomEffect;
  }

  setLocation(x, y, doupdate=true) {
    this.state.x = -x;
    this.state.y = y;
    this.state.focusX = ~~(this.state.x / this.dimensions.scale);
    this.state.focusY = ~~(this.state.y / this.dimensions.scale);
    this.state.offsetX = this.dimensions.centerX - this.state.focusX;
    this.state.offsetY = this.dimensions.centerY - this.state.focusY;
    this.container.style.transformOrigin = `${this.state.offsetX}px ${this.state.offsetY}px`;
    // if (doupdate)
    //     this.update();
  }

  setRotation(rotation, doupdate=true) {
    this.state.rotation = bngNavUtils.truncDec(rotation, 3) % 360;
    if (doupdate)
      this.update();
  }

  setZoom(zoom, doupdate=true) {
    /// see \lua\vehicle\controller\beamNavigator.lua - zoom is in range of 150..250
    let fixed = (zoom - 150) * 2; // 0..200
    this.setSpeed(fixed);
    // if (doupdate)
    //     this.update();
  }

  // setTime(time, doupdate=true) {
  //     this.state.time = time; // unused
  //     // if (doupdate)
  //     //     this.update();
  // }

  setScale(zoom, doupdate=true) { // sets real zoom level, relative to scale set in options
    this.state.zoom = zoom; // in case scale in options would change
    this.state.scale = this.scale * zoom;
    // if (doupdate)
    //     this.update();
  }

  setSpeed(speed) {
    this.state.speed = bngNavUtils.truncDec(speed, 3);
    if (this.state.speed === 0) {
      this.state.speedZoom = 0;
    } else {
      this.state.speedZoom = bngNavUtils.truncDec(
        (Math.min(1 + this.state.speed * 3.6 * 1.5, this.speedZoomMax) / this.speedZoomIncrements)
        * this.speedZoomIncrements / this.speedZoomMax,
        3
      );
    }
  }

  setOpacity(opacity) {
    this.canvas.style.backgroundColor = `rgba(${this.bgRgb}, ${opacity})`;
    this.terrainOpacity = opacity;
  }

  setMapSize(data) {
    // setup viewbox
    let res;
    if (data.terrainTiles && data.terrainTiles[0] && data.terrainTiles[0].size) {
      // squareSize might vary in rare cases but the terrain resolution is still locked to tile size so it doesn't really matter
      // const terrainSizeX = Math.min(data.terrainSize[0] / Math.min(data.squareSize, 1) / this.dimensions.scale, this.resolution / 2);
      // const terrainSizeY = Math.min(data.terrainSize[1] / Math.min(data.squareSize, 1) / this.dimensions.scale, this.resolution / 2);
      this.setMapDimensions(data);
      res = true;
    } else if (this.dimensions.ver === 0) {
      this.setMapDimensions(data);
      res = false;
    }
    // this.setMapDimensions(data);
    return res;
  }

  setMapDimensions(data) {
    // figure out dimensions of the road network
    const poss = [];
    const tiles = data.terrainTiles || [];
    for (const tile of tiles) {
      poss.push(
        // offset is for top left corner
        [tile.offset[0], -tile.offset[1]],
        [tile.offset[0] + tile.size[0], -tile.offset[1] + tile.size[1]],
      );
    }
    for (const key in data.nodes) {
      poss.push(
        [data.nodes[key].pos[0], -data.nodes[key].pos[1]]
      );
    }
    let minX = Infinity, maxX = -Infinity,
      minY = Infinity, maxY = -Infinity;
    for (const pos of poss) {
      pos[0] = pos[0] / this.dimensions.scale;
      pos[1] = pos[1] / this.dimensions.scale;
      if (pos[0] < minX) minX = pos[0];
      if (pos[0] > maxX) maxX = pos[0];
      if (pos[1] < minY) minY = pos[1];
      if (pos[1] > maxY) maxY = pos[1];
    }
    const dim = {
      centerX: -minX,
      centerY: -minY,
      width: -minX + maxX,
      height: -minY + maxY,
    };
    if (dim.centerX < 0 || dim.centerY < 0) {
      if (isFinite(dim.centerX) || isFinite(dim.centerY))
        console.error("Navigator: Invalid center point detected.");
      // default values
      dim.centerX = this.resolution / 2;
      dim.centerY = this.resolution / 2;
      dim.width = this.resolution;
      dim.height = this.resolution;
    }
    if (this.dimensions.offset > 0) {
      const off = this.dimensions.offset;
      // let off = ~~(dim.width * this.dimensions.offset);
      dim.centerX += off;
      dim.width += off * 2;
      // off = ~~(dim.height * this.dimensions.offset);
      dim.centerY += off;
      dim.height += off * 2;
    }
    for (let key in dim)
      dim[key] = Math.round(dim[key]);
    // console.log({ ...dim, minX, maxX, minY, maxY });
    let changed = false;
    for (let key in dim) {
      if (this.dimensions[key] !== dim[key]) {
        this.dimensions[key] = dim[key];
        changed = true;
      }
    }
    if (changed)
      this.dimensions.ver++;
  }

  applyMapSize() {
    // set container size
    this.container.style.width = this.dimensions.width + "px";
    this.container.style.height = this.dimensions.height + "px";
    // set svg size
    this.svg.setViewBox(`0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    // set canvas size
    const width = this.dimensions.width;
    const height = this.dimensions.height;
    this.canvas.style.width = this.wrapper.style.width = width + "px";
    this.canvas.style.height = this.wrapper.style.height = height + "px";
    this.canvas.width = width;
    this.canvas.height = height;
    // clear everything
    this.rendered.terrainCtx.clearRect(0, 0, this.rendered.terrainCvs.width, this.rendered.terrainCvs.height);
    this.rendered.terrainCvs.width = width;
    this.rendered.terrainCvs.height = height;
    this.rendered.roadsCtx.clearRect(0, 0, this.rendered.roadsCvs.width, this.rendered.roadsCvs.height);
    this.rendered.roadsCvs.width = width;
    this.rendered.roadsCvs.height = height;
  }

  addRenderSource(source) {
    /* {
      source: <img/canvas/etc>, - source
      [passive: <bool>,]        - render occurs only when other changes are detected (or when forced)
      [region: <region>,]       - region object by which we detect if there are changes (and where)
      [render: <function>,]     - render function to call (always called before draw)
      [alpha: <float>,]         - layer transparency 0..1
      [pos: <pos>,]             - layer position (overrides region-provided sizes)
      // pos = [<dx>, <dy>]
      // pos = [<dx>, <dy>, <dw>, <dh>]
      // pos = [<sx>, <sy>, <sw>, <sh>, <dx>, <dy>, <dw>, <dh>]
      // d* - dest, s* - source
    } */
    if (typeof source !== "object" && !("source" in source))
      return console.error(`Navigator: Render source is invalid`);
    // if (!source.passive && !("region" in source))
    //   console.warn(`Navigator: Active render source should expose its region for better performance`);
    this.renders.push(source);
  }

  render(passive=false) {
    if (!passive)
      return;
    const ctx = this.canvasCtx,
      full = [0, 0, this.dimensions.width, this.dimensions.height];
    ctx.clearRect(...full);
    for (const src of this.renders) {
      if (!!src.passive !== passive)
        continue;
      if (src.source.width === 0 || src.source.height === 0)
        continue;
      let region = src.region;
      if (src.render) {
        const res = src.render();
        if (typeof res === "object" && "empty" in res) {
          region = {
            full: res,
            fullArray: [res.x1, res.y1, res.x2 - res.x1, res.y2 - res.y1],
          };
        }
      }
      let pos = src.pos;
      if (!pos) {
        if (region && !region.full.empty)
          pos = region.fullArray;
        else
          pos = full;
        pos = [...pos, ...pos];
      }
      if (src.alpha)
        ctx.globalAlpha = src.alpha;
      ctx.drawImage(src.source, ...pos);
      ctx.globalAlpha = 1.0;
    }
  }

  renderMap(data) { // runs once on startup (must be ran after applyMapSize)

    // this.state.scale = 0.1; // for debug

    // draw terrain
    // it has its own render call because it's async
    this.drawTerrain(data, this.rendered.terrainCtx);

    // temp fix for borked drivability values in lua
    for (const key in data.nodes) {
      const el = data.nodes[key];
      if (!el.links)
        continue;
      for (const key2 in el.links) {
        el.links[key2].drivability = Math.round(el.links[key2].drivability * 10) / 10;
      }
    }

    /// draw roads
    this.drawRoads(data.nodes, 0, 0.1, this.roadColors[2], this.rendered.roadsCtx);
    this.drawRoads(data.nodes, 0.1, 0.9, this.roadColors[1], this.rendered.roadsCtx);
    this.drawRoads(data.nodes, 0.9, 1, this.roadColors[0], this.rendered.roadsCtx);
    this.render(true);
  }

  drawTerrain(data, ctx) {
    /// draw grid
    for (let x = this.gridGap; x < this.dimensions.width; x += this.gridGap) {
      this.createLine(ctx,
        { x, y: 0, radius: 1 },
        { x, y: this.dimensions.height, radius: 1 },
        this.gridColour
      );
    }
    for (let y = this.gridGap; y < this.dimensions.height; y += this.gridGap) {
      this.createLine(ctx,
        { y, x: 0, radius: 1 },
        { y, x: this.dimensions.width, radius: 1 },
        this.gridColour
      );
    }
    // this.render(true); // (optional) renders a grid moments before tiles appearing
    /// draw terrain
    const tiles = data.terrainTiles || [];
    let loading = 0;
    for (let tile of tiles) {
      if (!tile.file || !tile.offset || !tile.size)
        continue;
      if (!tile.file.startsWith("/"))
        tile.file = "/" + tile.file;
      loading++;
      const img = new Image();
      const dest = [
        tile.offset[0] / this.dimensions.scale,
        -tile.offset[1] / this.dimensions.scale,
        tile.size[0] / this.dimensions.scale,
        tile.size[1] / this.dimensions.scale,
      ];
      dest[0] += this.dimensions.centerX;
      dest[1] += this.dimensions.centerY;
      img.addEventListener("load", () => {
        // console.log(tile.file.replace(/^.+?([^/]+)$/, "$1"), img.width, img.height, ...dest);
        ctx.clearRect(...dest);
        ctx.drawImage(img, 0, 0, img.width, img.height, ...dest);
        /// red dot on a tile center
        // ctx.beginPath();
        // ctx.fillStyle = "rgba(255,0,0, 1.0)";
        // ctx.arc(dest[0] + dest[2] / 2, dest[1] + dest[3] / 2, 50, Math.PI * 2, 0, false);
        // ctx.fill();
        loading--;
        if (loading === 0) {
          // ctx.scale(-1, -1);
          this.render(true);
        }
      });
      img.addEventListener("error", () => {
        console.error(`Navigator: Unable to load tile "${tile.file}"`);
        loading--;
        if (loading === 0) {
          // ctx.scale(-1, -1);
          this.render(true);
        }
      });
      img.src = tile.file;
    }
  }

  createLine(ctx, p1, p2, color) {
    if (Math.abs(p1.radius - p2.radius) > 0.2) {
      // draw trapezoids if the radii are not the same
      this.varLine(ctx, p1.x, p1.y, p2.x, p2.y, p1.radius, p2.radius, color);
    } else {
      ctx.beginPath();
      ctx.lineWidth = Math.max(p1.radius, p2.radius);
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // License: CC BY 4.0
  // https://stackoverflow.com/questions/29377748/draw-a-line-with-two-different-sized-ends/29379772
  varLine(ctx, x1, y1, x2, y2, w1, w2, color) {
    let dx = x2 - x1
    let dy = y2 - y1
    // length of the AB vector
    let length = dx * dx + dy * dy
    if (length == 0) return // exit if zero length
    length = Math.sqrt(length)
    w1 *= 0.5
    w2 *= 0.5

    dx /= length
    dy /= length
    let shiftx = -dy * w1 // compute AA1 vector's x
    let shifty = dx * w1 // compute AA1 vector's y
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(x1 + shiftx, y1 + shifty)
    ctx.lineTo(x1 - shiftx, y1 - shifty) // draw A1A2
    shiftx = -dy * w2 // compute BB1 vector's x
    shifty = dx * w2 // compute BB1 vector's y
    ctx.lineTo(x2 - shiftx, y2 - shifty) // draw A2B1
    ctx.lineTo(x2 + shiftx, y2 + shifty) // draw B1B2
    ctx.closePath() // draw B2A1

    ctx.arc(x1, y1, w1, 0, 2 * Math.PI)
    ctx.arc(x2, y2, w2, 0, 2 * Math.PI)

    ctx.fill()
  }

  drawRoads(nodes, drivabilityMin, drivabilityMax, colour, ctx) {
    for (const key in nodes) {
      const el = nodes[key];
      if (!el.links)
        continue;
      // walk the links of the node
      for (const key2 in el.links) {
        const drivability = el.links[key2].drivability;
        if (drivability < drivabilityMin || drivability > drivabilityMax)
          continue;
        const el2 = nodes[key2];
        this.createLine(ctx,
          {
            x: el.pos[0] / this.dimensions.scale + this.dimensions.centerX,
            y: -el.pos[1] / this.dimensions.scale + this.dimensions.centerY,
            radius: Math.min(Math.max(el.radius, 0), 5) * 3, // prevents massive blobs due to waypoints having larger radius
          },
          {
            x: el2.pos[0] / this.dimensions.scale + this.dimensions.centerX,
            y: -el2.pos[1] / this.dimensions.scale + this.dimensions.centerY,
            radius: Math.min(Math.max(el2.radius, 0), 5) * 3,
          },
          colour
        );
      }
    }
  }

  update() {
    const pos = {
      x: -this.state.offsetX + this.offsetX,
      y: -this.state.offsetY + this.offsetY,
    };
    const rot = { x: 0, z: 0 };

    if (this.speedOffset > 0)
      pos.y += this.state.speedZoom * this.speedOffset;

    if (this.rotate) {
      rot.x = this.pitch;
      if (this.speedPitch > 0) {
        // in orig dash code it goes in 65..68 deg range
        // rot.x = this.state.speedZoom * this.speedZoomMax / 7.5;
        rot.x += this.speedPitch * this.state.speedZoom;
      }
      rot.z = this.state.rotation;
    }

    let scale = this.state.scale;
    if (this.speedZoom) // speed tied zoom
      scale -= this.state.speedZoom * 0.1;

    // scale = 0.05;
    // if (this.state.speed < 4) // debug
    //     return;
    // console.log(this.scale, this.state.speedZoom, scale, pos, rot);
    // console.log(`${this.scale}, ${this.state.speedZoom}, ${scale}, ${pos.x}:${pos.y}:${pos.z}, ${rot.x}:${rot.z}`);

    this.container.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0px) rotateX(${rot.x}deg) rotateZ(${(rot.z)}deg) scale(${scale})`;
  }
}


class bngNavLayerRoute {
  static name = "route";

  dimensions;
  scale = 1 / 3;
  lineWidth = 10;
  color;

  wrapper;
  canvas;
  canvasCtx;

  current = null;

  static canInit(elms, opts) {
    return !!opts.routes;
  }

  constructor({ routes }, opts, dimensions) {
    this.name = this.constructor.name;
    [
      this.wrapper,
      this.canvas,
      this.canvasCtx,
    ] = routes || svg.createCanvas(opts.resolution);
    this.dimensions = dimensions;
    this.setOptions(opts);
  }

  setOptions(opts) {
    this.color = opts.routeColor;
  }

  update(data) {
    if (this.dimver !== this.dimensions.ver) {
      this.dimver = this.dimensions.ver;
      const width = this.dimensions.width;
      const height = this.dimensions.height;
      this.canvas.style.width = this.wrapper.style.width = width + "px";
      this.canvas.style.height = this.wrapper.style.height = height + "px";
      this.canvas.width = this.canvasCtx.width = width * this.scale;
      this.canvas.height = this.canvasCtx.height = height * this.scale;
    }

    //clear canvas if no data or not markers
    if (!data || !data.markers) {
      this.clear();
      return;
    }
    if (!this.current) {
      // if no previous markers, redraw the whole route
      this.clear();
      if (data)
        this.drawFreshRoute(data);
    } else {
      // otherwise, check previous markers for same-ness of end, and only erase the beginning that changed
      // erase anything from old markers until we reach
      this.optimiseAndDrawRoute(data, this.current);
    }
    this.current = data.markers;
  }

  clear() {
    this.current = null;
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasCtx.stroke();
  }

  drawFreshRoute(data) {
    this.drawRoute({
      color: data.color,
      lineWidth: this.lineWidth,
      lineCap: "butt",
      markers: data.markers,
      startIndex: 0,
      drawFromIndex: 2,
      drawToIndex: data.markers.length
    });
  }

  optimiseAndDrawRoute(data, prevMarkers) {
    let markers = data.markers;
    let ci = markers.length - 2,
      pi = prevMarkers.length - 2;
    while (pi >= 0 && ci >= 0) {
      if (markers[ci] !== prevMarkers[pi] || markers[ci + 1] !== prevMarkers[pi + 1])
        break;
      ci -= 2;
      pi -= 2;
    }
    if (ci >= 0 || pi >= 0) {
      // we know the common postfix
      // first, un-draw all the stuff from prevMarkers
      this.canvasCtx.globalCompositeOperation = "destination-out";
      this.drawRoute({
        color: data.color,
        lineWidth: this.lineWidth + 2,
        markers: prevMarkers,
        drawToIndex: Math.min(pi + 4, prevMarkers.length)
      });
      // next, draw all the previx stuff form current markers
      this.canvasCtx.globalCompositeOperation = "source-over";
      this.drawRoute({
        color: data.color,
        lineWidth: this.lineWidth,
        markers: data.markers,
        drawToIndex: Math.min(ci + 6, data.markers.length)
      });
    }
  }

  drawRoute({ color, lineWidth, lineCap = "round", markers, startIndex = 0, drawFromIndex = 0, drawToIndex }) {
    const mapFac = this.scale / this.dimensions.scale;
    const cx = this.dimensions.centerX * mapFac,
      cy = this.dimensions.centerY * mapFac;
    this.canvasCtx.beginPath();
    this.canvasCtx.strokeStyle = color || this.color;
    this.canvasCtx.lineWidth = lineWidth * this.scale;
    this.canvasCtx.lineCap = lineCap;
    this.canvasCtx.moveTo(
      markers[startIndex] * mapFac + cx,
      -markers[startIndex + 1] * mapFac + cy
    );
    for (let i = drawFromIndex; i < drawToIndex; i += 2) {
      this.canvasCtx.lineTo(
        markers[i] * mapFac + cx,
        -markers[i + 1] * mapFac + cy
      );
    }
    this.canvasCtx.stroke();
  }
};


class bngNavLayerVehicles {
  static name = "vehicles";

  dimensions;
  dimver = -1;
  vehicles = {};
  borderColor = "#FFFFFF";
  pointSize = 10;
  borderSize = 3;
  vehicleMarkerSize = 48;
  vehicleMarker;
  vehicleMarkerColor = "#FF6600"; // fallback
  cameraColor;
  vehicleColor;

  static canInit(elms, opts) {
    return !!elms.svg && !!opts.vehicles && !!opts.vehicleMarker;
  }

  constructor({ svg }, opts, dimensions) {
    this.name = this.constructor.name;
    this.dimensions = dimensions;
    this.svg = svg;
    this.group = this.svg.createNode("g");
    this.setOptions(opts);
  }

  setOptions(opts) {
    this.vehicleMarker = opts.vehicleMarker;
    this.cameraColor = opts.cameraColor;
    this.vehicleColor = opts.vehicleColor;
  }

  updatePlayerShape(opts) {
    let changed = true;
    if (opts.type === "circle")
      opts.rot = 0;
    if (this.vehicles[opts.id]) {
      changed = false;
      let create = false;
      for (const key of ["type", "size", "colour"]) {
        if (this.vehicles[opts.id][key] !== opts[key]) {
          this.svg.removeNode(this.vehicles[opts.id].elm);
          create = true;
          changed = true;
          break;
        }
      }
      if (!create)
        opts.elm = this.vehicles[opts.id].elm;
      if (!changed) {
        for (const key of ["rot", "scale"]) {
          if (this.vehicles[opts.id][key] !== opts[key]) {
            changed = true;
            break;
          }
        }
        changed = changed || (opts.pos[0] !== this.vehicles[opts.id][0] && opts.pos[1] !== this.vehicles[opts.id][1]);
        if (!changed)
          return;
      }
    }
    const attrs = {
      transform: `translate(${opts.pos[0]}, ${opts.pos[1]}) scale(${opts.scale}, ${opts.scale}) rotate(${opts.rot})`,
    };
    switch (opts.type) {
      case "circle":
        if (!opts.elm) {
          opts.elm = this.svg.createNode("circle", {
            cx: 0,
            cy: 0,
            r: opts.size,
            fill: opts.colour,
            "stroke": "#FFFFFF",
            "stroke-width": `${opts.borderSize}px`,
          }, this.group);
        } else {
          attrs.fill = opts.colour;
        }
        break;
      case "image":
        if (!opts.elm) {
          opts.elm = this.svg.createNode("use", {
            "xlink:href": opts.image
          }, this.group);
        }
        break;
      default:
        return;
    }
    this.svg.setAttrs(opts.elm, attrs);
    this.vehicles[opts.id] = opts;
  }

  update(data) {
    // receive live data from the GE map
    if (!data.controlID)
      return;

    // delete missing vehicles
    for (const key in this.vehicles) {
      if (!data.objects[key]) {
        this.svg.removeNode(this.vehicles[key].elm);
        delete this.vehicles[key];
      }
    }

    // update vehicle positions
    const upd = [];
    const controlID = data.controlID.toString();
    for (const id in data.objects) {
      const obj = data.objects[id];
      const opts = {
        id,
        type: "circle",
        ontop: false,
        pos: [
          bngNavUtils.truncDec((obj.pos[0] / this.dimensions.scale + this.dimensions.centerX), 1),
          bngNavUtils.truncDec((-obj.pos[1] / this.dimensions.scale + this.dimensions.centerY), 1),
        ],
        size: this.pointSize,
        borderSize: this.borderSize,
        colour: this.vehicleColor,
        scale: 1, //Math.min(3, 1 + lastSpeed * 0.5)
        rot: bngNavUtils.truncDec(-obj.rot + 180, 1),
      };
      if (id === controlID) { // if controlled
        opts.ontop = true;
        if (obj.type === "Camera") {
          opts.colour = this.cameraColor;
        } else if (this.vehicleMarker) {
          opts.type = "image";
          opts.image = this.vehicleMarker;
          opts.size = this.vehicleMarkerSize;
        } else {
          this.colour = this.vehicleMarkerColor;
        }
      }
      if (opts.ontop)
        upd.push(opts);
      else
        upd.splice(0, 0, opts);
    }

    for (const opts of upd)
      this.updatePlayerShape(opts);
  }
};


class bngNavLayerMarkers {
  static name = "markers";

  dimensions;
  dimver = -1;
  markers = {};
  svg;
  group;

  color;
  borderColor = "#FFFFFFFF";
  pointSize = 8;
  borderSize = 3;

  static canInit(elms, opts) {
    return !!elms.svg && !!opts.markers;
  }

  constructor({ svg }, opts, dimensions) {
    this.name = this.constructor.name;
    this.dimensions = dimensions;
    this.svg = svg;
    this.group = this.svg.createNode("g");
    this.setOptions(opts);
  }

  setOptions(opts) {
    this.color = opts.markerColor;
  }

  update(data) {
    if (!data || !data.key)
      return;

    if (!(data.key in this.markers))
      this.markers[data.key] = {};
    const dict = this.markers[data.key];

    // remove any existing markers
    for (var key in dict)
      this.svg.removeNode(dict[key].marker);

    // add new markers
    for (let i = 0; i < data.items.length; i += 4) {
      const marker = this.svg.createNode("circle", {
        cx: bngNavUtils.truncDec((data.items[i] / this.dimensions.scale + this.dimensions.centerX), 1),
        cy: bngNavUtils.truncDec((-data.items[i + 1] / this.dimensions.scale + this.dimensions.centerY), 1),
        r: 8,
        fill: this.color,
        stroke: "#FFFFFF",
        "stroke-width": `${this.borderSize}px`,
        //visibility: "hidden",
      }, this.group);
      dict[i / 4] = {
        marker,
        /// unused for now
        // screenX: -data.items[i],
        // screenY: data.items[i + 1],
        // visible: false,
      };
    }
  }
};


class bngNavLayerElements {
  static name = "elements";

  clock;
  clockLast;
  north;
  northLast;
  rotate;
  otherFrame = true;

  static canInit(elms, opts) {
    return !!elms.clock || !!elms.north;
  }

  constructor({ clock, north }, opts) {
    this.name = this.constructor.name;
    this.clock = clock;
    this.north = north;
    this.setOptions(opts);
  }

  setOptions(opts) {
    this.rotate = opts.rotate;
  }

  update({ rotation }) {
    if (this.otherFrame = !this.otherFrame)
      return;
    if (this.clock) {
      const tim = (new Date()).toTimeString().substring(0, 5); // toTimeString always has leading zeros
      if (this.clockLast !== tim) {
        this.clockLast = tim;
        this.clock.innerText = tim;
      }
    }
    if (this.north && this.northLast !== rotation) {
      this.northLast = rotation;
      let x, y;
      if (this.rotate) {
        const degreeNorth = rotation - 90;
        const npx = 50 - Math.sin((degreeNorth * Math.PI) / 180) * 75;
        const npy = 50 - Math.cos((degreeNorth * Math.PI) / 180) * 75;
        x = Math.min(Math.max(npx, 0), 100) + "%";
        y = 100 - Math.min(Math.max(npy, 0), 100) + "%";
      } else {
        x = "50%";
        y = "0%";
      }
      bngNavUtils.setStyle(this.north, {
        left: x,
        top: y,
      });
    }
  }
}


class bngNavLayerBootscreen {
  static name = "bootscreen";

  displayed = true;
  elm;

  static canInit(elms, opts) {
    return !!elms.bootscreen;
  }

  constructor({ bootscreen }) {
    this.name = this.constructor.name;
    this.elm = bootscreen;
  }

  hide() {
    this.toggle(false);
  }

  toggle(displayed) {
    if (this.displayed == displayed)
      return;
    this.displayed = !!displayed;
    if (this.displayed) {
      this.elm.classList.add("fadein");
      this.elm.classList.remove("fadeout");
    } else {
      this.elm.classList.remove("fadein");
      this.elm.classList.add("fadeout");
    }
  }

  setImage(data) {
    this.elm.style.backgroundImage = `url("${data.url}")`;
  }
};

window.bngNavigator = bngNavigator;
