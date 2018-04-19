export function checkRepeat (arr) {
  var newLength = [...new Set(arr)].length
  return newLength !== arr.length
}
export function square (num) {
  return num * num
}
