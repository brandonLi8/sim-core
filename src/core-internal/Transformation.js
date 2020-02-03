// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A standard affine transformation Matrix, for identifying 2D CSS transformations.
 * Supports a conversion to pixels given the ScreenView scale. See `SCENERY/Node` and `SCENERY/ScreenView` for details.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix for context.
 *
 * Generally, there are 3 main transformations:
  * ## Translation:
 *  Translation is a shift in position of the element, relative to the original or original position. It is given in
 *  scenery coordinates (see `SCENERY/Node`), and is represented as a Vector <xTranslation, yTranslation>.
 *
 * ### Scaling:
 *  Scaling works by multiplying the original or original width and height by a scalar value. It can be represented as a
 *  single scale factor or as a vector <xScale, yScale>. Scale factors can by any number, including negatives and
 *  decimals. Negative scaling has the the effect of flipping the element about the respective axis.
 *
 * ### Rotation:
 *  Rotation is a turning about the center of the element. Positive rotations are clockwise and negative rotations are
 *  counter-clockwise. Rotations are in radians.
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
     * Constructs the Transformation with no transformations. Assumes the configuration:
     *  - translation: Vector.ZERO
     *  - rotation: 0
     *  - scale: 1
     *
     * Use the mutators below this method to start transformations.
     */
    constructor() {

      // @private {Vector} - the translation, relative to the ORIGNAL position, as <xTranslation, yTranslation>.
      this._translation = Vector.ZERO.copy();

      // @private {Vector} - the scalar, relative to the ORIGNAL scale, as <xScale, yScale>.
      this._scalar = new Vector( 1, 1 );

      // @private {number} - the rotation of the transformation, relative to the ORIGNAL rotation, in radians.
      this._rotation = 0;
    }

    /**
     * ES5 getters of properties of this Transformation. Traditional Accessors methods aren't included to reduce
     * the memory footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get translation() { return this._translation; }
    get scalar() { return this._scalar; }
    get rotation() { return this._rotation; }

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    /**
     * Translates, relative to the **CURRENT** translation, without mutating the passed in translation.
     * @public
     *
     * @param {Vector} translation - the translation amount, given as <xTranslation, yTranslation>.
     */
    translate( translation ) { this._translation.add( translation ); }

    /**
     * Sets the translation, relative to the **ORIGNAL** position, without mutating the passed in translation.
     * @public
     *
     * @param {Vector} translation - the translation, given as <xTranslation, yTranslation>.
     */
    set translation( translation ) { this._translation.set( translation ); }

    /**
     * Scales, relative to the **CURRENT** scale, as either a single scalar or as <xScale, yScale>
     * @public
     *
     * @param {Vector|number} scale - given as either a single scalar or as <xScale, yScale>
     */
    scale( scale ) { scale instanceof Vector ? this._scale.componentMultiply( scale ) : this._scale.multiply( scale ); }

    /**
     * Sets the scale, relative to the **ORIGINAl** scale, as either a single scalar or as <xScale, yScale>
     * @public
     *
     * @param {Vector|number} s - given as either a single scalar or as <xScale, yScale>
     */
    set scalar( s ) { s instanceof Vector ? this._scale.set( s ) : this._scale.setX( s ).setY( s ); }

    /**
     * Rotates, relative to the **CURRENT** rotation, in radians.
     * @public
     *
     * @param {number} rotation - rotation, in radians
     */
    rotate( rotation ) { this._rotation += rotation; }

    /**
     * Sets the rotation, relative to the **ORIGINAL** rotation, in radians.
     * @public
     *
     * @param {number} rotation - rotation, in radians
     */
    set rotatation( rotation ) { this._rotation = rotation; }

    /**
     * Gets the CSS style transform string.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix and
     * http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility.
     *
     * Will prevent numbers from being over 10 decimal places. 10 is the largest guaranteed number of digits
     * according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
     * @public
     *
     * @param {number} screenViewScale - screenViewScale in terms of window pixels per Scenery coordinates.
     */
    getCSSTransform( screenViewScale ) {

      // Compute the transformation matrix values. // NOTE: the toFixed calls are inlined for performance reasons.
      const scaleX = ( Math.cos( this.rotation ) * this.scale.x ).toFixed( 10 );
      const scaleY = ( Math.cos( this.rotation ) * this.scale.y ).toFixed( 10 );
      const skewX = ( -1 * Math.sin( this.rotation ) * this.scale.x ).toFixed( 10 );
      const skewY = ( Math.sin( this.rotation ) * this.scale.y ).toFixed( 10 );
      const translateX = ( this.translation.x * screenViewScale ).toFixed( 10 );
      const translateY = ( this.translation.y * screenViewScale ).toFixed( 10 );

      return `matrix(${ scaleX },${ skewY },${ skewX },${ scaleY },${ translateX },${ translateY })`;
    }
  }

  return Transformation;
} );