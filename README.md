# marquee-infinite
∞ JS Library for creating infinite scrolling and wrapping marquee-like elements

## Installation
1. `yarn add marquee-infinite` or `npm install marquee-infinite`
2. Copy [dist/marquee-infite.css](https://github.com/jesperjohansson/marquee-infinite/blob/master/dist/marquee-infinite.css) and import it into your project

## Usage
```
import MarqueeInfinite from 'marquee-infinite';

new MarqueeInfinite('.js-marquee-infinite', {
  maxItems: 800,
  duration: 1000,
  classNames: {
    container: 'marqueeInfinite',
    slider: 'marqueeInfiniteSlider',
    cell: 'marqueeInfiniteCell',
  },
});

```
