// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A 3 by 2 transformation Matrix, for identifying 2D CSS transformations. Supports a conversion to pixels given the
 * ScreenView scalings.
 *
 * There are 3 main transformations that are supported:
 * ### Scaling:
 *  Scaling works by multiplying the current width and height by a scalar value. There are generally 2 scalar values:
 *  one for x-scaling and one for y-scaling. Scale factors can by any number, including negatives and decimals.
 *  Negative scaling has the the effect of flipping the element about the respective axis. See setScale() for more doc.
 *
 * ### Rotation:
 *  Rotation is the amount of rotation of the element. Positive rotations are clockwise and negative rotations are
 *  counter-clockwise. Rotation are in radians. See setRotation() for more information.
 *
 * ## Translation:
 *  Translation is a shift in position of the element, relative to the original position. It is given in
 *  scenery coordinates (see Node.js for more information), and is represented in a Vector (x, y). See setTranslation()
 *  for more documentation.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix for context.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Transformation {

    /**
     * @param {Vector} scale - scaling of the transformation, given as <xScale, yScale>.
     * @param {number} rotation - the rotation of the transformation, given in radians.
     * @param {Vector} translation - the the translation of the translation, given as <xTranslation, yTranslation>.
     */
    constructor( scale, rotation, translation ) {
      assert( scale instanceof Vector, `invalid scale: ${ scale }` );
      assert( typeof rotation === 'number', `invalid rotation: ${ rotation }` );
      assert( translation instanceof Vector, `invalid translation: ${ translation }` );

      // @private {Vector} - see the argument documentation.
      this._translation = translation.copy();
      this._scale = scale.copy();

      // @public {number} - the rotation of the transformation. Can by publicly mutated.
      this.rotation = rotation;
    }

    /**
     * Setters the scale of the Transformation, without mutating the passed in scale.
     * @public
     *
     * @param {Vector} scale - scaling of the transformation, given as <xScale, yScale>.
     */
    set scale( scale ) { this._scale.set( scale ); }

    /**
     * Gets the scale of the Transformation.
     * @public
     *
     * @returns {Vector} - scaling of the transformation, given as <xScale, yScale>.
     */
    get scale() { return this._scale; }

    /**
     * Setters the translation of the Transformation, without mutating the passed in translation.
     * @public
     *
     * @param {Vector} translation - scaling of the transformation, given as <xTranslation, yTranslation>.
     */
    set translation( translation ) { this._translation.set( translation ); }

    /**
     * Gets the translation of the Transformation.
     * @public
     *
     * @returns {Vector} - scaling of the transformation, given as <xTranslation, yTranslation>.
     */
    get translation() { return this._translation; }

    /**
     * Gets the CSS style transform string.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix and
     * http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility.
     *
     * Will prevent numbers from being over 10 decimal places. 10 is the largest guaranteed number of digits
     * according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
     * @public
     *
     * @param {number} screenViewScale - screenViewScale in terms of global units per local unit for converting Scenery
     *                                   coordinates to pixels.
     */
    getCSSTransform( screenViewScale ) {

      // Compute the transformation matrix values. // NOTE: the toFixed calls are inlined for performance reasons.
      const scaleX = ( Math.cos( this.rotation ) * this.scale.x ).toFixed( 10 );
      const scaleY = ( Math.cos( this.rotation ) * this.scale.y ).toFixed( 10 );
      const skewX = ( -1 * Math.sin( this.rotation ) * this.scale.x ).toFixed( 10 );
      const skewY = ( Math.sin( this.rotation ) * this.scale.y ).toFixed( 10 );
      const translateX = ( this.translate.x * screenViewScale ).toFixed( 10 );
      const translateY = ( this.translate.y * screenViewScale ).toFixed( 10 );

      return `matrix(${ scaleX },${ skewY },${ skewX },${ scaleY },${ translateX },${ translateY })`;
    }
  }

  return Transformation;
}