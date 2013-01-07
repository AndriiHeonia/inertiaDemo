goog.require('goog.debug.Console');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
goog.require('ol.Collection');
goog.require('ol.Coordinate');
goog.require('ol.Map');
goog.require('ol.source.OpenStreetMap');
goog.require('ol.interaction.DragPan');
goog.require('ol.interaction.DragPanInertia');

if (goog.DEBUG) {
  goog.debug.Console.autoInstall();
  goog.debug.Logger.getLogger('ol').setLevel(goog.debug.Logger.Level.INFO);
}


var layer = new ol.layer.TileLayer({
  source: new ol.source.OpenStreetMap()
});
var map = new ol.Map({
  center: new ol.Coordinate(2, 57),
  layers: new ol.Collection([layer]),
  target: 'map',
  zoom: 5
});

goog.mixin(ol.interaction.DragPanInertia, ol.interaction.DragPan);