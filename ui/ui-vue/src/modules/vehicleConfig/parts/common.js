export const emptyOptionName = "Empty"

//export const formatOptionName = (part, withName = false) => (part.isAuxiliary ? "[!] " : "") + part.description + (withName && part.name ? ` - ${part.name}` : "")
export const formatOptionName = (part, useName = false) => (part.isAuxiliary ? "[!] " : "") + (useName && part.name ? part.name : part.description)

export function formatOptions(element, opts = { showNames: false, showAux: false }) {
  const optionFilter = selected => opt => opt.val === selected || !opt.isAuxiliary || opts.showAux

  const cmpNames = (...ab) => {
    for (let i = 0; i < 2; i++) {
      if (typeof ab[i] !== "string") return 0
      // parse wheel sizes: "4x12 wheel" translates to "00004x00012 wheel"
      ab[i] = ab[i].replace(/^(\d+)x(\d+)/i,
        (_, a, b) => [a, b].map(v => "00000".substring(v.length - 1) + v).join("x")
      )
    }
    return ab[0].localeCompare(ab[1])
  }

  const optionSorter = (a, b) => !a.description ? a.name.localeCompare(b.name) :
    b.description === emptyOptionName ? 1 : cmpNames(a.description, b.description)

  // add formatted fields for BngDropdown
  const optionMapDropdown = opt => ({
    ...opt,
    value: opt.val,
    label: formatOptionName(opt, opts.showNames),
  })

  return element.options
    .filter(optionFilter(element.val))
    .sort(optionSorter)
    .map(optionMapDropdown)
}
