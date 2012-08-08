/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Core JavaScript library for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */

// Top level object for Blockly.
var Blockly = {};

/**
 * Path to Blockly's directory.  Can be relative, absolute, or remote.
 * Used for loading additional resources.
 */
Blockly.pathToBlockly = './';

// Required name space for SVG elements.
Blockly.SVG_NS = 'http://www.w3.org/2000/svg';
// Required name space for HTML elements.
Blockly.HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * The HSV_SATURATION and HSV_VALUE constants provide Blockly with a consistent
 * colour scheme, regardless of the hue.
 * Both constants must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_SATURATION = 0.45;
Blockly.HSV_VALUE = 0.65;

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#84c'.
 */
Blockly.makeColour = function(hue) {
  hue %= 360;
  var topLimit = Blockly.HSV_VALUE;
  var bottomLimit = Blockly.HSV_VALUE * (1 - Blockly.HSV_SATURATION);
  var rangeUp = (topLimit - bottomLimit) * (hue % 60 / 60) + bottomLimit;
  var rangeDown = (topLimit - bottomLimit) * (1 - hue % 60 / 60) + bottomLimit;
  var r, g, b;
  if (0 <= hue && hue < 60) {
    r = topLimit;
    g = rangeUp;
    b = bottomLimit;
  } else if (60 <= hue && hue < 120) {
    r = rangeDown;
    g = topLimit;
    b = bottomLimit;
  } else if (120 <= hue && hue < 180) {
    r = bottomLimit;
    g = topLimit;
    b = rangeUp;
  } else if (180 <= hue && hue < 240) {
    r = bottomLimit;
    g = rangeDown;
    b = topLimit;
  } else if (240 <= hue && hue < 300) {
    r = rangeUp;
    g = bottomLimit;
    b = topLimit;
  } else if (300 <= hue && hue < 360) {
    r = topLimit;
    g = bottomLimit;
    b = rangeDown;
  } else {
    // Negative number?
    r = 0;
    g = 0;
    b = 0;
  }
  r = Math.floor(r * 16);
  g = Math.floor(g * 16);
  b = Math.floor(b * 16);
  var HEX = '0123456789abcdef';
  return '#' + HEX.charAt(r) + HEX.charAt(g) + HEX.charAt(b);
};

/**
 * ENUM for a right-facing value input.  E.g. 'test' or 'return'.
 */
Blockly.INPUT_VALUE = 1;
/**
 * ENUM for a left-facing value output.  E.g. 'call random'.
 */
Blockly.OUTPUT_VALUE = 2;
/**
 * ENUM for a down-facing block stack.  E.g. 'then-do' or 'else-do'.
 */
Blockly.NEXT_STATEMENT = 3;
/**
 * ENUM for an up-facing block stack.  E.g. 'close screen'.
 */
Blockly.PREVIOUS_STATEMENT = 4;
/**
 * ENUM for an local variable.  E.g. 'for x in list'.
 */
Blockly.LOCAL_VARIABLE = 5;

/**
 * Lookup table for determining the opposite type of a connection.
 */
Blockly.OPPOSITE_TYPE = [];
Blockly.OPPOSITE_TYPE[Blockly.INPUT_VALUE] = Blockly.OUTPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.OUTPUT_VALUE] = Blockly.INPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.NEXT_STATEMENT] = Blockly.PREVIOUS_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.PREVIOUS_STATEMENT] = Blockly.NEXT_STATEMENT;

/**
 * Database of pre-loaded sounds.
 * @private
 */
Blockly.SOUNDS_ = {};

/**
 * Currently selected block.
 * @type Blockly.Block
 */
Blockly.selected = null;

/**
 * In the future we might want to have display-only block views.
 * Until then, all blocks are considered editable.
 * Note that this property may only be set before init is called.
 * It can't be used to dynamically toggle editability on and off.
 */
Blockly.editable = true;

/**
 * Currently highlighted connection (during a drag).
 * @type {Blockly.Connection}
 * @private
 */
Blockly.highlightedConnection_ = null;

/**
 * Connection on dragged block that matches the highlighted connection.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.localConnection_ = null;

/**
 * Number of pixels the mouse must move before a drag starts.
 */
Blockly.DRAG_RADIUS = 5;

/**
 * Maximum misalignment between connections for them to snap together.
 */
Blockly.SNAP_RADIUS = 12;

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 */
Blockly.BUMP_DELAY = 250;

/**
 * The document object.
 * @type {Document}
 */
Blockly.svgDoc = null;

/**
 * The main workspace (defined by inject.js).
 * @type {Blockly.Workspace}
 */
Blockly.mainWorkspace = null;

/**
 * Returns the dimensions of the current SVG image.
 * @return {!Object} Contains width, height, top and left properties.
 */
Blockly.svgSize = function() {
  return {width: Blockly.svg.cachedWidth_,
          height: Blockly.svg.cachedHeight_,
          top: Blockly.svg.cachedTop_,
          left: Blockly.svg.cachedLeft_};
};

/**
 * Size the SVG image to completely fill its container.
 * Record both the height/width and the absolute postion of the SVG image.
 */
Blockly.svgResize = function() {
  var width = Blockly.svg.parentNode.offsetWidth;
  var height = Blockly.svg.parentNode.offsetHeight;
  if (Blockly.svg.cachedWidth_ != width) {
    Blockly.svg.setAttribute('width', width + 'px');
    Blockly.svg.cachedWidth_ = width;
  }
  if (Blockly.svg.cachedHeight_ != height) {
    Blockly.svg.setAttribute('height', height + 'px');
    Blockly.svg.cachedHeight_ = height;
  }
  var bBox = Blockly.svg.getBoundingClientRect();
  Blockly.svg.cachedLeft_ = bBox.left;
  Blockly.svg.cachedTop_ = bBox.top;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onMouseDown_ = function(e) {
  Blockly.hideChaff();
  Blockly.removeAllRanges();
  if (Blockly.isTargetInput_(e) ||
      (Blockly.Mutator && Blockly.Mutator.isOpen)) {
    return;
  }
  if (Blockly.selected && e.target.nodeName == 'svg') {
    // Clicking on the document clears the selection.
    Blockly.selected.unselect();
  }
  if (e.button == 2) {
    // Right-click.
    if (Blockly.ContextMenu) {
      Blockly.showContextMenu_(e.clientX, e.clientY);
    }
  } else if (e.target.nodeName == 'svg' || !Blockly.editable) {
    // If the workspace is editable, only allow dragging when gripping empty
    // space.  Otherwise, allow dragging when gripping anywhere.
    Blockly.mainWorkspace.dragMode = true;
    // Record the current mouse position.
    Blockly.mainWorkspace.startDragMouseX = e.clientX;
    Blockly.mainWorkspace.startDragMouseY = e.clientY;
    Blockly.mainWorkspace.startDragMetrics =
        Blockly.getMainWorkspaceMetrics();
    Blockly.mainWorkspace.startScrollX = Blockly.mainWorkspace.scrollX;
    Blockly.mainWorkspace.startScrollY = Blockly.mainWorkspace.scrollY;
  }
};

/**
 * Handle a mouse-up on SVG drawing surface.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.onMouseUp_ = function(e) {
  Blockly.setCursorHand_(false);
  Blockly.mainWorkspace.dragMode = false;
};

/**
 * Handle a mouse-move on SVG drawing surface.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.onMouseMove_ = function(e) {
  if (Blockly.mainWorkspace.dragMode) {
    Blockly.removeAllRanges();
    var dx = e.clientX - Blockly.mainWorkspace.startDragMouseX;
    var dy = e.clientY - Blockly.mainWorkspace.startDragMouseY;
    var metrics = Blockly.mainWorkspace.startDragMetrics;
    var x = Blockly.mainWorkspace.startScrollX + dx;
    var y = Blockly.mainWorkspace.startScrollY + dy;
    x = Math.min(x, -metrics.contentLeft);
    y = Math.min(y, -metrics.contentTop);
    x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
                 metrics.contentWidth);
    y = Math.max(y, metrics.viewHeight - metrics.contentTop -
                 metrics.contentHeight);

    // Move the scrollbars and the page will scroll automatically.
    Blockly.mainWorkspace.scrollbar.set(-x - metrics.contentLeft,
                                        -y - metrics.contentTop);
  }
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function(e) {
  if (Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  // TODO: Add keyboard support for cursoring around the context menu.
  if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff();
    if (Blockly.Mutator && Blockly.Mutator.isOpen) {
      Blockly.Mutator.closeDialog();
    }
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    if (Blockly.selected && Blockly.selected.editable &&
        (!Blockly.Mutator || !Blockly.Mutator.isOpen)) {
      Blockly.hideChaff();
      Blockly.playAudio('delete');
      Blockly.selected.destroy(true);
    }
    // Stop the browser from going back to the previous page.
    e.preventDefault();
  }
};

/**
 * Show the context menu for the workspace.
 * @param {number} x X-coordinate of mouse click.
 * @param {number} y Y-coordinate of mouse click.
 * @private
 */
Blockly.showContextMenu_ = function(x, y) {
  var options = [];

  // Option to get help.
  var helpOption = {enabled: false};
  helpOption.text = Blockly.MSG_HELP;
  helpOption.callback = function() {};
  options.push(helpOption);

  Blockly.ContextMenu.show(x, y, options);
};

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onContextMenu_ = function(e) {
  if (!Blockly.isTargetInput_(e) && Blockly.ContextMenu) {
    // When focused on an HTML text input widget, don't cancel the context menu.
    e.preventDefault();
  }
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip && Blockly.Tooltip.hide();
  Blockly.ContextMenu && Blockly.ContextMenu.hide();
  Blockly.FieldDropdown.hideMenu();
  if (Blockly.Toolbox && !opt_allowToolbox && Blockly.Toolbox.flyout_.autoClose) {
    Blockly.Toolbox.clearSelection();
  }
};

/**
 * Destroy all selections on the webpage.
 * Chrome will select text outside the SVG when double-clicking.
 * Deselect this text, so that it doesn't mess up any subsequent drag.
 */
Blockly.removeAllRanges = function() {
  if (window.getSelection) {  // W3
    var sel = window.getSelection();
    if (sel && sel.removeAllRanges) {
      sel.removeAllRanges();
      window.setTimeout(function() {
          window.getSelection().removeAllRanges();
        }, 0);
    }
  }
};

/**
 * Is this event targetting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.isTargetInput_ = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text';
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.loadAudio_ = function(name) {
  if (!Audio) {
    // No browser support for Audio.
    return;
  }
  var sound = new Audio(Blockly.pathToBlockly + 'media/' + name + '.wav');
  // To force the browser to load the sound, play it, but stop it immediately.
  // If this starts creating a chirp on startup, turn the sound's volume down,
  // or use another caching method such as XHR.
  if (sound && sound.play) {
    sound.play();
    sound.pause();
    Blockly.SOUNDS_[name] = sound;
  }
};

/**
 * Play an audio file.
 * @param {string} name Name of sound.
 */
Blockly.playAudio = function(name) {
  var sound = Blockly.SOUNDS_[name];
  if (sound) {
    sound.play();
  }
};

/**
 * Set the mouse cursor to be either a closed hand or the default.
 * @param {boolean} closed True for closed hand.
 * @private
 */
Blockly.setCursorHand_ = function(closed) {
  if (!Blockly.editable) {
    return;
  }
  /* Hotspot coordinates are baked into the CUR file, but they are still
     required due to a Chrome bug.
     http://code.google.com/p/chromium/issues/detail?id=1446 */
  var cursor = '';
  if (closed) {
    cursor = 'url(' + Blockly.pathToBlockly + 'media/handclosed.cur) 7 3, auto';
  }
  if (Blockly.selected) {
    Blockly.selected.getSvgRoot().style.cursor = cursor;
  }
  // Set cursor on the SVG surface as well as block so that rapid movements
  // don't result in cursor changing to an arrow momentarily.
  Blockly.svgDoc.getElementsByTagName('svg')[0].style.cursor = cursor;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * main workspace.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of main workspace.
 */
Blockly.getMainWorkspaceMetrics = function() {
  var hwView = Blockly.svgSize();
  if (Blockly.Toolbox) {
    hwView.width -= Blockly.Toolbox.width;
  }
  var viewWidth = hwView.width - Blockly.Scrollbar.scrollbarThickness;
  var viewHeight = hwView.height - Blockly.Scrollbar.scrollbarThickness;
  try {
    var blockBox = Blockly.mainWorkspace.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (blockBox.width == -Infinity && blockBox.height == -Infinity) {
    // Opera has trouble with bounding boxes around empty objects.
    blockBox = {width: 0, height: 0, x: 0, y: 0};
  }
  // Add a border around the content that is at least half a screenful wide.
  var leftEdge = Math.min(blockBox.x - viewWidth / 2,
                          blockBox.x + blockBox.width - viewWidth);
  var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth / 2,
                           blockBox.x + viewWidth);
  var topEdge = Math.min(blockBox.y - viewHeight / 2,
                         blockBox.y + blockBox.height - viewHeight);
  var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight / 2,
                            blockBox.y + viewHeight);
  var absoluteLeft = 0;
  if (Blockly.Toolbox && !Blockly.RTL) {
    absoluteLeft = Blockly.Toolbox.width;
  }
  return {
    viewHeight: hwView.height,
    viewWidth: hwView.width,
    contentHeight: bottomEdge - topEdge,
    contentWidth: rightEdge - leftEdge,
    viewTop: -Blockly.mainWorkspace.scrollY,
    viewLeft: -Blockly.mainWorkspace.scrollX,
    contentTop: topEdge,
    contentLeft: leftEdge,
    absoluteTop: 0,
    absoluteLeft: absoluteLeft
  };
};

/**
 * Sets the X/Y translations of the main workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 */
Blockly.setMainWorkspaceMetrics = function(xyRatio) {
  var metrics = Blockly.getMainWorkspaceMetrics();
  if (typeof xyRatio.x == 'number') {
    Blockly.mainWorkspace.scrollX = -metrics.contentWidth * xyRatio.x -
        metrics.contentLeft;
  }
  if (typeof xyRatio.y == 'number') {
    Blockly.mainWorkspace.scrollY = -metrics.contentHeight * xyRatio.y -
        metrics.contentTop;
  }
  var translation = 'translate(' +
      (Blockly.mainWorkspace.scrollX + metrics.absoluteLeft) + ',' +
      (Blockly.mainWorkspace.scrollY + metrics.absoluteTop) + ')';
  Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
  Blockly.commentCanvas.setAttribute('transform', translation);
};

/**
 * Rerender certain elements which might have had their sizes changed by the
 * CSS file and thus need realigning.
 * Called when the CSS file has finally loaded.
 */
Blockly.cssLoaded = function() {
  Blockly.Toolbox && Blockly.Toolbox.redraw();
};

// Utility methods.
// These methods are not specific to Blockly, and could be factored out if
// a JavaScript framework such as Closure were used.

/**
 * Removes all the child nodes on a DOM node.
 * Copied from Closure's goog.dom.removeChildren
 * @param {!Node} node Node to remove children from.
 * @private
 */
Blockly.removeChildren_ = function(node) {
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};

/**
 * Add a CSS class to a node.
 * Similar to Closure's goog.dom.classes.add
 * @param {!Node} node DOM node to add class to.
 * @param {string} className Name of class to add.
 * @private
 */
Blockly.addClass_ = function(node, className) {
  var classes = node.getAttribute('class') || '';
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') == -1) {
    if (classes) {
      classes += ' ';
    }
    node.setAttribute('class', classes + className);
  }
};

/**
 * Remove a CSS class from a node.
 * Similar to Closure's goog.dom.classes.remove
 * @param {!Node} node DOM node to remove class from.
 * @param {string} className Name of class to remove.
 * @private
 */
Blockly.removeClass_ = function(node, className) {
  var classes = node.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') != -1) {
    var classList = classes.split(/\s+/);
    for (var x = 0; x < classList.length; x++) {
      if (!classList[x] || classList[x] == className) {
        classList.splice(x, 1);
        x--;
      }
    }
    if (classList.length) {
      node.setAttribute('class', classList.join(' '));
    } else {
      node.removeAttribute('class');
    }
  }
};

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen to.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!Function} Function wrapper that was bound.  Used for unbindEvent_.
 * @private
 */
Blockly.bindEvent_ = function(element, name, thisObject, func) {
  var wrapFunc;
  if (element.addEventListener) {  // W3C
    wrapFunc = function(e) {
      func.apply(thisObject, arguments);
    };
    element.addEventListener(name, wrapFunc, false);
  } else {  // IE
    wrapFunc = function(e) {
      func.apply(thisObject, arguments);
      e.stopPropagation();
    };
    element.attachEvent('on' + name, wrapFunc);
  }
  return wrapFunc;
};

/**
 * Unbind an event from a function call.
 * @param {!Element} element Element from which to unlisten.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to stop calling when event is triggered.
 * @private
 */
Blockly.unbindEvent_ = function(element, name, func) {
  if (element.removeEventListener) {  // W3C
    element.removeEventListener(name, func, false);
  } else {  // IE
    element.detachEvent('on' + name, func);
  }
};

/**
 * Fire a synthetic event.
 * @param {!Element} doc Window's document for the event.
 * @param {!Element} element The event's target element.
 * @param {string} eventName Name of event (e.g. 'click').
 */
Blockly.fireUiEvent = function(doc, element, eventName) {
  if (doc.createEvent) {
    // W3
    var evt = doc.createEvent('UIEvents');
    evt.initEvent(eventName, true, true);  // event type, bubbling, cancelable
    element.dispatchEvent(evt);
  } else if (doc.createEventObject) {
    // MSIE
    var evt = doc.createEventObject();
    element.fireEvent('on' + eventName, evt);
  } else {
    throw 'FireEvent: No event creation mechanism.';
  }
};

/**
 * Don't do anything for this event, just halt propagation.
 * @param {!Event} e An event.
 */
Blockly.noEvent = function(e) {
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getRelativeXY_ = function(element) {
  var xy = {x: 0, y: 0};
  // First, check for x and y attributes.
  var x = element.getAttribute('x');
  if (x) {
    xy.x = parseInt(x, 10);
  }
  var y = element.getAttribute('y');
  if (y) {
    xy.y = parseInt(y, 10);
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform');
  // Note that Firefox returns 'translate(12)' instead of 'translate(12, 0)'.
  var r = transform &&
          transform.match(/translate\(\s*([-\d.]+)(,\s*([-\d.]+)\s*\))?/);
  if (r) {
    xy.x += parseInt(r[1], 10);
    if (r[3]) {
      xy.y += parseInt(r[3], 10);
    }
  }
  return xy;
};

/**
 * Return the absolute coordinates of the top-left corner of this element.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getAbsoluteXY_ = function(element) {
  var x = 0;
  var y = 0;
  do {
    // Loop through this block and every parent.
    var xy = Blockly.getRelativeXY_(element);
    x += xy.x;
    y += xy.y;
    element = element.parentNode;
  } while (element && element != Blockly.svgDoc);
  return {x: x, y: y};
};

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @return {!Element} Newly created SVG element.
 */
Blockly.createSvgElement = function(name, attrs, parent) {
  var e = Blockly.svgDoc.createElementNS(Blockly.SVG_NS, name);
  for (var key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  if (parent) {
    parent.appendChild(e);
  }
  return e;
};

/**
 * Comparison function that is case-insensitive.
 * Designed to be used by Array.sort()
 * @param {string} a First argument.
 * @param {string} b Second argument.
 * @return {number} 1 if a is bigger, -1 if b is bigger, 0 if equal.
 */
Blockly.caseInsensitiveComparator = function(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

/**
 * Return a random id that's 8 letters long.
 * 26*(26+10+4)^7 = 4,259,840,000,000
 * @return {string} Random id.
 */
Blockly.uniqueId = function() {
  // First character must be a letter.
  // IE is case insensitive (in violation of the W3 spec).
  var soup = 'abcdefghijklmnopqrstuvwxyz';
  var id = soup.charAt(Math.random() * soup.length);
  // Subsequent characters may include these.
  soup += '0123456789-_:.';
  for (var x = 1; x < 8; x++) {
    id += soup.charAt(Math.random() * soup.length);
  }
  // Don't allow IDs with '--' in them since it might close a comment.
  if (id.indexOf('--') != -1) {
    id = Blockly.uniqueId();
  }
  return id;
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for one block.
 * @param {Element} workspace The workspace in which to render the block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
Blockly.Block = function(workspace, prototypeName) {
  this.id = Blockly.uniqueId();
  this.titleRow = [];
  this.outputConnection = null;
  this.nextConnection = null;
  this.previousConnection = null;
  this.inputList = [];
  this.inputsInline = false;
  this.rendered = false;
  this.comment = null;
  this.collapsed = false;
  this.editable = workspace.editable;
  this.tooltip = '';
  this.contextMenu = true;

  this.parentBlock_ = null;
  this.childBlocks_ = [];

  this.isInFlyout = false;
  this.workspace = workspace;

  workspace.addTopBlock(this);
  // Copy the type-specific functions and data from the prototype.
  if (prototypeName) {
    this.type = prototypeName;
    var prototype = Blockly.Language[prototypeName];
    if (!prototype) {
      throw 'Error: "' + prototypeName + '" is an unknown language block.';
    }
    for (var name in prototype) {
      this[name] = prototype[name];
    }
  }
  // Call an initialization function, if it exists.
  if (typeof this.init == 'function') {
    this.init();
  }
};

/**
 * Pointer to SVG representation of the block.
 * @type {Blockly.BlockSvg}
 * @private
 */
Blockly.Block.prototype.svg_ = null;

/**
 * Create and initialize the SVG representation of the block.
 */
Blockly.Block.prototype.initSvg = function() {
  this.svg_ = new Blockly.BlockSvg(this);
  this.svg_.init();
  Blockly.bindEvent_(this.svg_.getRootNode(), 'mousedown', this,
                     this.onMouseDown_);
  this.workspace.getCanvas().appendChild(this.svg_.getRootNode());
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Node} The root SVG node (probably a group).
 */
Blockly.Block.prototype.getSvgRoot = function() {
  return this.svg_ && this.svg_.getRootNode();
};

/**
 * Is the mouse dragging a block?
 * 0 - No drag operation.
 * 1 - Still inside the stickly DRAG_RADIUS.
 * 2 - Freely draggable.
 * @private
 */
Blockly.Block.dragMode_ = 0;

/**
 * Wrapper function called when a mouseUp occurs during a drag operation.
 * @type {Function}
 * @private
 */
Blockly.Block.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mouseMove occurs during a drag operation.
 * @type {Function}
 * @private
 */
Blockly.Block.onMouseMoveWrapper_ = null;

/**
 * Stop binding to the global mouseup and mousemove events.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Block.unbindDragEvents_ = function(e) {
  if (Blockly.Block.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.svgDoc, 'mouseup',
                         Blockly.Block.onMouseUpWrapper_);
    Blockly.Block.onMouseUpWrapper_ = null;
  }
  if (Blockly.Block.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.svgDoc, 'mousemove',
                         Blockly.Block.onMouseMoveWrapper_);
    Blockly.Block.onMouseMoveWrapper_ = null;
  }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.Block.prototype.select = function() {
  if (Blockly.selected) {
    // Unselect any previously selected block.
    Blockly.selected.unselect();
  }
  Blockly.selected = this;
  this.svg_.addSelect();
  Blockly.fireUiEvent(Blockly.svgDoc, this.workspace.getCanvas(),
                      'blocklySelectChange');
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.Block.prototype.unselect = function() {
  Blockly.selected = null;
  this.svg_.removeSelect();
  Blockly.fireUiEvent(Blockly.svgDoc, this.workspace.getCanvas(),
                      'blocklySelectChange');
};

/**
 * Destroy this block.
 * @param {boolean} gentle If gentle, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, destroy all
 *     children of this block.
 */
Blockly.Block.prototype.destroy = function(gentle) {
  if (this.outputConnection) {
    // Detach this block from the parent's tree.
    this.setParent(null);
  } else {
    var previousTarget = null;
    if (this.previousConnection && this.previousConnection.targetConnection) {
      // Remember the connection that any next statements need to connect to.
      previousTarget = this.previousConnection.targetConnection;
      // Detatch this block from the parent's tree.
      this.setParent(null);
    }
    if (gentle && this.nextConnection && this.nextConnection.targetConnection) {
      // Disconnect the next statement.
      var nextTarget = this.nextConnection.targetConnection;
      var nextBlock = this.nextConnection.targetBlock();
      this.nextConnection.disconnect();
      nextBlock.setParent(null);

      if (previousTarget) {
        // Attach the next statement to the previous statement.
        previousTarget.connect(nextTarget);
      }
    }
  }

  //This block is now at the top of the workspace.
  // Remove this block from the workspace's list of top-most blocks.
  this.workspace.removeTopBlock(this);

  // Just deleting this block from the DOM would result in a memory leak as
  // well as corruption of the connection database.  Therefore we must
  // methodically step through the blocks and carefully disassemble them.

  // Switch off rerendering.
  this.rendered = false;

  if (Blockly.selected == this) {
    Blockly.selected = null;
    // If there's a drag in-progress, unlink the mouse events.
    Blockly.Block.unbindDragEvents_();
  }

  // First, destroy all my children.
  for (var x = this.childBlocks_.length - 1; x >= 0; x--) {
    this.childBlocks_[x].destroy(false);
  }
  // Then destroy myself.
  for (var x = 0; x < this.titleRow.length; x++) {
    this.titleRow[x].destroy();
  }
  if (this.comment) {
    this.comment.destroy();
  }
  if (this.mutator) {
    this.mutator.destroy();
  }
  // Destroy all inputs and their labels.
  for (var x = 0; x < this.inputList.length; x++) {
    var input = this.inputList[x];
    if (input.label) {
      input.label.destroy();
    }
    if (input.destroy) {
      input.destroy();
    }
  }
  this.inputList = [];
  // Destroy any remaining connections (next/previous/output).
  var connections = this.getConnections_(true);
  for (var x = 0; x < connections.length; x++) {
    var connection = connections[x];
    if (connection.targetConnection) {
      connection.disconnect();
    }
    connections[x].destroy();
  }
  // Destroy the SVG and break circular references.
  if (this.svg_) {
    this.svg_.destroy();
    this.svg_ = null;
  }
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's orgin (0,0).
 * @return {!Object} Object with .x and .y properties.
 */
Blockly.Block.prototype.getRelativeToSurfaceXY = function() {
  var element = this.svg_.getRootNode();
  var x = 0;
  var y = 0;
  do {
    // Loop through this block and every parent.
    var xy = Blockly.getRelativeXY_(element);
    x += xy.x;
    y += xy.y;
    element = element.parentNode;
  } while (element && element != this.workspace.getCanvas());
  return {x: x, y: y};
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Block.prototype.moveBy = function(dx, dy) {
  var xy = this.getRelativeToSurfaceXY();
  this.svg_.getRootNode().setAttribute('transform',
      'translate(' + (xy.x + dx) + ', ' + (xy.y + dy) + ')');
  this.moveConnections_(dx, dy);
};

/**
 * Handle a mouse-down on an SVG block.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Block.prototype.onMouseDown_ = function(e) {
  // Update Blockly's knowledge of its own location.
  Blockly.svgResize();

  Blockly.Block.unbindDragEvents_();
  this.select();
  Blockly.hideChaff(this.isInFlyout);
  if (e.button == 2) {
    // Right-click.
    if (Blockly.ContextMenu) {
      this.showContextMenu_(e.clientX, e.clientY);
    }
  } else if (!this.editable) {
    // Allow uneditable blocks to be selected and context menued, but not
    // dragged.  Let this event bubble up to document, so the workspace may be
    // dragged instead.
    return;
  } else {
    // Left-click (or middle click)
    Blockly.removeAllRanges();
    Blockly.setCursorHand_(true);
    // Look up the current translation and record it.
    var xy = this.getRelativeToSurfaceXY();
    this.startDragX = xy.x;
    this.startDragY = xy.y;
    // Record the current mouse position.
    this.startDragMouseX = e.clientX;
    this.startDragMouseY = e.clientY;
    Blockly.Block.dragMode_ = 1;
    Blockly.Block.onMouseUpWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
        'mouseup', this, this.onMouseUp_);
    Blockly.Block.onMouseMoveWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
        'mousemove', this, this.onMouseMove_);
    // Build a list of comments that need to be moved and where they started.
    this.draggedComments_ = [];
    var descendants = this.getDescendants();
    for (var x = 0, descendant; descendant = descendants[x]; x++) {
      if (descendant.comment) {
        var data = descendant.comment.getIconLocation();
        data.comment = descendant.comment;
        this.draggedComments_.push(data);
      }
    }
  }
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Block.prototype.onMouseUp_ = function(e) {
  /* BUG:
  In rare cases this onMouseUp event can be lost in Firefox due to a race
  condition.  Possibly: https://bugzilla.mozilla.org/show_bug.cgi?id=672677
  When this happens a dragged/clicked block becomes glued to the mouse
  cursor despite no button being depressed.  This state lasts until the
  user clicks to shake the block off.
  Ideally the mousemove function would check which buttons are depressed.
  Unfortunately Firefox sets e.button=0 and e.which=1 regardless of whether
  the left button is down or not.  Thus it is impossible to know the button
  state during mouse move.
  */
  Blockly.Block.unbindDragEvents_();
  if (Blockly.Block.dragMode_ == 2) {
    if (Blockly.selected != this) {
      throw 'Dragging no object?';
    }
    this.setDragging_(false);
    // Update the connection locations.
    var xy = this.getRelativeToSurfaceXY();
    var dx = xy.x - this.startDragX;
    var dy = xy.y - this.startDragY;
    this.moveConnections_(dx, dy);
    var selected = this;
    // Fire an event to allow scrollbars to resize.
    Blockly.fireUiEvent(Blockly.svgDoc, window, 'resize');
    window.setTimeout(function() {selected.bumpNeighbours_();},
                      Blockly.BUMP_DELAY);
  }
  Blockly.Block.dragMode_ = 0;
  delete this.draggedComments_;
  if (Blockly.selected && Blockly.highlightedConnection_) {
    Blockly.playAudio('click');
    // Connect two blocks together.
    Blockly.localConnection_.connect(Blockly.highlightedConnection_);
    if (this.workspace.trashcan && this.workspace.trashcan.isOpen) {
      // Don't throw an object in the trash can if it just got connected.
      Blockly.Trashcan.close(this.workspace.trashcan);
    }
  } else if (this.workspace.trashcan && this.workspace.trashcan.isOpen) {
    Blockly.playAudio('delete');
    Blockly.selected.destroy(false);
    var trashcan = this.workspace.trashcan;
    var closure = function() {
      Blockly.Trashcan.close(trashcan);
    };
    window.setTimeout(closure, 100);
    // Dropping a block on the trash can will usually cause the workspace to
    // resize to contain the newly positioned block.  Force a second resize now
    // that the block has been deleted.
    Blockly.fireUiEvent(Blockly.svgDoc, window, 'resize');
  }
  if (Blockly.highlightedConnection_) {
    Blockly.highlightedConnection_.unhighlight();
    Blockly.highlightedConnection_ = null;
  }
};

/**
 * Load the block's help page in a new window.
 * @private
 */
Blockly.Block.prototype.showHelp_ = function() {
  var url = (typeof this.helpUrl == 'function') ? this.helpUrl() : this.helpUrl;
  if (url) {
    window.open(url);
  }
};

/**
 * Show the context menu for this block.
 * @param {number} x X-coordinate of mouse click.
 * @param {number} y Y-coordinate of mouse click.
 * @private
 */
Blockly.Block.prototype.showContextMenu_ = function(x, y) {
  if (!this.contextMenu) {
    return;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var options = [];

  if (this.editable) {
    if (Blockly.Comment && !this.collapsed) {
      // Option to add/remove a comment.
      var commentOption = {enabled: true};
      if (this.comment) {
        commentOption.text = Blockly.MSG_REMOVE_COMMENT;
        commentOption.callback = function() {
          block.setCommentText(null);
        };
      } else {
        commentOption.text = Blockly.MSG_ADD_COMMENT;
        commentOption.callback = function() {
          block.setCommentText('');
        };
      }
      options.push(commentOption);
    }

    // Option to make block inline.
    if (!this.collapsed) {
      for (var i = 0; i < this.inputList.length; i++) {
        if (this.inputList[i].type == Blockly.INPUT_VALUE) {
          // Only display this option if there is a value input on the block.
          var inlineOption = {enabled: true};
          inlineOption.text = this.inputsInline ? Blockly.MSG_EXTERNAL_INPUTS :
                                                  Blockly.MSG_INLINE_INPUTS;
          inlineOption.callback = function() {
            block.setInputsInline(!block.inputsInline);
          };
          options.push(inlineOption);
          break;
        }
      }
    }

    // Option to collapse/expand block.
    if (this.collapsed) {
      var expandOption = {enabled: true};
      expandOption.text = Blockly.MSG_EXPAND_BLOCK;
      expandOption.callback = function() {
        block.setCollapsed(false);
      };
      options.push(expandOption);
    } else if (this.inputList.length) {
      // Only display this option if there are inputs on the block.
      var collapseOption = {enabled: true};
      collapseOption.text = Blockly.MSG_COLLAPSE_BLOCK;
      collapseOption.callback = function() {
        block.setCollapsed(true);
      };
      options.push(collapseOption);
    }

    // Option to delete this block.
    // Count the number of blocks that are nested in this block.
    var descendantCount = this.getDescendants().length;
    if (block.nextConnection && block.nextConnection.targetConnection) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= this.nextConnection.targetBlock().
          getDescendants().length;
    }
    var deleteOption = {
      text: descendantCount == 1 ? Blockly.MSG_DELETE_BLOCK :
          Blockly.MSG_DELETE_X_BLOCKS.replace('%1', descendantCount),
      enabled: true,
      callback: function() {
        Blockly.playAudio('delete');
        block.destroy(true);
      }
    };
    options.push(deleteOption);
  }

  // Option to get help.
  var url = (typeof this.helpUrl == 'function') ? this.helpUrl() : this.helpUrl;
  var helpOption = {enabled: !!url};
  helpOption.text = Blockly.MSG_HELP;
  helpOption.callback = function() {
    block.showHelp_();
  };
  options.push(helpOption);

  Blockly.ContextMenu.show(x, y, options);
};

/**
 * Returns all connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise return those that are visible.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @private
 */
Blockly.Block.prototype.getConnections_ = function(all) {
  var myConnections = [];
  if (all || this.rendered) {
    if (this.outputConnection) {
      myConnections.push(this.outputConnection);
    }
    if (this.nextConnection) {
      myConnections.push(this.nextConnection);
    }
    if (this.previousConnection) {
      myConnections.push(this.previousConnection);
    }
    if (all || !this.collapsed) {
      for (var x = 0, input; input = this.inputList[x]; x++) {
        if (input.type != Blockly.LOCAL_VARIABLE) {
          myConnections.push(input);
        }
      }
    }
  }
  return myConnections;
};

/**
 * Move the connections for this block and all blocks attached under it.
 * Also update any attached comment.
 * @param {number} dx Horizontal offset from current location.
 * @param {number} dy Vertical offset from current location.
 * @private
 */
Blockly.Block.prototype.moveConnections_ = function(dx, dy) {
  if (!this.rendered) {
    // Rendering is required to lay out the blocks.
    // This is probably an invisible block attached to a collapsed block.
    return;
  }
  var myConnections = this.getConnections_(false);
  for (var x = 0; x < myConnections.length; x++) {
    myConnections[x].moveBy(dx, dy);
  }
  if (this.comment) {
    this.comment.computeIconLocation();
  }

  // Recurse through all blocks attached under this one.
  for (var x = 0; x < this.childBlocks_.length; x++) {
    this.childBlocks_[x].moveConnections_(dx, dy);
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @private
 */
Blockly.Block.prototype.setDragging_ = function(adding) {
  if (adding) {
    this.svg_.addDragging();
  } else {
    this.svg_.removeDragging();
  }
  // Recurse through all blocks attached under this one.
  for (var x = 0; x < this.childBlocks_.length; x++) {
    this.childBlocks_[x].setDragging_(adding);
  }
};

/**
 * Drag this block to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Block.prototype.onMouseMove_ = function(e) {
  Blockly.removeAllRanges();
  var dx = e.clientX - this.startDragMouseX;
  var dy = e.clientY - this.startDragMouseY;
  if (Blockly.Block.dragMode_ == 1) {
    // Still dragging within the sticky DRAG_RADIUS.
    var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (dr > Blockly.DRAG_RADIUS) {
      // Switch to unrestricted dragging.
      Blockly.Block.dragMode_ = 2;
      // Push this block to the very top of the stack.
      this.setParent(null);
      this.setDragging_(true);
    }
  }
  if (Blockly.Block.dragMode_ == 2) {
    // Unrestricted dragging.
    var x = this.startDragX + dx;
    var y = this.startDragY + dy;
    this.svg_.getRootNode().setAttribute('transform',
                                     'translate(' + x + ', ' + y + ')');
    // Drag all the nested comments.
    for (var x = 0; x < this.draggedComments_.length; x++) {
      var commentData = this.draggedComments_[x];
      commentData.comment.setIconLocation(commentData.x + dx,
                                          commentData.y + dy);
    }

    // Check to see if any of this block's connections are within range of
    // another block's connection.
    var myConnections = this.getConnections_(false);
    var closestConnection = null;
    var localConnection = null;
    var radiusConnection = Blockly.SNAP_RADIUS;
    for (var i = 0; i < myConnections.length; i++) {
      var myConnection = myConnections[i];
      var neighbour = myConnection.closest(radiusConnection, dx, dy);
      if (neighbour.connection) {
        closestConnection = neighbour.connection;
        localConnection = myConnection;
        radiusConnection = neighbour.radius;
      }
    }

    // Remove connection highlighting if needed.
    if (Blockly.highlightedConnection_ &&
        Blockly.highlightedConnection_ != closestConnection) {
      Blockly.highlightedConnection_.unhighlight();
      Blockly.highlightedConnection_ = null;
      Blockly.localConnection_ = null;
    }
    // Add connection highlighting if needed.
    if (closestConnection &&
        closestConnection != Blockly.highlightedConnection_) {
      closestConnection.highlight();
      Blockly.highlightedConnection_ = closestConnection;
      Blockly.localConnection_ = localConnection;
    }
    // Flip the trash can lid if needed.
    this.workspace.trashcan && this.workspace.trashcan.onMouseMove(e);
  }
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 */
Blockly.Block.prototype.bumpNeighbours_ = function() {
  var rootBlock = this.getRootBlock();
  // Loop though every connection on this block.
  var myConnections = this.getConnections_(false);
  for (var x = 0; x < myConnections.length; x++) {
    var connection = myConnections[x];
    // Spider down from this block bumping all sub-blocks.
    if (connection.targetConnection &&
        (connection.type == Blockly.INPUT_VALUE ||
         connection.type == Blockly.NEXT_STATEMENT)) {
      connection.targetBlock().bumpNeighbours_();
    }

    var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for (var y = 0; y < neighbours.length; y++) {
      var otherConnection = neighbours[y];
      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.targetConnection || !otherConnection.targetConnection) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.sourceBlock_.getRootBlock() != rootBlock) {
          otherConnection.bumpAwayFrom_(connection);
        }
      }
    }
  }
};

/**
 * Return the parent block or null if this block is at the top level.
 * @return {Blockly.Block} The block that holds the current block.
 */
Blockly.Block.prototype.getParent = function() {
  // Look at the DOM to see if we are nested in another block.
  return this.parentBlock_;
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!Blockly.Block} The root block.
 */
Blockly.Block.prototype.getRootBlock = function() {
  var rootBlock;
  var block = this;
  do {
    rootBlock = block;
    block = rootBlock.parentBlock_;
  } while (block);
  return rootBlock;
};

/**
 * Find all the blocks that are directly nested inside this one.
 * Includes value and block inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceeding statement.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getChildren = function() {
  return this.childBlocks_;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block.
 */
Blockly.Block.prototype.setParent = function(newParent) {
  if (this.parentBlock_) {
    // Remove this block from the old parent's child list.
    var children = this.parentBlock_.childBlocks_;
    for (var child, x = 0; child = children[x]; x++) {
      if (child == this) {
        children.splice(x, 1);
        break;
      }
    }
    // Move this block up the DOM.  Keep track of x/y translations.
    var xy = this.getRelativeToSurfaceXY();
    this.workspace.getCanvas().appendChild(this.svg_.getRootNode());
    this.svg_.getRootNode().setAttribute('transform',
        'translate(' + xy.x + ', ' + xy.y + ')');

    // Disconnect from superior blocks.
    if (this.previousConnection && this.previousConnection.targetConnection) {
      this.previousConnection.disconnect();
    }
    if (this.outputConnection && this.outputConnection.targetConnection) {
      this.outputConnection.disconnect();
    }
    // This block hasn't actually moved on-screen, so there's no need to update
    // its connection locations.
  } else {
    // Remove this block from the workspace's list of top-most blocks.
    this.workspace.removeTopBlock(this);
  }

  this.parentBlock_ = newParent;
  if (newParent) {
    // Add this block to the new parent's child list.
    newParent.childBlocks_.push(this);

    var oldXY = this.getRelativeToSurfaceXY();
    newParent.svg_.getRootNode().appendChild(this.svg_.getRootNode());
    var newXY = this.getRelativeToSurfaceXY();
    // Move the connections to match the child's new position.
    this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
  } else {
    this.workspace.addTopBlock(this);
  }
};

/**
 * Find all the blocks that are directly or indirectly nested inside this one.
 * Includes this block in the list.
 * Includes value and block inputs, as well as any following statements.
 * Excludes any connection on an output tab or any preceeding statements.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
Blockly.Block.prototype.getDescendants = function() {
  var blocks = [this];
  for (var child, x = 0; child = this.childBlocks_[x]; x++) {
    blocks = blocks.concat(child.getDescendants());
  }
  return blocks;
};

/**
 * Get the colour of a block.
 * @return {string} HSV hue value.
 */
Blockly.Block.prototype.getColour = function() {
  return this.colourHue_;
};

/**
 * Change the colour of a block.
 * @param {number} colourHue HSV hue value.
 */
Blockly.Block.prototype.setColour = function(colourHue) {
  this.colourHue_ = colourHue;
  if (this.svg_) {
    this.svg_.updateColour();
  }
  if (this.comment) {
    this.comment.updateColour();
  }
  if (this.rendered) {
    this.render();
  }
};

/**
 * Add an item to the end of the title row.
 * @param {*} title Something to add as a title.
 * @param {string} opt_name Language-neutral identifier which may used to find
 *     this title again.  Should be unique to this block.
 * @return {!Blockly.Field} The title object created.
 */
Blockly.Block.prototype.appendTitle = function(title, opt_name) {
  // Generate a FieldLabel when given a plain text title.
  if (typeof title == 'string') {
    title = new Blockly.FieldLabel(title);
  }
  title.name = opt_name;

  // Add the title to the title row.
  this.titleRow.push(title);

  if (this.svg_) {
    title.init(this);
  }
  if (this.rendered) {
    this.render();
    // Adding a title will cause the block to change shape.
    this.bumpNeighbours_();
  }
  return title;
};

/**
 * Returns the human-readable text from the title of a block.
 * @param {string} name The name of the title.
 * @return {!string} Text from the title or null if title does not exist.
 */
Blockly.Block.prototype.getTitleText = function(name) {
  for (var x = 0, title; title = this.titleRow[x]; x++) {
    if (title.name === name) {
      return title.getText();
    }
  }
  return null;
};

/**
 * Returns the language-neutral value from the title of a block.
 * @param {string} name The name of the title.
 * @return {!string} Value from the title or null if title does not exist.
 */
Blockly.Block.prototype.getTitleValue = function(name) {
  for (var x = 0, title; title = this.titleRow[x]; x++) {
    if (title.name === name) {
      return title.getValue();
    }
  }
  return null;
};

/**
 * Change the title text for a block (e.g. 'choose' or 'remove list item').
 * @param {string} newText Text to be the new title.
 * @param {string} name The name of the title.
 */
Blockly.Block.prototype.setTitleText = function(newText, name) {
  for (var x = 0, title; title = this.titleRow[x]; x++) {
    if (title.name === name) {
      title.setText(newText);
      return;
    }
  }
  throw 'Title "' + name + '" not found.';
};

/**
 * Change the title value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new title.
 * @param {string} name The name of the title.
 */
Blockly.Block.prototype.setTitleValue = function(newValue, name) {
  for (var x = 0, title; title = this.titleRow[x]; x++) {
    if (title.name === name) {
      title.setValue(newValue);
      return;
    }
  }
  throw 'Title "' + name + '" not found.';
};

/**
 * Change the tooltip text for a block.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.Block.prototype.setTooltip = function(newTip) {
  this.tooltip = newTip;
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 */
Blockly.Block.prototype.setPreviousStatement = function(newBoolean) {
  if (this.previousConnection) {
    if (this.previousConnection.targetConnection) {
      throw 'Must disconnect previous statement before removing connection.';
    }
    this.previousConnection.destroy();
    this.previousConnection = null;
  }
  if (newBoolean) {
    if (this.outputConnection) {
      throw 'Remove output connection prior to adding previous connection.';
    }
    this.previousConnection =
        new Blockly.Connection(this, Blockly.PREVIOUS_STATEMENT, null);
  }
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 */
Blockly.Block.prototype.setNextStatement = function(newBoolean) {
  if (this.nextConnection) {
    if (this.nextConnection.targetConnection) {
      throw 'Must disconnect next statement before removing connection.';
    }
    this.nextConnection.destroy();
    this.nextConnection = null;
  }
  if (newBoolean) {
    this.nextConnection =
        new Blockly.Connection(this, Blockly.NEXT_STATEMENT, null);
  }
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {Object} check Returned type or list of returned types.
 *     Null if any type could be returned (e.g. variable get).
 */
Blockly.Block.prototype.setOutput = function(newBoolean, check) {
  if (this.outputConnection) {
    if (this.outputConnection.targetConnection) {
      throw 'Must disconnect output value before removing connection.';
    }
    this.outputConnection.destroy();
    this.outputConnection = null;
  }
  if (newBoolean) {
    if (this.previousConnection) {
      throw 'Remove previous connection prior to adding output connection.';
    }
    this.outputConnection =
        new Blockly.Connection(this, Blockly.OUTPUT_VALUE, check);
  }
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Blockly.Block.prototype.setInputsInline = function(newBoolean) {
  this.inputsInline = newBoolean;
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.Block.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed == collapsed) {
    return;
  }
  this.collapsed = collapsed;
  // Show/hide the inputs.
  var display = collapsed ? 'none' : 'block';
  var renderList = [];
  for (var x = 0, input; input = this.inputList[x]; x++) {
    if (input.label) {
      var labelElement = input.label.getRootElement ?
          input.label.getRootElement() : input.label;
      labelElement.style.display = display;
    }
    if (input.targetBlock) {
      // This is a connection.
      if (collapsed) {
        input.hideAll();
      } else {
        renderList = renderList.concat(input.unhideAll());
      }
      var child = input.targetBlock();
      if (child) {
        child.svg_.getRootNode().style.display = display;
        if (collapsed) {
          child.rendered = false;
        }
      }
    } else if (input.getText) {
      // This is a local variable.
      input.setVisible(!collapsed);
    }
  }

  if (collapsed && this.comment) {
    this.comment.setPinned(false);
  }

  if (renderList.length == 0) {
    // No child blocks, just render this block.
    renderList[0] = this;
  }
  if (this.rendered) {
    for (var x = 0, block; block = renderList[x]; x++) {
      block.render();
    }
    this.bumpNeighbours_();
  }
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {string|Blockly.Field} label Printed next to the input
 *     (e.g. 'x' or 'do').  May be an editable field.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.LOCAL_VARIABLE.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @param {Object} check Acceptable value type, or list of value types.
 *     Null all values are acceptable.
 * @return {!Object} The input object created.
 */
Blockly.Block.prototype.appendInput = function(label, type, name, check) {
  // Create descriptive text element.
  var textElement = null;
  if (label) {
    if (typeof label == 'string') {
      // Text label.
      textElement = new Blockly.FieldLabel(label);
    } else if (typeof label == 'object') {
      // Editable label.
      textElement = label;
    }
    if (this.svg_) {
      textElement.init(this);
    }
  }
  var input;
  if (type == Blockly.LOCAL_VARIABLE) {
    input = new Blockly.FieldDropdown(
        Blockly.Variables.dropdownCreate, Blockly.Variables.dropdownChange);
    if (this.svg_) {
      input.init(this);
    }
    input.type = Blockly.LOCAL_VARIABLE;
  } else {
    input = new Blockly.Connection(this, type, check);
  }
  input.label = textElement;
  input.name = name;
  // Append input to list.
  this.inputList.push(input);
  if (this.rendered) {
    this.render();
    // Adding an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
  return input;
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 */
Blockly.Block.prototype.removeInput = function(name) {
  for (var x = 0; x < this.inputList.length; x++) {
    var input = this.inputList[x];
    if (input.name == name) {
      if (input.targetConnection) {
        // Disconnect any attached block.
        input.targetBlock().setParent(null);
      }
      var field = input.label;
      if (field) {
        field.destroy();
      }
      if (input.destroy) {
        input.destroy();
      }
      this.inputList.splice(x, 1);
      if (this.rendered) {
        this.render();
        // Removing an input will cause the block to change shape.
        this.bumpNeighbours_();
      }
      return;
    }
  }
  throw 'Input "' + name + '" not found.';
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Object} The input object, or null of the input does not exist.
 */
Blockly.Block.prototype.getInput = function(name) {
  for (var x = 0; x < this.inputList.length; x++) {
    if (this.inputList[x].name == name) {
      return this.inputList[x];
    }
  }
  // This input does not exist.
  return null;
};

/**
 * Fetches the block attached to the named input.
 * @param {string} name The name of the input.
 * @return {Blockly.Block} The attached value block, or null if the input is
 *     either disconnected or if the input does not exist.
 */
Blockly.Block.prototype.getInputTargetBlock = function(name) {
  var input = this.getInput(name);
  return input && input.targetBlock();
};

/**
 * Gets the variable name attached to the named variable input.
 * @param {string} name The name of the input.
 * @return {string} The variable name, or null if the input does not exist.
 */
Blockly.Block.prototype.getInputVariable = function(name) {
  var input = this.getInput(name);
  return input && input.getText();
};

/**
 * Sets the variable name attached to the named variable input.
 * @param {string} name The name of the input.
 * @param {string} text The new variable name.
 */
Blockly.Block.prototype.setInputVariable = function(name, text) {
  var input = this.getInput(name);
  if (!input) {
    throw 'Input does not exist.';
  }
  input.setText(text);
};

/**
 * Fetches the value of the label attached to the named input.
 * @param {string} name The name of the input.
 * @return {string} The label's text, or null if the input does not exist.
 */
Blockly.Block.prototype.getInputLabelValue = function(name) {
  var input = this.getInput(name);
  if (input) {
    var label = input.label;
    if (label) {
      if (label.getText) {
        // Editable field.
        return label.getValue();
      } else {
        // Static text.
        return label.textContent;
      }
    } else {
      // Input exists, but label doesn't.
      return '';
    }
  }
  // This input does not exist.
  return null;
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.Block.prototype.setMutator = function(mutator) {
  if (this.mutator && this.mutator !== mutator) {
    this.mutator.destroy();
  }
  this.mutator = mutator;
  if (this.svg_) {
    mutator.createIcon();
  }
};

/**
 * Returns the comment on this block (or '' if none).
 * @return {string} Block's comment.
 */
Blockly.Block.prototype.getCommentText = function() {
  if (this.comment) {
    var comment = this.comment.getText();
    // Trim off trailing whitespace.
    return comment.replace(/\s+$/, '').replace(/ +\n/g, '\n');
  }
  return '';
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setCommentText = function(text) {
  if (!Blockly.Comment) {
    throw 'Comments not supported.';
  }
  var changedState = false;
  if (typeof text == 'string') {
    if (!this.comment) {
      this.comment = new Blockly.Comment(this, Blockly.commentCanvas);
      changedState = true;
    }
    this.comment.setText(text);
  } else {
    if (this.comment) {
      this.comment.destroy();
      this.comment = null;
      changedState = true;
    }
  }
  if (this.rendered) {
    this.render();
    if (changedState) {
      // Adding or removing the comment will cause the block to change shape.
      this.bumpNeighbours_();
    }
  }
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
Blockly.Block.prototype.render = function() {
  this.svg_.render();
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a block's SVG representation.
 * @param {!Blockly.Block} block The underlying block object.
 * @constructor
 */
Blockly.BlockSvg = function(block) {
  this.block_ = block;
  // Create core elements for the block.
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgPathDark_ = Blockly.createSvgElement('path',
      {transform: 'translate(1, 1)'}, this.svgGroup_);
  this.svgPath_ = Blockly.createSvgElement('path', {}, this.svgGroup_);
  this.svgPathLight_ = Blockly.createSvgElement('path',
      {'fill': 'none', 'stroke-width': 2, 'stroke-linecap': 'round'},
      this.svgGroup_);
  this.svgPath_.tooltip = this.block_;
  Blockly.Tooltip && Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  if (block.editable) {
    Blockly.addClass_(this.svgGroup_, 'blocklyDraggable');
  }
};

/**
 * Initialize the SVG representation with any block attributes which have
 * already been defined.
 */
Blockly.BlockSvg.prototype.init = function() {
  var block = this.block_;
  this.updateColour();
  for (var x = 0; x < block.titleRow.length; x++) {
    block.titleRow[x].init(block, this);
  }
  for (var x = 0, input; input = block.inputList[x]; x++) {
    if (input.label) {
      input.label.init(block, this);
    }
    if (input.type == Blockly.LOCAL_VARIABLE) {
      input.init(block, this);
    }
  }
  if (block.mutator) {
    block.mutator.createIcon();
  }
};

/**
 * Get the root SVG node.
 * @return {!Node} The root SVG node.
 */
Blockly.BlockSvg.prototype.getRootNode = function() {
  return this.svgGroup_;
};

// UI constants for rendering blocks.
Blockly.BlockSvg.SEP_SPACE_X = 10;   // Horizontal space between elements.
Blockly.BlockSvg.SEP_SPACE_Y = 5;    // Vertical space between elements.
Blockly.BlockSvg.MIN_BLOCK_Y = 25;   // Minimum height of a block.
Blockly.BlockSvg.TAB_HEIGHT = 20;    // Height of horizontal puzzle tab.
Blockly.BlockSvg.TAB_WIDTH = 8;      // Width of horizontal puzzle tab.
Blockly.BlockSvg.NOTCH_WIDTH = 30;   // Width of vertical tab (inc left margin).
Blockly.BlockSvg.CORNER_RADIUS = 8;  // Rounded corner radius.
// Distance from shape edge to intersect with a curved corner at 45 degrees.
// Applies to highlighting on around the inside of a curve.
Blockly.BlockSvg.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS - 1) + 1;
// Distance from shape edge to intersect with a curved corner at 45 degrees.
// Applies to highlighting on around the outside of a curve.
Blockly.BlockSvg.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS + 1) - 1;

/**
 * SVG path for drawing next/previous notch from left to right.
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 */
Blockly.BlockSvg.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 */
Blockly.BlockSvg.TAB_PATH_DOWN = 'v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 */
Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.98) + ',2.5 q -' +
    (Blockly.BlockSvg.TAB_WIDTH * .05) + ',10 ' +
    (Blockly.BlockSvg.TAB_WIDTH * .27) + ',10 m ' +
    (Blockly.BlockSvg.TAB_WIDTH * .71) + ',-2.5 v 1.5';

/**
 * Destroy this SVG block.
 */
Blockly.BlockSvg.prototype.destroy = function() {
  this.svgGroup_.parentNode.removeChild(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
  // Break circular references.
  this.block_ = null;
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  var hexColour = Blockly.makeColour(this.block_.getColour());
  var r = window.parseInt(hexColour.charAt(1), 16);
  var g = window.parseInt(hexColour.charAt(2), 16);
  var b = window.parseInt(hexColour.charAt(3), 16);
  var HEX = '0123456789abcdef';
  var rLight = HEX.charAt(Math.min(r + 3, 15));
  var gLight = HEX.charAt(Math.min(g + 2, 15));
  var bLight = HEX.charAt(Math.min(b + 2, 15));
  var rDark = HEX.charAt(Math.max(r - 4, 0));
  var gDark = HEX.charAt(Math.max(g - 4, 0));
  var bDark = HEX.charAt(Math.max(b - 4, 0));
  this.svgPathLight_.setAttribute('stroke', '#' + rLight + gLight + bLight);
  this.svgPathDark_.setAttribute('fill', '#' + rDark + gDark + bDark);
  this.svgPath_.setAttribute('fill', hexColour);
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.addClass_(this.svgPath_, 'blocklySelected');
  this.svgPathLight_.setAttribute('display', 'none');
  // Move the selected block to the top of the stack.
  this.svgGroup_.parentNode.appendChild(this.svgGroup_);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.removeClass_(this.svgPath_, 'blocklySelected');
  this.svgPathLight_.setAttribute('display', 'block');
};

/**
 * Adds the dragging class to this block.
 * Also disables the highlights/shadows to improve performance.
 */
Blockly.BlockSvg.prototype.addDragging = function() {
  Blockly.addClass_(this.svgPath_, 'blocklyDragging');
  Blockly.addClass_(this.svgPathLight_, 'blocklyDragging');
  this.svgPathDark_.style.display = 'none';
};

/**
 * Removes the dragging class from this block.
 */
Blockly.BlockSvg.prototype.removeDragging = function() {
  Blockly.removeClass_(this.svgPath_, 'blocklyDragging');
  Blockly.removeClass_(this.svgPathLight_, 'blocklyDragging');
  this.svgPathDark_.style.display = 'block';
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
Blockly.BlockSvg.prototype.render = function() {
  this.block_.rendered = true;
  var titleY = 18;
  if (!this.block_.collapsed &&
      this.block_.inputsInline && this.block_.inputList.length &&
      this.block_.inputList[0].type == Blockly.INPUT_VALUE) {
    // Lower the title elements a bit in order to line up with the first
    // row of inline labels.
    titleY += Blockly.BlockSvg.SEP_SPACE_Y;
  }
  var titleX = Blockly.RTL ?
      this.renderTitleRTL_(titleY) : this.renderTitleLTR_(titleY);
  var inputRows = this.renderCompute_(this.block_.inputList);
  this.renderDraw_(titleX, inputRows);

  // Render all blocks above this one (propagate a reflow).
  var parentBlock = this.block_.getParent();
  if (parentBlock) {
    parentBlock.render();
  } else {
    // Top-most block.  Fire an event to allow scrollbars to resize.
    Blockly.fireUiEvent(Blockly.svgDoc, window, 'resize');
  }
};

/**
 * Render the title row as right-to-left.
 * @param {number} titleY Vertical offset for text.
 * @return {number} Width of row.
 * @private
 */
Blockly.BlockSvg.prototype.renderTitleRTL_ = function(titleY) {
  var titleX = -Blockly.BlockSvg.SEP_SPACE_X;
  var iconWidth;
  // Move the comment icon into position.
  if (this.block_.comment) {
    iconWidth = this.block_.comment.renderIcon(titleX);
    if (iconWidth) {
      titleX -= iconWidth + Blockly.BlockSvg.SEP_SPACE_X;
    }
  }
  // Move the mutator icon into position.
  if (this.block_.mutator) {
    iconWidth = this.block_.mutator.renderIcon(titleX);
    if (iconWidth) {
      titleX -= iconWidth + Blockly.BlockSvg.SEP_SPACE_X;
    }
  }

  // Move the title element(s) into position.
  for (var x = 0, title; title = this.block_.titleRow[x]; x++) {
    var titleWidth = title.width();
    titleX -= titleWidth;
    title.getRootElement().setAttribute('transform',
        'translate(' + titleX + ', ' + titleY + ')');
    if (titleWidth) {
      titleX -= Blockly.BlockSvg.SEP_SPACE_X;
    }
  }

  if (this.block_.previousConnection || this.block_.nextConnection) {
    titleX = Math.min(titleX, -Blockly.BlockSvg.NOTCH_WIDTH -
                              Blockly.BlockSvg.SEP_SPACE_X);
  }
  return -titleX;
};

/**
 * Render the title row as left-to-right.
 * @param {number} titleY Vertical offset for text.
 * @return {number} Width of row.
 * @private
 */
Blockly.BlockSvg.prototype.renderTitleLTR_ = function(titleY) {
  var titleX = Blockly.BlockSvg.SEP_SPACE_X;
  var iconWidth;
  // Move the comment icon into position.
  if (this.block_.comment) {
    iconWidth = this.block_.comment.renderIcon(titleX);
    if (iconWidth) {
      titleX += iconWidth + Blockly.BlockSvg.SEP_SPACE_X;
    }
  }
  // Move the mutator icon into position.
  if (this.block_.mutator) {
    iconWidth = this.block_.mutator.renderIcon(titleX);
    if (iconWidth) {
      titleX += iconWidth + Blockly.BlockSvg.SEP_SPACE_X;
    }
  }

  // Move the title element(s) into position.
  for (var x = 0, title; title = this.block_.titleRow[x]; x++) {
    title.getRootElement().setAttribute('transform',
        'translate(' + titleX + ', ' + titleY + ')');
    var titleWidth = title.width();
    if (titleWidth) {
      titleX += titleWidth + Blockly.BlockSvg.SEP_SPACE_X;
    }
  }

  if (this.block_.previousConnection || this.block_.nextConnection) {
    titleX = Math.max(titleX, Blockly.BlockSvg.NOTCH_WIDTH +
                              Blockly.BlockSvg.SEP_SPACE_X);
  }
  return titleX;
};

/**
 * Computes the locations for all input elements.
 * @param {!Array.<!Array>} inputList Tuples containing the label element and
 *     the input type.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function(inputList) {
  var inputRows = [];
  inputRows.labelValueWidth = 0;  // Width of longest value 1st input label.
  inputRows.labelVariableWidth = 0;  // Width of longest variable label.
  inputRows.labelStatementWidth = 0;  // Width of longest statement label.
  inputRows.hasValue = false;
  inputRows.hasVariable = false;
  inputRows.hasStatement = false;
  var lastType = null;
  if (this.block_.collapsed) {
    // Collapsed blocks have no visible inputs.
    return inputRows;
  }
  for (var i = 0; i < inputList.length; i++) {
    var input = inputList[i];
    var row;
    if (lastType != Blockly.INPUT_VALUE || input.type != Blockly.INPUT_VALUE ||
        !this.block_.inputsInline) {
      // Create new row.
      lastType = input.type;
      var row = [];
      row.type = input.type;
      row.height = 0;
      inputRows.push(row);
    } else {
      row = inputRows[inputRows.length - 1];
    }
    row.push(input);

    // Compute minimum input size.
    input.height = Blockly.BlockSvg.MIN_BLOCK_Y;
    if (row.type == Blockly.INPUT_VALUE) {
      input.width = Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X;
    } else {
      // The width is currently only needed for inline value inputs.
      input.width = NaN;
    }
    // Expand input size if there is a connection.
    if (input.targetConnection) {
      var linkedBlock = input.targetBlock().getSvgRoot();
      try {
        var bBox = linkedBlock.getBBox();
      } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        var bBox = {height: 0, width: 0};
      }
      if (window.navigator.userAgent.indexOf('AppleWebKit/') != -1) {
        /* HACK:
         The current versions of Chrome (16.0) and Safari (5.1) with a common
         root of WebKit 535 has a size reporting bug where the height of a
         block is 5 pixels too large.  If WebKit browsers start under-sizing
         connections to other blocks, then delete this entire hack.
        */
        bBox.height -= 5;
      }
      // Subtract one from the height due to the shadow.
      input.height = Math.max(input.height, bBox.height - 1);
      input.width = Math.max(input.width, bBox.width);
    }

    row.height = Math.max(row.height, input.height);
    if (input.label) {
      if (input.label.getComputedTextLength) {
        // Plain text label.
        input.labelWidth = input.label.getComputedTextLength();
      } else {
        // Editable label.
        var labelBox = input.label.render();
        input.labelWidth = labelBox ? labelBox.width : 0;
      }
    } else {
      // No label.
      input.labelWidth = 0;
    }

    if (row.type == Blockly.INPUT_VALUE) {
      inputRows.hasValue = true;
      if (row.length == 1) {
        inputRows.labelValueWidth = Math.max(inputRows.labelValueWidth,
                                             input.labelWidth);
      }
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      inputRows.hasStatement = true;
      inputRows.labelStatementWidth = Math.max(inputRows.labelStatementWidth,
                                               input.labelWidth);
    } else if (row.type == Blockly.LOCAL_VARIABLE) {
      inputRows.hasVariable = true;
      inputRows.labelVariableWidth = Math.max(inputRows.labelVariableWidth,
                                           input.labelWidth);
    }
  }

  // Make inline rows a bit thicker in order to enclose the values.
  if (this.block_.inputsInline && inputRows.hasValue) {
    for (var y = 0; y < inputRows.length; y++) {
      var row = inputRows[y];
      if (row.type == Blockly.INPUT_VALUE) {
        row.height += 2 * Blockly.BlockSvg.SEP_SPACE_Y;
      }
    }
  }
  return inputRows;
};


/**
 * Draw the path of the block.
 * Move the labels to the correct locations.
 * @param {number} titleX Horizontal space taken up by the title.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function(titleX, inputRows) {
  // Fetch the block's coordinates on the surface for use in anchoring
  // the connections.
  var connectionsXY = this.block_.getRelativeToSurfaceXY();
  // Compute the preferred right edge.  Inline blocks may extend beyond.
  var rightEdge = titleX;
  if (inputRows.hasStatement) {
    rightEdge = Math.max(rightEdge,
        Blockly.BlockSvg.SEP_SPACE_X + inputRows.labelStatementWidth +
        Blockly.BlockSvg.SEP_SPACE_X + Blockly.BlockSvg.NOTCH_WIDTH);
  }
  if (inputRows.hasValue) {
    rightEdge = Math.max(rightEdge, titleX +
        (inputRows.labelValueWidth ? inputRows.labelValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X : 0) + Blockly.BlockSvg.TAB_WIDTH);
  }
  if (inputRows.hasVariable) {
    rightEdge = Math.max(rightEdge, titleX +
        (inputRows.labelVariableWidth ? inputRows.labelVariableWidth +
        Blockly.BlockSvg.SEP_SPACE_X : 0) + Blockly.BlockSvg.TAB_WIDTH);
  }

  // Assemble the block's path.
  var steps = [];
  var inlineSteps = [];
  // The highlighting applies to edges facing the upper-left corner.
  // Since highlighting is a two-pixel wide border, it would normally overhang
  // the edge of the block by a pixel. So undersize all measurements by a pixel.
  var highlightSteps = [];
  var highlightInlineSteps = [];

  this.renderDrawTop_(steps, highlightSteps, connectionsXY, rightEdge);
  var cursorY = this.renderDrawRight_(steps, highlightSteps, inlineSteps,
      highlightInlineSteps, connectionsXY, rightEdge, inputRows, titleX);
  this.renderDrawBottom_(steps, highlightSteps, connectionsXY, cursorY);
  this.renderDrawLeft_(steps, highlightSteps, connectionsXY, cursorY);

  var pathString = steps.join(' ') + '\n' + inlineSteps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  this.svgPathDark_.setAttribute('d', pathString);
  pathString = highlightSteps.join(' ') + '\n' + highlightInlineSteps.join(' ');
  this.svgPathLight_.setAttribute('d', pathString);
  if (Blockly.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};

/**
 * Render the top edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ = function(steps, highlightSteps,
                                                   connectionsXY, rightEdge) {
  // Position the cursor at the top-left starting point.
  if (this.block_.outputConnection) {
    steps.push('m 0,0');
    highlightSteps.push('m 1,1');
  } else {
    steps.push('m 0,' + Blockly.BlockSvg.CORNER_RADIUS);
    if (Blockly.RTL) {
      highlightSteps.push('m ' + Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
                          Blockly.BlockSvg.DISTANCE_45_INSIDE);
    } else {
      highlightSteps.push('m 1,' + (Blockly.BlockSvg.CORNER_RADIUS - 1));
    }
    // Top-left rounded corner.
    if (Blockly.BlockSvg.CORNER_RADIUS) {
      steps.push('A', Blockly.BlockSvg.CORNER_RADIUS + ',' +
             Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
             Blockly.BlockSvg.CORNER_RADIUS + ',0');
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 1) + ',' +
           (Blockly.BlockSvg.CORNER_RADIUS - 1) + ' 0 0,1 ' +
           Blockly.BlockSvg.CORNER_RADIUS + ',1');
    }
  }

  // Top edge.
  if (this.block_.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);
    // Create previous block connection.
    var connectionX = connectionsXY.x + (Blockly.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    var connectionY = connectionsXY.y;
    this.block_.previousConnection.moveTo(connectionX, connectionY);
    // This connection will be tightened when the parent renders.
  }
  steps.push('H', rightEdge);
  highlightSteps.push('H', rightEdge + (Blockly.RTL ? -1 : 0));
};

/**
 * Render the right edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Array.<string>} inlineSteps Inline block outlines.
 * @param {!Array.<string>} highlightInlineSteps Inline block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} titleX Horizontal space taken up by the title.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(steps, highlightSteps,
    inlineSteps, highlightInlineSteps, connectionsXY, rightEdge, inputRows,
    titleX) {
  var cursorX = 0;
  var cursorY = 0;
  var connectionX, connectionY;
  if (inputRows.length) {
    for (var y = 0; y < inputRows.length; y++) {
      highlightSteps.push('M', (rightEdge - 1) + ',' + (cursorY + 1));
      var row = inputRows[y];
      if (row.type == Blockly.INPUT_VALUE) {
        if (this.block_.inputsInline) {
          // Inline inputs.
          cursorX = Math.max(titleX + inputRows.labelValueWidth,
                             inputRows.labelStatementWidth);
          cursorX -= row[0].labelWidth;
          for (var x = 0; x < row.length; x++) {
            var input = row[x];
            if (input.label) {
              var labelElement = input.label.getRootElement();
              var labelX = Blockly.RTL ? -cursorX - input.labelWidth : cursorX;
              var labelY = cursorY + 18 + Blockly.BlockSvg.SEP_SPACE_Y;
              labelElement.setAttribute('transform',
                  'translate(' + labelX + ',' + labelY + ')');
              cursorX += input.labelWidth + Blockly.BlockSvg.SEP_SPACE_X;
            }
            cursorX += input.width + Blockly.BlockSvg.SEP_SPACE_X;
            inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X) +
                             ',' + (cursorY + Blockly.BlockSvg.SEP_SPACE_Y));
            inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - input.width);
            inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
            inlineSteps.push('v', input.height - Blockly.BlockSvg.TAB_HEIGHT);
            inlineSteps.push('h', input.width - Blockly.BlockSvg.TAB_WIDTH);
            inlineSteps.push('z');
            if (Blockly.RTL) {
              // Highlight right edge, around back of tab, and bottom.
              highlightInlineSteps.push('M',
                  (cursorX - Blockly.BlockSvg.SEP_SPACE_X +
                   Blockly.BlockSvg.TAB_WIDTH - input.width - 1) + ',' +
                  (cursorY + Blockly.BlockSvg.SEP_SPACE_Y + 1));
              highlightInlineSteps.push(
                  Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
              highlightInlineSteps.push('v',
                  input.height - Blockly.BlockSvg.TAB_HEIGHT + 2);
              highlightInlineSteps.push('h',
                  input.width - Blockly.BlockSvg.TAB_WIDTH);
            } else {
              // Highlight right edge, bottom, and glint at bottom of tab.
              highlightInlineSteps.push('M',
                  (cursorX - Blockly.BlockSvg.SEP_SPACE_X + 1) + ',' +
                  (cursorY + Blockly.BlockSvg.SEP_SPACE_Y + 1));
              highlightInlineSteps.push('v', input.height);
              highlightInlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH -
                                             input.width);
              highlightInlineSteps.push('M',
                  (cursorX - input.width - Blockly.BlockSvg.SEP_SPACE_X + 3.8) +
                  ',' + (cursorY + Blockly.BlockSvg.SEP_SPACE_Y +
                         Blockly.BlockSvg.TAB_HEIGHT - 0.4));
              highlightInlineSteps.push('l',
                  (Blockly.BlockSvg.TAB_WIDTH * 0.42) + ',-1.8');
            }
            // Create inline input connection.
            if (Blockly.RTL) {
              connectionX = connectionsXY.x - cursorX -
                  Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
                  input.width - 1;
            } else {
              connectionX = connectionsXY.x + cursorX +
                  Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                  input.width + 1;
            }
            connectionY = connectionsXY.y + cursorY +
                Blockly.BlockSvg.SEP_SPACE_Y;
            input.moveTo(connectionX, connectionY);
            if (input.targetConnection) {
              input.tighten_();
            }
          }
          steps.push('H', cursorX);
          highlightSteps.push('H', cursorX + (Blockly.RTL ? -1 : 0));
          steps.push('v', row.height);
          if (Blockly.RTL) {
            highlightSteps.push('v', row.height - 2);
          }
        } else {
          // External input.
          var input = row[0];
          if (input.label) {
            var labelElement = input.label.getRootElement();
            var labelX = Blockly.RTL ? -rightEdge + Blockly.BlockSvg.TAB_WIDTH +
                Blockly.BlockSvg.SEP_SPACE_X :
                rightEdge - Blockly.BlockSvg.TAB_WIDTH -
                Blockly.BlockSvg.SEP_SPACE_X - input.labelWidth;
            var labelY = cursorY + 18;
            labelElement.setAttribute('transform',
                'translate(' + labelX + ',' + labelY + ')');
          }
          steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
          steps.push('v', row.height - Blockly.BlockSvg.TAB_HEIGHT);
          if (Blockly.RTL) {
            // Highlight around back of tab.
            highlightSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
            highlightSteps.push('v', row.height - Blockly.BlockSvg.TAB_HEIGHT);
          } else {
            // Short highlight glint at bottom of tab.
            highlightSteps.push('M', (rightEdge - 4.2) + ',' +
                (cursorY + Blockly.BlockSvg.TAB_HEIGHT - 0.4));
            highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.42) +
                ',-1.8');
          }
          // Create external input connection.
          connectionX = connectionsXY.x +
              (Blockly.RTL ? -rightEdge - 1 : rightEdge + 1);
          connectionY = connectionsXY.y + cursorY;
          input.moveTo(connectionX, connectionY);
          if (input.targetConnection) {
            input.tighten_();
          }
        }
      } else if (row.type == Blockly.LOCAL_VARIABLE) {
        var input = row[0];
        if (input.label) {
          var labelElement = input.label.getRootElement();
          if (Blockly.RTL) {
            labelElement.setAttribute('x', -rightEdge +
                Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X);
          } else {
            labelElement.setAttribute('x', rightEdge -
                Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                input.labelWidth);
          }
          labelElement.setAttribute('y', cursorY + 18);
        }
        var fieldGroup = input.getRootElement();
        var bBox = input.render() || {height: 0, width: 0};
        if (Blockly.RTL) {
          fieldGroup.setAttribute('transform', 'translate(' +
              (-rightEdge - bBox.width + Blockly.BlockSvg.SEP_SPACE_X / 2) +
              ', ' + (cursorY + 18) + ')');
        } else {
          fieldGroup.setAttribute('transform', 'translate(' +
              (rightEdge - Blockly.BlockSvg.SEP_SPACE_X / 2) +
              ', ' + (cursorY + 18) + ')');
        }
        var width = bBox.width + Blockly.BlockSvg.SEP_SPACE_X / 2;
        steps.push('H', rightEdge + width);
        steps.push('v', row.height);
        steps.push('h', -width);
        if (Blockly.RTL) {
          highlightSteps.push('h', width);
          highlightSteps.push('v', row.height - 2);
          highlightSteps.push('m', -width + ',0');
        } else {
          highlightSteps.push('h', width + 1);
        }
      } else if (row.type == Blockly.NEXT_STATEMENT) {
        // Nested statement.
        var input = row[0];
        // If the first row is a block, add a header row on top.
        if (y == 0) {
          steps.push('v', Blockly.BlockSvg.MIN_BLOCK_Y);
          if (Blockly.RTL) {
            highlightSteps.push('v', Blockly.BlockSvg.MIN_BLOCK_Y - 2);
          }
          cursorY += Blockly.BlockSvg.MIN_BLOCK_Y;
        }
        if (input.label) {
          var labelElement = input.label.getRootElement();
          if (Blockly.RTL) {
            labelElement.setAttribute('x', -Blockly.BlockSvg.SEP_SPACE_X -
                inputRows.labelStatementWidth);
          } else {
            labelElement.setAttribute('x', Blockly.BlockSvg.SEP_SPACE_X +
                inputRows.labelStatementWidth - input.labelWidth);
          }
          labelElement.setAttribute('y', cursorY + 18);
        }
        cursorX = Blockly.BlockSvg.SEP_SPACE_X + inputRows.labelStatementWidth +
                  Blockly.BlockSvg.SEP_SPACE_X + Blockly.BlockSvg.NOTCH_WIDTH;
        steps.push('H', cursorX);
        steps.push(Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
            (Blockly.BlockSvg.NOTCH_WIDTH - 15 -
             Blockly.BlockSvg.CORNER_RADIUS));
        if (Blockly.BlockSvg.CORNER_RADIUS) {
          steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
                     Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
                     Blockly.BlockSvg.CORNER_RADIUS + ',' +
                     Blockly.BlockSvg.CORNER_RADIUS);
        }
        steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
        if (Blockly.BlockSvg.CORNER_RADIUS) {
          steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
                     Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
                     Blockly.BlockSvg.CORNER_RADIUS + ',' +
                     Blockly.BlockSvg.CORNER_RADIUS);
        }
        steps.push('H', rightEdge);
        if (Blockly.RTL) {
          highlightSteps.push('M',
              (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
               Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
              ',' + (cursorY + Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
          highlightSteps.push('a', (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
              (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
              (-Blockly.BlockSvg.DISTANCE_45_OUTSIDE - 1) + ',' +
              (Blockly.BlockSvg.CORNER_RADIUS -
               Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
          highlightSteps.push('v',
              row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
          highlightSteps.push('a', (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
              (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
              (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
              (Blockly.BlockSvg.CORNER_RADIUS + 1));
          highlightSteps.push('H', rightEdge - 1);
        } else {
          highlightSteps.push('M',
              (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
               Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
              ',' + (cursorY + row.height -
                     Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
          highlightSteps.push('a', (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
              (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
              (Blockly.BlockSvg.CORNER_RADIUS -
               Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
              (Blockly.BlockSvg.DISTANCE_45_OUTSIDE + 1));
          highlightSteps.push('H', rightEdge);
        }
        // Create statement connection.
        connectionX = connectionsXY.x + (Blockly.RTL ? -cursorX : cursorX);
        connectionY = connectionsXY.y + cursorY + 1;
        input.moveTo(connectionX, connectionY);
        if (input.targetConnection) {
          input.tighten_();
        }
        if (y == inputRows.length - 1 ||
            inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
          // If the final input is a block, add a small row underneath.
          // Consecutive blocks are also separated by a small divider.
          steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
          if (Blockly.RTL) {
            highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
          }
          cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
        }
      }
      cursorY += row.height;
    }
  } else {
    if (this.block_.collapsed) {
      steps.push(Blockly.BlockSvg.JAGGED_TEETH);
      if (Blockly.RTL) {
        highlightSteps.push('l 8,0 0,3.8 7,3.2 m -14.5,9 l 8,4');
      } else {
        highlightSteps.push('h 8');
      }
    }
    steps.push('V', Blockly.BlockSvg.MIN_BLOCK_Y);
    if (Blockly.RTL) {
      highlightSteps.push('V', Blockly.BlockSvg.MIN_BLOCK_Y - 1);
    }
    cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
  }
  return cursorY;
};

/**
 * Render the bottom edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ = function(steps, highlightSteps,
                                                     connectionsXY, cursorY) {
  if (this.block_.nextConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH + ' ' +
        Blockly.BlockSvg.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX;
    if (Blockly.RTL) {
      connectionX = connectionsXY.x - Blockly.BlockSvg.NOTCH_WIDTH;
    } else {
      connectionX = connectionsXY.x + Blockly.BlockSvg.NOTCH_WIDTH;
    }
    var connectionY = connectionsXY.y + cursorY + 1;
    this.block_.nextConnection.moveTo(connectionX, connectionY);
    if (this.block_.nextConnection.targetConnection) {
      this.block_.nextConnection.tighten_();
    }
  }
  if (this.block_.outputConnection) {
    steps.push('H 0');
  } else {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    if (Blockly.BlockSvg.CORNER_RADIUS) {
      steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
                 Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
                 Blockly.BlockSvg.CORNER_RADIUS + ',-' +
                 Blockly.BlockSvg.CORNER_RADIUS);
      if (!Blockly.RTL) {
        highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
            (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
        highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 1) + ',' +
            (Blockly.BlockSvg.CORNER_RADIUS - 1) + ' 0 0,1 ' +
            '1,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
      }
    }
  }
};

/**
 * Render the left edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ = function(steps, highlightSteps,
                                                   connectionsXY, cursorY) {
  if (this.block_.outputConnection) {
    steps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
        Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
        ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
    if (Blockly.RTL) {
      highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.3) + ',8.9');
      highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
    } else {
      highlightSteps.push('M', '1,' + cursorY);
      highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1);
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                          ',-1 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                          ',-5.5 0,-11');
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                          ',1 V 1 H 2');
    }
    // Create output connection.
    this.block_.outputConnection.moveTo(connectionsXY.x, connectionsXY.y);
    // This connection will be tightened when the parent renders.
  } else {
    if (!Blockly.RTL) {
      highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
    }
  }
  steps.push('z');
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a code comment.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @param {!Element} commentGroup The SVG group to append the comment bubble.
 * @constructor
 */
Blockly.Comment = function(block, commentGroup) {
  this.block_ = block;

  var angle = Blockly.Comment.ARROW_ANGLE;
  if (Blockly.RTL) {
    angle = -angle;
  }
  this.arrow_radians_ = angle / 360 * Math.PI * 2;

  this.createIcon_();
  this.createBubble_(commentGroup);

  this.setPinned(false);
  this.updateColour();
};

/**
 * Radius of the comment icon.
 */
Blockly.Comment.ICON_RADIUS = 8;

/**
 * Width of the border around the comment bubble.
 */
Blockly.Comment.BORDER_WIDTH = 6;

/**
 * Determines the thickness of the base of the arrow in relation to the size
 * of the comment bubble.  Higher numbers result in thinner arrows.
 */
Blockly.Comment.ARROW_THICKNESS = 10;

/**
 * The number of degrees that the arrow bends counter-clockwise.
 */
Blockly.Comment.ARROW_ANGLE = 20;

/**
 * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
 */
Blockly.Comment.ARROW_BEND = 4;

/**
 * Wrapper function called when a mouseUp occurs during a drag operation.
 * @type {Function}
 * @private
 */
Blockly.Comment.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mouseMove occurs during a drag operation.
 * @type {Function}
 * @private
 */
Blockly.Comment.onMouseMoveWrapper_ = null;

/**
 * Stop binding to the global mouseup and mousemove events.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.unbindDragEvents_ = function(e) {
  if (Blockly.Comment.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.svgDoc, 'mouseup',
                         Blockly.Comment.onMouseUpWrapper_);
    Blockly.Comment.onMouseUpWrapper_ = null;
  }
  if (Blockly.Comment.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.svgDoc, 'mousemove',
                         Blockly.Comment.onMouseMoveWrapper_);
    Blockly.Comment.onMouseMoveWrapper_ = null;
  }
};

/**
 * Absolute X coordinate of icon's center.
 * @type {?number}
 * @private
 */
Blockly.Comment.prototype.iconX_ = null;

/**
 * Absolute Y coordinate of icon's centre.
 * @type {?number}
 * @private
 */
Blockly.Comment.prototype.iconY_ = null;

/**
 * Relative X coordinate of bubble with respect to the icon's centre.
 * In RTL mode the initial value is negated.
 * @private
 */
Blockly.Comment.prototype.relativeLeft_ = -100;

/**
 * Relative Y coordinate of bubble with respect to the icon's centre.
 * @private
 */
Blockly.Comment.prototype.relativeTop_ = -120;

/**
 * Width of bubble.
 * @private
 */
Blockly.Comment.prototype.width_ = 160;

/**
 * Height of bubble.
 * @private
 */
Blockly.Comment.prototype.height_ = 80;

/**
 * Is the comment always visible?
 * @private
 */
Blockly.Comment.prototype.isPinned_ = false;

/**
 * Create the icon on the block.
 * @private
 */
Blockly.Comment.prototype.createIcon_ = function() {
  /* Here's the markup that will be generated:
  <g class="blocklyIconGroup">
    <circle class="blocklyIconShield" r="8" cx="8" cy="8"/>
    <text class="blocklyCommentMark" x="4" y="13">?</text>
  </g>
  */
  this.iconGroup_ = Blockly.createSvgElement('g',
      {'class': 'blocklyIconGroup'}, null);
  var iconShield = Blockly.createSvgElement('circle',
      {'class': 'blocklyIconShield',
      r: Blockly.Comment.ICON_RADIUS,
      cx: Blockly.Comment.ICON_RADIUS,
      cy: Blockly.Comment.ICON_RADIUS}, this.iconGroup_);
  this.iconMark_ = Blockly.createSvgElement('text',
      {'class': 'blocklyCommentMark',
      x: Blockly.Comment.ICON_RADIUS / 2,
      y: 2 * Blockly.Comment.ICON_RADIUS - 3}, this.iconGroup_);
  this.iconMark_.appendChild(Blockly.svgDoc.createTextNode('?'));
  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  Blockly.bindEvent_(this.iconGroup_, 'click', this, this.iconClick_);
  Blockly.bindEvent_(this.iconGroup_, 'mouseover', this, this.iconMouseOver_);
  Blockly.bindEvent_(this.iconGroup_, 'mouseout', this, this.iconMouseOut_);
};

/**
 * Create the icon's bubble.
 * @param {!Element} commentGroup The SVG group to append the comment bubble.
 * @private
 */
Blockly.Comment.prototype.createBubble_ = function(commentGroup) {
  /* Create the editor.  Here's the markup that will be generated:
  <g>
    <g filter="url(#blocklyEmboss)">
      <path d="... Z" />
      <rect class="blocklyDraggable" rx="8" ry="8" width="180" height="180"/>
    </g>
    <g transform="translate(165, 165)" class="blocklyResizeSE">
      <polygon points="0,15 15,15 15,0"/>
      <line class="blocklyResizeLine" x1="5" y1="14" x2="14" y2="5"/>
      <line class="blocklyResizeLine" x1="10" y1="14" x2="14" y2="10"/>
    </g>
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  </g>
  */
  this.bubbleGroup_ = Blockly.createSvgElement('g', {}, null);
  var bubbleEmboss = Blockly.createSvgElement('g',
      {filter: 'url(#blocklyEmboss)'}, this.bubbleGroup_);
  this.bubbleArrow_ = Blockly.createSvgElement('path', {}, bubbleEmboss);
  this.bubbleBack_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyDraggable', x: 0, y: 0,
      rx: Blockly.Comment.BORDER_WIDTH, ry: Blockly.Comment.BORDER_WIDTH},
      bubbleEmboss);
  this.resizeGroup_ = Blockly.createSvgElement('g',
      {'class': Blockly.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'},
      this.bubbleGroup_);
  var resizeSize = 2 * Blockly.Comment.BORDER_WIDTH;
  Blockly.createSvgElement('polygon',
      {points: '0,x x,x x,0'.replace(/x/g, resizeSize)}, this.resizeGroup_);
  Blockly.createSvgElement('line',
      {'class': 'blocklyResizeLine',
      x1: resizeSize / 3, y1: resizeSize - 1,
      x2: resizeSize - 1, y2: resizeSize / 3}, this.resizeGroup_);
  Blockly.createSvgElement('line',
      {'class': 'blocklyResizeLine',
      x1: resizeSize * 2 / 3, y1: resizeSize - 1,
      x2: resizeSize - 1, y2: resizeSize * 2 / 3}, this.resizeGroup_);
  this.foreignObject_ = Blockly.createSvgElement('foreignObject',
      {x: Blockly.Comment.BORDER_WIDTH, y: Blockly.Comment.BORDER_WIDTH},
      this.bubbleGroup_);
  var body = Blockly.svgDoc.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  this.textarea_ = Blockly.svgDoc.createElementNS(Blockly.HTML_NS, 'textarea');
  this.textarea_.className = 'blocklyCommentTextarea';
  this.textarea_.setAttribute('dir', Blockly.RTL ? 'RTL' : 'LTR');
  body.appendChild(this.textarea_);
  this.foreignObject_.appendChild(body);

  this.setBubbleSize(this.width_, this.height_);

  commentGroup.appendChild(this.bubbleGroup_);

  Blockly.bindEvent_(this.bubbleBack_, 'mousedown', this,
                     this.bubbleMouseDown_);
  Blockly.bindEvent_(this.resizeGroup_, 'mousedown', this,
                     this.resizeMouseDown_);
  Blockly.bindEvent_(this.foreignObject_, 'mousedown', this,
                     Blockly.noEvent);
  Blockly.bindEvent_(this.textarea_, 'mouseup', this,
                     this.textareaFocus_);
};

/**
 * Is the comment bubble always visible?
 * @return {boolean} True if the bubble should be always visible.
 */
Blockly.Comment.prototype.isPinned = function() {
  return this.isPinned_;
};

/**
 * Set whether the comment bubble is always visible or not.
 * @param {boolean} pinned True if the bubble should be always visible.
 */
Blockly.Comment.prototype.setPinned = function(pinned) {
  this.isPinned_ = pinned;
  this.iconMark_.style.fill = pinned ? '#fff' : '';
  this.setVisible_(pinned);
};

/**
 * Is the comment bubble visible?
 * @return {boolean} True if the bubble is visible.
 * @private
 */
Blockly.Comment.prototype.isVisible_ = function() {
  return this.bubbleGroup_.style.display != 'none';
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 * @private
 */
Blockly.Comment.prototype.setVisible_ = function(visible) {
  this.bubbleGroup_.style.display = visible ? '' : 'none';
  if (visible) {
    // Rendering was disabled while it was invisible.
    // Rerender to pick up any changes.
    this.positionBubble_();
  }
};

/**
 * Clicking on the icon toggles if the bubble is pinned.
 * @param {!Event} e Mouse click event.
 * @private
 */
Blockly.Comment.prototype.iconClick_ = function(e) {
  this.setPinned(!this.isPinned_);
};

/**
 * Mousing over the icon makes the bubble visible.
 * @param {!Event} e Mouse over event.
 * @private
 */
Blockly.Comment.prototype.iconMouseOver_ = function(e) {
  if (!this.isPinned_ && Blockly.Block.dragMode_ == 0) {
    this.setVisible_(true);
  }
};

/**
 * Mousing off of the icon hides the bubble (unless it is pinned).
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.Comment.prototype.iconMouseOut_ = function(e) {
  if (!this.isPinned_ && Blockly.Block.dragMode_ == 0) {
    this.setVisible_(false);
  }
};

/**
 * Handle a mouse-down on comment bubble.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Comment.prototype.bubbleMouseDown_ = function(e) {
  this.promote_();
  Blockly.Comment.unbindDragEvents_();
  if (e.button == 2) {
    // Right-click.
    return;
  } else if (Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't trap any events.
    return;
  }
  // Left-click (or middle click)
  Blockly.setCursorHand_(true);
  // Record the starting offset between the current location and the mouse.
  if (Blockly.RTL) {
    this.dragDeltaX = this.relativeLeft_ + e.clientX;
  } else {
    this.dragDeltaX = this.relativeLeft_ - e.clientX;
  }
  this.dragDeltaY = this.relativeTop_ - e.clientY;

  Blockly.Comment.onMouseUpWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
      'mouseup', this, Blockly.Comment.unbindDragEvents_);
  Blockly.Comment.onMouseMoveWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
      'mousemove', this, this.bubbleMouseMove_);
  Blockly.hideChaff();
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Drag this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Comment.prototype.bubbleMouseMove_ = function(e) {
  if (Blockly.RTL) {
    this.relativeLeft_ = this.dragDeltaX - e.clientX;
  } else {
    this.relativeLeft_ = this.dragDeltaX + e.clientX;
  }
  this.relativeTop_ = this.dragDeltaY + e.clientY;
  this.positionBubble_();
  this.renderArrow_();
};

/**
 * Handle a mouse-down on comment bubble's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Comment.prototype.resizeMouseDown_ = function(e) {
  this.promote_();
  Blockly.Comment.unbindDragEvents_();
  if (e.button == 2) {
    // Right-click.
    return;
  }
  // Left-click (or middle click)
  Blockly.setCursorHand_(true);
  // Record the starting offset between the current location and the mouse.
  if (Blockly.RTL) {
    this.resizeDeltaWidth = this.width_ + e.clientX;
  } else {
    this.resizeDeltaWidth = this.width_ - e.clientX;
  }
  this.resizeDeltaHeight = this.height_ - e.clientY;

  Blockly.Comment.onMouseUpWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
      'mouseup', this, Blockly.Comment.unbindDragEvents_);
  Blockly.Comment.onMouseMoveWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
      'mousemove', this, this.resizeMouseMove_);
  Blockly.hideChaff();
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Resize this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Comment.prototype.resizeMouseMove_ = function(e) {
  var w = this.resizeDeltaWidth;
  var h = this.resizeDeltaHeight + e.clientY;
  if (Blockly.RTL) {
    // RTL drags the bottom-left corner.
    w -= e.clientX;
  } else {
    // LTR drags the bottom-right corner.
    w += e.clientX;
  }
  this.setBubbleSize(w, h);
  if (Blockly.RTL) {
    // RTL requires the bubble to move its left edge.
    this.positionBubble_();
  }
};

/**
 * Bring the comment to the top of the stack when clicked on.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.textareaFocus_ = function(e) {
  // Ideally this would be hooked to the focus event for the comment.
  // However doing so in Firefox swallows the cursor for unkown reasons.
  // So this is hooked to mouseup instead.  No big deal.
  this.promote_();
  // Since the act of moving this node within the DOM causes a loss of focus,
  // we need to reapply the focus.
  this.textarea_.focus();
};

/**
 * Move this comment to the top of the stack.
 * @private
 */
Blockly.Comment.prototype.promote_ = function() {
  var commentGroup = this.bubbleGroup_.parentNode;
  commentGroup.appendChild(this.bubbleGroup_);
};

/**
 * Get the location of this comment's bubble.
 * @return {!Object} Object with x and y properties.
 */
Blockly.Comment.prototype.getBubbleLocation = function() {
  return {x: this.relativeLeft_, y: this.relativeTop_};
};

/**
 * Set the location of this comment's bubble.
 * @param {number} x Horizontal offset from block.
 * @param {number} y Vertical offset from block.
 */
Blockly.Comment.prototype.setBubbleLocation = function(x, y) {
  this.relativeLeft_ = x;
  this.relativeTop_ = y;
  this.positionBubble_();
};

/**
 * Move the comment bubble to a location relative to the icon's centre.
 * @private
 */
Blockly.Comment.prototype.positionBubble_ = function() {
  if (!this.isVisible_() || this.iconX_ === null || this.iconY_ === null) {
    // Comment bubble invisible or host block hasn't rendered yet.
    return;
  }
  var left;
  if (Blockly.RTL) {
    left = this.iconX_ - this.relativeLeft_ - this.width_;
  } else {
    left = this.iconX_ + this.relativeLeft_;
  }
  var top = this.relativeTop_ + this.iconY_;
  this.bubbleGroup_.setAttribute('transform',
      'translate(' + left + ', ' + top + ')');
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Comment.prototype.getBubbleSize = function() {
  return {width: this.width_, height: this.height_};
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Comment.prototype.setBubbleSize = function(width, height) {
  var doubleBorderWidth = 2 * Blockly.Comment.BORDER_WIDTH;
  width = Math.max(width, doubleBorderWidth + 45);
  height = Math.max(height, doubleBorderWidth + 18);
  this.width_ = width;
  this.height_ = height;
  this.bubbleBack_.setAttribute('width', width);
  this.bubbleBack_.setAttribute('height', height);
  if (Blockly.RTL) {
    // Mirror the resize group.
    var resizeSize = 2 * Blockly.Comment.BORDER_WIDTH;
    this.resizeGroup_.setAttribute('transform', 'translate(' +
        resizeSize + ', ' +
        (height - doubleBorderWidth) + ') scale(-1 1)');
  } else {
    this.resizeGroup_.setAttribute('transform', 'translate(' +
        (width - doubleBorderWidth) + ', ' +
        (height - doubleBorderWidth) + ')');
  }
  this.foreignObject_.setAttribute('width', width - doubleBorderWidth);
  this.foreignObject_.setAttribute('height', height - doubleBorderWidth);
  this.textarea_.style.width = (width - doubleBorderWidth - 4) + 'px';
  this.textarea_.style.height = (height - doubleBorderWidth - 4) + 'px';
  this.renderArrow_();
};

/**
 * Draw the arrow between the comment bubble and the block.
 * @private
 */
Blockly.Comment.prototype.renderArrow_ = function() {
  if (!this.isVisible_()) {
    return;
  }
  var steps = [];
  // Find the relative coordinates of the center of the bubble.
  var relBubbleX = this.width_ / 2;
  var relBubbleY = this.height_ / 2;
  // Find the relative coordinates of the center of the icon.
  var relIconX = -this.relativeLeft_;
  var relIconY = -this.relativeTop_;
  if (relBubbleX == relIconX && relBubbleY == relIconY) {
    // Null case.  Bubble is directly on top of the icon.
    // Short circuit this rather than wade through divide by zeros.
    steps.push('M ' + relBubbleX + ',' + relBubbleY);
  } else {
    // Compute the angle of the arrow's line.
    var rise = relIconY - relBubbleY;
    var run = relIconX - relBubbleX;
    if (Blockly.RTL) {
      run *= -1;
    }
    var hypotenuse = Math.sqrt(rise * rise + run * run);
    var angle = Math.acos(run / hypotenuse);
    if (rise < 0) {
      angle = 2 * Math.PI - angle;
    }
    // Compute a line perpendicular to the arrow.
    var rightAngle = angle + Math.PI / 2;
    if (rightAngle > Math.PI * 2) {
      rightAngle -= Math.PI * 2;
    }
    var rightRise = Math.sin(rightAngle);
    var rightRun = Math.cos(rightAngle);

    // Calculate the thickness of the base of the arrow.
    var bubbleSize = this.getBubbleSize();
    var thickness = (bubbleSize.width + bubbleSize.height) /
                    Blockly.Comment.ARROW_THICKNESS;
    thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 2;

    // Back the tip of the arrow off of the icon.
    var backoffRatio = 1 - Blockly.Comment.ICON_RADIUS / hypotenuse;
    relIconX = relBubbleX + backoffRatio * run;
    relIconY = relBubbleY + backoffRatio * rise;

    // Coordinates for the base of the arrow.
    var baseX1 = relBubbleX + thickness * rightRun;
    var baseY1 = relBubbleY + thickness * rightRise;
    var baseX2 = relBubbleX - thickness * rightRun;
    var baseY2 = relBubbleY - thickness * rightRise;

    // Distortion to curve the arrow.
    var swirlAngle = angle + this.arrow_radians_;
    if (swirlAngle > Math.PI * 2) {
      swirlAngle -= Math.PI * 2;
    }
    var swirlRise = Math.sin(swirlAngle) *
        hypotenuse / Blockly.Comment.ARROW_BEND;
    var swirlRun = Math.cos(swirlAngle) *
        hypotenuse / Blockly.Comment.ARROW_BEND;

    steps.push('M' + baseX1 + ',' + baseY1);
    steps.push('C' + (baseX1 + swirlRun) + ',' + (baseY1 + swirlRise) +
               ' ' + relIconX + ',' + relIconY +
               ' ' + relIconX + ',' + relIconY);
    steps.push('C' + relIconX + ',' + relIconY +
               ' ' + (baseX2 + swirlRun) + ',' + (baseY2 + swirlRise) +
               ' ' + baseX2 + ',' + baseY2);
  }
  steps.push('z');
  this.bubbleArrow_.setAttribute('d', steps.join(' '));
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
Blockly.Comment.prototype.getText = function() {
  return this.textarea_.value;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 */
Blockly.Comment.prototype.setText = function(text) {
  this.textarea_.value = text;
};

/**
 * Change the colour of a comment to match its block.
 */
Blockly.Comment.prototype.updateColour = function() {
  var hexColour = Blockly.makeColour(this.block_.getColour());
  this.bubbleBack_.setAttribute('fill', hexColour);
  this.bubbleArrow_.setAttribute('fill', hexColour);
};

/**
 * Destroy this comment.
 */
Blockly.Comment.prototype.destroy = function() {
  Blockly.Comment.unbindDragEvents_();
  // Destroy and unlink the icon.
  this.iconGroup_.parentNode.removeChild(this.iconGroup_);
  this.iconGroup_ = null;
  // Destroy and unlink the bubble.
  this.bubbleGroup_.parentNode.removeChild(this.bubbleGroup_);
  this.textarea_ = null;
  this.bubbleGroup_ = null;
  // Disconnect links between the block and the comment.
  this.block_.comment = null;
  this.block_ = null;
};

/**
 * Render the icon for this comment.
 * @param {number} titleX Horizontal offset at which to position the icon.
 * @return {number} Width of icon.
 */
Blockly.Comment.prototype.renderIcon = function(titleX) {
  if (this.block_.collapsed) {
    this.iconGroup_.setAttribute('display', 'none');
    return 0;
  }
  this.iconGroup_.setAttribute('display', 'block');

  var TOP_MARGIN = 5;
  var diameter = 2 * Blockly.Comment.ICON_RADIUS;
  if (Blockly.RTL) {
    titleX -= diameter;
  }
  this.iconGroup_.setAttribute('transform',
                               'translate(' + titleX + ', ' + TOP_MARGIN + ')');
  this.computeIconLocation();

  if (window.navigator.userAgent.indexOf('Chrome/') != -1) {
    /* HACK:
     The current version of Chrome (16.0) has a redraw bug which fails to update
     changes to the comment bubble's colour or changes to the arrow's geometry.
     Needlessly calling positionBubble_ solves this.
     If Chrome starts behaving properly with the following line commented out,
     then delete this entire hack.
    */
    this.positionBubble_();
  }
  return diameter;
};

/**
 * Notification that the icon has moved.  Update the arrow accordingly.
 * @param {number} x Absolute horizontal location.
 * @param {number} y Absolute vertical location.
 */
Blockly.Comment.prototype.setIconLocation = function(x, y) {
  this.iconX_ = x;
  this.iconY_ = y;
  this.positionBubble_();
};

/**
 * Notification that the icon has moved, but we don't really know where.
 * Recompute the icon's location from sratch.
 */
Blockly.Comment.prototype.computeIconLocation = function() {
  // Find coordinates for the centre of the icon and update the arrow.
  var blockXY = this.block_.getRelativeToSurfaceXY();
  var iconXY = Blockly.getRelativeXY_(this.iconGroup_);
  var newX = blockXY.x + iconXY.x + Blockly.Comment.ICON_RADIUS;
  var newY = blockXY.y + iconXY.y + Blockly.Comment.ICON_RADIUS;
  if (newX !== this.iconX_ || newY !== this.iconY_) {
    this.iconX_ = newX;
    this.iconY_ = newY;
    this.positionBubble_();
  }
};

/**
 * Returns the center of the block's icon relative to the surface.
 * @return {!Object} Object with x and y properties.
 */
Blockly.Comment.prototype.getIconLocation = function() {
  return {x: this.iconX_, y: this.iconY_};
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a connection between blocks.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @param {string} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @constructor
 */
Blockly.Connection = function(source, type, check) {
  this.sourceBlock_ = source;
  this.targetConnection = null;
  this.type = type;
  if (check) {
    // Ensure that check is in an array.
    if (!(check instanceof Array)) {
      check = [check];
    }
    this.check_ = check;
  } else {
    this.check_ = null;
  }
  this.x_ = 0;
  this.y_ = 0;
  this.inDB_ = false;
  // Shortcut for the databases for this connection's workspace.
  this.dbList_ = this.sourceBlock_.workspace.connectionDBList;
};

/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.destroy = function() {
  if (this.targetConnection) {
    throw 'Disconnect connection before destroying it.';
  }
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  this.inDB_ = false;
  if (Blockly.highlightedConnection_ == this) {
    Blockly.highlightedConnection_ = null;
  }
  if (Blockly.localConnection_ == this) {
    Blockly.localConnection_ = null;
  }
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
Blockly.Connection.prototype.connect = function(otherConnection) {
  if (this.sourceBlock_ == otherConnection.sourceBlock_) {
    throw 'Attempted to connect a block to itself.';
  }
  if (this.sourceBlock_.workspace !== otherConnection.sourceBlock_.workspace) {
    throw 'Blocks are on different workspaces.';
  }
  if (Blockly.OPPOSITE_TYPE[this.type] != otherConnection.type) {
    throw 'Attempt to connect incompatible types.';
  }
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    if (this.targetConnection) {
      // Can't make a value connection if male block is already connected.
      throw 'Source connection already connected (value).';
    } else if (otherConnection.targetConnection) {
      // If female block is already connected, disconnect and bump the male.
      var orphanBlock = otherConnection.targetBlock();
      orphanBlock.setParent(null);
      // Attempt to reattach the orphan at the end of the newly inserted
      // block.  Since this block may be a row, walk down to the end.
      function singleInput(block) {
        var input = false;
        for (var x = 0; x < block.inputList.length; x++) {
          if (block.inputList[x].type == Blockly.INPUT_VALUE &&
              orphanBlock.outputConnection.checkType_(block.inputList[x])) {
            if (input) {
              return null;  // More than one input.
            }
            input = block.inputList[x];
          }
        }
        return input;
      };
      var newBlock = this.sourceBlock_;
      var connection;
      while (connection = singleInput(newBlock)) {  // '=' is intentional.
        if (connection.targetBlock()) {
          newBlock = connection.targetBlock();
        } else {
          connection.connect(orphanBlock.outputConnection);
          orphanBlock = null;
          break;
        }
      }
      if (orphanBlock) {
        // Unable to reattach orphan.  Bump it off to the side.
        window.setTimeout(function() {
              orphanBlock.outputConnection.bumpAwayFrom_(otherConnection);
            }, Blockly.BUMP_DELAY);
      }
    }
  } else {
    if (this.targetConnection) {
      throw 'Source connection already connected (block).';
    } else if (otherConnection.targetConnection) {
      // Statement blocks may be inserted into the middle of a stack.
      if (this.type != Blockly.PREVIOUS_STATEMENT) {
        throw 'Can only do a mid-stack connection with the top of a block.';
      }
      // Split the stack.
      var orphanBlock = otherConnection.targetBlock();
      orphanBlock.setParent(null);
      // Attempt to reattach the orphan at the bottom of the newly inserted
      // block.  Since this block may be a stack, walk down to the end.
      var newBlock = this.sourceBlock_;
      while (newBlock.nextConnection) {
        if (newBlock.nextConnection.targetConnection) {
          newBlock = newBlock.nextConnection.targetBlock();
        } else {
          newBlock.nextConnection.connect(orphanBlock.previousConnection);
          orphanBlock = null;
          break;
        }
      }
      if (orphanBlock) {
        // Unable to reattach orphan.  Bump it off to the side.
        window.setTimeout(function() {
              orphanBlock.previousConnection.bumpAwayFrom_(otherConnection);
            }, Blockly.BUMP_DELAY);
      }
    }
  }

  // Determine which block is superior (higher in the source stack)
  var parentBlock, childBlock;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.NEXT_STATEMENT) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.sourceBlock_;
  } else {
    // Inferior block.
    parentBlock = otherConnection.sourceBlock_;
    childBlock = this.sourceBlock_;
  }

  // Establish the connections.
  this.targetConnection = otherConnection;
  otherConnection.targetConnection = this;

  // Demote the inferior block so that one is a child of the superior one.
  childBlock.setParent(parentBlock);

  // Rendering a node will move its connected children into position.
  if (parentBlock.rendered) {
    parentBlock.render();
  }
};

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  if (!otherConnection) {
    throw 'Source connection not connected.';
  } else if (otherConnection.targetConnection != this) {
    throw 'Target connection not connected to source connection.';
  }
  otherConnection.targetConnection = null;
  this.targetConnection = null;

  // Rerender the parent so that it may reflow.
  var parentBlock;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.NEXT_STATEMENT) {
    // Superior block.
    parentBlock = this.sourceBlock_;
  } else {
    // Inferior block.
    parentBlock = otherConnection.sourceBlock_;
  }
  if (parentBlock.rendered) {
    parentBlock.render();
  }
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
Blockly.Connection.prototype.targetBlock = function() {
  if (this.targetConnection) {
    return this.targetConnection.sourceBlock_;
  }
  return null;
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.Connection.prototype.bumpAwayFrom_ = function(staticConnection) {
  if (Blockly.Block.dragMode_ != 0) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  var reverse = false;
  if (!rootBlock.editable) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is editable.
    rootBlock = staticConnection.sourceBlock_.getRootBlock();
    if (!rootBlock.editable) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visiblility.
  rootBlock.getSvgRoot().parentNode.appendChild(rootBlock.getSvgRoot());
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS * 2) - this.y_;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (Blockly.RTL) {
    dx = -dx;
  }
  rootBlock.moveBy(dx, dy);
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate.
 * @param {number} y New absolute y coordinate.
 */
Blockly.Connection.prototype.moveTo = function(x, y) {
  // Remove it from its old location in the database (if already present)
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  this.x_ = x;
  this.y_ = y;
  // Insert it into its new location in the database.
  this.dbList_[this.type].addConnection_(this);
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate.
 * @param {number} dy Change to y coordinate.
 */
Blockly.Connection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x_ + dx, this.y_ + dy);
};

/**
 * Add highlighting around this connection.
 */
Blockly.Connection.prototype.highlight = function() {
  var steps;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    var tabWidth = Blockly.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
                                 Blockly.BlockSvg.TAB_WIDTH;
    steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
            tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
  } else {
    if (Blockly.RTL) {
      steps = 'm 20,0 h -5 l -6,4 -3,0 -6,-4 h -5';
    } else {
      steps = 'm -20,0 h 5 l 6,4 3,0 6,-4 h 5';
    }
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
      {'class': 'blocklyHighlightedConnectionPath',
       d: steps,
       transform: 'translate(' + x + ', ' + y + ')'},
      this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.Connection.prototype.unhighlight = function() {
  var path = Blockly.Connection.highlightedPath_;
  path.parentNode.removeChild(path);
  delete Blockly.Connection.highlightedPath_;
};

/**
 * Move the blocks on either side of this connection right next to each other.
 * @private
 */
Blockly.Connection.prototype.tighten_ = function() {
  var dx = Math.round(this.targetConnection.x_ - this.x_);
  var dy = Math.round(this.targetConnection.y_ - this.y_);
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var xy = Blockly.getRelativeXY_(block.getSvgRoot());
    block.getSvgRoot().setAttribute('transform',
        'translate(' + (xy.x - dx) + ', ' + (xy.y - dy) + ')');
    block.moveConnections_(-dx, -dy);
  }
};

/**
 * Find the closest compatible connection to this connection.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!Object} Contains two properties: 'connection' which is either
 *     another connection or null, and 'radius' which is the distance.
 */
Blockly.Connection.prototype.closest = function(maxLimit, dx, dy) {
  if (this.targetConnection) {
    // Don't offer to connect to a connection that's already connected.
    return {connection: null, radius: maxLimit};
  }
  // Determine the opposite type of connection.
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];

  // Since this connection is probably being dragged, add the delta.
  var currentX = this.x_ + dx;
  var currentY = this.y_ + dy;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var closestConnection = null;
  var sourceBlock = this.sourceBlock_;
  var thisConnection = this;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the search needs to continue: either the current
   *     connection's vertical distance from the other connection is less than
   *     the allowed radius, or if the connection is not compatible.
   */
  function checkConnection_(yIndex) {
    var connection = db[yIndex];
    if (connection.type == Blockly.OUTPUT_VALUE ||
        connection.type == Blockly.PREVIOUS_STATEMENT) {
      // Don't offer to connect an already connected left (male) value plug to
      // an available right (female) value plug.  Don't offer to connect the
      // bottom of a statement block to one that's already connected.
      if (connection.targetConnection) {
        return true;
      }
    }
    // Offering to connect the top of a statement block to an already connected
    // connection is ok, we'll just insert it into the stack.
    // Offering to connect the left (male) of a value block to an already
    // connected value pair is ok, we'll splice it in.

    // Do type checking.
    if (!thisConnection.checkType_(connection)) {
      return true;
    }

    // Don't let blocks try to connect to themselves or ones they nest.
    var targetSourceBlock = connection.sourceBlock_;
    do {
      if (sourceBlock == targetSourceBlock) {
        return true;
      }
      targetSourceBlock = targetSourceBlock.getParent();
    } while (targetSourceBlock);

    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxLimit) {
      closestConnection = db[yIndex];
      maxLimit = r;
    }
    return dy < maxLimit;
  }
  return {connection: closestConnection, radius: maxLimit};
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
Blockly.Connection.prototype.checkType_ = function(otherConnection) {
  if (!this.check_ || !otherConnection.check_) {
    // One or both sides are promiscuous enough that anything will fit.
    return true;
  }
  // Find any intersection in the check lists.
  for (var x = 0; x < this.check_.length; x++) {
    if (otherConnection.check_.indexOf(this.check_[x]) != -1) {
      return true;
    }
  }
  // No intersection.
  return false;
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 * @private
 */
Blockly.Connection.prototype.neighbours_ = function(maxLimit) {
  // Determine the opposite type of connection.
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];

  var currentX = this.x_;
  var currentY = this.y_;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var neighbours = [];
  var sourceBlock = this.sourceBlock_;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the current connection's vertical distance from
   *     the other connection is less than the allowed radius.
   */
  function checkConnection_(yIndex) {
    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxLimit) {
      neighbours.push(db[yIndex]);
    }
    return dy < maxLimit;
  }
  return neighbours;
};

/**
 * Hide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is collapsed.
 * Also hides down-stream comments.
 */
Blockly.Connection.prototype.hideAll = function() {
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  if (this.targetConnection) {
    var blocks = this.targetBlock().getDescendants();
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      // Hide all connections of all children.
      var connections = block.getConnections_(true);
      for (var c = 0; c < connections.length; c++) {
        var connection = connections[c];
        if (connection.inDB_) {
          this.dbList_[connection.type].removeConnection_(connection);
        }
      }
      // Hide all comments of all children.
      if (block.comment) {
        block.comment.setVisible_(false);
      }
    }
  }
};

/**
 * Unhide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is expanded.
 * Also unhides down-stream comments.
 * @return {!Array.<Blockly.Block>} List of blocks to render.
 */
Blockly.Connection.prototype.unhideAll = function() {
  if (!this.inDB_) {
    this.dbList_[this.type].addConnection_(this);
  }
  // All blocks that need unhiding must be unhidden before any rendering takes
  // place, since rendering requires knowing the dimensions of lower blocks.
  // Also, since rendering a block renders all its parents, we only need to
  // render the leaf nodes.
  var renderList = [];
  if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
    // Only spider down.
    return renderList;
  }
  var block = this.targetBlock();
  if (block) {
    var connections;
    if (block.collapsed) {
      // This block should only be partially revealed since it is collapsed.
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection);
    } else {
      // Show all connections of this block.
      connections = block.getConnections_(true);
    }
    for (var c = 0; c < connections.length; c++) {
      renderList = renderList.concat(connections[c].unhideAll());
    }
    if (renderList.length == 0) {
      // Leaf block.
      renderList[0] = block;
    }
    // Show any pinned comments.
    if (block.comment && block.comment.isPinned()) {
        block.comment.setVisible_(true);
    }
  }
  return renderList;
};


/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @constructor
 */
Blockly.ConnectionDB = function() {
};

Blockly.ConnectionDB.prototype = new Array();

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 * @private
 */
Blockly.ConnectionDB.prototype.addConnection_ = function(connection) {
  if (connection.inDB_) {
    throw 'Connection already in database.';
  }
  // Insert connection using binary search.
  var pointerMin = 0;
  var pointerMax = this.length;
  while (pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1;
    } else if (this[pointerMid].y_ > connection.y_) {
      pointerMax = pointerMid;
    } else {
      pointerMin = pointerMid;
      break;
    }
  }
  this.splice(pointerMin, 0, connection);
  connection.inDB_ = true;
};

/**
 * Remove a connection from the database.  Must already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be removed.
 * @private
 */
Blockly.ConnectionDB.prototype.removeConnection_ = function(connection) {
  if (!connection.inDB_) {
    throw 'Connection not in database.';
  }
  connection.inDB_ = false;
  // Find the connection using a binary search.
  var pointerMin = 0;
  var pointerMax = this.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the connection.
  // When found, splice it out of the array.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  while (pointerMin >= 0 && this[pointerMin].y_ == connection.y_) {
    if (this[pointerMin] == connection) {
      this.splice(pointerMin, 1);
      return;
    }
    pointerMin--;
  }
  do {
    if (this[pointerMax] == connection) {
      this.splice(pointerMax, 1);
      return;
    }
    pointerMax++;
  } while (pointerMax < this.length &&
           this[pointerMax].y_ == connection.y_);
  throw 'Unable to find connection in connectionDB.';
};

/**
 * Initialize a set of connection DBs for a specified workspace.
 * @param {!Element} workspace SVG root element.
 */
Blockly.ConnectionDB.init = function(workspace) {
  // Create four databases, one for each connection type.
  var dbList = [];
  dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB();
  dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB();
  workspace.connectionDBList = dbList;
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Functionality for the right-click context menus.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Due to a bug in Webkit concerning the stacking order of background colours,
 * it is not possible to use foreignObject to nest an HTML context menu in
 * an SVG document.  Therefore the context menu is purely SVG.
 * http://code.google.com/p/chromium/issues/detail?id=35545
 */

// Name space for the context menu.
Blockly.ContextMenu = {};

// Horizontal padding on either side of each option.
Blockly.ContextMenu.X_PADDING = 20;

// Vertical height of each option.
Blockly.ContextMenu.Y_HEIGHT = 20;

// Is a context menu currently showing?
Blockly.ContextMenu.visible = false;

/**
 * Creates the context menu's DOM.  Only needs to be called once.
 * @return {!Element} The context menu's SVG group.
 */
Blockly.ContextMenu.createDom = function() {
  /*
  <g class="blocklyHidden">
    <rect class="blocklyContextMenuShadow" x="2" y="-2" rx="4" ry="4"/>
    <rect class="blocklyContextMenuBackground" y="-4" rx="4" ry="4"/>
    <g class="blocklyContextMenuOptions">
    </g>
  </g>
  */
  var svgGroup =
      Blockly.createSvgElement('g', {'class': 'blocklyHidden'}, null);
  Blockly.ContextMenu.svgGroup = svgGroup;
  Blockly.ContextMenu.svgShadow = Blockly.createSvgElement('rect',
      {'class': 'blocklyContextMenuShadow',
      x: 2, y: -2, rx: 4, ry: 4}, svgGroup);
  Blockly.ContextMenu.svgBackground = Blockly.createSvgElement('rect',
      {'class': 'blocklyContextMenuBackground',
      y: -4, rx: 4, ry: 4}, svgGroup);
  Blockly.ContextMenu.svgOptions = Blockly.createSvgElement('g',
      {'class': 'blocklyContextMenuOptions'}, svgGroup);
  return svgGroup;
};

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {number} anchorX X-coordinate of anchor point.
 * @param {number} anchorY Y-coordinate of anchor point.
 * @param {!Array.<Object>} options Array of menu options.
 */
Blockly.ContextMenu.show = function(anchorX, anchorY, options) {
  if (options.length == 0) {
    Blockly.ContextMenu.hide();
  }
  /* Here's what one option object looks like:
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  // Erase all existing options.
  Blockly.removeChildren_(Blockly.ContextMenu.svgOptions);
  /* Here's the SVG we want for each option:
    <g class="blocklyMenuDiv" transform="translate(0, 0)">
      <rect width="100" height="20"/>
      <text class="blocklyMenuText" x="20" y="15">Make It So</text>
    </g>
  */
  // The menu must be made visible early since otherwise BBox and
  // getComputedTextLength will return 0.
  Blockly.ContextMenu.svgGroup.style.display = 'block';
  var maxWidth = 0;
  var resizeList = [Blockly.ContextMenu.svgBackground,
                    Blockly.ContextMenu.svgShadow];
  for (var x = 0, option; option = options[x]; x++) {
    var gElement = Blockly.ContextMenu.optionToDom(option.text);
    var rectElement = gElement.firstChild;
    var textElement = gElement.lastChild;
    Blockly.ContextMenu.svgOptions.appendChild(gElement);

    gElement.setAttribute('transform',
        'translate(0, ' + (x * Blockly.ContextMenu.Y_HEIGHT) + ')');
    resizeList.push(rectElement);
    Blockly.bindEvent_(gElement, 'mousedown', null, Blockly.noEvent);
    if (option.enabled) {
      Blockly.bindEvent_(gElement, 'mouseup', null, option.callback);
      Blockly.bindEvent_(gElement, 'mouseup', null, Blockly.ContextMenu.hide);
    } else {
      gElement.setAttribute('class', 'blocklyMenuDivDisabled');
    }
    // Compute the length of the longest text length.
    maxWidth = Math.max(maxWidth, textElement.getComputedTextLength());
  }
  // Run a second pass to resize all options to the required width.
  maxWidth += Blockly.ContextMenu.X_PADDING * 2;
  for (var x = 0; x < resizeList.length; x++) {
    resizeList[x].setAttribute('width', maxWidth);
  }
  if (Blockly.RTL) {
    // Right-align the text.
    for (var x = 0, gElement;
         gElement = Blockly.ContextMenu.svgOptions.childNodes[x]; x++) {
      var textElement = gElement.lastChild;
      textElement.setAttribute('x', maxWidth -
          textElement.getComputedTextLength() - Blockly.ContextMenu.X_PADDING);
    }
  }
  Blockly.ContextMenu.svgBackground.setAttribute('height',
      options.length * Blockly.ContextMenu.Y_HEIGHT + 8);
  Blockly.ContextMenu.svgShadow.setAttribute('height',
      options.length * Blockly.ContextMenu.Y_HEIGHT + 10);
  // Measure the menu's size and position it so that it does not go off-screen.
  var bBox = Blockly.ContextMenu.svgGroup.getBBox();
  var svgSize = Blockly.svgSize();
  anchorX -= svgSize.left;
  anchorY -= svgSize.top;
  if (anchorY + bBox.height > svgSize.height) {
    // Falling off the bottom of the screen; shift the menu up.
    anchorY -= bBox.height - 10;
  }
  if (Blockly.RTL) {
    if (anchorX - bBox.width <= 0) {
      anchorX++;
    } else {
      anchorX -= bBox.width;
    }
  } else {
    if (anchorX + bBox.width > svgSize.width) {
      anchorX -= bBox.width;
    } else {
      anchorX++;
    }
  }
  Blockly.ContextMenu.svgGroup.setAttribute('transform',
      'translate(' + anchorX + ', ' + anchorY + ')');
  Blockly.ContextMenu.visible = true;
};

/**
 * Create the DOM nodes for a menu option.
 * @param {string} text The option's text.
 * @return {!Element} <g> node containing the menu option.
 */
Blockly.ContextMenu.optionToDom = function(text) {
  /* Here's the SVG we create:
    <g class="blocklyMenuDiv">
      <rect height="20"/>
      <text class="blocklyMenuText" x="20" y="15">Make It So</text>
    </g>
  */
  var gElement = Blockly.createSvgElement('g', {'class': 'blocklyMenuDiv'},
                                          null);
  var rectElement = Blockly.createSvgElement('rect',
      {height: Blockly.ContextMenu.Y_HEIGHT}, gElement);
  var textElement = Blockly.createSvgElement('text',
      {'class': 'blocklyMenuText',
      x: Blockly.ContextMenu.X_PADDING,
      y: 15}, gElement);
  var textNode = Blockly.svgDoc.createTextNode(text);
  textElement.appendChild(textNode);
  return gElement;
};

/**
 * Hide the context menu.
 */
Blockly.ContextMenu.hide = function() {
  if (Blockly.ContextMenu.visible) {
    Blockly.ContextMenu.svgGroup.style.display = 'none';
    Blockly.ContextMenu.visible = false;
  }
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Input field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be Blockly.FieldTextInput, Blockly.FieldDropdown, etc.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for an editable field.
 * @param {?string} text The initial content of the field.
 * @constructor
 */
Blockly.Field = function(text) {
  if (text === null) {
    // This is a Field instance to be used in inheritance.
    return;
  }
  this.sourceBlock_ = null;
  // Build the DOM.
  this.group_ = Blockly.createSvgElement('g', {}, null);
  this.borderRect_ = Blockly.createSvgElement('rect',
      {rx: 4, ry: 4}, this.group_);
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText'}, this.group_);
  if (this.CURSOR) {
    // Different field types show different cursor hints.
    this.group_.style.cursor = this.CURSOR;
  }
  this.setText(text);
};

/**
 * Non-breaking space.
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.init = function(block) {
  if (this.sourceBlock_) {
    throw 'Field has already been initialized once.';
  }
  this.sourceBlock_ = block;
  this.group_.setAttribute('class',
      block.editable ? 'blocklyEditableText' : 'blocklyNonEditableText');
  block.getSvgRoot().appendChild(this.group_);
  if (block.editable) {
    this.mouseUpWrapper_ =
        Blockly.bindEvent_(this.group_, 'mouseup', this, this.onMouseUp_);
  }
};

/**
 * Destroy all DOM objects belonging to this editable field.
 */
Blockly.Field.prototype.destroy = function() {
  if (this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.group_, 'mouseup', this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
  }
  this.sourceBlock_ = null;
  this.group_.parentNode.removeChild(this.group_);
  this.group_ = null;
  this.textElement_ = null;
  this.borderRect_ = null;
};

/**
 * Sets whether this editable field is visible or not.
 * @param {boolean} visible True if visible.
 */
Blockly.Field.prototype.setVisible = function(visible) {
  this.getRootElement().style.display = visible ? 'block' : 'none';
};

/**
 * Gets the group element for this editable field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.Field.prototype.getRootElement = function() {
  return this.group_;
};

/**
 * Draws the border in the correct location.
 * Returns the resulting bounding box.
 * @return {Object} Object containing width/height/x/y properties.
 */
Blockly.Field.prototype.render = function() {
  try {
    var bBox = this.textElement_.getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (bBox.height == 0) {
    bBox.height = 18;
  }
  var width = bBox.width + Blockly.BlockSvg.SEP_SPACE_X;
  var height = bBox.height;
  var left = bBox.x - Blockly.BlockSvg.SEP_SPACE_X / 2;
  var top = bBox.y;
  this.borderRect_.setAttribute('width', width);
  this.borderRect_.setAttribute('height', height);
  this.borderRect_.setAttribute('x', left);
  this.borderRect_.setAttribute('y', top);
  return bBox;
};

/**
 * Returns the width of the title.
 * @return {number} Width.
 */
Blockly.Field.prototype.width = function() {
  var bBox = this.render();
  if (!bBox) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return 0;
  }
  if (bBox.width == -Infinity) {
    // Opera has trouble with bounding boxes around empty objects.
    return 0;
  }
  return bBox.width;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getText = function() {
  return this.text_;
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {string} text New text.
 */
Blockly.Field.prototype.setText = function(text) {
  this.text_ = text;
  // Empty the text element.
  Blockly.removeChildren_(this.textElement_);
  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if (!text) {
    // Prevent the field from disappearing if empty.
    text = Blockly.Field.NBSP;
  }
  var textNode = Blockly.svgDoc.createTextNode(text);
  this.textElement_.appendChild(textNode);

  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getValue = function() {
  return this.getText();
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} text New text.
 */
Blockly.Field.prototype.setValue = function(text) {
  this.setText(text);
};

/**
 * Handle a mouse up event on an editable field.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Field.prototype.onMouseUp_ = function(e) {
  if (e.button == 2) {
    // Right-click.
    return;
  } else if (Blockly.Block.dragMode_ == 2) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  }
  // Non-abstract sub-classes must define a showEditor_ method.
  this.showEditor_();
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.Field.prototype.setTooltip = function(newTip) {
  // Non-abstract sub-classes may wish to implement this.  See FieldLabel.
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<string>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.
 * @constructor
 */
Blockly.FieldDropdown = function(menuGenerator, opt_changeHandler) {
  this.menuGenerator_ = menuGenerator;
  this.changeHandler_ = opt_changeHandler;
  var firstText = this.getOptions_()[0][0];
  // Call parent's constructor.
  Blockly.Field.call(this, firstText);
};

// FieldDropdown is a subclass of Field.
Blockly.FieldDropdown.prototype = new Blockly.Field(null);

/**
 * Create the dropdown field's elements.  Only needs to be called once.
 * @return {!Element} The field's SVG group.
 */
Blockly.FieldDropdown.createDom = function() {
  /*
  <g class="blocklyHidden">
    <rect class="blocklyDropdownMenuShadow" x="0" y="1" rx="2" ry="2"/>
    <rect x="-2" y="-1" rx="2" ry="2"/>
    <g class="blocklyDropdownMenuOptions">
    </g>
  </g>
  */
  var svgGroup = Blockly.createSvgElement('g', {'class': 'blocklyHidden'},
                                          null);
  Blockly.FieldDropdown.svgGroup_ = svgGroup;
  Blockly.FieldDropdown.svgShadow_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyDropdownMenuShadow',
      x: 0, y: 1, rx: 2, ry: 2}, svgGroup);
  Blockly.FieldDropdown.svgBackground_ = Blockly.createSvgElement('rect',
      {x: -2, y: -1, rx: 2, ry: 2,
      filter: 'url(#blocklyEmboss)'}, svgGroup);
  Blockly.FieldDropdown.svgOptions_ = Blockly.createSvgElement('g',
      {'class': 'blocklyDropdownMenuOptions'}, svgGroup);
  return svgGroup;
};

/**
 * Corner radius of the dropdown background.
 */
Blockly.FieldDropdown.CORNER_RADIUS = 2;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  var svgGroup = Blockly.FieldDropdown.svgGroup_;
  var svgOptions = Blockly.FieldDropdown.svgOptions_;
  var svgBackground = Blockly.FieldDropdown.svgBackground_;
  var svgShadow = Blockly.FieldDropdown.svgShadow_;
  // Erase all existing options.
  Blockly.removeChildren_(svgOptions);
  // The menu must be made visible early since otherwise BBox and
  // getComputedTextLength will return 0.
  svgGroup.style.display = 'block';

  function callbackFactory(text) {
    return function(e) {
      if (this.changeHandler_) {
        this.changeHandler_(text);
      } else {
        this.setText(text);
      }
      // This mouse click has been handled, don't bubble up to document.
      e.stopPropagation();
    };
  }

  var maxWidth = 0;
  var resizeList = [];
  var checkElement = null;
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    var text = options[x][0];  // Human-readable text.
    var value = options[x][1]; // Language-neutral value.
    var gElement = Blockly.ContextMenu.optionToDom(text);
    var rectElement = gElement.firstChild;
    var textElement = gElement.lastChild;
    svgOptions.appendChild(gElement);
    // Add a checkmark next to the current item.
    if (!checkElement && text == this.text_) {
      checkElement = Blockly.createSvgElement('text',
          {'class': 'blocklyMenuText', y: 15}, null);
      // Insert the checkmark between the rect and text, thus preserving the
      // ability to reference them as firstChild and lastChild respectively.
      gElement.insertBefore(checkElement, textElement);
      checkElement.appendChild(Blockly.svgDoc.createTextNode('\u2713'));
    }

    gElement.setAttribute('transform',
        'translate(0, ' + (x * Blockly.ContextMenu.Y_HEIGHT) + ')');
    resizeList.push(rectElement);
    Blockly.bindEvent_(gElement, 'mousedown', null, Blockly.noEvent);
    Blockly.bindEvent_(gElement, 'mouseup', this, callbackFactory(text));
    Blockly.bindEvent_(gElement, 'mouseup', null,
                       Blockly.FieldDropdown.hideMenu);
    // Compute the length of the longest text length.
    maxWidth = Math.max(maxWidth, textElement.getComputedTextLength());
  }
  // Run a second pass to resize all options to the required width.
  maxWidth += Blockly.ContextMenu.X_PADDING * 2;
  for (var x = 0; x < resizeList.length; x++) {
    resizeList[x].setAttribute('width', maxWidth);
  }
  if (Blockly.RTL) {
    // Right-align the text.
    for (var x = 0, gElement; gElement = svgOptions.childNodes[x]; x++) {
      var textElement = gElement.lastChild;
      textElement.setAttribute('x', maxWidth -
          textElement.getComputedTextLength() - Blockly.ContextMenu.X_PADDING);
    }
  }
  if (checkElement) {
    if (Blockly.RTL) {
      // Research indicates that RTL checkmarks are supposed to be drawn the
      // same in the same direction as LTR checkmarks.  It's only the alignment
      // that needs to change.
      checkElement.setAttribute('x',
          maxWidth - 5 - checkElement.getComputedTextLength());
    } else {
      checkElement.setAttribute('x', 5);
    }
  }
  var width = maxWidth + Blockly.FieldDropdown.CORNER_RADIUS * 2;
  var height = options.length * Blockly.ContextMenu.Y_HEIGHT +
               Blockly.FieldDropdown.CORNER_RADIUS + 1;
  svgShadow.setAttribute('width', width);
  svgShadow.setAttribute('height', height);
  svgBackground.setAttribute('width', width);
  svgBackground.setAttribute('height', height);
  var hexColour = Blockly.makeColour(this.sourceBlock_.getColour());
  svgBackground.setAttribute('fill', hexColour);
  // Position the dropdown to line up with the field.
  var xy = Blockly.getAbsoluteXY_(this.borderRect_);
  var borderBBox = this.borderRect_.getBBox();
  var x;
  if (Blockly.RTL) {
    x = xy.x - maxWidth + Blockly.ContextMenu.X_PADDING + borderBBox.width -
        Blockly.BlockSvg.SEP_SPACE_X / 2;
  } else {
    x = xy.x - Blockly.ContextMenu.X_PADDING + Blockly.BlockSvg.SEP_SPACE_X / 2;
  }
  svgGroup.setAttribute('transform',
      'translate(' + x + ', ' + (xy.y + borderBBox.height) + ')');
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldDropdown.prototype.getOptions_ = function() {
  if (typeof this.menuGenerator_ == 'function') {
    return this.menuGenerator_.call(this);
  }
  return this.menuGenerator_;
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldDropdown.prototype.getValue = function() {
  var selectedText = this.text_;
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][0] == selectedText) {
      return options[x][1];
    }
  }
  throw '"' + selectedText + '" not valid in dropdown.';
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldDropdown.prototype.setValue = function(newValue) {
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][1] == newValue) {
      this.setText(options[x][0]);
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.setText(newValue);
};

/**
 * Hide the dropdown menu.
 */
Blockly.FieldDropdown.hideMenu = function() {
  Blockly.FieldDropdown.svgGroup_.style.display = 'none';
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Non-editable text field.  Used for titles, labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a non-editable field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
Blockly.FieldLabel = function(text) {
  this.sourceBlock_ = null;
  // Build the DOM.
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText'}, null);
  this.setText(text);
};

// Text is a subclass of Field.
Blockly.FieldLabel.prototype = new Blockly.Field(null);

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldLabel.prototype.EDITABLE = false;

/**
 * Install this text on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldLabel.prototype.init = function(block) {
  if (this.sourceBlock_) {
    throw 'Text has already been initialized once.';
  }
  this.sourceBlock_ = block;
  block.getSvgRoot().appendChild(this.textElement_);

  // Configure the field to be transparent with respect to tooltips.
  this.textElement_.tooltip = this.sourceBlock_;
  Blockly.Tooltip && Blockly.Tooltip.bindMouseEvents(this.textElement_);
};

/**
 * Destroy all DOM objects belonging to this text.
 */
Blockly.FieldLabel.prototype.destroy = function() {
  this.textElement_.parentNode.removeChild(this.textElement_);
  this.textElement_ = null;
};

/**
 * Gets the group element for this field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.FieldLabel.prototype.getRootElement = function() {
  return this.textElement_;
};

/**
 * Returns the resulting bounding box.
 * @return {Object} Object containing width/height/x/y properties.
 */
Blockly.FieldLabel.prototype.render = function() {
  try {
    var bBox = this.textElement_.getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (bBox.height == 0) {
    bBox.height = 18;
  }
  return bBox;
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldLabel.prototype.setTooltip = function(newTip) {
  this.textElement_.tooltip = newTip;
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Text input field.  Used for editable titles and variables.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_validationFunc An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @constructor
 */
Blockly.FieldTextInput = function(text, opt_validationFunc) {
  // Call parent's constructor.
  Blockly.Field.call(this, text);
  this.validationFunc_ = opt_validationFunc;
};

// FieldTextInput is a subclass of Field.
Blockly.FieldTextInput.prototype = new Blockly.Field(null);

/**
 * Set the text in this field.
 * @param {string} text New text.
 */
Blockly.FieldTextInput.prototype.setText = function(text) {
  if (this.validationFunc_) {
    var validated = this.validationFunc_(text);
    // If the new text is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null) {
      text = validated;
    }
  }
  Blockly.Field.prototype.setText.call(this, text);
};

/**
 * Create the editable text field's elements.  Only needs to be called once.
 * @return {!Element} The field's SVG foreignObject.
 */
Blockly.FieldTextInput.createDom = function() {
  /*
  <foreignObject class="blocklyHidden" height="22">
    <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
      <input class="blocklyHtmlInput" xmlns="http://www.w3.org/1999/xhtml"/>
    </body>
  </foreignObject>
  */
  var foreignObject = Blockly.createSvgElement('foreignObject',
      {'class': 'blocklyHidden', height: 22}, null);
  Blockly.FieldTextInput.svgForeignObject_ = foreignObject;
  // Can't use 'Blockly.createSvgElement' since this is not in the SVG NS.
  var body = Blockly.svgDoc.createElement('body');
  body.className = 'blocklyMinimalBody';
  var input = Blockly.svgDoc.createElement('input');
  input.className = 'blocklyHtmlInput';
  input.style.border = 'none';
  input.style.outline = 'none';
  Blockly.FieldTextInput.htmlInput_ = input;
  body.appendChild(input);
  foreignObject.appendChild(body);
  return foreignObject;
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldTextInput.prototype.showEditor_ = function() {
  if (window.opera) {
    /* HACK:
     The current version of Opera (11.61) does not support foreignObject
     content.  Instead of presenting an inline editor, use a modal prompt.
     If Opera starts supporting foreignObjects, then delete this entire hack.
    */
    var newValue = window.prompt(Blockly.MSG_CHANGE_VALUE_TITLE, this.text_);
    if (this.validationFunc_) {
      newValue = this.validationFunc_(newValue);
    }
    if (newValue !== null) {
      this.setText(newValue);
    }
    return;
  }
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  htmlInput.value = htmlInput.defaultValue = this.text_;
  htmlInput.oldValue_ = null;
  var htmlInputFrame = Blockly.FieldTextInput.svgForeignObject_;
  htmlInputFrame.style.display = 'block';
  var xy = Blockly.getAbsoluteXY_(this.borderRect_);
  if (!Blockly.RTL) {
    htmlInputFrame.setAttribute('x', xy.x + 1);
  }
  var isGecko = window.navigator.userAgent.indexOf('Gecko/') != -1;
  if (isGecko) {
    htmlInputFrame.setAttribute('y', xy.y - 1);
  } else {
    htmlInputFrame.setAttribute('y', xy.y - 3);
  }
  htmlInput.focus();
  htmlInput.select();
  // Bind to blur -- close the editor on loss of focus.
  htmlInput.onBlurWrapper_ =
      Blockly.bindEvent_(htmlInput, 'blur', this, this.onHtmlInputBlur_);
  // Bind to keyup -- trap Enter and Esc; resize after every keystroke.
  htmlInput.onKeyUpWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keyup', this,
                         this.onHtmlInputKeyUp_);
  // Bind to keyPress -- repeatedly resize when holding down a key.
  htmlInput.onKeyPressWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keypress', this, this.resizeEditor_);
  this.resizeEditor_();
  this.validate_();
};

/**
 * Handle a blur event on an editor.
 * @param {!Event} e Blur event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputBlur_ = function(e) {
  this.closeEditor_(true);
};

/**
 * Handle a key up event on an editor.
 * @param {!Event} e Key up event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyUp_ = function(e) {
  if (e.keyCode == 13) {
    // Enter
    this.closeEditor_(true);
  } else if (e.keyCode == 27) {
    // Esc
    this.closeEditor_(false);
  } else {
    this.resizeEditor_();
    this.validate_();
  }
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.FieldTextInput.prototype.validate_ = function() {
  var valid = true;
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  if (this.validationFunc_) {
    valid = this.validationFunc_(htmlInput.value);
  }
  if (valid) {
    Blockly.removeClass_(htmlInput, 'blocklyInvalidInput');
  } else {
    Blockly.addClass_(htmlInput, 'blocklyInvalidInput');
  }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function() {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var text = htmlInput.value;
  if (text === htmlInput.oldValue_) {
    // There has been no change.
    return;
  }
  htmlInput.oldValue_ = text;
  this.setText(text);
  var bBox = this.group_.getBBox();
  var htmlInputFrame = Blockly.FieldTextInput.svgForeignObject_;
  htmlInputFrame.setAttribute('width', bBox.width);
  htmlInput.style.width = (bBox.width - 2) + 'px';
  if (Blockly.RTL) {
    // In RTL mode the left edge moves, whereas the right edge is fixed.
    var xy = Blockly.getAbsoluteXY_(this.group_);
    htmlInputFrame.setAttribute('x', xy.x - 4);
  }
};

/**
 * Close the editor and optionally save the results.
 * @param {boolean} save True if the result should be saved.
 * @private
 */
Blockly.FieldTextInput.prototype.closeEditor_ = function(save) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  Blockly.unbindEvent_(htmlInput, 'blur', htmlInput.onBlurWrapper_);
  Blockly.unbindEvent_(htmlInput, 'keyup', htmlInput.onKeyUpWrapper_);
  Blockly.unbindEvent_(htmlInput, 'keypress', htmlInput.onKeyPressWrapper_);

  var text;
  if (save) {
    // Save the edit (if it validates).
    text = htmlInput.value;
    if (this.validationFunc_) {
      text = this.validationFunc_(text);
      if (text === null) {
        // Invalid edit.
        text = htmlInput.defaultValue;
      }
    }
  } else {
    // Cancelling edit.
    text = htmlInput.defaultValue;
  }
  this.setText(text);
  htmlInput.value = '';
  htmlInput.defaultValue = '';
  delete htmlInput.oldValue_;
  var htmlInputFrame = Blockly.FieldTextInput.svgForeignObject_;
  htmlInputFrame.style.display = 'none';
  this.sourceBlock_.render();
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a flyout.
 * @constructor
 */
Blockly.Flyout = function() {
  this.workspace_ = new Blockly.Workspace(false);
};

/**
 * Does the flyout automatically close when a block is created?
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Corner radius of the flyout background.
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 8;

/**
 * Creates the flyout's DOM.  Only needs to be called once.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function() {
  /*
  <g>
    <path class="blocklyFlyoutBackground"/>
    <g></g>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgBackground_ = Blockly.createSvgElement('path',
      {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
  this.svgOptions_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
  this.svgOptions_.appendChild(this.workspace_.createDom());
  return this.svgGroup_;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 */
Blockly.Flyout.prototype.getMetrics = function() {
  if (!this.isVisible()) {
    // Flyout is hidden.
    return null;
  }
  var viewHeight = this.height_ - 2 * this.CORNER_RADIUS;
  var viewWidth = this.width_;
  try {
    var optionBox = this.svgOptions_.getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var optionBox = {height: 0, y: 0};
  }
  return {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height + optionBox.y,
    viewTop: -this.svgOptions_.scrollY,
    contentTop: 0,
    absoluteTop: this.CORNER_RADIUS,
    absoluteLeft: 0
  };
};

/**
 * Sets the Y translation of the flyout to match the scrollbars.
 * @param {!Object} yRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 */
Blockly.Flyout.prototype.setMetrics = function(yRatio) {
  var metrics = this.getMetrics();
  if (typeof yRatio.y == 'number') {
    this.svgOptions_.scrollY =
        -metrics.contentHeight * yRatio.y - metrics.contentTop;
  }
  var y = this.svgOptions_.scrollY + metrics.absoluteTop;
  this.svgOptions_.setAttribute('transform', 'translate(0,' + y + ')');
};

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new
 *     blocks.
 * @param {!Function} workspaceMetrics Function which returns size information
 *     regarding the flyout's target workspace.
 */
Blockly.Flyout.prototype.init = function(workspace, workspaceMetrics) {
  this.targetWorkspace_ = workspace;
  this.targetWorkspaceMetrics_ = workspaceMetrics;
  // Add scrollbars.
  this.width_ = 0;
  this.height_ = 0;
  var flyout = this;
  new Blockly.Scrollbar(this.svgOptions_,
      function() {return flyout.getMetrics();},
      function(ratio) {return flyout.setMetrics(ratio);},
      false, false);

  // List of background buttons that lurk behind each block to catch clicks
  // landing in the blocks' lakes and bays.
  this.buttons_ = [];

  this.position_();

  // If the document resizes, reposition the toolbox.
  Blockly.bindEvent_(window, 'resize', this, this.position_);
};

/**
 * Move the toolbox to the edge of the workspace.
 * @private
 */
Blockly.Flyout.prototype.position_ = function() {
  var metrics = this.targetWorkspaceMetrics_();
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  var edgeWidth = this.width_ - this.CORNER_RADIUS;
  if (Blockly.RTL) {
    edgeWidth *= -1;
  }
  var path = ['M ' + (Blockly.RTL ? this.width_ : 0) + ',0'];
  path.push('h', edgeWidth);
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      Blockly.RTL ? 0 : 1,
      Blockly.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  path.push('v', Math.max(0, metrics.viewHeight - this.CORNER_RADIUS * 2));
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      Blockly.RTL ? 0 : 1,
      Blockly.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  path.push('h', -edgeWidth);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));
  var x = metrics.absoluteLeft;
  if (Blockly.RTL) {
    x -= this.width_;
  }
  this.svgGroup_.setAttribute('transform',
      'translate(' + x + ',' + metrics.absoluteTop + ')');

  // Record the height for Blockly.Flyout.getMetrics.
  this.height_ = metrics.viewHeight;
};

/**
 * Is the flyout visisble?
 * @return {boolean} True if visible.
 */
Blockly.Flyout.prototype.isVisible = function() {
  return this.svgGroup_.style.display != 'none';
};

/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
  this.svgGroup_.style.display = 'none';
  // Delete all the blocks.
  var blocks = this.workspace_.getTopBlocks(false);
  for (var x = 0, block; block = blocks[x]; x++) {
    block.destroy();
  }
  // Delete all the background buttons.
  for (var x = 0, rect; rect = this.buttons_[x];
       x++) {
    Blockly.unbindEvent_(rect, 'mousedown', rect.wrapper_);
    rect.parentNode.removeChild(rect);
  }
  this.buttons_ = [];
};

/**
 * Show and populate the flyout.
 * @param {!Array.<string>|string} names List of type names of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(names) {
  var margin = this.CORNER_RADIUS;
  this.svgGroup_.style.display = 'block';

  // Create the blocks to be shown in this flyout.
  var blocks = [];
  var gaps = [];
  if (names == Blockly.MSG_VARIABLE_CATEGORY) {
    // Special category for variables.
    Blockly.Variables.flyoutCategory(blocks, gaps, margin, this.workspace_);
  } else if (names == Blockly.MSG_PROCEDURE_CATEGORY) {
    // Special category for procedures.
    Blockly.Procedures.flyoutCategory(blocks, gaps, margin, this.workspace_);
  } else {
    for (var i = 0, name; name = names[i]; i++) {
      var block = new Blockly.Block(this.workspace_, name);
      block.initSvg();
      blocks[i] = block;
      gaps[i] = margin * 2;
    }
  }

  // Lay out the blocks vertically.
  var flyoutWidth = 0;
  var cursorY = margin;
  for (var i = 0, block; block = blocks[i]; i++) {
    // Mark blocks as being inside a flyout.  This is used to detect and prevent
    // the closure of the flyout if the user right-clicks on such a block.
    block.isInFlyout = true;
    // There is no good way to handle comment bubbles inside the flyout.
    // Blocks shouldn't come with predefined comments, but someone will
    // try this, I'm sure.  Kill the comment.
    Blockly.Comment && block.setCommentText(null);
    block.render();
    var bBox = block.getSvgRoot().getBBox();
    var x = Blockly.RTL ? 0 : margin + Blockly.BlockSvg.TAB_WIDTH;
    block.moveBy(x, cursorY);
    flyoutWidth = Math.max(flyoutWidth, bBox.width);
    cursorY += bBox.height + gaps[i];
    Blockly.bindEvent_(block.getSvgRoot(), 'mousedown', null,
                       Blockly.Flyout.createBlockFunc_(this, block));
  }
  flyoutWidth += margin + Blockly.BlockSvg.TAB_WIDTH + margin / 2 +
                 Blockly.Scrollbar.scrollbarThickness;

  for (var i = 0, block; block = blocks[i]; i++) {
    if (Blockly.RTL) {
      // With the flyoutWidth known, reposition the blocks to the right-aligned.
      block.moveBy(flyoutWidth - margin - Blockly.BlockSvg.TAB_WIDTH, 0);
    }
    // Create an invisible rectangle over the block to act as a button.  Just
    // using the block as a button is poor, since blocks have holes in them.
    var bBox = block.getSvgRoot().getBBox();
    var xy = block.getRelativeToSurfaceXY();
    var rect = Blockly.createSvgElement('rect',
        {width: bBox.width, height: bBox.height,
        x: xy.x + bBox.x, y: xy.y + bBox.y,
        'fill-opacity': 0}, null);
    // Add the rectangles under the blocks, so that the blocks' tooltips work.
    this.svgOptions_.insertBefore(rect, this.svgOptions_.firstChild);
    rect.wrapper_ = Blockly.bindEvent_(rect, 'mousedown', null,
        Blockly.Flyout.createBlockFunc_(this, block));
    this.buttons_[i] = rect;
  }
  // Record the width for .getMetrics and .position_.
  this.width_ = flyoutWidth;

  // Fire a resize event to update the flyout's scrollbar.
  Blockly.fireUiEvent(Blockly.svgDoc, window, 'resize');
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.Flyout} flyout Instance of the flyout.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.createBlockFunc_ = function(flyout, originBlock) {
  return function(e) {
    if (e.button == 2) {
      // Right-click.  Don't create a block, let the context menu show.
      return;
    }
    // Create the new block by cloning the block in the flyout (via XML).
    var xml = Blockly.Xml.blockToDom_(originBlock);
    var block = Blockly.Xml.domToBlock_(flyout.targetWorkspace_, xml);
    // Place it in the same spot as the flyout copy.
    var xyOld = Blockly.getAbsoluteXY_(originBlock.getSvgRoot());
    var xyNew = Blockly.getAbsoluteXY_(flyout.targetWorkspace_.getCanvas());
    block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
    block.render();
    if (flyout.autoClose) {
      flyout.hide();
    }
    // Start a dragging operation on the new block.
    block.onMouseDown_(e);
  };
};
/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author fraser@google.com (Neil Fraser)
 */

Blockly.Generator = {};

Blockly.Generator.NAME_TYPE = 'generated_function';

/**
 * Database of code generators, one for each language.
 */
Blockly.Generator.languages = {};

/**
 * Return the code generator for the specified language.  Create one if needed.
 * @param {string} name The language's name.
 * @return {!Object} Generator for this language.
 */
Blockly.Generator.get = function(name) {
  if (!(name in Blockly.Generator.languages)) {
    var generator = {};
    /**
     * Generate code for the specified block (and attached blocks).
     * @param {Blockly.Block} block The block to generate code for.
     * @param {?boolean} opt_dropParens If true, don't surround code with
     *     paretheses since the caller already has a safe container.
     * @return {string} Generated code, or '' if block is null.
     */
    generator.blockToCode = function(block, opt_dropParens) {
      if (!block) {
        return '';
      }
      var func = this[block.type];
      if (!func) {
        throw 'Language "' + name + '" does not know how to generate code ' +
            'for block type "' + block.type + '"';
      }
      var code = func.call(block, opt_dropParens);
      return this.scrub_(block, code);
    };

    /**
     * Generate Dart code representing the specified value input.
     * @param {!Blockly.Block} block The block containing the input.
     * @param {string} name The name of the input.
     * @param {?boolean} opt_dropParens If true, don't surround code with
     *     paretheses since the caller already has a safe container.
     * @return {string} Generated code or '' if no blocks are connected.
     */
    generator.valueToCode = function(block, name, opt_dropParens) {
      var input = block.getInputTargetBlock(name);
      return this.blockToCode(input, opt_dropParens);
    };

    /**
     * Generate Dart code representing the statement.  Indent the code.
     * @param {!Blockly.Block} block The block containing the input.
     * @param {string} name The name of the input.
     * @return {string} Generated code or '' if no blocks are connected.
     */
    generator.statementToCode = function(block, name) {
      var input = block.getInputTargetBlock(name);
      var code = this.blockToCode(input);
      if (code) {
        code = Blockly.Generator.prefixLines(code, '  ');
      }
      return code;
    };

    Blockly.Generator.languages[name] = generator;
  }
  return Blockly.Generator.languages[name];
};

/**
 * Generate code for all blocks in the workspace to the specified language.
 * @param {string} name Language name (e.g. 'JavaScript').
 * @return {string} Generated code.
 */
Blockly.Generator.workspaceToCode = function(name) {
  var code = [];
  var generator = Blockly.Generator.get(name);
  generator.init();
  var blocks = Blockly.mainWorkspace.getTopBlocks(true);
  for (var x = 0, block; block = blocks[x]; x++) {
    if(generator.topBlockInit)
      code.push(generator.topBlockInit());

    var line = generator.blockToCode(block, true);
    if (block.outputConnection && generator.scrubNakedValue) {
      // This block is a naked value.  Ask the language's code generator if
      // it wants to append a semicolon, or something.
      line = generator.scrubNakedValue(line);
    }
    code.push(line);
    if(generator.topBlockFinish)
      code.push(generator.topBlockFinish());

  }
  code = code.join('\n');  // Blank line between each section.
  code = generator.finish(code);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};

// The following are some helpful functions which can be used by multiple
// languages.

/**
 * Prepend a common prefix onto each line of code.
 * @param {string} text The lines of code.
 * @param {string} prefix The common prefix.
 * @return {string} The prefixed lines of code.
 */
Blockly.Generator.prefixLines = function(text, prefix) {
  return prefix + text.replace(/\n(.)/g, '\n' + prefix + '$1');
};

/**
 * Recursively spider a tree of blocks, returning all their comments.
 * @param {!Blockly.Block} block The block from which to start spidering.
 * @return {string} Concatinated list of comments.
 */
Blockly.Generator.allNestedComments = function(block) {
  var comments = [];
  var blocks = block.getDescendants();
  for (var x = 0; x < blocks.length; x++) {
    var comment = blocks[x].getCommentText();
    if (comment) {
      comments.push(comment);
    }
  }
  // Append an empty string to create a trailing line break when joined.
  if (comments.length) {
    comments.push('');
  }
  return comments.join('\n');
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Initialise the SVG document with various handlers.
 * @param {!Element} container Containing element.
 * @param {Object} opt_options Optional dictionary of options.
 */
Blockly.inject = function(container, opt_options) {
  if (opt_options) {
    Blockly.parseOptions_(opt_options);
  }
  Blockly.createDom_(container);
  Blockly.init_();
};

/**
 * Configure Blockly to behave according to a set of options.
 * @param {!Object} options Dictionary of options.
 * @private
 */
Blockly.parseOptions_ = function(options) {
  Blockly.RTL = !!options['rtl'];
  Blockly.editable = !options['readOnly'];
  Blockly.pathToBlockly = options['path'] || './';
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @private
 */
Blockly.createDom_ = function(container) {
  // Find the document for the container.
  var doc = container;
  while (doc.parentNode) {
    doc = doc.parentNode;
  }
  Blockly.svgDoc = doc;

  // Load CSS.
  //<link href="blockly.css" rel="stylesheet" type="text/css" />
  var link = doc.createElement('link');
  link.setAttribute('href', Blockly.pathToBlockly + 'blockly.css');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('onload', 'Blockly.cssLoaded()');
  var head = doc.head || doc.getElementsByTagName('head')[0];
  if (!head) {
    throw 'No head in document.';
  }
  head.appendChild(link);

  // Build the SVG DOM.
  /*
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="blocklySvg">
    ...
  </svg>
  */
  var svg = Blockly.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklySvg'
  }, null);
  /*
  <defs>
    ... filters go here ...
  </defs>
  */
  var defs = Blockly.createSvgElement('defs', {}, svg);
  var filter, feSpecularLighting, feMerge;
  /*
    <!--
      Blocks are highlighted from a light source at the top-left.
      In RTL languages we wish to keep this top-left light source.
    -->
    <filter id="blocklyEmboss">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.5"
                          specularExponent="10" lighting-color="white"
                          result="specOut">
        <fePointLight x="-5000" y="-10000" z="20000"/>
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in"
                   result="specOut"/>
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
                   k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  */
  filter = Blockly.createSvgElement('filter', {id: 'blocklyEmboss'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', stdDeviation: 1, result: 'blur'}, filter);
  feSpecularLighting = Blockly.createSvgElement('feSpecularLighting',
      {'in': 'blur', surfaceScale: 1, specularConstant: 0.5,
      specularExponent: 10, 'lighting-color': 'white', result: 'specOut'},
      filter);
  Blockly.createSvgElement('fePointLight',
      {x: -5000, y: -10000, z: 20000}, feSpecularLighting);
  Blockly.createSvgElement('feComposite',
      {'in': 'specOut', in2: 'SourceAlpha', operator: 'in', result: 'specOut'},
      filter);
  Blockly.createSvgElement('feComposite',
      {'in': 'SourceGraphic', in2: 'specOut', operator: 'arithmetic',
      k1: 0, k2: 1, k3: 1, k4: 0}, filter);
  /*
    <filter id="blocklyTrashcanShadowFilter">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
      <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
      <feMerge>
        <feMergeNode in="offsetBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  */
  filter = Blockly.createSvgElement('filter',
      {id: 'blocklyTrashcanShadowFilter'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', stdDeviation: 2, result: 'blur'}, filter);
  Blockly.createSvgElement('feOffset',
      {'in': 'blur', dx: 1, dy: 1, result: 'offsetBlur'}, filter);
  feMerge = Blockly.createSvgElement('feMerge', {}, filter);
  Blockly.createSvgElement('feMergeNode', {'in': 'offsetBlur'}, feMerge);
  Blockly.createSvgElement('feMergeNode', {'in': 'SourceGraphic'}, feMerge);
  /*
    <filter id="blocklyShadowFilter">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  */
  filter = Blockly.createSvgElement('filter',
      {id: 'blocklyShadowFilter'}, defs);
  Blockly.createSvgElement('feGaussianBlur', {stdDeviation: 2}, filter);

  Blockly.mainWorkspace = new Blockly.Workspace(Blockly.editable);
  svg.appendChild(Blockly.mainWorkspace.createDom());
  svg.appendChild(Blockly.FieldTextInput.createDom());
  Blockly.commentCanvas = Blockly.createSvgElement('g', {}, svg);
  if (Blockly.Toolbox && Blockly.editable) {
    svg.appendChild(Blockly.Toolbox.createDom());
  }
  if (Blockly.Mutator && Blockly.editable) {
    svg.appendChild(Blockly.Mutator.createDom());
  }
  Blockly.Tooltip && svg.appendChild(Blockly.Tooltip.createDom());
  if (Blockly.editable) {
    svg.appendChild(Blockly.FieldDropdown.createDom());
  }
  if (Blockly.ContextMenu) {
    svg.appendChild(Blockly.ContextMenu.createDom());
  }

  // The SVG is now fuly assembled.  Add it to the container.
  container.appendChild(svg);
  Blockly.svg = svg;
  Blockly.svgResize();
};


/**
 * Initialise Blockly with various handlers.
 * @private
 */
Blockly.init_ = function() {
  var doc = Blockly.svgDoc;

  Blockly.bindEvent_(window, 'resize', doc, Blockly.svgResize);
  // Bind events for scrolling the workspace.
  // Most of these events should be bound to the SVG's surface.
  // However, 'mouseup' has to be on the whole document so that a block dragged
  // out of bounds and released will know that it has been released.
  // Also, 'keydown' has to be on the whole document since the browser doesn't
  // understand a concept of focus on the SVG image.
  Blockly.bindEvent_(Blockly.svg, 'mousedown', null, Blockly.onMouseDown_);
  Blockly.bindEvent_(doc, 'mouseup', null, Blockly.onMouseUp_);
  Blockly.bindEvent_(Blockly.svg, 'mousemove', null, Blockly.onMouseMove_);
  Blockly.bindEvent_(Blockly.svg, 'contextmenu', null, Blockly.onContextMenu_);
  Blockly.bindEvent_(doc, 'keydown', null, Blockly.onKeyDown_);
  if (Blockly.editable) {
    Blockly.Toolbox && Blockly.Toolbox.init();
    Blockly.Mutator && Blockly.Mutator.init();
  }

  Blockly.mainWorkspace.addTrashcan(Blockly.getMainWorkspaceMetrics);
  Blockly.mainWorkspace.scrollbar = new Blockly.ScrollbarPair(
      Blockly.mainWorkspace.getCanvas(),
      Blockly.getMainWorkspaceMetrics, this.setMainWorkspaceMetrics);

  // Load the sounds.
  Blockly.loadAudio_('click');
  Blockly.loadAudio_('delete');
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a mutator dialog.  A mutator allows the
 * user to change the shape of a block using a nested blocks editor.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a mutator dialog.
 * @param {!Blockly.Block} block The block associated with this mutator.
 * @param {!Array.<string>} quarkNames List of names of sub-blocks for flyout.
 * @constructor
 */
Blockly.Mutator = function(block, quarkNames) {
  this.block_ = block;
  this.quarkNames_ = quarkNames;
};

/**
 * Height and width of the mutator icon.
 */
Blockly.Mutator.ICON_SIZE = 16;

/**
 * Is the mutator dialog open?
 */
Blockly.Mutator.isOpen = false;

/**
 * Disassemble the mutator icon to avoid memory leaks.
 */
Blockly.Mutator.prototype.destroy = function() {
  // Destroy and unlink the icon.
  this.iconGroup_.parentNode.removeChild(this.iconGroup_);
  this.iconGroup_ = null;
  // Disconnect links between the block and the mutator.
  this.block_.mutator = null;
  this.block_ = null;
};

/**
 * Create the icon on the block.
 */
Blockly.Mutator.prototype.createIcon = function() {
  /* Here's the markup that will be generated:
  <g class="blocklyIconGroup">
    <rect class="blocklyIconShield" width="16" height="16"/>
    <path class="blocklyMutatorMark" d="..."></path>
  </g>
  */
  var quantum = Blockly.Mutator.ICON_SIZE / 8;
  this.iconGroup_ = Blockly.createSvgElement('g', {}, null);
  if (this.block_.editable) {
    this.iconGroup_.setAttribute('class', 'blocklyIconGroup');
  }
  var iconShield = Blockly.createSvgElement('rect',
      {'class': 'blocklyIconShield',
       width: 8 * quantum,
       height: 8 * quantum,
       rx: 2 * quantum,
       ry: 2 * quantum}, this.iconGroup_);
  if (!Blockly.Mutator.crossPath_) {
    // Draw the cross once, and save it for future use.
    var path = [];
    path.push('M', (3.5 * quantum) + ',' + (3.5 * quantum));
    path.push('v', -2 * quantum, 'h', quantum);
    path.push('v', 2 * quantum, 'h', 2 * quantum);
    path.push('v', quantum, 'h', -2 * quantum);
    path.push('v', 2 * quantum, 'h', -quantum);
    path.push('v', -2 * quantum, 'h', -2 * quantum);
    path.push('v', -quantum, 'z');
    Blockly.Mutator.crossPath_ = path.join(' ');
  }
  var iconMark = Blockly.createSvgElement('path',
      {'class': 'blocklyMutatorMark',
       d: Blockly.Mutator.crossPath_}, this.iconGroup_);
  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  if (this.block_.editable) {
    Blockly.bindEvent_(this.iconGroup_, 'mouseup', this, this.onMouseUp_);
  }

  if (Blockly.Tooltip) {
    this.tooltip = Blockly.MSG_MUTATOR_TOOLTIP;
    iconShield.tooltip = this;
    iconMark.tooltip = this;
    Blockly.Tooltip.bindMouseEvents(iconShield);
    Blockly.Tooltip.bindMouseEvents(iconMark);
  }
};

/**
 * Render the icon for this mutator.
 * @param {number} titleX Horizontal offset at which to position the icon.
 * @return {number} Width of icon.
 */
Blockly.Mutator.prototype.renderIcon = function(titleX) {
  if (this.block_.collapsed) {
    this.iconGroup_.setAttribute('display', 'none');
    return 0;
  }
  this.iconGroup_.setAttribute('display', 'block');

  var TOP_MARGIN = 5;
  var diameter = Blockly.Mutator.ICON_SIZE;
  if (Blockly.RTL) {
    titleX -= diameter;
  }
  this.iconGroup_.setAttribute('transform',
      'translate(' + titleX + ', ' + TOP_MARGIN + ')');
  return diameter;
};

/**
 * Clicking on the icon displays the dialog.
 * @param {!Event} e Mouse click event.
 * @private
 */
Blockly.Mutator.prototype.onMouseUp_ = function(e) {
  if (e.button == 2) {
    // Right-click.
    return;
  } else if (Blockly.Block.dragMode_ == 2) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  }
  Blockly.Mutator.openDialog_(this.block_);
};


/**
 * Create the mutator dialog's elements.  Only needs to be called once.
 * @return {!Element} The dialog's SVG group.
 */
Blockly.Mutator.createDom = function() {
  /*
  <g class="blocklyHidden">
    <rect class="blocklyScreenShadow" />
    <svg>
      <rect class="blocklyMutatorBackground" />
      <text class="blocklyHeader" y="30">Block Editor</text>
      [Help button]
      [Cancel button]
      [Change button]
      [Flyout]
      [Workspace]
    </g>
  </g>
  */
  var svgGroup = Blockly.createSvgElement('g', {'class': 'blocklyHidden'},
                                          null);
  Blockly.Mutator.svgGroup_ = svgGroup;
  Blockly.Mutator.svgShadow_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyScreenShadow'}, svgGroup);
  Blockly.Mutator.svgDialog_ = Blockly.createSvgElement('svg', {}, svgGroup);
  Blockly.Mutator.svgBackground_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyMutatorBackground',
       height: '100%', width: '100%'}, Blockly.Mutator.svgDialog_);
  Blockly.Mutator.svgHeader_ = Blockly.createSvgElement('text',
      {'class': 'blocklyHeader', y: 30}, Blockly.Mutator.svgDialog_);
  var textNode = Blockly.svgDoc.createTextNode(Blockly.MSG_MUTATOR_HEADER);
  Blockly.Mutator.svgHeader_.appendChild(textNode);

  // Buttons
  Blockly.Mutator.helpButton_ =
      new Blockly.Mutator.Button(Blockly.MSG_HELP, false,
                                 Blockly.Mutator.showHelp_);
  Blockly.Mutator.cancelButton_ =
      new Blockly.Mutator.Button(Blockly.MSG_MUTATOR_CANCEL, false,
                                 Blockly.Mutator.closeDialog);
  Blockly.Mutator.changeButton_ =
      new Blockly.Mutator.Button(Blockly.MSG_MUTATOR_CHANGE, true,
                                 Blockly.Mutator.saveDialog_);
  Blockly.Mutator.svgDialog_.appendChild(
      Blockly.Mutator.helpButton_.createDom());
  Blockly.Mutator.svgDialog_.appendChild(
      Blockly.Mutator.cancelButton_.createDom());
  Blockly.Mutator.svgDialog_.appendChild(
      Blockly.Mutator.changeButton_.createDom());

  // TODO: Move workspace and flyout instantiation into constructor, once
  // Mutator stops being a singleton.
  Blockly.Mutator.workspace_ = new Blockly.Workspace(true);
  Blockly.Mutator.flyout_ = new Blockly.Flyout();
  Blockly.Mutator.flyout_.autoClose = false;
  Blockly.Mutator.svgDialog_.appendChild(
      Blockly.Mutator.flyout_.createDom());
  Blockly.Mutator.svgDialog_.appendChild(
      Blockly.Mutator.workspace_.createDom());

  return svgGroup;
};

/**
 * Layout the buttons.  Only needs to be called once.
 */
Blockly.Mutator.init = function() {
  Blockly.Mutator.helpButton_.init();
  Blockly.Mutator.cancelButton_.init();
  Blockly.Mutator.changeButton_.init();
  // Save the size of the header and buttons so that calculations on their size
  // may be performed regardless of whether they are hidden or not.
  Blockly.Mutator.headerLength_ =
      Blockly.Mutator.svgHeader_.getComputedTextLength();
  Blockly.Mutator.helpLength_ = Blockly.Mutator.helpButton_.getBBox().width;
  Blockly.Mutator.cancelLength_ = Blockly.Mutator.cancelButton_.getBBox().width;
  var bBoxChange = Blockly.Mutator.changeButton_.getBBox();
  Blockly.Mutator.changeLength_ = bBoxChange.width;

  // Record some layout information for Blockly.Mutator.getWorkspaceMetrics_.
  Blockly.Mutator.workspaceLeft_ = 0;
  Blockly.Mutator.workspaceTop_ = bBoxChange.height + 10;

  Blockly.Mutator.workspace_.addTrashcan(Blockly.Mutator.getWorkspaceMetrics_);
  Blockly.Mutator.flyout_.init(Blockly.Mutator.workspace_,
                               Blockly.Mutator.getFlyoutMetrics_);
};

/**
 * Lay out the dialog to fill the screen.
 * @private
 */
Blockly.Mutator.position_ = function() {
  var svgSize = Blockly.svgSize();
  Blockly.Mutator.svgShadow_.setAttribute('width', svgSize.width);
  Blockly.Mutator.svgShadow_.setAttribute('height', svgSize.height);

  var MARGIN = 40;
  var width = Math.max(0, svgSize.width - 2 * MARGIN);
  var height = Math.max(0, svgSize.height - 2 * MARGIN);
  Blockly.Mutator.svgDialog_.setAttribute('x', MARGIN);
  Blockly.Mutator.svgDialog_.setAttribute('y', MARGIN);
  Blockly.Mutator.svgDialog_.setAttribute('width', width);
  Blockly.Mutator.svgDialog_.setAttribute('height', height);
  Blockly.Mutator.svgDialog_.setAttribute('viewBox',
      '0 0 ' + width + ' ' + height);

  var headerX = Blockly.ContextMenu.X_PADDING;
  if (Blockly.RTL) {
    headerX = width - Blockly.Mutator.headerLength_ - headerX;
  }
  Blockly.Mutator.svgHeader_.setAttribute('x', headerX);

  var cursorX;
  var cursorY = 5;
  if (Blockly.RTL) {
    cursorX = Blockly.ContextMenu.X_PADDING;
    Blockly.Mutator.changeButton_.setLocation(cursorX, cursorY);
    cursorX += Blockly.Mutator.changeLength_ + Blockly.ContextMenu.X_PADDING;
    Blockly.Mutator.cancelButton_.setLocation(cursorX, cursorY);
    cursorX += Blockly.Mutator.cancelLength_ + Blockly.ContextMenu.X_PADDING;
    Blockly.Mutator.helpButton_.setLocation(cursorX, cursorY);
    cursorX += Blockly.Mutator.helpLength_;
    cursorX = headerX - cursorX;
  } else {
    var cursorX = width - Blockly.ContextMenu.X_PADDING -
        Blockly.Mutator.changeLength_;
    Blockly.Mutator.changeButton_.setLocation(cursorX, cursorY);
    cursorX -= Blockly.ContextMenu.X_PADDING + Blockly.Mutator.cancelLength_;
    Blockly.Mutator.cancelButton_.setLocation(cursorX, cursorY);
    cursorX -= Blockly.ContextMenu.X_PADDING + Blockly.Mutator.helpLength_;
    Blockly.Mutator.helpButton_.setLocation(cursorX, cursorY);
    Blockly.Mutator.helpButton_.setVisible(cursorX > 0);
    cursorX -= headerX + Blockly.Mutator.headerLength_;
  }

  // Hide the header if the window is too small.
  Blockly.Mutator.svgHeader_.style.display = (cursorX > 0) ? 'block' : 'none';

  // Record some layout information for Blockly.Mutator.getWorkspaceMetrics_.
  Blockly.Mutator.workspaceWidth_ = width;
  Blockly.Mutator.workspaceHeight_ = height - Blockly.Mutator.workspaceTop_;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * mutator flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of mutator dialog's
 *     workspace.  Returns null if the dialog is hidden.
 * @private
 */
Blockly.Mutator.getFlyoutMetrics_ = function() {
  if (!Blockly.Mutator.isOpen) {
    return null;
  }
  var left = Blockly.Mutator.workspaceLeft_;
  if (Blockly.RTL) {
    left += Blockly.Mutator.workspaceWidth_;
  }
  return {
    viewHeight: Blockly.Mutator.workspaceHeight_,
    absoluteTop: Blockly.Mutator.workspaceTop_,
    absoluteLeft: left
  };
};

/**
 * Return an object with the metrics required to position the trash can.
 * The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of mutator dialog's
 *     workspace.  Returns null if the dialog is hidden.
 * @private
 */
Blockly.Mutator.getWorkspaceMetrics_ = function() {
  if (!Blockly.Mutator.isOpen) {
    return null;
  }
  return {
    viewHeight: Blockly.Mutator.workspaceHeight_,
    viewWidth: Blockly.Mutator.workspaceWidth_,
    absoluteTop: Blockly.Mutator.workspaceTop_,
    absoluteLeft: Blockly.Mutator.workspaceLeft_
  };
};

/**
 * Load the source block's help page in a new window.
 * @private
 */
Blockly.Mutator.showHelp_ = function() {
  Blockly.Mutator.sourceBlock_.showHelp_();
};

/**
 * Open the dialog.
 * @param {!Blockly.Block} block Block to mutate.
 * @private
 */
Blockly.Mutator.openDialog_ = function(block) {
  Blockly.Mutator.isOpen = true;
  Blockly.Mutator.sourceBlock_ = block;
  Blockly.Mutator.helpButton_.setVisible(!!block.helpUrl);
  Blockly.removeClass_(Blockly.Mutator.svgGroup_, 'blocklyHidden');
  Blockly.Mutator.position_();
  // Fire an event to allow the trashcan to position.
  Blockly.fireUiEvent(Blockly.svgDoc, window, 'resize');
  // If the document resizes, reposition the dialog.
  Blockly.Mutator.resizeWrapper_ =
      Blockly.bindEvent_(window, 'resize', null, Blockly.Mutator.position_);
  Blockly.Mutator.flyout_.show(block.mutator.quarkNames_);

  Blockly.Mutator.rootBlock_ = block.decompose(Blockly.Mutator.workspace_);
  var blocks = Blockly.Mutator.rootBlock_.getDescendants();
  for (var i = 0, child; child = blocks[i]; i++) {
    child.render();
  }
  var x = 150;
  if (Blockly.RTL) {
    x = Blockly.Mutator.workspaceWidth_ - x;
  }
  Blockly.Mutator.rootBlock_.moveBy(x, 50);
};

/**
 * Close the dialog.
 */
Blockly.Mutator.closeDialog = function() {
  Blockly.Mutator.isOpen = false;
  Blockly.addClass_(Blockly.Mutator.svgGroup_, 'blocklyHidden');
  Blockly.unbindEvent_(window, 'resize', Blockly.Mutator.resizeWrapper_);
  Blockly.Mutator.resizeWrapper_ = null;

  // Empty the dialog.
  Blockly.Mutator.flyout_.hide();
  var blocks = Blockly.Mutator.workspace_.getTopBlocks(false);
  for (var x = 0, block; block = blocks[x]; x++) {
    block.destroy();
  }
  Blockly.Mutator.sourceBlock_ = null;
  Blockly.Mutator.rootBlock_ = null;
};

/**
 * Save the mutation and close the dialog.
 * @private
 */
Blockly.Mutator.saveDialog_ = function() {
  Blockly.Mutator.sourceBlock_.compose(Blockly.Mutator.rootBlock_);
  Blockly.Mutator.closeDialog();
};

// If Buttons get used for other things beyond the Mutator Dialog, then move
// this class to a separate file.

/**
 * Class for a styled button.
 * @param {string} caption Text to display on the button.
 * @param {boolean} launch True if the button should be the launch button (red).
 * @param {Function} action Function to call when the button is clicked.
 * @constructor
 */
Blockly.Mutator.Button = function(caption, launch, action) {
  this.caption_ = caption;
  this.launch_ = launch;
  this.action_ = action;
};

/**
 * Destroy this button and unlink everything cleanly.
 */
Blockly.Mutator.Button.prototype.destroy = function() {
  if (this.onClickWrapper_) {
    Blockly.unbindEvent_(this.svgGroup_, 'click', this.onClickWrapper_);
    this.onClickWrapper_ = null;
  }
  this.svgGroup_.parentNode.removeChild(this.svgGroup_);
  this.svgGroup_ = null;
  this.svgShadow_ = null;
  this.svgBackground_ = null;
  this.svgText_ = null;
};

/**
 * Create the button's elements.  Only needs to be called once.
 * @return {!Element} The button's SVG group.
 */
Blockly.Mutator.Button.prototype.createDom = function() {
  /*
  <g class="blocklyButton blocklyLaunchButton">
    <rect rx="5" ry="5" x="2" y="2" class="bocklyButtonShadow"/>
    <rect rx="5" ry="5" class="bocklyButtonBackground"/>
    <text class="bocklyButtonText">Caption</text>
  </g>
  */
  var className = 'blocklyButton';
  if (this.launch_) {
    className += ' blocklyLaunchButton';
  }
  this.svgGroup_ = Blockly.createSvgElement('g', {'class': className}, null);
  this.svgShadow_ = Blockly.createSvgElement('rect',
      {rx: 5, ry: 5, x: 2, y: 2, 'class': 'blocklyButtonShadow'},
      this.svgGroup_);
  this.svgBackground_ = Blockly.createSvgElement('rect',
      {rx: 5, ry: 5, 'class': 'blocklyButtonBackground'}, this.svgGroup_);
  this.svgText_ = Blockly.createSvgElement('text',
      {'class': 'blocklyButtonText'}, this.svgGroup_);
  this.svgText_.appendChild(Blockly.svgDoc.createTextNode(this.caption_));

  this.onClickWrapper_ = null;
  if (this.action_) {
    this.onClickWrapper_ =
      Blockly.bindEvent_(this.svgGroup_, 'click', this, this.action_);
  }
  return this.svgGroup_;
};

/**
 * Size the buttons to fit the text.  Only needs to be called once.
 */
Blockly.Mutator.Button.prototype.init = function() {
  var X_PADDING = Blockly.ContextMenu.X_PADDING;
  try {
    var bBox = this.svgText_.getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var bBox = {height: 0, width: 0};
  }
  this.svgShadow_.setAttribute('width', bBox.width + 2 * X_PADDING);
  this.svgShadow_.setAttribute('height', bBox.height + 10);
  this.svgBackground_.setAttribute('width', bBox.width + 2 * X_PADDING);
  this.svgBackground_.setAttribute('height', bBox.height + 10);
  this.svgText_.setAttribute('x', X_PADDING);
  this.svgText_.setAttribute('y', bBox.height);
};

/**
 * Returns the dimensions of this button.
 * @return {!Object} Bounding box with x, y, height and width properties.
 */
Blockly.Mutator.Button.prototype.getBBox = function() {
  try {
    return this.svgGroup_.getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return {height: 0, width: 0};
  }
};

/**
 * Move this button to a location relative to its parent.
 * @param {number} x Horizontal location.
 * @param {number} y Vertical location.
 */
Blockly.Mutator.Button.prototype.setLocation = function(x, y) {
  this.svgGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');
};

/**
 * Show or hide this button.
 * @param {boolean} visible True if visible.
 */
Blockly.Mutator.Button.prototype.setVisible = function(visible) {
  this.svgGroup_.setAttribute('display', visible ? 'block' : 'none');
};
/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling variables and procedure names.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a database of entity names (variables, functions, etc).
 * @param {Array.<string>} reservedWords An array of words that are illegal for
 *     use as names in a language (e.g. ['new', 'if', 'this', ...]).
 * @constructor
 */
Blockly.Names = function(reservedWords) {
  this.reservedDict_ = {};
  if (reservedWords) {
    for (var x = 0; x < reservedWords.length; x++) {
      this.reservedDict_[Blockly.Names.PREFIX_ + reservedWords[x]] = true;
    }
  }
  this.reset();
};

/**
 * When JavaScript (or most other languages) is generated, variable 'foo' and
 * procedure 'foo' would collide.  However, Blockly has no such problems since
 * variable get 'foo' and procedure call 'foo' are unambiguous.
 * Therefore, Blockly keeps a separate type name to disambiguate.
 * getName('foo', 'variable') -> 'foo'
 * getName('foo', 'procedure') -> 'foo2'
 */

/**
 * JavaScript doesn't have a true hashtable, it uses object properties.
 * Since even clean objects have a few properties, prepend this prefix onto
 * names so that they don't collide with any builtins.
 * @private
 */
Blockly.Names.PREFIX_ = 'v_';

/**
 * Empty the database and start from scratch.  The reserved words are kept.
 */
Blockly.Names.prototype.reset = function() {
  this.db_ = {};
  this.dbReverse_ = {};
};

/**
 * Convert a Blockly entity name to a legal exportable entity name.
 * @param {string} name The Blockly entity name (no constraints).
 * @param {string} type The type of entity in Blockly
 *     ('variable', 'procedure', 'builtin', etc...).
 * @return {string} An entity name legal for the exported language.
 */
Blockly.Names.prototype.getName = function(name, type) {
  var normalized = Blockly.Names.PREFIX_ + name.toLowerCase() + 'X' + type;
  if (normalized in this.db_) {
    return this.db_[normalized];
  } else {
    return this.getDistinctName(name, type);
  }
};

/**
 * Convert a Blockly entity name to a legal exportable entity name.
 * Ensure that this is a new name not overlapping any previously defined name.
 * Also check against list of reserved words for the current language and
 * ensure name doesn't collide.
 * @param {string} name The Blockly entity name (no constraints).
 * @param {string} type The type of entity in Blockly
 *     ('variable', 'procedure', 'builtin', etc...).
 * @return {string} An entity name legal for the exported language.
 */
Blockly.Names.prototype.getDistinctName = function(name, type) {
  var safeName = this.safeName_(name);
  var i = '';
  while (this.dbReverse_[Blockly.Names.PREFIX_ + safeName + i] ||
      (Blockly.Names.PREFIX_ + safeName + i) in this.reservedDict_) {
    // Collision with existing name.  Create a unique name.
    i = i ? i + 1 : 2;
  }
  safeName += i;
  this.db_[Blockly.Names.PREFIX_ + name.toLowerCase() + 'X' + type] = safeName;
  this.dbReverse_[Blockly.Names.PREFIX_ + safeName] = true;
  return safeName;
};

/**
 * Given a proposed entity name, generate a name that conforms to the
 * [_A-Za-z][_A-Za-z0-9]* format that most languages consider legal for
 * variables.
 * @param {string} name Potentially illegal entity name.
 * @return {string} Safe entity name.
 * @private
 */
Blockly.Names.prototype.safeName_ = function(name) {
  if (!name) {
    name = 'unnamed';
  } else {
    // Unfortunately names in non-latin characters will look like
    // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
    name = encodeURI(name.replace(/ /g, '_')).replace(/[^\w]/g, '_');
    // Most languages don't allow names with leading numbers.
    if ('0123456789'.indexOf(name.charAt(0)) != -1) {
      name = 'my_' + name;
    }
  }
  return name;
};

/**
 * Do the given two entity names refer to the same entity?
 * Blockly names are case-insensitive.
 * @param {string} name1 First name.
 * @param {string} name2 Second name.
 * @return {boolean} True if names are the same.
 */
Blockly.Names.equals = function(name1, name2) {
  return name1.toLowerCase() == name2.toLowerCase();
};
/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 */
Blockly.Procedures = {};

Blockly.Procedures.NAME_TYPE = 'procedure';

/**
 * Find all user-created procedure definitions.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Procedures.allProcedures = function() {
  var blocks = Blockly.mainWorkspace.getAllBlocks(false);
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureDef;
    if (func) {
      var tuple = func.call(blocks[x]);
      if (tuple) {
        if (tuple[1]) {
          proceduresReturn.push(tuple[0]);
        } else {
          proceduresNoReturn.push(tuple[0]);
        }
      }
    }
  }
  proceduresNoReturn.sort(Blockly.caseInsensitiveComparator);
  proceduresReturn.sort(Blockly.caseInsensitiveComparator);
  return [proceduresNoReturn, proceduresReturn];
};

/**
 * Ensure two identically-named procedures don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Procedures.findLegalName = function(name, block) {
  if (!block.workspace.editable) {
    return name;
  }
  while (!Blockly.Procedures.isLegalName(name, block.workspace, block)) {
    // Collision with another procedure.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};

/**
 * Does this procedure have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 */
Blockly.Procedures.isLegalName = function(name, workspace, opt_exclude) {
  name = name.toLowerCase();
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var x = 0; x < blocks.length; x++) {
    if (blocks[x] == opt_exclude) {
      continue;
    }
    var func = blocks[x].getProcedureDef;
    if (func) {
      var procName = func.call(blocks[x]);
      if (procName[0].toLowerCase() == name) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Rename a procedure.  Called by the editable field.
 * @param {string} text The proposed new name.
 * @return {?string} The accepted name, or null if rejected.
 */
Blockly.Procedures.rename = function(text) {
  if (!this.sourceBlock_.editable) {
    return text;
  }
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  text = text.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
  if (!text) {
    return null;
  }
  // Ensure two identically-named procedures don't exist.
  text = Blockly.Procedures.findLegalName(text, this.sourceBlock_);
  // Rename any callers.
  var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].renameProcedure;
    if (func) {
      func.call(blocks[x], this.text_, text);
    }
  }
  window.setTimeout(Blockly.Procedures.refreshFlyoutCategory, 1);
  return text;
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Procedures.flyoutCategory = function(blocks, gaps, margin, workspace) {
  if (Blockly.Language.procedures_defnoreturn) {
    var block = new Blockly.Block(workspace, 'procedures_defnoreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }
  if (Blockly.Language.procedures_defreturn) {
    var block = new Blockly.Block(workspace, 'procedures_defreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }

  var tuple = Blockly.Procedures.allProcedures();
  var proceduresNoReturn = tuple[0];
  var proceduresReturn = tuple[1];
  if (Blockly.Language.procedures_callnoreturn) {
    for (var x = 0; x < proceduresNoReturn.length; x++) {
      var block = new Blockly.Block(workspace, 'procedures_callnoreturn');
      block.setTitleText(proceduresNoReturn[x], 'NAME');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }
  if (Blockly.Language.procedures_callreturn) {
    for (var x = 0; x < proceduresReturn.length; x++) {
      var block = new Blockly.Block(workspace, 'procedures_callreturn');
      block.setTitleText(proceduresReturn[x], 'NAME');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }
};

/**
 * Refresh the procedure flyout if it is open.
 * Only used if the flyout's autoClose is false.
 */
Blockly.Procedures.refreshFlyoutCategory = function() {
  if (Blockly.Toolbox && Blockly.Toolbox.flyout_.isVisible() && Blockly.Toolbox.selectedOption_ &&
      Blockly.Toolbox.selectedOption_.cat == Blockly.MSG_PROCEDURE_CATEGORY) {
    Blockly.Toolbox.flyout_.hide();
    Blockly.Toolbox.flyout_.show(Blockly.MSG_PROCEDURE_CATEGORY);
  }
};

/**
 * When a procedure definition is destroyed, find and destroy all its callers.
 * @param {string} name Name of deleted procedure definition.
 * @param {!Blockly.Workspace} workspace The workspace to delete callers from.
 */
Blockly.Procedures.destroyCallers = function(name, workspace) {
  name = name.toLowerCase();
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureCall;
    if (func) {
      var procName = func.call(blocks[x]);
      // Procedure name may be null if the block is only half-built.
      if (procName && procName.toLowerCase() == name) {
        blocks[x].destroy(true);
      }
    }
  }
  window.setTimeout(Blockly.Procedures.refreshFlyoutCategory, 1);
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Library for creating scrollbars.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @param {!Function} getMetrics A function that returns scrolling metrics.
 * @param {!Function} setMetrics A function that sets scrolling metrics.
 * @constructor
 */
Blockly.ScrollbarPair = function(element, getMetrics, setMetrics) {
  this.element_ = element;
  this.getMetrics_ = getMetrics;
  this.setMetrics_ = setMetrics;
  this.oldHostMetrics_ = {};
  this.hScroll = new Blockly.Scrollbar(element, getMetrics, setMetrics,
                                       true, true);
  this.vScroll = new Blockly.Scrollbar(element, getMetrics, setMetrics,
                                       false, true);
  this.corner_ = this.addCorner_(element);
  this.resize();

  // If the document resizes, reposition the scrollbars.
  var pair = this;
  Blockly.bindEvent_(window, 'resize', pair, function() {pair.resize();});
};

/**
 * Creates a corner element and adds it to the DOM.
 * 'resize' must be called to position it properly.
 * The corner element is a small square at the bottom-right between the two
 * scrollbars.  It prevents content from being visible in that location.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @return {!Element} The corner element.
 * @private
 */
Blockly.ScrollbarPair.prototype.addCorner_ = function(element) {
  var corner = Blockly.createSvgElement('rect',
      {height: Blockly.Scrollbar.scrollbarThickness,
      width: Blockly.Scrollbar.scrollbarThickness,
      style: 'fill: #fff'}, null);
  Blockly.Scrollbar.insertAfter_(corner, element);
  return corner;
};

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectange.
 */
Blockly.ScrollbarPair.prototype.resize = function() {
  // Look up the host metrics once, and use for both scrollbars.
  var hostMetrics = this.getMetrics_();
  if (!hostMetrics) {
    // Host element is likely not visible.
    return;
  }

  // Only change the scrollbars if there has been a change in metrics.
  var resizeH = false;
  var resizeV = false;
  if (this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
      this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop ||
      this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
    // The window has been resized or repositioned.
    resizeH = true;
    resizeV = true;
  } else {
    // Has the content been resized or moved?
    if (this.oldHostMetrics_.contentWidth != hostMetrics.contentWidth ||
        this.oldHostMetrics_.viewLeft != hostMetrics.viewLeft ||
        this.oldHostMetrics_.contentLeft != hostMetrics.contentLeft) {
      resizeH = true;
    }
    if (this.oldHostMetrics_.contentHeight != hostMetrics.contentHeight ||
        this.oldHostMetrics_.viewTop != hostMetrics.viewTop ||
        this.oldHostMetrics_.contentTop != hostMetrics.contentTop) {
      resizeV = true;
    }
  }
  if (resizeH) {
    this.hScroll.resize(hostMetrics);
  }
  if (resizeV) {
    this.vScroll.resize(hostMetrics);
  }

  // Reposition the corner square.
  if (this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
      this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
    this.corner_.setAttribute('x', this.vScroll.xCoordinate);
  }
  if (this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop) {
    this.corner_.setAttribute('y', this.hScroll.yCoordinate);
  }

  // Cache the current metrics to potentially short-cut the next resize event.
  this.oldHostMetrics_ = hostMetrics;
};

/**
 * Set the sliders of both scrollbars to be at a certain position.
 * @param {number} x Horizontal scroll value.
 * @param {number} y Vertical scroll value.
 */
Blockly.ScrollbarPair.prototype.set = function(x, y) {
  /* HACK:
   Two scrollbars are about to have their sliders moved.  Moving a scollbar
   will normally result in its onScroll function being called.  That function
   will update the contents.  At issue is what happens when two scrollbars are
   moved.  Calling onScroll twice may result in two rerenderings of the content
   and increase jerkiness during dragging.
   In the case of native scrollbars (currently used only by Firefox), onScroll
   is called as an event, which means two separate renderings of the content are
   performed.  However in the case of SVG scrollbars (currently used by all
   other browsers), onScroll is called as a function and the browser only
   rerenders the contents once at the end of the thread.
  */
  if (Blockly.Scrollbar === Blockly.ScrollbarNative) {
    // Native scrollbar mode.
    // Set both scrollbars and supress their two separate onScroll events.
    this.hScroll.set(x, false);
    this.vScroll.set(y, false);
    // Redraw the surface once with the new settings for both scrollbars.
    var xyRatio = {};
    xyRatio.x = (this.hScroll.outerDiv_.scrollLeft /
                 this.hScroll.innerImg_.offsetWidth) || 0;
    xyRatio.y = (this.vScroll.outerDiv_.scrollTop /
                 this.vScroll.innerImg_.offsetHeight) || 0;
    this.setMetrics_(xyRatio);
  } else {
    // SVG scrollbars.
    // Set both scrollbars and allow each to call a separate onScroll execution.
    this.hScroll.set(x, true);
    this.vScroll.set(y, true);
  }
};

// --------------------------------------------------------------------

/**
 * Class for a native widget scrollbar nested in a foreignObject element.
 * This technique offers a scrollbar that looks and behaves like the system's
 * scrollbars.  However it isn't well supported at the moment.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @param {!Function} getMetrics A function that returns scrolling metrics.
 * @param {!Function} setMetrics A function that sets scrolling metrics.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 *     Null is used to create a test scrollbar to measure thickness.
 * @param {boolean} opt_pair True if the scrollbar is part of a horiz/vert pair.
 * @constructor
 */
Blockly.ScrollbarNative = function(element, getMetrics, setMetrics,
                                   horizontal, opt_pair) {
  this.element_ = element;
  this.getMetrics_ = getMetrics;
  this.setMetrics_ = setMetrics;
  this.pair_ = opt_pair || false;
  this.horizontal_ = horizontal;

  this.createDom_(element);
  if (horizontal === null) {
    // Just return a bare-bones scrollbar DOM for thickness testing.
    return;
  }
  if (!Blockly.ScrollbarNative.scrollbarThickness) {
    // The first time a scrollbar is created, we need to measure the thickness.
    Blockly.ScrollbarNative.measureScrollbarThickness_(element);
  }

  if (horizontal) {
    this.foreignObject_.setAttribute('height',
        Blockly.ScrollbarNative.scrollbarThickness);
    this.outerDiv_.style.height =
        Blockly.ScrollbarNative.scrollbarThickness + 'px';
    this.outerDiv_.style.overflowX = 'scroll';
    this.outerDiv_.style.overflowY = 'hidden';
    this.innerImg_.style.height = '1px';
  } else {
    this.foreignObject_.setAttribute('width',
        Blockly.ScrollbarNative.scrollbarThickness);
    this.outerDiv_.style.width =
        Blockly.ScrollbarNative.scrollbarThickness + 'px';
    this.outerDiv_.style.overflowX = 'hidden';
    this.outerDiv_.style.overflowY = 'scroll';
    this.innerImg_.style.width = '1px';
  }
  var scrollbar = this;
  this.onScrollWrapper_ = Blockly.bindEvent_(this.outerDiv_, 'scroll',
      scrollbar, function() {scrollbar.onScroll_();});
  Blockly.bindEvent_(this.foreignObject_, 'mousedown', null, Blockly.noEvent);
  if (!this.pair_) {
    // If this scrollbar is part of a pair, then the ScrollbarPair will handle
    // resizing and event registration.
    this.resize();
    Blockly.bindEvent_(window, 'resize', scrollbar,
                       function() {scrollbar.resize();});
  }
};

/**
 * Recalculate the scrollbar's location and its length.
 * @param {Object} opt_metrics A data structure of from the describing all the
 * required dimensions.  If not provided, it will be fetched from the host
 * object.
 */
Blockly.ScrollbarNative.prototype.resize = function(opt_metrics) {
  // Determine the location, height and width of the host element.
  var hostMetrics = opt_metrics;
  if (!hostMetrics) {
    hostMetrics = this.getMetrics_();
    if (!hostMetrics) {
      // Host element is likely not visible.
      return;
    }
  }
  /* hostMetrics is an object with the following properties.
   * .viewHeight: Height of the visible rectangle,
   * .viewWidth: Width of the visible rectangle,
   * .contentHeight: Height of the contents,
   * .contentWidth: Width of the content,
   * .viewTop: Offset of top edge of visible rectangle from parent,
   * .viewLeft: Offset of left edge of visible rectangle from parent,
   * .contentTop: Offset of the top-most content from the y=0 coordinate,
   * .contentLeft: Offset of the left-most content from the x=0 coordinate,
   * .absoluteTop: Top-edge of view.
   * .absoluteLeft: Left-edge of view.
   */
  if (this.horizontal_) {
    var outerLength = hostMetrics.viewWidth;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      outerLength -= Blockly.ScrollbarNative.scrollbarThickness;
    } else {
      // Only show the scrollbar if needed.
      // Ideally this would also apply to scrollbar pairs, but that's a bigger
      // headache (due to interactions with the corner square).
      this.setVisible(outerLength < hostMetrics.contentHeight);
    }
    this.ratio_ = outerLength / hostMetrics.viewWidth;
    var innerLength = this.ratio_ * hostMetrics.contentWidth;
    var innerOffset = (hostMetrics.viewLeft - hostMetrics.contentLeft) *
        this.ratio_;
    this.outerDiv_.style.width = outerLength + 'px';
    this.innerImg_.style.width = innerLength + 'px';
    this.xCoordinate = hostMetrics.absoluteLeft;
    if (this.pair_ && Blockly.RTL) {
      this.xCoordinate += Blockly.ScrollbarNative.scrollbarThickness;
    }
    this.yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
        Blockly.ScrollbarNative.scrollbarThickness;
    this.foreignObject_.setAttribute('x', this.xCoordinate);
    this.foreignObject_.setAttribute('y', this.yCoordinate);
    this.foreignObject_.setAttribute('width', Math.max(0, outerLength));
    this.outerDiv_.scrollLeft = Math.round(innerOffset);
  } else {
    var outerLength = hostMetrics.viewHeight;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      outerLength -= Blockly.ScrollbarNative.scrollbarThickness;
    } else {
      // Only show the scrollbar if needed.
      this.setVisible(outerLength < hostMetrics.contentHeight);
    }
    this.ratio_ = outerLength / hostMetrics.viewHeight;
    var innerLength = this.ratio_ * hostMetrics.contentHeight;
    var innerOffset = (hostMetrics.viewTop - hostMetrics.contentTop) *
        this.ratio_;
    this.outerDiv_.style.height = outerLength + 'px';
    this.innerImg_.style.height = innerLength + 'px';
    this.xCoordinate = hostMetrics.absoluteLeft;
    if (!Blockly.RTL) {
      this.xCoordinate += hostMetrics.viewWidth -
          Blockly.ScrollbarNative.scrollbarThickness;
    }
    this.yCoordinate = hostMetrics.absoluteTop;
    this.foreignObject_.setAttribute('x', this.xCoordinate);
    this.foreignObject_.setAttribute('y', this.yCoordinate);
    this.foreignObject_.setAttribute('height', Math.max(0, outerLength));
    this.outerDiv_.scrollTop = Math.round(innerOffset);
  }
};

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @private
 */
Blockly.ScrollbarNative.prototype.createDom_ = function(element) {
  /* Create the following DOM:
  <foreignObject xmlns="http://www.w3.org/2000/svg">
    <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
      <div>
        <img src="1x1.gif">
      </div>
    </body>
  </foreignObject>
  */
  this.foreignObject_ = Blockly.createSvgElement('foreignObject', {}, null);
  var body = Blockly.svgDoc.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.setAttribute('class', 'blocklyMinimalBody');
  var outer = Blockly.svgDoc.createElementNS(Blockly.HTML_NS, 'div');
  this.outerDiv_ = outer;
  var inner = Blockly.svgDoc.createElementNS(Blockly.HTML_NS, 'img');
  inner.setAttribute('src', Blockly.pathToBlockly + '1x1.gif');
  this.innerImg_ = inner;

  outer.appendChild(inner);
  body.appendChild(outer);
  this.foreignObject_.appendChild(body);
  Blockly.Scrollbar.insertAfter_(this.foreignObject_, element);
};

/**
 * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
 * needed.
 * @return {boolean} True if visible.
 */
Blockly.ScrollbarNative.prototype.isVisible = function() {
  return this.foreignObject_.style.display != 'none';
};

/**
 * Set whether the scrollbar is visible.
 * Only applies to non-paired scrollbars.
 * @param {boolean} visible True if visible.
 */
Blockly.ScrollbarNative.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    return;
  }
  // Ideally this would also apply to scrollbar pairs, but that's a bigger
  // headache (due to interactions with the corner square).
  if (this.pair_) {
    throw 'Unable to toggle visibility of paired scrollbars.';
  }
  if (visible) {
    this.foreignObject_.style.display = 'block';
    /* HACK:
    For some reason Firefox requires the metrics to be recalculated after
    displaying the scrollbar.  Even though the metrics are identical and
    calculating these metrics has no side effects.  Failure to do so
    results in a scrollbar that's crushed to 0 in an offscale range.
    */
    this.getMetrics_();
  } else {
    // Hide the scrollbar.
    this.setMetrics_({x: 0, y: 0});
    this.foreignObject_.style.display = 'none';
  }
};

/**
 * Called when scrollbar is dragged.
 * @private
 */
Blockly.ScrollbarNative.prototype.onScroll_ = function() {
  var xyRatio = {};
  if (this.horizontal_) {
    xyRatio.x = (this.outerDiv_.scrollLeft / this.innerImg_.offsetWidth) || 0;
  } else {
    xyRatio.y = (this.outerDiv_.scrollTop / this.innerImg_.offsetHeight) || 0;
  }
  this.setMetrics_(xyRatio);
};

/**
 * Set the scrollbar slider's position.
 * @param {number} value The distance from the top/left end of the bar.
 * @param {boolean} fireEvents True if onScroll events should be fired.
 */
Blockly.ScrollbarNative.prototype.set = function(value, fireEvents) {
  // If the scrollbar is part of a pair, it is slightly shorter than the view
  // and the value needs to be scaled accordingly.
  if (!fireEvents) {
    // Temporarily supress the onscroll event handler.
    Blockly.unbindEvent_(this.outerDiv_, 'scroll', this.onScrollWrapper_);
  }
  // Move the scrollbar slider.
  if (this.horizontal_) {
    this.outerDiv_.scrollLeft = value * this.ratio_;
  } else {
    this.outerDiv_.scrollTop = value * this.ratio_;
  }
  if (!fireEvents) {
    // Reenable the onscroll event handler.
    var scrollbar = this;
    Blockly.bindEvent_(this.outerDiv_, 'scroll', scrollbar,
                       this.onScrollWrapper_);
  }
};

/**
 * Width of a vertical scrollbar or height of a horizontal scrollbar.
 * We assume that both the above are the same.
 */
Blockly.ScrollbarNative.scrollbarThickness = 0;

/**
 * Mutilate this scrollbar to measure the thickness of an HTML scrollbar.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @private
 */
Blockly.ScrollbarNative.measureScrollbarThickness_ = function(element) {
  var testBar = new Blockly.ScrollbarNative(element, null, null, null, false);

  testBar.outerDiv_.style.width = '100px';
  testBar.outerDiv_.style.height = '100px';
  testBar.innerImg_.style.width = '100%';
  testBar.innerImg_.style.height = '200px';
  // Trivia: failure to set a height and width results in Firefox returning
  // a scrollbar width of -85 instead of 15.
  testBar.foreignObject_.setAttribute('width', 1);
  testBar.foreignObject_.setAttribute('height', 1);

  // Measure the width of the inner-most div.
  testBar.outerDiv_.style.overflowY = 'scroll';
  var w1 = testBar.innerImg_.offsetWidth;
  // Turn off scrollbars and remeasure.
  testBar.outerDiv_.style.overflowY = 'hidden';
  var w2 = testBar.innerImg_.offsetWidth;

  // Destroy the test scrollbar.
  element.parentNode.removeChild(testBar.foreignObject_);

  var thickness = w2 - w1;
  if (thickness <= 0) {
    // Chrome for OS X 10.7 (Lion) floats scrollbars over the content, meaning
    // that there is no way to measure the thickness.  Pick a default.
    thickness = 15;
  }
  Blockly.ScrollbarNative.scrollbarThickness = thickness;
};

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @param {!Function} getMetrics A function that returns scrolling metrics.
 * @param {!Function} setMetrics A function that sets scrolling metrics.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean} opt_pair True if the scrollbar is part of a horiz/vert pair.
 * @constructor
 */
Blockly.ScrollbarSvg = function(element, getMetrics, setMetrics,
                                horizontal, opt_pair) {
  this.element_ = element;
  this.getMetrics_ = getMetrics;
  this.setMetrics_ = setMetrics;
  this.pair_ = opt_pair || false;
  this.horizontal_ = horizontal;

  this.createDom_(element);

  if (horizontal) {
    this.svgBackground_.setAttribute('height',
        Blockly.ScrollbarSvg.scrollbarThickness);
    this.svgKnob_.setAttribute('height',
        Blockly.ScrollbarSvg.scrollbarThickness - 6);
    this.svgKnob_.setAttribute('y', 3);
  } else {
    this.svgBackground_.setAttribute('width',
        Blockly.ScrollbarSvg.scrollbarThickness);
    this.svgKnob_.setAttribute('width',
        Blockly.ScrollbarSvg.scrollbarThickness - 6);
    this.svgKnob_.setAttribute('x', 3);
  }
  var scrollbar = this;
  if (!this.pair_) {
    // If this scrollbar is part of a pair, then the ScrollbarPair will handle
    // resizing and event registration.
    this.resize();
    Blockly.bindEvent_(window, 'resize', scrollbar,
                       function() {scrollbar.resize();});
  }
  Blockly.bindEvent_(this.svgBackground_, 'mousedown', scrollbar,
                     scrollbar.onMouseDownBar_);
  Blockly.bindEvent_(this.svgKnob_, 'mousedown', scrollbar,
                     scrollbar.onMouseDownKnob_);
};

/**
 * Recalculate the scrollbar's location and its length.
 * @param {Object} opt_metrics A data structure of from the describing all the
 * required dimensions.  If not provided, it will be fetched from the host
 * object.
 */
Blockly.ScrollbarSvg.prototype.resize = function(opt_metrics) {
  // Determine the location, height and width of the host element.
  var hostMetrics = opt_metrics;
  if (!hostMetrics) {
    hostMetrics = this.getMetrics_();
    if (!hostMetrics) {
      // Host element is likely not visible.
      return;
    }
  }
  /* hostMetrics is an object with the following properties.
   * .viewHeight: Height of the visible rectangle,
   * .viewWidth: Width of the visible rectangle,
   * .contentHeight: Height of the contents,
   * .contentWidth: Width of the content,
   * .viewTop: Offset of top edge of visible rectangle from parent,
   * .viewLeft: Offset of left edge of visible rectangle from parent,
   * .contentTop: Offset of the top-most content from the y=0 coordinate,
   * .contentLeft: Offset of the left-most content from the x=0 coordinate,
   * .absoluteTop: Top-edge of view.
   * .absoluteLeft: Left-edge of view.
   */
  if (this.horizontal_) {
    var outerLength = hostMetrics.viewWidth;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      outerLength -= Blockly.ScrollbarSvg.scrollbarThickness;
    } else {
      // Only show the scrollbar if needed.
      // Ideally this would also apply to scrollbar pairs, but that's a bigger
      // headache (due to interactions with the corner square).
      this.setVisible(outerLength < hostMetrics.contentHeight);
    }
    this.ratio_ = outerLength / hostMetrics.contentWidth;
    if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
        isNaN(this.ratio_)) {
      this.ratio_ = 0;
    }
    var innerLength = hostMetrics.viewWidth * this.ratio_;
    var innerOffset = (hostMetrics.viewLeft - hostMetrics.contentLeft) *
        this.ratio_;
    this.svgKnob_.setAttribute('width', Math.max(0, innerLength));
    this.xCoordinate = hostMetrics.absoluteLeft;
    if (this.pair_ && Blockly.RTL) {
      this.xCoordinate += hostMetrics.absoluteLeft +
          Blockly.ScrollbarSvg.scrollbarThickness;
    }
    this.yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
        Blockly.ScrollbarSvg.scrollbarThickness;
    this.svgGroup_.setAttribute('transform',
        'translate(' + this.xCoordinate + ', ' + this.yCoordinate + ')');
    this.svgBackground_.setAttribute('width', Math.max(0, outerLength));
    this.svgKnob_.setAttribute('x', this.constrainKnob_(innerOffset));
  } else {
    var outerLength = hostMetrics.viewHeight;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      outerLength -= Blockly.ScrollbarSvg.scrollbarThickness;
    } else {
      // Only show the scrollbar if needed.
      this.setVisible(outerLength < hostMetrics.contentHeight);
    }
    this.ratio_ = outerLength / hostMetrics.contentHeight;
    if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
        isNaN(this.ratio_)) {
      this.ratio_ = 0;
    }
    var innerLength = hostMetrics.viewHeight * this.ratio_;
    var innerOffset = (hostMetrics.viewTop - hostMetrics.contentTop) *
        this.ratio_;
    this.svgKnob_.setAttribute('height', Math.max(0, innerLength));
    this.xCoordinate = hostMetrics.absoluteLeft;
    if (!Blockly.RTL) {
      this.xCoordinate += hostMetrics.viewWidth -
          Blockly.ScrollbarSvg.scrollbarThickness;
    }
    this.yCoordinate = hostMetrics.absoluteTop;
    this.svgGroup_.setAttribute('transform',
        'translate(' + this.xCoordinate + ', ' + this.yCoordinate + ')');
    this.svgBackground_.setAttribute('height', Math.max(0, outerLength));
    this.svgKnob_.setAttribute('y', this.constrainKnob_(innerOffset));
  }
  // Resizing may have caused some scrolling.
  this.onScroll_();
};

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @param {!Element} element The SVG element to bind the scrollbars to.
 * @private
 */
Blockly.ScrollbarSvg.prototype.createDom_ = function(element) {
  /* Create the following DOM:
  <g>
    <rect class="blocklyScrollbarBackground" />
    <rect class="blocklyScrollbarKnob" rx="7" ry="7" />
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgBackground_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyScrollbarBackground'}, this.svgGroup_);
  var radius = Math.floor((Blockly.ScrollbarSvg.scrollbarThickness - 6) / 2);
  this.svgKnob_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyScrollbarKnob', rx: radius, ry: radius},
      this.svgGroup_);
  Blockly.Scrollbar.insertAfter_(this.svgGroup_, element);
};

/**
 * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
 * needed.
 * @return {boolean} True if visible.
 */
Blockly.ScrollbarSvg.prototype.isVisible = function() {
  return this.svgGroup_.getAttribute('display') != 'none';
};

/**
 * Set whether the scrollbar is visible.
 * Only applies to non-paired scrollbars.
 * @param {boolean} visible True if visible.
 */
Blockly.ScrollbarSvg.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    return;
  }
  // Ideally this would also apply to scrollbar pairs, but that's a bigger
  // headache (due to interactions with the corner square).
  if (this.pair_) {
    throw 'Unable to toggle visibility of paired scrollbars.';
  }
  if (visible) {
    this.svgGroup_.setAttribute('display', 'block');
  } else {
    // Hide the scrollbar.
    this.setMetrics_({x: 0, y: 0});
    this.svgGroup_.setAttribute('display', 'none');
  }
};

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.ScrollbarSvg.prototype.onMouseDownBar_ = function(e) {
  Blockly.hideChaff(true);
  if (e.button == 2) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation();
    return;
  }
  // Update Blockly's knowledge of its own location.
  Blockly.svgResize();
  var svgSize = Blockly.svgSize();
  var mouseLocation = this.horizontal_ ?
      e.x - svgSize.left : e.y - svgSize.top;

  var knobXY = Blockly.getAbsoluteXY_(this.svgKnob_);
  var knobStart = this.horizontal_ ? knobXY.x : knobXY.y;
  var knobLength = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'width' : 'height'));
  var knobValue = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));

  var pageLength = knobLength * 0.95;
  if (mouseLocation <= knobStart) {
    // Decrease the scrollbar's value by a page.
    knobValue -= pageLength;
  } else if (mouseLocation >= knobStart + knobLength) {
    // Increase the scrollbar's value by a page.
    knobValue += pageLength;
  }
  this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y',
                             this.constrainKnob_(knobValue));
  this.onScroll_();
  e.stopPropagation();
};

/**
 * Start a dragging operation.
 * Called when scrollbar knob is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.ScrollbarSvg.prototype.onMouseDownKnob_ = function(e) {
  Blockly.hideChaff(true);
  this.onMouseUpKnob_();
  if (e.button == 2) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation();
    return;
  }
  // Look up the current translation and record it.
  this.startDragKnob = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));
  // Record the current mouse position.
  this.startDragMouse = this.horizontal_ ? e.clientX : e.clientY;
  Blockly.ScrollbarSvg.onMouseUpWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
      'mouseup', this, this.onMouseUpKnob_);
  Blockly.ScrollbarSvg.onMouseMoveWrapper_ = Blockly.bindEvent_(Blockly.svgDoc,
      'mousemove', this, this.onMouseMoveKnob_);
  e.stopPropagation();
};

/**
 * Drag the scrollbar's knob.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.ScrollbarSvg.prototype.onMouseMoveKnob_ = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY;
  var mouseDelta = currentMouse - this.startDragMouse;
  var knobValue = this.startDragKnob + mouseDelta;
  // Position the bar.
  this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y',
                             this.constrainKnob_(knobValue));
  this.onScroll_();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.ScrollbarSvg.prototype.onMouseUpKnob_ = function(e) {
  if (Blockly.ScrollbarSvg.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.svgDoc, 'mouseup',
                         Blockly.ScrollbarSvg.onMouseUpWrapper_);
    Blockly.ScrollbarSvg.onMouseUpWrapper_ = null;
  }
  if (Blockly.ScrollbarSvg.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.svgDoc, 'mousemove',
                         Blockly.ScrollbarSvg.onMouseMoveWrapper_);
    Blockly.ScrollbarSvg.onMouseMoveWrapper_ = null;
  }
};

/**
 * Constrain the knob's position within the minimum (0) and maximum
 * (length of scrollbar) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds.
 * @return {number} Constrained value.
 * @private
 */
Blockly.ScrollbarSvg.prototype.constrainKnob_ = function(value) {
  if (value <= 0 || isNaN(value)) {
    value = 0;
  } else {
    var axis = this.horizontal_ ? 'width' : 'height';
    var barLength = parseFloat(this.svgBackground_.getAttribute(axis));
    var knobLength = parseFloat(this.svgKnob_.getAttribute(axis));
    value = Math.min(value, barLength - knobLength);
  }
  return value;
};

/**
 * Called when scrollbar is moved.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.ScrollbarSvg.prototype.onScroll_ = function(e) {
  var knobValue = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));
  var barLength = parseFloat(
      this.svgBackground_.getAttribute(this.horizontal_ ? 'width' : 'height'));
  var ratio = knobValue / barLength;
  if (isNaN(ratio)) {
    ratio = 0;
  }
  var xyRatio = {};
  if (this.horizontal_) {
    xyRatio.x = ratio;
  } else {
    xyRatio.y = ratio;
  }
  this.setMetrics_(xyRatio);
};

/**
 * Set the scrollbar slider's position.
 * @param {number} value The distance from the top/left end of the bar.
 * @param {boolean} fireEvents True if onScroll events should be fired.
 */
Blockly.ScrollbarSvg.prototype.set = function(value, fireEvents) {
  // Move the scrollbar slider.
  this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y', value * this.ratio_);

  if (fireEvents) {
    this.onScroll_();
  }
};

/**
 * Width of a vertical scrollbar or height of a horizontal scrollbar.
 */
Blockly.ScrollbarSvg.scrollbarThickness = 15;

Blockly.Scrollbar = {};

/**
 * Choose between the native and the SVG implementations.  The native one is
 * preferred, provided that the browser supports it.
 * To test, see: tests/native_scrollbar_test.html
 */
(function() {
  var useNative = false;
  var ua = window.navigator.userAgent;
  var isGecko = ua.indexOf('Gecko/') != -1;
  var isMac = window.navigator.platform == 'MacIntel';
  var isLinux = window.navigator.platform.indexOf('Linux') != -1;
  // Known good user agents:
  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:10.0.2)
  //     Gecko/20100101 Firefox/10.0.2
  // Mozilla/5.0 (Ubuntu; X11; Linux x86_64; rv:9.0.1)
  //     Gecko/20100101 Firefox/9.0.1
  if (isGecko && (isMac || isLinux)) {
    useNative = true;
  }
  if (useNative) {
    Blockly.Scrollbar = Blockly.ScrollbarNative;
  } else {
    Blockly.Scrollbar = Blockly.ScrollbarSvg;
  }
})();

Blockly.Scrollbar.insertAfter_ = function(newNode, refNode) {
  var siblingNode = refNode.nextSibling;
  var parentNode = refNode.parentNode;
  if (!parentNode) {
    throw 'Reference node has no parent.';
  }
  if (siblingNode) {
    parentNode.insertBefore(newNode, siblingNode);
  } else {
    parentNode.appendChild(newNode);
  }
};

/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Toolbox from whence to create blocks.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */

// Name space for the toolbox.
Blockly.Toolbox = {};

/**
 * Width of the toolbox.
 */
Blockly.Toolbox.width = 0;

/**
 * The SVG group currently selected.
 * @type {Element}
 * @private
 */
Blockly.Toolbox.selectedOption_ = null;

/**
 * Creates the toolbox's DOM.  Only needs to be called once.
 * @return {!Element} The toolbox's SVG group.
 */
Blockly.Toolbox.createDom = function() {
  Blockly.Toolbox.flyout_ = new Blockly.Flyout();
  /*
  <g>
    [flyout]
    <rect class="blocklyToolboxBackground" height="100%"/>
    <g class="blocklyToolboxOptions">
    </g>
  </g>
  */
  var svgGroup = Blockly.createSvgElement('g', {}, null);
  Blockly.Toolbox.svgGroup_ = svgGroup;
  var flyoutGroup = Blockly.Toolbox.flyout_.createDom();
  svgGroup.appendChild(flyoutGroup);
  Blockly.Toolbox.svgBackground_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyToolboxBackground', height: '100%'}, svgGroup);
  Blockly.Toolbox.svgOptions_ = Blockly.createSvgElement('g',
      {'class': 'blocklyToolboxOptions'}, svgGroup);
  return svgGroup;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * toolbox.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the toolbox.
 */
Blockly.Toolbox.getMetrics = function() {
  var viewHeight = Blockly.svgSize().height;
  var viewWidth = Blockly.Toolbox.width;
  try {
    var optionBox = Blockly.Toolbox.svgOptions_.getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  return {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height + optionBox.y,
    viewTop: -Blockly.Toolbox.svgOptions_.scrollY,
    contentTop: 0,
    absoluteTop: 0,
    // absoluteLeft should be 0, but Firefox leaks by a pixel.
    absoluteLeft: Blockly.RTL ? -1 : 1
  };
};

/**
 * Sets the Y translation of the toolbox to match the scrollbars.
 * @param {!Object} yRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 */
Blockly.Toolbox.setMetrics = function(yRatio) {
  var metrics = Blockly.Toolbox.getMetrics();
  if (typeof yRatio.y == 'number') {
    Blockly.Toolbox.svgOptions_.scrollY = -metrics.contentHeight * yRatio.y -
        metrics.contentTop;
  }
  Blockly.Toolbox.svgOptions_.setAttribute('transform', 'translate(0,' +
      (Blockly.Toolbox.svgOptions_.scrollY + metrics.absoluteTop) + ')');
};

/**
 * Initializes the toolbox.
 */
Blockly.Toolbox.init = function() {
  Blockly.Toolbox.flyout_.init(Blockly.mainWorkspace,
                               Blockly.getMainWorkspaceMetrics);
  Blockly.Toolbox.languageTree = Blockly.Toolbox.buildTree_();
  Blockly.Toolbox.redraw();

  // Add scrollbars.
  new Blockly.Scrollbar(Blockly.Toolbox.svgOptions_,
      Blockly.Toolbox.getMetrics, Blockly.Toolbox.setMetrics,
      false, false);

  Blockly.Toolbox.position_();

  // If the document resizes, reposition the toolbox.
  Blockly.bindEvent_(window, 'resize', null, Blockly.Toolbox.position_);
};

/**
 * Move the toolbox to the edge.
 * @private
 */
Blockly.Toolbox.position_ = function() {
  var svgSize = Blockly.svgSize();
  if (Blockly.RTL) {
    Blockly.Toolbox.svgGroup_.setAttribute('transform',
        'translate(' + (svgSize.width - Blockly.Toolbox.width) + ',0)');
  }
};

/**
 * String to prefix on categories of each block in the toolbox.
 * Used to prevent collisions with built-in properties like 'toString'.
 * @private
 */
Blockly.Toolbox.PREFIX_ = 'cat_';

/**
 * Build the hierarchical tree of block types.
 * @return {!Object} Tree object.
 * @private
 */
Blockly.Toolbox.buildTree_ = function() {
  var tree = {};
  // Populate the tree structure.
  for (var name in Blockly.Language) {
    var block = Blockly.Language[name];
    // Blocks without a category are fragments used by the mutator dialog.
    if (block.category) {
      var cat = Blockly.Toolbox.PREFIX_ + window.encodeURI(block.category);
      if (cat in tree) {
        tree[cat].push(name);
      } else {
        tree[cat] = [name];
      }
    }
  }
  return tree;
};

/**
 * Fill the toolbox with options.
 */
Blockly.Toolbox.redraw = function() {
  // Create an option for each category.
  var options = [];
  for (var cat in Blockly.Toolbox.languageTree) {
    var option = {};
    option.text =
        window.decodeURI(cat.substring(Blockly.Toolbox.PREFIX_.length));
    option.cat = cat;
    options.push(option);
  }
  var option = {};
  if (Blockly.Language.variables_get || Blockly.Language.variables_set) {
    // Variables have a special category that is dynamic.
    options.push({text: Blockly.MSG_VARIABLE_CATEGORY,
                  cat: Blockly.MSG_VARIABLE_CATEGORY});
  }
  if (Blockly.Language.procedures_defnoreturn ||
      Blockly.Language.procedures_defreturn) {
    // Procedures have a special category that is dynamic.
    options.push({text: Blockly.MSG_PROCEDURE_CATEGORY,
                  cat: Blockly.MSG_PROCEDURE_CATEGORY});
  }


  function callbackFactory(element) {
    return function(e) {
      var oldSelectedOption = Blockly.Toolbox.selectedOption_;
      Blockly.hideChaff();
      if (oldSelectedOption == element) {
        Blockly.Toolbox.clearSelection();
      } else {
        Blockly.Toolbox.selectOption_(element);
      }
      // This mouse click has been handled, don't bubble up to document.
      e.stopPropagation();
    };
  }

  // Erase all existing options.
  Blockly.removeChildren_(Blockly.Toolbox.svgOptions_);

  var TOP_MARGIN = 4;
  var maxWidth = 0;
  var resizeList = [Blockly.Toolbox.svgBackground_];
  for (var x = 0, option; option = options[x]; x++) {
    var gElement = Blockly.ContextMenu.optionToDom(option.text);
    var rectElement = gElement.firstChild;
    var textElement = gElement.lastChild;
    Blockly.Toolbox.svgOptions_.appendChild(gElement);

    gElement.setAttribute('transform', 'translate(0, ' +
        (x * Blockly.ContextMenu.Y_HEIGHT + TOP_MARGIN) + ')');
    gElement.cat = option.cat;
    Blockly.bindEvent_(gElement, 'mousedown', null,
                       callbackFactory(gElement));
    resizeList.push(rectElement);
    // Compute the length of the longest text length.
    maxWidth = Math.max(maxWidth, textElement.getComputedTextLength());
  }
  // Run a second pass to resize all options to the required width.
  maxWidth += Blockly.ContextMenu.X_PADDING * 2;
  for (var x = 0; x < resizeList.length; x++) {
    resizeList[x].setAttribute('width', maxWidth);
  }
  if (Blockly.RTL) {
    // Right-align the text.
    for (var x = 0, gElement;
         gElement = Blockly.Toolbox.svgOptions_.childNodes[x]; x++) {
      var textElement = gElement.lastChild;
      textElement.setAttribute('x', maxWidth -
          textElement.getComputedTextLength() - Blockly.ContextMenu.X_PADDING);
    }
  }
  Blockly.Toolbox.width = maxWidth;

  // Right-click on empty areas of the toolbox does not generate a context menu.
  Blockly.bindEvent_(Blockly.Toolbox.svgGroup_, 'mousedown', null,
      function(e) {
        if (e.button == 2) {
          Blockly.hideChaff(true);
          e.stopPropagation();
        }
      });

  // Fire a resize event since the toolbox may have changed width and height.
  Blockly.fireUiEvent(Blockly.svgDoc, window, 'resize');
};

/**
 * Highlight the specified option.
 * @param {Element} newSelectedOption The SVG group for the selected option,
 *     or null to select nothing.
 * @private
 */
Blockly.Toolbox.selectOption_ = function(newSelectedOption) {
  Blockly.Toolbox.clearSelection();
  Blockly.Toolbox.selectedOption_ = newSelectedOption;
  if (newSelectedOption) {
    Blockly.addClass_(newSelectedOption, 'blocklyMenuSelected');
    var cat = newSelectedOption.cat;
    var blockSet = Blockly.Toolbox.languageTree[cat] || cat;
    Blockly.Toolbox.flyout_.show(blockSet);
  }
};

/**
 * Unhighlight any previously specified option.  Hide the flyout.
 */
Blockly.Toolbox.clearSelection = function() {
  var oldSelectedOption = Blockly.Toolbox.selectedOption_;
  if (oldSelectedOption) {
    Blockly.removeClass_(oldSelectedOption, 'blocklyMenuSelected');
    Blockly.Toolbox.selectedOption_ = null;
  }
  Blockly.Toolbox.flyout_.hide();
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Library to create tooltips for Blockly.
 * First, call Blockly.Tooltip.init() after onload.
 * Second, set the 'tooltip' property on any SVG element that needs a tooltip.
 * If the tooltip is a string, then that message will be displayed.
 * If the tooltip is an SVG element, then that object's tooltip will be used.
 * Third, call Blockly.Tooltip.bindMouseEvents(e) passing the SVG element.
 * @author fraser@google.com (Neil Fraser)
 */

// Tooltip Engine
Blockly.Tooltip = {};

// PID of suspended threads.
Blockly.Tooltip.mouseOutPid = 0;
Blockly.Tooltip.showPid = 0;

// Last observed location of the mouse pointer (freezes when tooltip appears).
Blockly.Tooltip.lastX = 0;
Blockly.Tooltip.lastY = 0;

// Is a tooltip currently showing?
Blockly.Tooltip.visible = false;

// Current element being pointed at.
Blockly.Tooltip.element = null;
Blockly.Tooltip.poisonedElement = null;

// References to the SVG elements.
Blockly.Tooltip.svgGroup_ = null;
Blockly.Tooltip.svgText_ = null;
Blockly.Tooltip.svgBackground_ = null;
Blockly.Tooltip.svgShadow_ = null;

// Various constants.
Blockly.Tooltip.OFFSET_X = 0;  // Offset between mouse cursor and tooltip.
Blockly.Tooltip.OFFSET_Y = 10;
Blockly.Tooltip.RADIUS_OK = 10;  // Radius mouse can move before killing tip.
Blockly.Tooltip.HOVER_MS = 1000;  // Delay before tooltip appears.
Blockly.Tooltip.MARGINS = 5;  // Horizontal padding between text and background.

/**
 * Create the tooltip elements.  Only needs to be called once.
 * @return {!Element} The tooltip's SVG group.
 */
Blockly.Tooltip.createDom = function() {
  /*
  <g class="blocklyHidden">
    <rect class="blocklyTooltipShadow" x="2" y="2"/>
    <rect class="blocklyTooltipBackground"/>
    <text class="blocklyTooltipText"></text>
  </g>
  */
  var svgGroup =
      Blockly.createSvgElement('g', {'class': 'blocklyHidden'}, null);
  Blockly.Tooltip.svgGroup_ = svgGroup;
  Blockly.Tooltip.svgShadow_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyTooltipShadow', x: 2, y: 2}, svgGroup);
  Blockly.Tooltip.svgBackground_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyTooltipBackground'}, svgGroup);
  Blockly.Tooltip.svgText_ = Blockly.createSvgElement('text',
      {'class': 'blocklyTooltipText'}, svgGroup);
  return svgGroup;
};

/**
 * Binds the required mouse events onto an SVG element.
 * @param {!Element} element SVG element onto which tooltip is to be bound.
 */
Blockly.Tooltip.bindMouseEvents = function(element) {
  Blockly.bindEvent_(element, 'mouseover', null, Blockly.Tooltip.onMouseOver_);
  Blockly.bindEvent_(element, 'mouseout', null, Blockly.Tooltip.onMouseOut_);
  Blockly.bindEvent_(element, 'mousemove', null, Blockly.Tooltip.onMouseMove_);
};

/**
 * Hide the tooltip if the mouse is over a different object.
 * Initialize the tooltip to potentially appear for this object.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseOver_ = function(e) {
  // If the tooltip is an object, treat it as a pointer to the next object in
  // the chain to look at.  Terminate when a string is found.
  var element = e.target;
  while (typeof element.tooltip == 'object') {
    element = element.tooltip;
  }
  if (Blockly.Tooltip.element != element) {
    Blockly.Tooltip.hide();
    Blockly.Tooltip.poisonedElement = null;
    Blockly.Tooltip.element = element;
  }
  // Forget about any immediately preceeding mouseOut event.
  window.clearTimeout(Blockly.Tooltip.mouseOutPid);
};

/**
 * Hide the tooltip if the mouse leaves the object and enters the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseOut_ = function(e) {
  // Moving from one element to another (overlapping or with no gap) generates
  // a mouseOut followed instantly by a mouseOver.  Fork off the mouseOut
  // event and kill it if a mouseOver is received immediately.
  // This way the task only fully executes if mousing into the void.
  Blockly.Tooltip.mouseOutPid = window.setTimeout(function() {
        Blockly.Tooltip.element = null;
        Blockly.Tooltip.poisonedElement = null;
        Blockly.Tooltip.hide();
      }, 1);
  window.clearTimeout(Blockly.Tooltip.showPid);
};

/**
 * When hovering over an element, schedule a tooltip to be shown.  If a tooltip
 * is already visible, hide it if the mouse strays out of a certain radius.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseMove_ = function(e) {
  if (!Blockly.Tooltip.element || !Blockly.Tooltip.element.tooltip) {
    // No tooltip here to show.
    return;
  } else if ((Blockly.ContextMenu && Blockly.ContextMenu.visible) ||
             Blockly.Block.dragMode_ != 0) {
    // Don't display a tooltip when a context menu is active, or during a drag.
    return;
  }
  if (Blockly.Tooltip.visible) {
    // Compute the distance between the mouse position when the tooltip was
    // shown and the current mouse position.  Pythagorean theorem.
    var dx = Blockly.Tooltip.lastX - e.clientX;
    var dy = Blockly.Tooltip.lastY - e.clientY;
    var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (dr > Blockly.Tooltip.RADIUS_OK) {
      Blockly.Tooltip.hide();
    }
  } else if (Blockly.Tooltip.poisonedElement != Blockly.Tooltip.element) {
    // The mouse moved, clear any previously scheduled tooltip.
    window.clearTimeout(Blockly.Tooltip.showPid);
    // Maybe this time the mouse will stay put.  Schedule showing of tooltip.
    Blockly.Tooltip.lastX = e.clientX;
    Blockly.Tooltip.lastY = e.clientY;
    Blockly.Tooltip.showPid =
        window.setTimeout(Blockly.Tooltip.show_, Blockly.Tooltip.HOVER_MS);
  }
};

/**
 * Hide the tooltip.
 */
Blockly.Tooltip.hide = function() {
  if (Blockly.Tooltip.visible) {
    Blockly.Tooltip.visible = false;
    if (Blockly.Tooltip.svgGroup_) {
      Blockly.Tooltip.svgGroup_.style.display = 'none';
    }
  }
  window.clearTimeout(Blockly.Tooltip.showPid);
};

/**
 * Create the tooltip and show it.
 * @private
 */
Blockly.Tooltip.show_ = function() {
  Blockly.Tooltip.poisonedElement = Blockly.Tooltip.element;
  if (!Blockly.Tooltip.svgGroup_) {
    return;
  }
  // Erase all existing text.
  Blockly.removeChildren_(Blockly.Tooltip.svgText_);
  // Create new text, line by line.
  var tip = Blockly.Tooltip.element.tooltip;
  if (typeof tip == 'function') {
    tip = tip();
  }
  var lines = tip.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var tspanElement = Blockly.createSvgElement('tspan',
        {dy: '1em', x: Blockly.Tooltip.MARGINS}, Blockly.Tooltip.svgText_);
    var textNode = Blockly.svgDoc.createTextNode(lines[i]);
    tspanElement.appendChild(textNode);
  }
  // Display the tooltip.
  Blockly.Tooltip.visible = true;
  Blockly.Tooltip.svgGroup_.style.display = 'block';
  // Resize the background and shadow to fit.
  var bb = Blockly.Tooltip.svgText_.getBBox();
  var width = 2 * Blockly.Tooltip.MARGINS + bb.width;
  var height = bb.height;
  Blockly.Tooltip.svgBackground_.setAttribute('width', width);
  Blockly.Tooltip.svgBackground_.setAttribute('height', height);
  Blockly.Tooltip.svgShadow_.setAttribute('width', width);
  Blockly.Tooltip.svgShadow_.setAttribute('height', height);
  // Move the tooltip to just below the cursor.
  var left = Blockly.Tooltip.lastX;
  if (Blockly.RTL) {
    left -= Blockly.Tooltip.OFFSET_X + width;
  } else {
    left += Blockly.Tooltip.OFFSET_X;
  }
  var top = Blockly.Tooltip.lastY + Blockly.Tooltip.OFFSET_Y;
  // Update Blockly's knowledge of its own location.
  Blockly.svgResize();
  var svgSize = Blockly.svgSize();
  left -= svgSize.left;
  top -= svgSize.top;
  Blockly.Tooltip.svgGroup_.setAttribute('transform',
      'translate(' + left + ',' + top + ')');
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a trash can icon.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a trash can.
 * @param {!Function} getMetrics A function that returns workspace's metrics.
 * @constructor
 */
Blockly.Trashcan = function(getMetrics) {
  this.getMetrics_ = getMetrics;
};

Blockly.Trashcan.prototype.BODY_URL_ = 'media/trashbody.png';
Blockly.Trashcan.prototype.LID_URL_ = 'media/trashlid.png';
Blockly.Trashcan.prototype.WIDTH_ = 47;
Blockly.Trashcan.prototype.BODY_HEIGHT_ = 45;
Blockly.Trashcan.prototype.LID_HEIGHT_ = 15;
Blockly.Trashcan.prototype.MARGIN_BOTTOM_ = 35;
Blockly.Trashcan.prototype.MARGIN_SIDE_ = 35;

/**
 * Current open/close state of the lid.
 */
Blockly.Trashcan.prototype.isOpen = false;

/**
 * The SVG group containing the trash can.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgGroup_ = null;

/**
 * The SVG image element of the trash can body.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgBody_ = null;

/**
 * The SVG image element of the trash can lid.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgLid_ = null;

/**
 * Task ID of opening/closing animation.
 * @private
 */
Blockly.Trashcan.prototype.lidTask_ = 0;

/**
 * Current angle of the lid.
 * @private
 */
Blockly.Trashcan.prototype.lidAngle_ = 0;

/**
 * Left coordinate of the trash can.
 * @private
 */
Blockly.Trashcan.prototype.left_ = 0;

/**
 * Top coordinate of the trash can.
 * @private
 */
Blockly.Trashcan.prototype.top_ = 0;

/**
 * Create the trash can elements.
 * @return {!Element} The trash can's SVG group.
 */
Blockly.Trashcan.prototype.createDom = function() {
  /*
  <g filter="url(#blocklyTrashcanShadowFilter)">
    <image width="47" height="45" y="15" href="media/trashbody.png"></image>
    <image width="47" height="15" href="media/trashlid.png"></image>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g',
      {filter: 'url(#blocklyTrashcanShadowFilter)'}, null);
  this.svgBody_ = Blockly.createSvgElement('image',
      {width: this.WIDTH_, height: this.BODY_HEIGHT_},
      this.svgGroup_);
  this.svgBody_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.pathToBlockly + this.BODY_URL_);
  this.svgBody_.setAttribute('y', this.LID_HEIGHT_);
  this.svgLid_ = Blockly.createSvgElement('image',
      {width: this.WIDTH_, height: this.LID_HEIGHT_},
      this.svgGroup_);
  this.svgLid_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.pathToBlockly + this.LID_URL_);
  return this.svgGroup_;
};

/**
 * Initialize the trash can.
 */
Blockly.Trashcan.prototype.init = function() {
  this.setOpen_(false);
  this.position_();
  // If the document resizes, reposition the trash can.
  Blockly.bindEvent_(window, 'resize', this, this.position_);
};

/**
 * Move the trash can to the bottom-right corner.
 * @private
 */
Blockly.Trashcan.prototype.position_ = function() {
  var metrics = this.getMetrics_();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  if (Blockly.RTL) {
    this.left_ = this.MARGIN_SIDE_;
  } else {
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
        this.WIDTH_ - this.MARGIN_SIDE_;
  }
  this.top_ = metrics.viewHeight + metrics.absoluteTop -
      (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.MARGIN_BOTTOM_;
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Determines if the mouse is currently over the trash can.
 * Opens/closes the lid and sets the isOpen flag.
 * @param {!Event} e Mouse move event.
 */
Blockly.Trashcan.prototype.onMouseMove = function(e) {
  /*
  An alternative approach would be to use onMouseOver and onMouseOut events.
  However the selected block will be between the mouse and the trash can,
  thus these events won't fire.
  Another approach is to use HTML5's drag & drop API, but it's widely hated.
  Instead, we'll just have the block's drag_ function call us.
  */
  if (!this.svgGroup_) {
    return;
  }
  var hwView = Blockly.svgSize();
  var xy = Blockly.getAbsoluteXY_(this.svgGroup_);
  var left = xy.x + hwView.left;
  var top = xy.y + hwView.top;
  var over = (e.clientX > left) &&
             (e.clientX < left + this.WIDTH_) &&
             (e.clientY > top) &&
             (e.clientY < top + this.BODY_HEIGHT_ + this.LID_HEIGHT_);
  // For bonus points we might want to match the trapezoidal outline.
  if (this.isOpen != over) {
    this.setOpen_(over);
  }
};

/**
 * Flip the lid open or shut.
 * @param {boolean} state True if open.
 * @private
 */
Blockly.Trashcan.prototype.setOpen_ = function(state) {
  if (this.isOpen == state) {
    return;
  }
  window.clearTimeout(this.lidTask_);
  this.isOpen = state;
  Blockly.Trashcan.animateLid_(this);
};

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @param {!Blockly.Trashcan} trashcan The instance of a trashcan to animate.
 * @private
 */
Blockly.Trashcan.animateLid_ = function(trashcan) {
  trashcan.lidAngle_ += trashcan.isOpen ? 10 : -10;
  trashcan.lidAngle_ = Math.max(0, trashcan.lidAngle_);
  trashcan.svgLid_.setAttribute('transform', 'rotate(' +
      (Blockly.RTL ? -trashcan.lidAngle_ : trashcan.lidAngle_) + ', ' +
      (Blockly.RTL ? 4 : trashcan.WIDTH_ - 4) + ', ' +
      (trashcan.LID_HEIGHT_ - 2) + ')');
  if (trashcan.isOpen ? (trashcan.lidAngle_ < 45) : (trashcan.lidAngle_ > 0)) {
    var closure = function() {
      Blockly.Trashcan.animateLid_(trashcan);
    };
    this.lidTask_ = window.setTimeout(closure, 5);
  }
};

/**
 * Flip the lid shut.
 * @param {!Blockly.Trashcan} trashcan The instance of a trashcan to animate.
 * Called externally after a drag.
 */
Blockly.Trashcan.close = function(trashcan) {
  trashcan.setOpen_(false);
};
/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling connections.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 */
Blockly.Wiring = {};

Blockly.Wiring.NAME_TYPE = 'connection';

/**
 * Find all user-created procedure definitions.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Wiring.allWiring = function() {
/*  var blocks = Blockly.mainWorkspace.getAllBlocks(false);
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureDef;
    if (func) {
      var tuple = func.call(blocks[x]);
      if (tuple) {
        if (tuple[1]) {
          proceduresReturn.push(tuple[0]);
        } else {
          proceduresNoReturn.push(tuple[0]);
        }
      }
    }
  }
  proceduresNoReturn.sort(Blockly.caseInsensitiveComparator);
  proceduresReturn.sort(Blockly.caseInsensitiveComparator);
  return [proceduresNoReturn, proceduresReturn];*/
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Wiring.flyoutCategory = function(blocks, gaps, margin, workspace) {
    var block = new Blockly.Block(workspace, 'nop');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);


/*  if (Blockly.Language.procedures_defnoreturn) {
    var block = new Blockly.Block(workspace, 'procedures_defnoreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }
  if (Blockly.Language.procedures_defreturn) {
    var block = new Blockly.Block(workspace, 'procedures_defreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }

  var tuple = Blockly.Procedures.allProcedures();
  var proceduresNoReturn = tuple[0];
  var proceduresReturn = tuple[1];
  if (Blockly.Language.procedures_callnoreturn) {
    for (var x = 0; x < proceduresNoReturn.length; x++) {
      var block = new Blockly.Block(workspace, 'procedures_callnoreturn');
      block.setTitleText(proceduresNoReturn[x], 'NAME');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }
  if (Blockly.Language.procedures_callreturn) {
    for (var x = 0; x < proceduresReturn.length; x++) {
      var block = new Blockly.Block(workspace, 'procedures_callreturn');
      block.setTitleText(proceduresReturn[x], 'NAME');
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }*/
};

/**
 * Refresh the procedure flyout if it is open.
 * Only used if the flyout's autoClose is false.
 */
Blockly.Wiring.refreshFlyoutCategory = function() {
/*  if (Blockly.Toolbox && Blockly.Toolbox.flyout_.isVisible() && Blockly.Toolbox.selectedOption_ &&
      Blockly.Toolbox.selectedOption_.cat == Blockly.MSG_PROCEDURE_CATEGORY) {
    Blockly.Toolbox.flyout_.hide();
    Blockly.Toolbox.flyout_.show(Blockly.MSG_PROCEDURE_CATEGORY);
  }*/
};

/**
 * When a procedure definition is destroyed, find and destroy all its callers.
 * @param {string} name Name of deleted procedure definition.
 * @param {!Blockly.Workspace} workspace The workspace to delete callers from.
 */
Blockly.Wiring.destroyCallers = function(name, workspace) {
/*  name = name.toLowerCase();
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureCall;
    if (func) {
      var procName = func.call(blocks[x]);
      // Procedure name may be null if the block is only half-built.
      if (procName && procName.toLowerCase() == name) {
        blocks[x].destroy(true);
      }
    }
  }
  window.setTimeout(Blockly.Procedures.refreshFlyoutCategory, 1);*/
};
/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling variables and procedure names.
 * Note that variables and procedures share the same name space, meaning that
 * one can't have a variable and a procedure of the same name.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a database of variables.
 * @param {Array.<string>} reservedWords An array of words that are illegal for
 *     use as variable names in a language (e.g. ['new', 'if', 'this', ...]).
 * @constructor
 */
Blockly.Variables = {};

Blockly.Variables.NAME_TYPE = 'variable';

/**
 * Find all user-created variables.
 * @param {Blockly.Block} opt_block Optional root block.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.allVariables = function(opt_block) {
  var blocks;
  if (opt_block) {
    blocks = opt_block.getDescendants();
  } else {
    blocks = Blockly.mainWorkspace.getAllBlocks();
  }
  var variableHash = {};
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getVars;
    if (func) {
      var blockVariables = func.call(blocks[x]);
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
          variableHash[Blockly.Names.PREFIX_ +
              varName.toLowerCase()] = varName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var name in variableHash) {
    variableList.push(variableHash[name]);
  }
  return variableList;
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.dropdownCreate = function() {
  var variableList = Blockly.Variables.allVariables();
  // Ensure that the currently selected variable is an option.
  var name = this.getText();
  if (name && variableList.indexOf(name) == -1) {
    variableList.push(name);
  }
  variableList.sort(Blockly.caseInsensitiveComparator);
  variableList.push(Blockly.MSG_RENAME_VARIABLE);
  variableList.push(Blockly.MSG_NEW_VARIABLE);
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < variableList.length; x++) {
    options[x] = [variableList[x], variableList[x]];
  }
  return options;
};

/**
 * Event handler for a change in variable name.
 * Special case the 'New variable...' and 'Rename variable...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 */
Blockly.Variables.dropdownChange = function(text) {
  function promptName(promptText, defaultText) {
    Blockly.hideChaff();
    var newVar = window.prompt(promptText, defaultText);
    // Strip leading and trailing whitespace.  Beyond this, all names are legal.
    return newVar && newVar.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
  }
  if (text == Blockly.MSG_RENAME_VARIABLE) {
    var oldVar = this.getText();
    text = promptName(Blockly.MSG_RENAME_VARIABLE_TITLE.replace('%1', oldVar),
                      oldVar);
    if (text) {
      Blockly.Variables.renameVariable(oldVar, text);
    }
  } else {
    if (text == Blockly.MSG_NEW_VARIABLE) {
      text = promptName(Blockly.MSG_NEW_VARIABLE_TITLE, '');
      // Since variables are case-insensitive, ensure that if the new variable
      // matches with an existing variable, the new case prevails throughout.
      Blockly.Variables.renameVariable(text, text);
    }
    if (text) {
      this.setText(text);
    }
  }
  window.setTimeout(Blockly.Variables.refreshFlyoutCategory, 1);
};

/**
 * Find all instances of the specified variable and rename them.
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.Variables.renameVariable = function(oldName, newName) {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  // Iterate through every block.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].renameVar;
    if (func) {
      func.call(blocks[x], oldName, newName);
    }
  }
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Variables.flyoutCategory = function(blocks, gaps, margin, workspace) {
  var variableList = Blockly.Variables.allVariables();
  variableList.sort(Blockly.caseInsensitiveComparator);
  // In addition to the user's variables, we also want to display the default
  // variable name at the top.  We also don't want this duplicated if the
  // user has created a variable of the same name.
  variableList.unshift(null);
  var defaultVariable = undefined;
  for (var i = 0; i < variableList.length; i++) {
    if (variableList[i] === defaultVariable) {
      continue;
    }
    var getBlock = Blockly.Language.variables_get ?
        new Blockly.Block(workspace, 'variables_get') : null;
    getBlock && getBlock.initSvg();
    var setBlock = Blockly.Language.variables_set ?
        new Blockly.Block(workspace, 'variables_set') : null;
    setBlock && setBlock.initSvg();
    if (variableList[i] === null) {
      defaultVariable = (getBlock || setBlock).getVars()[0];
    } else {
      getBlock && getBlock.setTitleText(variableList[i], 'VAR');
      setBlock && setBlock.setTitleText(variableList[i], 'VAR');
    }
    setBlock && blocks.push(setBlock);
    getBlock && blocks.push(getBlock);
    if (getBlock && setBlock) {
      gaps.push(margin, margin * 3);
    } else {
      gaps.push(margin * 2);
    }
  }
};

/**
 * Refresh the variable flyout if it is open.
 * Only used if the flyout's autoClose is false.
 */
Blockly.Variables.refreshFlyoutCategory = function() {
  if (Blockly.Toolbox && Blockly.Toolbox.flyout_.isVisible() &&
      Blockly.Toolbox.selectedOption_.cat == Blockly.MSG_VARIABLE_CATEGORY) {
    Blockly.Toolbox.flyout_.hide();
    Blockly.Toolbox.flyout_.show(Blockly.MSG_VARIABLE_CATEGORY);
  }
};
/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class for a workspace.
 * @param {boolean} editable Is this workspace freely interactive?
 * @constructor
 */
Blockly.Workspace = function(editable) {
  this.editable = editable;
  this.topBlocks_ = [];
  this.wiring = [];
  Blockly.ConnectionDB.init(this);
};

Blockly.Workspace.prototype.dragMode = false;

// Add properties to control the current scrolling offset.
Blockly.Workspace.prototype.scrollX = 0;
Blockly.Workspace.prototype.scrollY = 0;

Blockly.Workspace.prototype.trashcan = null;

/**
 * Create the trash can elements.
 * @return {!Element} The trash can's SVG group.
 */
Blockly.Workspace.prototype.createDom = function() {
  /*
  <g>
    [Trashcan may go here]
    <g></g>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
  return this.svgGroup_;
};

/**
 * Add a trashcan.
 * @param {!Function} getMetrics A function that returns workspace's metrics.
 */
Blockly.Workspace.prototype.addTrashcan = function(getMetrics) {
  if (Blockly.Trashcan && this.editable) {
    this.trashcan = new Blockly.Trashcan(getMetrics);
    var svgTrashcan = this.trashcan.createDom();
    this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
    this.trashcan.init();
  }
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.Workspace.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  var found = false;
  for (var child, x = 0; child = this.topBlocks_[x]; x++) {
    if (child == block) {
      this.topBlocks_.splice(x, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.Workspace.prototype.getTopBlocks = function(ordered) {
  // Copy the topBlocks_ list.
  var blocks = [].concat(this.topBlocks_);
  if (ordered && blocks.length > 1) {
    blocks.sort(function(a, b)
        {return a.getRelativeToSurfaceXY().y - b.getRelativeToSurfaceXY().y;});
  }
  return blocks;
};

/**
 * Find all blocks in workspace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for (var x = 0; x < blocks.length; x++) {
    blocks = blocks.concat(blocks[x].getChildren());
  }
  return blocks;
};

/**
 * Destroy all blocks in workspace.
 */
Blockly.Workspace.prototype.clear = function() {
  Blockly.hideChaff();
  while (this.topBlocks_.length) {
    this.topBlocks_[0].destroy();
  }
};

/**
 * Render all blocks in workspace.
 */
Blockly.Workspace.prototype.render = function() {
  var renderList = this.getAllBlocks();
  for (var x = 0, block; block = renderList[x]; x++) {
    if (!block.getChildren().length) {
      block.render();
    }
  }
};

/**
 * Finds the block with the specified ID in this workspace.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The matching block, or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  // If this O(n) function fails to scale well, maintain a hash table of IDs.
  var blocks = this.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    if (block.id == id) {
      return block;
    }
  }
  return null;
};

/**
 * Turn the visual trace functionality on or off.
 * @param {boolean} armed True if the trace should be on.
 */
Blockly.Workspace.prototype.traceOn = function(armed) {
  this.traceOn_ = armed;
  if (this.traceWrapper_) {
    Blockly.unbindEvent_(this.svgBlockCanvas_, 'blocklySelectChange',
                         this.traceWrapper_);
    this.traceWrapper_ = null;
  }
  if (armed) {
    this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_,
        'blocklySelectChange', this, function() {this.traceOn_ = false});
  }
};

/**
 * Highlight a block in the workspace.
 * @param {string} id ID of block to find.
 */
Blockly.Workspace.prototype.highlightBlock = function(id) {
  if (!this.traceOn_) {
    return;
  }
  var block = this.getBlockById(id);
  if (!block) {
    return;
  }
  // Temporary turn off the listener for selection changes, so that we don't
  // trip the monitor for detecting user activity.
  this.traceOn(false);
  // Select the curent block.
  block.select();
  // Restore the monitor for user activity.
  this.traceOn(true);
};

Blockly.Workspace.prototype.getWiring = function()
{
  return this.wiring;
}/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview XML reader and writer.
 * @author fraser@google.com (Neil Fraser)
 */

Blockly.Xml = {};

/**
 * Encode a block tree as XML.
 * @param {!Object} blockGroup The SVG workspace.
 * @return {!Element} XML document.
 */
Blockly.Xml.workspaceToDom = function(blockGroup) {
  var xml = document.createElement('xml');
  var blocks = blockGroup.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var element = Blockly.Xml.blockToDom_(block);
    var xy = block.getRelativeToSurfaceXY();
    element.setAttribute('x', Blockly.RTL ? -xy.x : xy.x);
    element.setAttribute('y', xy.y);
    xml.appendChild(element);
  }
  var wiring = document.createElement('wiring');
  for(x in blockGroup.wiring){
    if(blockGroup.wiring[x]){
      var connection = document.createElement('connection');
      connection.setAttribute('pin', x);
      connection.setAttribute('type', blockGroup.wiring[x].type);
      connection.setAttribute('name', blockGroup.wiring[x].name);
      wiring.appendChild(connection);
    }
  }
  xml.appendChild(wiring);
  return xml;
};

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @return {!Element} Tree of XML elements.
 * @private
 */
Blockly.Xml.blockToDom_ = function(block) {
  var element = document.createElement('block');
  element.setAttribute('type', block.type);
  if (block.mutationToDom) {
    // Custom data for an advanced block.
    var mutation = block.mutationToDom();
    if (mutation) {
      element.appendChild(mutation);
    }
  }
  for (var i = 0, title; title = block.titleRow[i]; i++) {
    if (title.name && title.EDITABLE) {
      var container = document.createElement('title');
      container.setAttribute('name', title.name);
      var titleText = document.createTextNode(title.getValue());
      container.appendChild(titleText);
      element.appendChild(container);
    }
  }

  if (block.comment) {
    var commentElement = document.createElement('comment');
    var commentText = document.createTextNode(block.comment.getText());
    commentElement.appendChild(commentText);
    commentElement.setAttribute('pinned', block.comment.isPinned());
    var xy = block.comment.getBubbleLocation();
    commentElement.setAttribute('x', xy.x);
    commentElement.setAttribute('y', xy.y);
    var hw = block.comment.getBubbleSize();
    commentElement.setAttribute('h', hw.height);
    commentElement.setAttribute('w', hw.width);
    element.appendChild(commentElement);
  }

  var hasValues = false;
  for (var i = 0, input; input = block.inputList[i]; i++) {
    var container;
    var empty = true;
    if (input.type == Blockly.LOCAL_VARIABLE) {
      container = document.createElement('variable');
      container.setAttribute('data', input.getText());
      empty = false;
    } else {
      var childBlock = input.targetBlock();
      if (input.type == Blockly.INPUT_VALUE) {
        container = document.createElement('value');
        hasValues = true;
      } else if (input.type == Blockly.NEXT_STATEMENT) {
        container = document.createElement('statement');
      }
      if (childBlock) {
        container.appendChild(Blockly.Xml.blockToDom_(childBlock));
        empty = false;
      }
    }
    container.setAttribute('name', input.name);
    if (input.label && input.label.EDITABLE && input.label.getValue) {
      container.setAttribute('label', input.label.getValue());
      empty = false;
    }
    if (!empty) {
      element.appendChild(container);
    }
  }
  if (hasValues) {
    element.setAttribute('inline', block.inputsInline);
  }
  if (block.collapsed) {
    element.setAttribute('collapsed', true);
  }

  if (block.nextConnection) {
    var nextBlock = block.nextConnection.targetBlock();
    if (nextBlock) {
      var container = document.createElement('next');
      container.appendChild(Blockly.Xml.blockToDom_(nextBlock));
      element.appendChild(container);
    }
  }

  return element;
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToText = function(dom) {
  var oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
};

/**
 * Converts a DOM structure into properly indented text.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToPrettyText = function(dom) {
  // This function is not guaranteed to be correct for all XML.
  // But it handles the XML that Blockly generates.
  var line = Blockly.Xml.domToText(dom);
  // Add place every open and close tag on its own line.
  var lines = line.split('<');
  // Indent every line.
  var indent = '';
  for (var x = 1; x < lines.length; x++) {
    var nextChar = lines[x][0];
    if (nextChar == '/') {
      indent = indent.substring(2);
    }
    lines[x] = indent + '<' + lines[x];
    if (nextChar != '/') {
      indent += '  ';
    }
  }
  // Pull simple tags back together.
  // E.g. <foo></foo>
  var text = lines.join('\n');
  text = text.replace(/(<(\w+)[^>]*>[^\n]*)\n *<\/\2>/g, '$1</$2>');
  // Trim leading blank line.
  return text.replace(/^\n/, '');
};

/**
 * Converts plain text into a DOM structure.
 * Throws an error if XML doesn't parse.
 * @param {string} text Text representation.
 * @return {!Element} A tree of XML elements.
 */
Blockly.Xml.textToDom = function(text) {
  var oParser = new DOMParser();
  var dom = oParser.parseFromString(text, 'text/xml');
  // The DOM should have one and only one top-level node, an XML tag.
  if (!dom || !dom.firstChild || dom.firstChild.tagName != 'xml' ||
      dom.firstChild !== dom.lastChild) {
    // Whatever we got back from the parser is not XML.
    throw 'Blockly.Xml.textToDom did not obtain a valid XML tree.';
  }
  return dom.firstChild;
};

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @param {!Object} blockGroup The SVG workspace.
 * @param {!Element} xml XML DOM.
 */
Blockly.Xml.domToWorkspace = function(blockGroup, xml) {
  for (var x = 0, xmlChild; xmlChild = xml.childNodes[x]; x++) {
    if (xmlChild.nodeName && xmlChild.nodeName.toLowerCase() == 'wiring') {
      for(var n = xmlChild.firstChild; n; n = n.nextSibling)
      {
        if(n.nodeName == 'connection'){
          blockGroup.wiring[parseInt(n.getAttribute('pin'))] = {
            name: n.getAttribute('name'),
            type: n.getAttribute('type')
          };
        }
      }
    }
  }
  for (var x = 0, xmlChild; xmlChild = xml.childNodes[x]; x++) {
    if (xmlChild.nodeName && xmlChild.nodeName.toLowerCase() == 'block') {
      var block = Blockly.Xml.domToBlock_(blockGroup, xmlChild);
      var blockX = parseInt(xmlChild.getAttribute('x'), 10);
      var blockY = parseInt(xmlChild.getAttribute('y'), 10);
      if (!isNaN(blockX) && !isNaN(blockY)) {
        block.moveBy(Blockly.RTL ? -blockX : blockX, blockY);
      }
    }
  }
};

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Object} blockGroup The SVG workspace.
 * @param {!Element} xmlBlock XML block element.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
Blockly.Xml.domToBlock_ = function(blockGroup, xmlBlock) {
  var prototypeName = xmlBlock.getAttribute('type');
  var block = new Blockly.Block(blockGroup, prototypeName);
  block.initSvg();

  var inline = xmlBlock.getAttribute('inline');
  if (inline) {
    block.setInputsInline(inline == 'true');
  }

  var collapsed = xmlBlock.getAttribute('collapsed');
  if (collapsed) {
    block.setCollapsed(collapsed == 'true');
  }

  for (var x = 0, xmlChild; xmlChild = xmlBlock.childNodes[x]; x++) {
    if (xmlChild.nodeType == 3 && xmlChild.data.match(/^\s*$/)) {
      // Extra whitespace between tags does not concern us.
      continue;
    }
    var blockChild = null;
    var input;

    // Find the first 'real' grandchild node (that isn't whitespace).
    var firstRealGrandchild = null;
    for (var y = 0, grandchildNode; grandchildNode = xmlChild.childNodes[y]; y++) {
      if (grandchildNode.nodeType != 3 || !grandchildNode.data.match(/^\s*$/)) {
        firstRealGrandchild = grandchildNode;
      }
    }

    var name = xmlChild.getAttribute('name');
    switch (xmlChild.tagName.toLowerCase()) {
      case 'mutation':
        // Custom data for an advanced block.
        if (block.domToMutation) {
          block.domToMutation(xmlChild);
        }
        break;
      case 'comment':
        block.setCommentText(xmlChild.textContent);
        var pinned = xmlChild.getAttribute('pinned');
        if (pinned) {
          block.comment.setPinned(pinned == 'true');
        }
        var bubbleX = parseInt(xmlChild.getAttribute('x'), 10);
        var bubbleY = parseInt(xmlChild.getAttribute('y'), 10);
        if (!isNaN(bubbleX) && !isNaN(bubbleY)) {
          block.comment.setBubbleLocation(bubbleX, bubbleY, false);
        }
        var bubbleW = parseInt(xmlChild.getAttribute('w'), 10);
        var bubbleH = parseInt(xmlChild.getAttribute('h'), 10);
        if (!isNaN(bubbleW) && !isNaN(bubbleH)) {
          block.comment.setBubbleSize(bubbleW, bubbleH);
        }
        break;
      case 'title':
        block.setTitleValue(xmlChild.textContent, name);
        break;
      case 'variable':
        var data = xmlChild.getAttribute('data');
        if (data !== null) {
          input = block.getInput(name);
          if (!input) {
            throw 'Variable input does not exist.';
          }
          input.setText(data);
        }
        break;
      case 'value':
      case 'statement':
        input = block.getInput(name);
        if (!input) {
          throw 'Input does not exist.';
        }
        if (firstRealGrandchild && firstRealGrandchild.tagName &&
            firstRealGrandchild.tagName.toLowerCase() == 'block') {
          blockChild = Blockly.Xml.domToBlock_(blockGroup, firstRealGrandchild);
          if (blockChild.outputConnection) {
            input.connect(blockChild.outputConnection);
          } else if (blockChild.previousConnection) {
            input.connect(blockChild.previousConnection);
          } else {
            throw 'Child block does not have output or previous statement.';
          }
        }
        break;
      case 'next':
        if (firstRealGrandchild && firstRealGrandchild.tagName &&
            firstRealGrandchild.tagName.toLowerCase() == 'block') {
          if (!block.nextConnection) {
            throw 'Next statement does not exist.';
          } else if (block.nextConnection.targetConnection) {
            // This could happen if there is more than one XML 'next' tag.
            throw 'Next statement is already connected.';
          }
          blockChild = Blockly.Xml.domToBlock_(blockGroup, firstRealGrandchild);
          if (!blockChild.previousConnection) {
            throw 'Next block does not have previous statement.';
          }
          block.nextConnection.connect(blockChild.previousConnection);
        }
        break;
      default:
        // Unknown tag; ignore.  Same principle as HTML parsers.
    }
    var labelText = xmlChild.getAttribute('label');
    if (labelText !== null && input && input.label && input.label.setText) {
      input.label.setValue(labelText);
    }
  }
  block.render();
  return block;
};

/**
 * Find the first 'real' child of a node, skipping whitespace text nodes.
 * Return true if that child is of the the specified type (case insensitive).
 * @param {!Node} parentNode The parent node.
 * @param {string} tagName The node type to check for.
 * @return {boolean} True if the first real child is the specified type.
 * @private
 */
Blockly.Xml.isFirstRealChild_ = function(parentNode, tagName) {
  for (var x = 0, childNode; childNode = parentNode.childNodes[x]; x++) {
    if (childNode.nodeType != 3 || !childNode.data.match(/^\s*$/)) {
      return childNode.tagName && childNode.tagName.toLowerCase() == tagName;
    }
  }
  return false;
};
