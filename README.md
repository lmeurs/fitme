# FitMe!

FitMe is a small javascript library (minimized and gzipped < 1.3KB) that fits one element into another.

## Features

1. A child element can A) completely cover or B) perfectly fit into it's parent element;
2. Setting horizontal and vertical focal points allows full control of the child element's alignment;
3. Settings can be defined using A) HTML data attributes, B) javascript on initialization or C) the javascipt API;
4. Because of it's modular structure callbacks can be easily overwritten globally or per instance.

## Example 1: Simple

#### HTML:
```html
<div class="my-parent">
  <img class="my-child" width="1920" height="1080" src="image.jpg" alt="My image" />
</div>
```

#### Javascript:
```javascript
jQuery('.my-child').fitMe();
```

## Example 2: Setting and altering options using data attributes.

#### HTML:
```html
<div class="my-parent">
  <div class="my-child" data-fit-me-ratio="1920 / 1080" data-fit-me-focal-point-x="0.2" data-fit-me-focal-point-y="0.8" data-fit-me-fill-mode="cover">My child element.</div>
</div>
```

#### Javascript:
```javascript
jQuery('.my-child').fitMe();
```

### Changing settings using data attributes.
```javascript
jQuery('.my-child')
  .data('fillmode', 'contain')
  .trigger('fit-me-update');
```

## Example 3: Setting and altering options using the API.

#### HTML:
```html
<div class="my-parent">
  <div class="my-child">My child element.</div>
</div>
```

#### Javascript:
```javascript
jQuery('.my-child').fitMe({
    ratio: 1920 / 1080,
    focalPointX: .2,
    focalPointY: .8,
    fillMode: 'cover'
  });
```

### Changing settings using the API.
```javascript
var fitMe = jQuery('.my-child').data('fit-me-instance');
fitMe.set('fillMode', 'contain');
fitMe.update();
```

## Dependencies

1. [jQuery 1.7+](http://jquery.com/download/)
