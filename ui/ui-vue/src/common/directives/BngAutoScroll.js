/**
 * @brief   automatically scrolls a list to the specified direction
 * @argument   **top** automatically scrolls list to the top
 * @argument   **bottom** automatically scrolls list to the bottom
 * @tutorial   usage1   `v-bng-auto-scroll:top`
 * @tutorial   usage2   `v-bng-auto-scroll:bottom`
 */
function scroll(el, binding) {
  const direction = binding.arg

  if (direction === "top") {
    el.scrollTop = 0
  } else if (direction === "bottom") {
    el.scrollTop = el.scrollHeight
  }
}

export default scroll
