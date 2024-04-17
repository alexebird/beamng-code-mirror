// Polyfills for JS features not available in old CEF

// Object.fromEntries
if (!('fromEntries' in Object)) {
  Object.fromEntries = function fromEntries(iterable) {
    return [...iterable].reduce((obj, [key, val]) => {
      obj[key] = val
      return obj
    }, {})
  }
}

// Array.prototype.at
if (!('at' in Array.prototype)) {
  Object.defineProperty(Array.prototype, 'at', {
    value: function (index) {
      if (index >= 0) {
        return this[index];
      } else {
        return this[this.length + index];
      }
    }
  })
}

