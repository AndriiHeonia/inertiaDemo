goog.provide('ol.interaction.DragPanInertia');

goog.require('ol.interaction.DragPan');


/**
 * @constructor
 * @extends {ol.interaction.DragPan}
 * @param {ol.interaction.ConditionType} condition Condition.
 */
ol.interaction.DragPanInertia = function(condition) {
  goog.base(this, condition);

  // requestAnimationFrame shim with setTimeout fallback
  window.requestAnimFrame =
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
};

goog.inherits(ol.interaction.DragPanInertia, ol.interaction.DragPan);

/**
 * @inheritDoc
 */
ol.interaction.DragPanInertia.prototype.handleDragStart = function(mapBrowserEvent) {
    ol.interaction.DragPan.prototype.handleDragStart.call(this, mapBrowserEvent);
    this._dragStartTime = new Date();
    return true;
};

/**
 * @inheritDoc
 */
ol.interaction.DragPanInertia.prototype.handleDragEnd = function(mapBrowserEvent) {
  this._dragDuration = new Date() - this._dragStartTime;
  this._dragSpeed = {
    x: this.deltaX / this._dragDuration,
    y: this.deltaY / this._dragDuration
  };
  this._impulse = {
    x: ol.interaction.DragPanInertia.MASS * this._dragSpeed.x,
    y: ol.interaction.DragPanInertia.MASS * this._dragSpeed.y
  };
  this._vector1 = {
    x1: 0, y1: 0,
    x2: 0, y2: 0,
    a: 0, b: 0
  };
  this._vector2 = {
    x1: 0, y1: 0,
    x2: 0, y2: 0,
    a: 0, b: 0
  };

  var self = this;
  var map = mapBrowserEvent.map;

  var inertiaMove = function() {

    var isStopNextFrame = false;

    // vector 1 start
    self._vector1.x1 = map.getCenter().x;
    self._vector1.y1 = map.getCenter().y;

    var newCenter = new ol.Coordinate(
      map.getCenter().x - self._impulse.x,
      map.getCenter().y + self._impulse.y
    );

    map.setCenter(newCenter);

    // vector 1 end, vector 2 start
    self._vector1.x2 = self._vector2.x1 = newCenter.x;
    self._vector1.y2 = self._vector2.y1 = newCenter.y;
  
    // decrease impulse
    self._impulse.x /= ol.interaction.DragPanInertia.SLOWING_SPEED;
    self._impulse.y /= ol.interaction.DragPanInertia.SLOWING_SPEED;

    // vector 2 end
    self._vector2.x2 = newCenter.x - self._impulse.x;
    self._vector2.y2 = newCenter.y + self._impulse.y;

    // vector 1 a and b, @see http://www.math.by/geometry/eqline.html
    self._vector1.a = self._vector1.y1 - self._vector1.y2;
    self._vector1.b = self._vector1.x2 - self._vector1.x1;

    // vector 2 a and b
    self._vector2.a = self._vector2.y1 - self._vector2.y2;
    self._vector2.b = self._vector2.x2 - self._vector2.x1;

    // if vectors are not parallels, @see http://bit.ly/KmdcJH
    if((self._vector1.a * self._vector2.b - self._vector2.a * self._vector1.b) !== 0) {

      // calculate moving corner, @see http://www.math.by/geometry/anglline.html
      var corner = Math.acos(
        (self._vector1.b * self._vector2.b + self._vector1.a * self._vector2.a) /
        ( Math.sqrt(Math.pow(self._vector1.b, 2) + Math.pow(self._vector1.a, 2)) *
          Math.sqrt(Math.pow(self._vector2.b, 2) + Math.pow(self._vector2.a, 2)) ));
      corner *= (180 / Math.PI);

      // if moving corner changed more than ol.interaction.DragPanInertia.STOP_CORNER,
      // then stop moving
      if(corner >= ol.interaction.DragPanInertia.STOP_CORNER) {
        isStopNextFrame = true;
      }

    }

    if (self._impulse.x <= ol.interaction.DragPanInertia.STOP_IMPULSE &&
        self._impulse.y <= ol.interaction.DragPanInertia.STOP_IMPULSE) {
      isStopNextFrame = true;
    }

    if (isStopNextFrame === false) {
      window.requestAnimFrame(inertiaMove);
    }
  };

  inertiaMove();
};

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.MASS = 300000;

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.SLOWING_SPEED = 1.1;

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.STOP_CORNER = 40;

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.STOP_IMPULSE = 600;
