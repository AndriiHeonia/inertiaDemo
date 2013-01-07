goog.provide('ol.interaction.DragPanInertia');

goog.require('ol.interaction.DragPan');
goog.require('ol.util.anim');


/**
 * @constructor
 * @extends {ol.interaction.DragPan}
 * @param {ol.interaction.ConditionType} condition Condition.
 */
ol.interaction.DragPanInertia = function(condition) {

  goog.base(this, condition);

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

  this._map = mapBrowserEvent.map;
  this.inertiaMove();

};

/**
 * Inertia after drag end
 */
ol.interaction.DragPanInertia.prototype.inertiaMove = function() {
    var self = this;
    var curCenter = this._map.getCenter();
    var newCenter = new ol.Coordinate(
      curCenter.x - this._impulse.x,
      curCenter.y + this._impulse.y
    );

    this._map.setCenter(newCenter);
  
    // decrease impulse
    this._impulse.x /= ol.interaction.DragPanInertia.SLOWING_SPEED;
    this._impulse.y /= ol.interaction.DragPanInertia.SLOWING_SPEED;

    // if impulse isn't too small - move
    if (!(Math.abs(this._impulse.x) <= ol.interaction.DragPanInertia.STOP_IMPULSE &&
          Math.abs(this._impulse.y) <= ol.interaction.DragPanInertia.STOP_IMPULSE)) {

      ol.util.anim.requestAnimFrame(function() {
        self.inertiaMove.call(self);
      });
    
    }
};

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.MASS = 20000;

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.SLOWING_SPEED = 1.06;

/**
 * @const {number}
 */
ol.interaction.DragPanInertia.STOP_IMPULSE = 500;