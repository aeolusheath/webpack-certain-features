export function checkRepeat (arr) {
  var newUniqueLength = [...new Set(arr)].length
  return newUniqueLength !== arr.length
}
