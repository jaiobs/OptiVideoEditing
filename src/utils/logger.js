/**
 * logger method log message based on environment
 * @param {*} tag
 * @param {*} message
 */
export function log(tag, message = new Date()) {
  if (__DEV__) {
    console.log(tag, message);
  }
}
