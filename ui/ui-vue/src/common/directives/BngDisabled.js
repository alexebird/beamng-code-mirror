// Properly adds/removes "disabled" attribute on an element

export default (el, { value }) => {
  const has = el.hasAttribute("disabled")
  if (!has && value) {
    el.setAttribute("disabled", "disabled")
  } else if (has && !value) {
    el.removeAttribute("disabled")
  }
}
