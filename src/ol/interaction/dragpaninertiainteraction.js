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
    x2: 0, y2: 0
  };
  this._vector2 = {
    x1: 0, y1: 0,
    x2: 0, y2: 0
  };

  var self = this;
  var map = mapBrowserEvent.map;

  var inertiaMove = function() {

    var newCenter = new ol.Coordinate(
      map.getCenter().x - self._impulse.x,
      map.getCenter().y + self._impulse.y
    );
    map.setCenter(newCenter);
    window.requestAnimFrame(inertiaMove);

  };

  inertiaMove();
};

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.MASS = 180000;

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.SLOWING_SPEED = 1.2;