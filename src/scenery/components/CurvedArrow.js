// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * CurvedArrow is a Arrow sub-type that displays a single-headed pointy curved arrow shape in a circular arc, with
 * different radii, start angles, end angles, and directions.
 *
 * Since CurvedArrow is a Arrow sub-type, you can still change the head widths, tail widths, etc.
 *
 * Contains methods to change the start and end angle and the radius.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Arrow = require( 'SIM_CORE/scenery/Arrow' );
  const assert = require( 'SIM_CORE/util/assert' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const V = ( x, y ) => Vector.scratch.setXY( x, y ); // convenience function to return the scratch Vector with <x, y>

  class CurvedArrow extends Arrow {

    /**
     * @param {Vector} arcCenter
     * @param {number} radius - the radius of curved arrow.
     * @param {number} startAngle - the start angle of the curved arrow.
     * @param {number} endAngle - the end angle of the curved arrow.
     * @param {Object} [options]
     */
    constructor( arcCenter, radius, startAngle, endAngle, options ) {
      assert( arcCenter instanceof Vector, `invalid arcCenter: ${ arcCenter }` );
      assert( typeof radius === 'number' && radius > 0, `invalid radius: ${ radius }` );
      assert( typeof startAngle === 'number', `invalid startAngle: ${ startAngle }` );
      assert( typeof endAngle === 'number', `invalid endAngle: ${ endAngle }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        headHeight: 8,        // {number} - the head-height of the curved arrow.
        headWidth: 11,        // {number} - the head-width of the curved arrow.
        tailWidth: 1.2,       // {number} - the tail-width of the curved arrow.
        fill: 'black',        // {string} - the fill of the curved arrow.
        clockwise: false,     // {boolean} - indicates if the arrow is in clockwise direction
        adjustEndAngle: true, // {boolean} - indicates if the end angle should be adjusted to include the head or not
        ...options
      };
      super( 0, 0, 0, 0, options );

      // @private {number} - see options declaration for documentation. Contains getters and setters. Set to what was
      //                     provided as they were set in the mutate() call in Path's constructor.
      this._clockwise = options.clockwise;

      // @private {number} - reference the passed in parameters
      this._radius = radius;
      this._startAngle = startAngle;
      this._endAngle = endAngle;
      this._arcCenter = arcCenter.copy();
      this._adjustEndAngle = options.adjustEndAngle;
      this._updateArrowShape();
    }

    /**
     * ES5 getters of properties specific to CurvedArrow. Traditional Accessors methods aren't included to reduce the
     * memory footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get startAngle() { return this._startAngle; }
    get endAngle() { return this._endAngle; }
    get radius() { return this._radius; }
    get arcCenter() { return this._arcCenter; }

    /**
     * @override
     * Ensure that inappropriate super-class setters and getters are not invoked.
     */
    set tail( tail ) { assert( false, 'arrow sets tail' ); }
    set tip( tip ) { assert( false, 'arrow sets tip' ); }
    set tailX( tailX ) { assert( false, 'arrow sets tailX' ); }
    set tailY( tailY ) { assert( false, 'arrow sets tailY' ); }
    set tipX( tipX ) { assert( false, 'arrow sets tipX' ); }
    set tipY( tipY ) { assert( false, 'arrow sets tipY' ); }
    get tail() { return assert( false, 'tail not a property of CurvedArrow' ); }
    get tip() { return assert( false, 'tip not a property of CurvedArrow' ); }

    /**
     * Sets the startAngle of the Curved Arrow.
     * @public
     *
     * @param {Vector} startAngle
     */
    set startAngle( startAngle ) {
      if ( startAngle === this._startAngle ) return; // Exit if setting to the same 'startAngle'
      assert( typeof startAngle === 'number', `invalid startAngle: ${ startAngle }` );
      this._startAngle = startAngle;
      this._updateArrowShape();
    }

    /**
     * Sets the endAngle coordinate of the Curved Arrow.
     * @public
     *
     * @param {Vector} endAngle
     */
    set endAngle( endAngle ) {
      if ( endAngle === this._endAngle ) return; // Exit if setting to the same 'endAngle'
      assert( typeof endAngle === 'number', `invalid endAngle: ${ endAngle }` );
      this._endAngle = endAngle;
      this._updateArrowShape();
    }

    /**
     * Sets the radius coordinate of the Curved Arrow.
     * @public
     *
     * @param {Vector} radius
     */
    set radius( radius ) {
      if ( radius === this._radius ) return; // Exit if setting to the same 'radius'
      assert( typeof radius === 'number', `invalid radius: ${ radius }` );
      this._radius = radius;
      this._updateArrowShape();
    }

    /**
     * @override
     * Generates a Arrow shape and updates the shape of this Arrow. Called when a property or the Arrow that is
     * displayed is changed, resulting in a different Arrow Shape.
     * @private
     */
    _updateArrowShape() {

      // Must be a valid CurvedArrow
      if ( isFinite( this._radius ) && isFinite( this._startAngle ) && isFinite( this._endAngle ) ) {
        if ( Util.equalsEpsilon( this._startAngle, this._endAngle ) ) {
          // If the start and end angle are the same, exit.
          return Object.getOwnPropertyDescriptor( Path.prototype, 'shape' ).set.call( this, null );
        }

        assert( this.headWidth > this.tailWidth, 'tailWidth must be smaller than the headWidth' );
        assert( this._radius > this.headWidth / 2, 'radius smaller than half of the headWidth' );

        const innerRadius = this._radius - this.tailWidth / 2;
        const outerRadius = this._radius + this.tailWidth / 2;

        // Make sure that head height is less than half the arc length.
        const arcLength = this._radius * Math.abs( this.endAngle - this.startAngle );
        const headHeight = Math.min( this._headHeight, 0.5 * arcLength );

        // The arrowhead subtended angle is defined as the angle between the vector from the center to the tip of the
        // arrow and the vector of the center to first point the arc and the triangle intersect
        const arrowheadSubtendedAngle = Math.asin( headHeight / this.radius );

        // The corrected angle is the angle that is between the vector that goes from the center to the first point the
        // arc and the triangle intersect and the vector along the baseline (x-axis). This is used instead to create a
        // more accurate angle excluding the size of the triangle.
        const endAngle = this._adjustEndAngle ? ( this._clockwise ?
                                                  this.endAngle + arrowheadSubtendedAngle :
                                                  this.endAngle - arrowheadSubtendedAngle ) : this._endAngle;


        // Find and reference the tip location of the arrow head.
        const arrowHeadTip = new Vector( 0, this.radius ).setAngle( -endAngle ).add( this.arcCenter ).add( V( 0, 1 )
            .setAngle( -endAngle + ( this._clockwise ? Math.PI / 2 : -Math.PI / 2 ) ).multiply( headHeight ) );

        // Set the shape attribute of the Grandparent class (which is Path). See
        // https://stackoverflow.com/questions/55228720/how-to-call-setter-of-grandparent-class-in-javascript
        Object.getOwnPropertyDescriptor( Path.prototype, 'shape' ).set.call( this, new Shape()
          .arc( this.arcCenter, outerRadius, -endAngle, -this.startAngle, this._clockwise )
          .lineToPoint( V( 0, innerRadius ).setAngle( -this.startAngle ).add( this.arcCenter ) )
          .arc( this.arcCenter, innerRadius, -this.startAngle, -endAngle, !this._clockwise )
          .lineToPoint( V( 0, this.radius - this.headWidth / 2 ).setAngle( -endAngle ).add( this.arcCenter ) )
          .lineToPoint( arrowHeadTip )
          .lineToPoint( V( 0, this.radius + this.headWidth / 2 ).setAngle( -endAngle ).add( this.arcCenter ) )
          .close()
        );
      }
    }
  }

  return CurvedArrow;
} );