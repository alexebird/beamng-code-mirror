export function shrinkNum(num, decimals = 0) {
  const units = ["", "K", "M", "B", "T", "Q"]
  if (!num) return "0"
  if (isNaN(parseFloat(num)) || !isFinite(+num)) return "n/a"
  let power = Math.floor(Math.log(Math.abs(+num)) / Math.log(1000))
  if (power >= units.length) power = units.length - 1
  //return (num / Math.pow(1000, power)).toFixed(decimals).replace(/\.?0+$/, "") + units[power]
  return (num / Math.pow(1000, power)).toFixed(decimals).replace(/\.0+$/, "") + units[power]
}
