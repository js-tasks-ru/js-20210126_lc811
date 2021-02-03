/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size == undefined) {
    return string;
  }
  let result = '';
  let streak;
  for (let char of string) {
    if (result[result.length - 1] == char) {
      streak += 1;
    } else {
      streak = 1;
    }
    if (streak <= size) {
      result += char;
    }
  }
  return result;
}
