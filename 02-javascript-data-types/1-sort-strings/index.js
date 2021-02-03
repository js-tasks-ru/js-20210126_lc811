/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let result = arr.slice();
  let order;
  result = result.map(item => item.normalize());
  switch (param) {
    case 'asc':
      order = 1;
      break;
    case 'desc':
      order = -1;
      break;
    default:
      console.error('Invalid param, should be "asc" or "desc"');
      return -1; // По-хорошему, надо бросить исключение
  }
  result.sort((a, b) =>
  order * a.localeCompare(b, 'ru-u-kf-upper', 'en-u-kf-upper'));
  return result;
}
