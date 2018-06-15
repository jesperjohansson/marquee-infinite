import debounce from 'lodash.debounce';

/**
 * Gets the calculated width of an element
 * @param {Object} element - The element to retrieve the width of
 */
function getWidth(element) {
  /* TODO: REM, EM */
  if (!element) return 0;
  const style = element.currentStyle || window.getComputedStyle(element);
  const width = Number(style.width);
  return [
    Number.isNaN(width) ? element.clientWidth : width,
    style.marginRight,
    style.marginLeft,
    style.paddingRight,
    style.paddingLeft,
    style.borderRightWidth,
    style.borderLeftWidth,
  ].reduce((sum, value) => {
    const num = Number(value);
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
function setStyle(element, property, value, reflow = false) {
  element.style.setProperty(property, value);
  if (reflow) element.scrollTop; // eslint-disable-line
}

/**
 * Create and insert a new element to a parent element
 * @param {Object} parent - The element to insert the new element into
 * @param {string} className - The new element's class name
 * @param {string} [tag] - The new element's tag name
 */
function insertElement(parent, className, tag = 'div') {
  const element = document.createElement(tag);
  element.className = className;
  parent.appendChild(element);
  return element;
}

/**
 * Get a selector string from an element
 * @param {string} element - An element
 */
function elementToSelector(element) {
  if (typeof element !== 'object' || !element.nodeType) {
    throw new Error(`Invalid element provided: ${typeof element}`);
  }

  const className = element.className.replace(' ', '.');
  const tag = element.tagName.toLowerCase();
  return `${tag}${className && className.length ? '.' : ''}${className}`;
}

/**
 * Gets the element from a selector string or returns an element if one was provided
 * @param {string|Object} selectorOrElement - A string or an element
 */
function getElementFromArgument(selectorOrElement) {
  if (typeof selectorOrElement === 'object' && selectorOrElement.nodeType) {
    return selectorOrElement;
  } else if (typeof selectorOrElement === 'string') {
    return document.querySelector(selectorOrElement);
  }

  throw new Error(`Invalid element or selector: ${selectorOrElement}`);
}

/**
 * Get the direct children of an element
 * @param {Object} element - The element to get the direct children of
 */
function getDirectChildren(element) {
  const parent = element.parentElement;
  if (parent) {
    return [...parent.querySelectorAll(`${elementToSelector(element)} > *`)];
  }

  return [];
}

const defaultOptions = {
  maxItems: 800,
  setMinHeight: true,
  duration: 1000,
  classNames: {
    slider: 'marqueeInfiniteSlider',
    cell: 'marqueeInfiniteCell',
  },
};

class MarqueeInfinite {
  /**
   * Initialize marquee-infinite
   * @param {string|Object} [selectorOrElement]
   * - An existing element's selector or an element
   * @param {Object} [options]
   * - An object containing configuration options to initialize with
   */
  constructor(selectorOrElement = '.js-marquee-infinite', options = defaultOptions) {
    const container = getElementFromArgument(selectorOrElement);
    if (!container) return;
    this.options = options;
    this.container = container;
    this.start();
  }

  start() {
    this.cacheContainerDirectChildren();
    this.cacheInitialItems();
    this.insertMarqueeElements();
    this.cacheItems();
    this.fillWithItems();
    this.duplicateItems();
    this.runAnimation();
    this.events();
  }

  refresh() {
    this.insertMarqueeElements(true);
    this.cacheItems();
    this.fillWithItems();
    this.duplicateItems();
    this.runAnimation();
  }

  /**
   * Gets the container's direct children and stores them in this.containerDirectChildren
   */
  cacheContainerDirectChildren() {
    this.containerDirectChildren = getDirectChildren(this.container);
  }

  /**
   * Gets the initial items and stores them in this.initialItemElements
   */
  cacheInitialItems() {
    this.initialItemElements = this.containerDirectChildren.map(child => child.cloneNode(true));
    if (!this.initialItemElements.length) {
      throw new Error('Could not find any items');
    }

    this.initialItemsWidth = this.containerDirectChildren.reduce(
      (sum, item) => sum + getWidth(item),
      0,
    );
  }

  /**
   * Removes all direct children of the container element
   */
  removeContainerDirectChildren() {
    this.containerDirectChildren.forEach(child => child.parentElement.removeChild(child));
  }

  /**
   * Dynamically inserts the necessary elements into the DOM
   * @param {boolean} recache - Set to true if container's direct children should be re-cached
   */
  insertMarqueeElements(recache = false) {
    if (recache) this.cacheContainerDirectChildren();
    this.removeContainerDirectChildren();
    const { classNames } = this.options;
    this.slider = insertElement(this.container, classNames.slider);
    this.container.appendChild(this.slider);
    this.initialItemElements.forEach(item =>
      insertElement(this.slider, classNames.cell).appendChild(item));
  }

  /**
   * Gets all direct children to the slider and stores them in this.items
   */
  cacheItems() {
    this.items = getDirectChildren(this.slider);
  }

  /**
   * Clones and appends an element to the slider and then caches all items
   * @param {Object} item - An element to clone and append to the slider
   * @param {Object} appendToElement - An element to clone and append to the slider
   */
  addClone(item, appendToElement) {
    appendToElement.appendChild(item.cloneNode(true));
    this.cacheItems();
  }

  /**
   * Gets the sum of all items' widths in pixels
   */
  getAllItemsWidth() {
    return this.items.length * (this.initialItemsWidth / this.initialItemElements.length);
  }

  /**
   * Gets the container's width in pixels
   */
  getContainerWidth() {
    return getWidth(this.container);
  }

  /**
   * Checks if the sum of all items' width is greater or equal to the width of the container
   */
  getIsFilled() {
    return this.getAllItemsWidth() >= this.getContainerWidth();
  }

  /**
   * Fills the slider with items
   */
  fillWithItems() {
    if (this.getIsFilled()) return;
    for (let i = 0; i < this.options.maxItems; i += this.initialItemElements.length) {
      if (this.getIsFilled()) break;
      const cell = insertElement(this.slider, this.options.classNames.cell);
      this.initialItemElements.forEach(item => this.addClone(item, cell));
      if (i >= this.options.maxItems - 1 && !this.getIsFilled()) {
        console.warn(`Reached the max items limit of ${
          this.options.maxItems
        }. You can adjust this limit in your "options" object using the property "maxItems".`);
      }
    }
  }

  /**
   * Duplicates all items to create the "seamless" effect
   */
  duplicateItems() {
    this.items.forEach(item => this.addClone(item, this.slider));
  }

  /**
   * Gets the calculated animation duration from speed and the elements' widths
   */
  getAnimationDuration() {
    const itemsWidth = this.items.reduce((sum, item) => sum + getWidth(item), 0);

    // prettier-ignore
    const factor = itemsWidth / (this.initialItemsWidth * 2);
    return factor * this.options.duration;
  }

  /**
   * Runs the marquee animation
   */
  runAnimation() {
    const animate = () => {
      const duration = this.getAnimationDuration();
      setStyle(this.slider, 'transform', 'translateX(0%)');
      setStyle(this.slider, 'transition', `transform ${duration}ms linear`);
      setStyle(this.slider, 'transform', 'translateX(-100%)');

      this.animationTimer = setTimeout(() => {
        this.stopAnimation();
        requestAnimationFrame(() => animate());
      }, duration / 2);
    };

    animate();
  }

  /**
   * Stops the marquee animation
   */
  stopAnimation() {
    setStyle(this.slider, 'transition', '', true);
    setStyle(this.slider, 'transform', 'translateX(0%)', true);
  }

  /**
   * Pauses the marquee animation
   */
  pauseAnimation() {
    if (this.animationTimer) clearTimeout(this.animationTimer);
    const style = this.slider.currentStyle || window.getComputedStyle(this.slider);
    setStyle(this.slider, 'transform', style.transform);
    setStyle(this.slider, 'transition', '', true);
  }

  /**
   * Registers event listeners
   */
  events() {
    const handleResize = this.handleResize.bind(this);
    const resizeDebouncer = debounce(handleResize, 1000);
    window.addEventListener('resize', () => {
      this.pauseAnimation();
      resizeDebouncer();
    });
  }

  /**
   * Handles the resize event
   */
  handleResize() {
    this.refresh();
  }
}

export default MarqueeInfinite;
