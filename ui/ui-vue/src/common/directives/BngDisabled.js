// Properly adds/removes "disabled" attribute on an element

export default (el, { value }) => {
  const has = {
    disabled: el.hasAttribute("disabled"),
    tabindex: el.hasAttribute("tabindex"),
  }
  if (!has.disabled && value) {
    el.setAttribute("disabled", "disabled")
    if (has.tabindex) {
      el._BNG_TABINDEX = el.getAttribute("tabindex")
      el.setAttribute("tabindex", "-1")
    }
  } else if (has.disabled && !value) {
    el.removeAttribute("disabled")
    if (has.tabindex && "_BNG_TABINDEX" in el && el.getAttribute("tabindex") !== el._BNG_TABINDEX) {
      el.setAttribute("tabindex", el._BNG_TABINDEX)
      delete el._BNG_TABINDEX
    }
  }
}
