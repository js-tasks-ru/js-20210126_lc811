/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const getter = function (obj) {
    const steps = path.split('.');
    for (let step of steps) {
      if (step in obj) {
        obj = obj[step];
      } else {
        return undefined;
      }
    }
    return obj;
  };
  return getter;
}
