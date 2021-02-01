/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let result = arr.slice();
  result.map(item=>item.normalize());
  result.sort((a, b) => a.localeCompare(b, 'ru-u-kf-upper', 'en-u-kf-upper'));
  if (param == 'asc') {
    return result;
  } else {
    return result.reverse();
  }
}
