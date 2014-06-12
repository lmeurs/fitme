/*! FitMe - v0.1 - 2014-06-12
* https://github.com/lmeurs/fitme
* Copyright (c) 2014 Laurens Meurs, wiedes.nl; Licensed MIT */

// Main object with default options and callbacks. Each option and callback can
// be overwritten 1) globally by altering their values in this object and 2) per
// instance through the options argument using $.fn.fitMe({...}).
var FitMe = {

  /*** SETTINGS ***/

  // The child element can completely cover or fit into the parent element.
  // Possible values are "cover" and "contain", named after values for the CSS
  // background-size property.
  fillMode: 'cover',

  // Process settings before updating?
  doProcessSettingsBeforeUpdate: false,

  // Update on window resize?
  doUpdateOnWindowResize: true,



  /*** CALLBACKS ***/

  // Initialize instance.
  initialize: function() {
    // Initialize variables
    this.initializeVariables();

    // Check and set some basic CSS properties on child and parent elements.
    if (this.checkCssProperties) this.checkCssProperties();

    // Bind events.
    if (this.bindElementEvents) this.bindElementEvents();
    if (this.bindWindowEvents) this.bindWindowEvents();

    // Update.
    this.update(true);

    // Store instance as data objects and set processed class to child and
    // parent elements.
    this.$child.add(this.$parent)
      .data('fit-me-instance', this)
      .addClass('fit-me-processed');
  },

  // Initialize variables.
  initializeVariables: function() {
    // Get parent element.
    this.$parent = this.getParent();

    // Define unique instance id ie. for namespaced events.
    this.id = 'fit-me-' + Date.now() + '-' + String(Math.random()).substr(2);

    // Calculate the ratio by reading width / height attributes or measuring the
    // child element as long as ratio has not been provided by user. Set to
    // false if user provided a ratio on initialization.
    this._doCalculateRatio = !this.ratio;

    // Copy of data attributes, used to check if values have changed. This is to
    // prevent overwriting settings that may have been changed manually.
    this._lastDataAttributes = {};

    // The updateEventCallback can be called on window resize, call this
    // callback a 2nd time after a small timeout.
    this._updateEventCallbackTimeout = null;
  },

  // Get child's parent element.
  getParent: function() {
    return this.$child.parent();
  },

  // Check and set CSS properties to make sure we can set dimensions and
  // positioning of child element.
  checkCssProperties: function() {
    if (this.$child.css('display') == 'inline') this.$child.css('display', 'block');
    if (this.$child.css('position') == 'static') this.$child.css('position', 'relative');
    if (this.$parent.css('position') == 'static') this.$parent.css('position', 'relative');
  },

  // Bind element events.
  bindElementEvents: function() {
    // Bind custom event to child and parent elements, so the child can easily
    // be updated from outside this instance by triggering the event. A parent
    // can contain multiple child elements, so we use a namespaced event.
    this.$child.bind('fit-me-update', {fitMe: this}, this.updateEventCallback);
    this.$parent.bind('fit-me-update.' + this.id, {fitMe: this}, this.updateEventCallback);
  },

  // Bind window events.
  bindWindowEvents: function() {
    // Update on window load.
    jQuery(window).bind('load.' + this.id, {fitMe: this}, this.updateEventCallback);

    // Update on window resize.
    if (this.doUpdateOnWindowResize) {
      jQuery(window).bind('resize.' + this.id, {fitMe: this, addTimeout: true}, this.updateEventCallback);
    }
  },

  // Event callback that is bound to child, parent and window elements.
  updateEventCallback: function(e) {
    // Update using the fitMe instance which is received through the event's
    // data object.
    e.data.fitMe.update(true);

    // If addTimeout has been set.
    if (e.data.addTimeout) {
      // Clear timeout.
      clearTimeout(this._updateEventCallbackTimeout);

      // Update after small timeout.
      this._updateEventCallbackTimeout = setTimeout(function() {
        e.data.fitMe.update(true);
      }, 100);
    }

    // Prevent event being triggered on child and parent elements.
    e.stopPropagation();
  },

  // Actual resizing of the child element.
  update: function(forceProcessSettings) {
    // Process settings if 1) force flag is set to true, 2) ratio has no value
    // yet or 3) the doProcessSettingsBeforeUpdate option is set to true.
    if (forceProcessSettings || !this.ratio || this.doProcessSettingsBeforeUpdate) {
      this.processSettings();
    }

    // Get parent's dimensions.
    var parentDimensions = {};
    parentDimensions.width = this.$parent.width();
    parentDimensions.height = this.$parent.height();
    parentDimensions.ratio = parentDimensions.width / parentDimensions.height;

    // Set child dimensions.
    this.setChildDimensions(parentDimensions);
  },

  // Process settings. Settings might be updated after initialization by calling
  // instance.setInitialSettings() manually or by setting
  // instance.doProcessSettingsBeforeUpdate to true.
  processSettings: function() {
    // Read data attributes.
    if (this.readDataAttributes) this.readDataAttributes();

    // Calculate ratio if it has not been provided yet.
    if (this._doCalculateRatio && this.calculateRatio) this.calculateRatio();

    // Check and correct settings.
    if (this.checkSettings) this.checkSettings();
  },

  // Read child element's data attributes.
  readDataAttributes: function() {
    var dataAttributes = this.$child.data(),
      key, m;

    // Iterate through data attributes.
    for (var key in dataAttributes) {
      // If 1) data attribute is not a reference to this instance, 2) has a
      // value, 3) it's value has changed and 4) it's key starts with "fitMe".
      if (key != 'fitMeInstance' && dataAttributes[key] !== '' && dataAttributes[key] != this._lastDataAttributes[key] && (m = key.match(/^fitMe(\w)(.*)/))) {
        // Copy data attribute's value to instance.
        this.set(m[1].toLowerCase() + m[2], dataAttributes[key]);
      }
    }

    // Clone data attributes so we can check if values have changed.
    this._lastDataAttributes = $.extend({}, dataAttributes);
  },

  // Default method to calculate the ratio by trying to 1) read the width /
  // height attributes (in case child element is an image) or 2) measure the
  // child element's dimensions.
  calculateRatio: function(ratio) {
    // Calculate ratio based on child element's width / height attributes.
    if (this.$child.attr('width') && this.$child.attr('height')) {
      this.ratio = this.$child.attr('width') / this.$child.attr('height');
    }
    // Calculate ratio based on child element's dimensions.
    else {
      this.ratio = this.$child.width() / this.$child.height();
    }
  },

  // Check and correct settings.
  checkSettings: function(ratio) {
    // If no valid values defined, set default values. isNumeric also checks
    // whether a number is NaN or Infinite (divided by 0).
    this.ratio = $.isNumeric(this.ratio) ? this.ratio : 1;
    this.focalPointX = $.isNumeric(this.focalPointX) ? this.focalPointX : .5;
    this.focalPointY = $.isNumeric(this.focalPointY) ? this.focalPointY : .5;
  },

  // Return object with dimensions of child element depending on the parent's
  // dimensions. Object can be used as argument for $.fn.css().
  setChildDimensions: function(parentDimensions) {
    // Set child element's width to 100% of parent's width?
    var dimensions = {},
      equalizeWidths = this.fillMode == 'cover' && this.ratio < parentDimensions.ratio || this.fillMode != 'cover' && this.ratio > parentDimensions.ratio;

    // Calculate new dimensions of child element.
    dimensions.width = equalizeWidths ? parentDimensions.width : parentDimensions.height * this.ratio;
    dimensions.height = !equalizeWidths ? parentDimensions.height : parentDimensions.width / this.ratio;
    dimensions.left = equalizeWidths ? 0 : (parentDimensions.width - dimensions.width) * this.focalPointX;
    dimensions.top = !equalizeWidths ? 0 : (parentDimensions.height - dimensions.height) * this.focalPointY;

    // Allow altering of dimensions before applying them.
    if (this.alterDimensions) this.alterDimensions(dimensions, parentDimensions);

    // Set dimensions.
    this.$child.css(dimensions);
  },

  // Allow altering of new dimensions before setting them.
  alterDimensions: function(dimensions) {
    // Example: remove height.
    // delete dimensions.height;
  },



  // Setting getter.
  get: function(key) {
    // Return setting or null.
    return this[key] || null;
  },

  // Setting setter.
  set: function(key, value) {
    // Set or remove setting.
    if (typeof(value) !== undefined) this[key] = value;
    else delete this[key];

    // If ratio is being set.
    if (key == 'ratio') {
      // Evaluate ratio to allow values like "1920 / 1080".
      this.ratio = eval(this.ratio);

      // Set flag.
      this._doCalculateRatio = false;
    }
  }
};

// jQuery plugin.
(function($) {
  // Register jQuery plugin.
  $.fn.fitMe = function(options) {
    return this.each(function(i,elm) {
      // Create instance.
      var instance = {$child: $(elm)};

      // Extend instance with FitMe and options objects.
      $.extend(instance, FitMe, options);

      // Initialize instance.
      instance.initialize();
    });
  }
}(jQuery));
