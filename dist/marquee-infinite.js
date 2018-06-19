'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var lodash_debounce = debounce;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Gets the calculated width of an element
 * @param {Object} element - The element to retrieve the width of
 */
function getWidth(element) {
  /* TODO: REM, EM */
  if (!element) return 0;
  var style = element.currentStyle || window.getComputedStyle(element);
  var width = Number(style.width);
  return [Number.isNaN(width) ? element.clientWidth : width, style.marginRight, style.marginLeft, style.paddingRight, style.paddingLeft, style.borderRightWidth, style.borderLeftWidth].reduce(function (sum, value) {
    var num = Number(value);
    return sum + (Number.isNaN(num) ? 0 : num);
  }, 0);
}

/**
 * Sets an inline style with an option to use reflow on the element (helpful for transitions)
 * @param {Object} element - The element to add style to
 * @param {string} property - The name of the style property
 * @param {string} value - The propertie's value
 * @param {boolean} [reflow] - Set to true if the element should reflow after
 */
function setStyle(element, property, value) {
  var reflow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  element.style.setProperty(property, value);
  if (reflow) element.scrollTop; // eslint-disable-line
}

/**
 * Create and insert a new element to a parent element
 * @param {Object} parent - The element to insert the new element into
 * @param {string} className - The new element's class name
 * @param {string} [tag] - The new element's tag name
 */
function insertElement(parent, className) {
  var tag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'div';

  var element = document.createElement(tag);
  element.className = className;
  parent.appendChild(element);
  return element;
}

/**
 * Get a selector string from an element
 * @param {string} element - An element
 */
function elementToSelector(element) {
  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) !== 'object' || !element.nodeType) {
    throw new Error('Invalid element provided: ' + (typeof element === 'undefined' ? 'undefined' : _typeof(element)));
  }

  var className = [].concat(toConsumableArray(element.classList.values())).join('.');
  var tag = element.tagName.toLowerCase();
  return '' + tag + (className && className.length ? '.' : '') + className;
}

/**
 * Gets the element from a selector string or returns an element if one was provided
 * @param {string|Object} selectorOrElement - A string or an element
 */
function getElementFromArgument(selectorOrElement) {
  if ((typeof selectorOrElement === 'undefined' ? 'undefined' : _typeof(selectorOrElement)) === 'object' && selectorOrElement.nodeType) {
    return selectorOrElement;
  } else if (typeof selectorOrElement === 'string') {
    return document.querySelector(selectorOrElement);
  }

  throw new Error('Invalid element or selector: ' + selectorOrElement);
}

/**
 * Get the direct children of an element
 * @param {Object} element - The element to get the direct children of
 */
function getDirectChildren(element) {
  var parent = element.parentElement;
  if (parent) {
    return [].concat(toConsumableArray(parent.querySelectorAll(elementToSelector(element) + ' > *')));
  }

  return [];
}

var defaultOptions = {
  maxItems: 800,
  duration: 1000,
  classNames: {
    container: 'marqueeInfinite',
    slider: 'marqueeInfiniteSlider',
    cell: 'marqueeInfiniteCell'
  }
};

var MarqueeInfinite = function () {
  /**
   * Initialize marquee-infinite
   * @param {string|Object} [selectorOrElement]
   * - An existing element's selector or an element
   * @param {Object} [options]
   * - An object containing configuration options to initialize with
   * @param {number} [options.maxItems]
   * @param {number} [options.duration]
   * @param {Object} [options.classNames]
   * @param {string} [options.classNames.container]
   * @param {string} [options.classNames.slider]
   * @param {string} [options.classNames.cell]
   */
  function MarqueeInfinite(selectorOrElement, options) {
    classCallCheck(this, MarqueeInfinite);

    var container = getElementFromArgument(selectorOrElement || '.js-marquee-infinite');
    if (!container) return;
    this.container = container;
    this.options = Object.assign({}, defaultOptions, options || {});
    if (options && options.classNames) {
      this.options.classNames = Object.assign({}, defaultOptions.classNames, options.classNames);
    }

    this.setContainerClassName();
    this.start();
  }

  createClass(MarqueeInfinite, [{
    key: 'setContainerClassName',
    value: function setContainerClassName() {
      var classNames = this.options.classNames;

      if (this.container.classList.contains(classNames.container)) return;
      this.container.classList.add(classNames.container);
    }
  }, {
    key: 'start',
    value: function start() {
      this.cacheContainerDirectChildren();
      this.cacheInitialItems();
      this.insertMarqueeElements();
      this.cacheItems();
      this.fillWithItems();
      this.duplicateItems();
      this.runAnimation();
      this.events();
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.insertMarqueeElements(true);
      this.cacheItems();
      this.fillWithItems();
      this.duplicateItems();
      this.runAnimation();
    }

    /**
     * Gets the container's direct children and stores them in this.containerDirectChildren
     */

  }, {
    key: 'cacheContainerDirectChildren',
    value: function cacheContainerDirectChildren() {
      this.containerDirectChildren = getDirectChildren(this.container);
    }

    /**
     * Gets the initial items and stores them in this.initialItemElements
     */

  }, {
    key: 'cacheInitialItems',
    value: function cacheInitialItems() {
      this.initialItemElements = this.containerDirectChildren.map(function (child) {
        return child.cloneNode(true);
      });
      if (!this.initialItemElements.length) {
        throw new Error('Could not find any items');
      }

      this.initialItemsWidth = this.containerDirectChildren.reduce(function (sum, item) {
        return sum + getWidth(item);
      }, 0);
    }

    /**
     * Removes all direct children of the container element
     */

  }, {
    key: 'removeContainerDirectChildren',
    value: function removeContainerDirectChildren() {
      this.containerDirectChildren.forEach(function (child) {
        return child.parentElement.removeChild(child);
      });
    }

    /**
     * Dynamically inserts the necessary elements into the DOM
     * @param {boolean} recache - Set to true if container's direct children should be re-cached
     */

  }, {
    key: 'insertMarqueeElements',
    value: function insertMarqueeElements() {
      var _this = this;

      var recache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (recache) this.cacheContainerDirectChildren();
      this.removeContainerDirectChildren();
      var classNames = this.options.classNames;

      this.slider = insertElement(this.container, classNames.slider);
      this.container.appendChild(this.slider);
      this.initialItemElements.forEach(function (item) {
        return insertElement(_this.slider, classNames.cell).appendChild(item);
      });
    }

    /**
     * Gets all direct children to the slider and stores them in this.items
     */

  }, {
    key: 'cacheItems',
    value: function cacheItems() {
      this.items = getDirectChildren(this.slider);
    }

    /**
     * Clones and appends an element to the slider and then caches all items
     * @param {Object} item - An element to clone and append to the slider
     * @param {Object} appendToElement - An element to clone and append to the slider
     */

  }, {
    key: 'addClone',
    value: function addClone(item, appendToElement) {
      appendToElement.appendChild(item.cloneNode(true));
      this.cacheItems();
    }

    /**
     * Gets the sum of all items' widths in pixels
     */

  }, {
    key: 'getAllItemsWidth',
    value: function getAllItemsWidth() {
      return this.items.length * (this.initialItemsWidth / this.initialItemElements.length);
    }

    /**
     * Gets the container's width in pixels
     */

  }, {
    key: 'getContainerWidth',
    value: function getContainerWidth() {
      return getWidth(this.container);
    }

    /**
     * Checks if the sum of all items' width is greater or equal to the width of the container
     */

  }, {
    key: 'getIsFilled',
    value: function getIsFilled() {
      return this.getAllItemsWidth() >= this.getContainerWidth();
    }

    /**
     * Fills the slider with items
     */

  }, {
    key: 'fillWithItems',
    value: function fillWithItems() {
      var _this2 = this;

      if (this.getIsFilled()) return;

      var _loop = function _loop(i) {
        if (_this2.getIsFilled()) return 'break';
        var cell = insertElement(_this2.slider, _this2.options.classNames.cell);
        _this2.initialItemElements.forEach(function (item) {
          return _this2.addClone(item, cell);
        });
        if (i >= _this2.options.maxItems - 1 && !_this2.getIsFilled()) {
          console.warn('Reached the max items limit of ' + _this2.options.maxItems + '. You can adjust this limit in your "options" object using the property "maxItems".');
        }
      };

      for (var i = 0; i < this.options.maxItems; i += this.initialItemElements.length) {
        var _ret = _loop(i);

        if (_ret === 'break') break;
      }
    }

    /**
     * Duplicates all items to create the "seamless" effect
     */

  }, {
    key: 'duplicateItems',
    value: function duplicateItems() {
      var _this3 = this;

      this.items.forEach(function (item) {
        return _this3.addClone(item, _this3.slider);
      });
    }

    /**
     * Gets the calculated animation duration from speed and the elements' widths
     */

  }, {
    key: 'getAnimationDuration',
    value: function getAnimationDuration() {
      var itemsWidth = this.items.reduce(function (sum, item) {
        return sum + getWidth(item);
      }, 0);

      // prettier-ignore
      var factor = itemsWidth / (this.initialItemsWidth * 2);
      return factor * this.options.duration;
    }

    /**
     * Runs the marquee animation
     */

  }, {
    key: 'runAnimation',
    value: function runAnimation() {
      var _this4 = this;

      var animate = function animate() {
        var duration = _this4.getAnimationDuration();
        setStyle(_this4.slider, 'transform', 'translateX(0%)');
        setStyle(_this4.slider, 'transition', 'transform ' + duration + 'ms linear');
        setStyle(_this4.slider, 'transform', 'translateX(-100%)');

        _this4.animationTimer = setTimeout(function () {
          _this4.stopAnimation();
          requestAnimationFrame(function () {
            return animate();
          });
        }, duration / 2);
      };

      animate();
    }

    /**
     * Stops the marquee animation
     */

  }, {
    key: 'stopAnimation',
    value: function stopAnimation() {
      setStyle(this.slider, 'transition', '', true);
      setStyle(this.slider, 'transform', 'translateX(0%)', true);
    }

    /**
     * Pauses the marquee animation
     */

  }, {
    key: 'pauseAnimation',
    value: function pauseAnimation() {
      if (this.animationTimer) clearTimeout(this.animationTimer);
      var style = this.slider.currentStyle || window.getComputedStyle(this.slider);
      setStyle(this.slider, 'transform', style.transform);
      setStyle(this.slider, 'transition', '', true);
    }

    /**
     * Registers event listeners
     */

  }, {
    key: 'events',
    value: function events() {
      var _this5 = this;

      var handleResize = this.handleResize.bind(this);
      var resizeDebouncer = lodash_debounce(handleResize, 1000);
      window.addEventListener('resize', function () {
        _this5.pauseAnimation();
        resizeDebouncer();
      });
    }

    /**
     * Handles the resize event
     */

  }, {
    key: 'handleResize',
    value: function handleResize() {
      this.refresh();
    }
  }]);
  return MarqueeInfinite;
}();

module.exports = MarqueeInfinite;
