/**
 * @description
 *   This directive modifies inner HTML to highlight the text.
 *   It accepts both string and regular expression as a parameter.
 *   In case of string, .case modifier is supported to make it case sensitive.
 * @example
 *   `<span v-bng-highlighter="'test'">Test test</span>` will highlight both words individually
 * @example
 *   `<span v-bng-highlighter.case="'test'">Test test</span>` will highlight only first word "Test" because we enabled case sensitivity
 * @example
 *   `<span v-bng-highlighter="['some', 'else']">Something else</span>` will highlight words specified as an array (empty ones will be ignored)
 * @example
 *   `<span v-bng-highlighter="/(me|i)/gi">Something</span>` will highlight both "me" and "i" because we're using regular expression
 */

const highlighter = ['<span style="font-weight: bold; color: #fc0;">', "</span>"]

const rgxSanitize = str => str.replace(/[\\[]\?:.\*\+\-]/g, "\\$1")

export default (el, binding, vnode, prevVnode) => {
  if (vnode.children.length !== 1 || vnode.children[0].type.toString() !== "Symbol(v-txt)") {
    if (!el.__highlightwarned) {
      el.__highlightwarned = true
      console.warn("Only a single inner text v-node supported", el)
    }
    return
  }

  let res = vnode.children[0].children
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
  // small bug: it will prevent highlighting things with < or >

  const highlight = binding.value
  if (highlight) {
    let rgx
    if (highlight instanceof RegExp) {
      if (highlight.test(res)) rgx = highlight
    } else {
      const searchCase = str => !binding.modifiers.case ? str.toLowerCase() : str
      const searchSource = searchCase(res)
      const checkString = str => searchSource.indexOf(str) > -1
      const buildRegexp = str => new RegExp(`(${str})`, "gm" + (!binding.modifiers.case ? "i" : ""))
      if (typeof highlight === "object" && Array.isArray(highlight)) {
        const found = []
        for (let str of highlight) {
          if (!str) continue
          str = searchCase(String(str))
          if (checkString(str)) found.push(str)
        }
        if (found.length > 0) rgx = buildRegexp(found.map(str => rgxSanitize(str)).join("|"))
      } else {
        const str = searchCase(String(highlight))
        if (checkString(str)) rgx = buildRegexp(rgxSanitize(str))
      }
    }
    // do highlighting
    if (rgx) res = res.replace(rgx, `${highlighter[0]}$1${highlighter[1]}`)
  }

  // prevent DOM mutation events from triggering when no change will be made
  if (el.innerHTML !== res) el.innerHTML = res
}
