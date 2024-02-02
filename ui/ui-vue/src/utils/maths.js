export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const roundDec = (val, dec = 0) => {
  if (typeof val === "undefined")
    throw new Error("The function at least needs a value")
  if (dec > 15)
    throw new Error("Floating point won't be precise after 15th decimal")
  const pow = Math.pow(10, dec)
  return Math.round(val * pow + Number.EPSILON) / pow
}

export const round = (val, step = 1) => {
  if (typeof val === "undefined")
    throw new Error("The function at least needs a value")
  return Math.round(val / step + Number.EPSILON) * step
}
