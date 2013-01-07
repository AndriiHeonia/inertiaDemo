goog.provide('ol.util.anim');


/**
 * @constructor
 */
ol.util.anim = function() {
};


/**
 * Request animation frame shim with setTimeout fallback.
 * @param {function} callback
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
ol.util.anim.requestAnimFrame = (function() {
    var requestFn = 
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    return function (callback) {
        requestFn(callback);
    };
})();