/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const steps = path.split('.');
  const getter = function (obj) {
    for (let step of steps) {
      if (step in obj) {
        obj = obj[step];
      } else {
        return;
      }
    }
    return obj;
  };
  return getter;
}
