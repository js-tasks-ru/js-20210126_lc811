/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const toPick = Object.entries(obj);
  const picked = toPick.filter((item) => fields.includes(item[0]));
  return Object.fromEntries(picked);
};
