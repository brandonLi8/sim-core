// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Arrow Node that displays a single-headed pointy arrow shape, with different head widths, tail widths, etc.
 *
 * Arrow inherits from Path to allow for different strokes, fills, shapeRenderings, head-styles, etc.
 *
 * Currently, Arrows are constructed by their tailX, tailY, tipX, tipY.
 * Possible ways of initiating Arrows include:
 *   - new Arrow( tailX, tailY, tipX, tipY, [options] );
 *   - Arrow.withPoints( tail, tip, [options] );
 * See the bottom portion of the file for documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Arrow extends Path {

    /**
     * @param {number} tailX - the x-coordinate of the tail of the arrow
     * @param {number} tailY - the y-coordinate of the tail of the arrow
     * @param {number} tipX - the x-coordinate of the tip of the arrow
     * @param {number} tipY - the y-coordinate of the tip of the arrow
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( tailX, tailY, tipX, tipY, options ) {
      assert( typeof tailX === 'number', `invalid tailX: ${ tailX }` );
      assert( typeof tailY === 'number', `invalid tailY: ${ tailY }` );
      assert( typeof tipX === 'number', `invalid tipX: ${ tipX }` );
      assert( typeof tipY === 'number', `invalid tipY: ${ tipY }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Arrow sets attributes' );

      options = {

        headHeight: 12,      // {number} - the head-height of the Arrow. See `set headHeight()`.
        headWidth: 12,       // {number} - the head-width of the Arrow. See `set headWidth()`.
        tailWidth: 3,        // {number} - the tail-width of the Arrow. See `set tailWidth()`.
        doubleHead: false,   // {boolean} - indicates if there are heads on both sides of the arrow.
        headStyle: 'closed', // {string} - the style of the head. See `set headStyle()` for documentation.

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( null, options );

      // @private {number} - see options declaration for documentation. Contains getters and setters. Set to what was
      //                     provided as they were set in the mutate() call in Path's constructor.
      this._headHeight = options.headHeight;
      this._headWidth = options.headWidth;
      this._tailWidth = options.tailWidth;
      this._doubleHead = options.doubleHead;
      this._headStyle = options.headStyle;

      // @public {Vector} - create references to the coordinates of the tip and the tail of the Arrow.
      this._tail = new Vector( tailX, tailY );
      this._tip = new Vector( tipX, tipY );
      this._updateArrowShape();
    }

    /**
     * ES5 getters of properties specific to Arrow. Traditional Accessors methods aren't included to reduce the memory
     * footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get headHeight() { return this._headHeight; }
    get headWidth() { return this._headWidth; }
    get tailWidth() { return this._tailWidth; }
    get doubleHead() { return this._doubleHead; }
    get headStyle() { return this._headStyle; }
    get tail() { return this._tail; }
    get tip() { return this._tip; }

    //----------------------------------------------------------------------------------------

    /**
     * Ensures that `set shape` is not called on a Arrow.
     * @public
     *
     * @param {Shape} shape
     */
    set shape( shape ) { assert( false, 'Arrow sets shape' ); }

    /**
     * Sets the vertical height of the Arrow head (as a vertical arrow).
     * @public
     *
     * @param {number} headHeight
     */
    set headHeight( headHeight ) {
      if ( headHeight === this._headHeight ) return; // Exit if setting to the same 'headHeight'
      assert( typeof headHeight === 'number', `invalid headHeight: ${ headHeight }` );
      this._headHeight = headHeight;
      this._updateArrowShape();
    }

    /**
     * Sets the horizontal width of the Arrow head (as a vertical arrow).
     * @public
     *
     * @param {number} headWidth
     */
    set headWidth( headWidth ) {
      if ( headWidth === this._headWidth ) return; // Exit if setting to the same 'headWidth'
      assert( typeof headWidth === 'number', `invalid headWidth: ${ headWidth }` );
      this._headWidth = headWidth;
      this._updateArrowShape();
    }

    /**
     * Sets the horizontal width of the Arrow tail (as a vertical arrow).
     * @public
     *
     * @param {number} tailWidth
     */
    set tailWidth( tailWidth ) {
      if ( tailWidth === this._tailWidth ) return; // Exit if setting to the same 'tailWidth'
      assert( typeof tailWidth === 'number', `invalid tailWidth: ${ tailWidth }` );
      this._tailWidth = tailWidth;
      this._updateArrowShape();
    }

    /**
     * Sets the tail coordinate of the Arrow.
     * @public
     *
     * @param {Vector} tail
     */
    set tail( tail ) {
      if ( tail.equals( this._tail ) ) return; // Exit if setting to the same 'tail'
      assert( tail instanceof Vector, `invalid tail: ${ tail }` );
      this._tail.set( tail );
      this._updateArrowShape();
    }

    /**
     * Sets the tip coordinate of the Arrow.
     * @public
     *
     * @param {Vector} tip
     */
    set tip( tip ) {
      if ( tip.equals( this._tip ) ) return; // Exit if setting to the same 'tip'
      assert( tip instanceof Vector, `invalid tip: ${ tip }` );
      this._tip.set( tip );
      this._updateArrowShape();
    }

    /**
     * Sets the tail x-coordinate of the Arrow.
     * @public
     *
     * @param {number} tailX
     */
    set tailX( tailX ) {
      if ( tailX === this.tail.x ) return; // Exit if setting to the same 'tailX'
      assert( typeof tailX === 'number', `invalid tailX: ${ tailX }` );
      this._tail.setX( tailX );
      this._updateArrowShape();
    }

    /**
     * Sets the tail y-coordinate of the Arrow.
     * @public
     *
     * @param {number} tailY
     */
    set tailY( tailY ) {
      if ( tailY === this.tail.x ) return; // Exit if setting to the same 'tailY'
      assert( typeof tailY === 'number', `invalid tailY: ${ tailY }` );
      this._tail.setY( tailY );
      this._updateArrowShape();
    }

    /**
     * Sets the tip x-coordinate of the Arrow.
     * @public
     *
     * @param {number} tipX
     */
    set tipX( tipX ) {
      if ( tipX === this.tip.x ) return; // Exit if setting to the same 'tipX'
      assert( typeof tipX === 'number', `invalid tipX: ${ tipX }` );
      this._tip.setX( tipX );
      this._updateArrowShape();
    }

    /**
     * Sets the tip x-coordinate of the Arrow.
     * @public
     *
     * @param {number} tipY
     */
    set tipY( tipY ) {
      if ( tipY === this.tip.x ) return; // Exit if setting to the same 'tipY'
      assert( typeof tipY === 'number', `invalid tipY: ${ tipY }` );
      this._tip.setY( tipY );
      this._updateArrowShape();
    }

    /**
     * Sets the head style of arrow.
     * @public
     *
     * @param {string} headStyle - Either:
     *                               'closed' -⮀
     *                               'open' —⮁. The line-width of the head will be the same as the tail width.
     */
    set headStyle( headStyle ) {
      if ( headStyle === this._headStyle ) return; // Exit if setting to the same 'headStyle'
      assert( headStyle === 'closed' || headStyle === 'open', `invalid headStyle: ${ headStyle }` );
      this._headStyle = headStyle;
      this._updateArrowShape();
    }

    /**
     * Generates a Arrow shape and updates the shape of this Arrow. Called when a property or the Arrow that is
     * displayed is changed, resulting in a different Arrow Shape.
     * @private
     */
    _updateArrowShape() {
      // Must be a valid Arrow Node.
      if ( this._tail && this._tip && this._headWidth && this._headHeight && this._tailWidth && this._headStyle ) {
        if ( this._tail.equalsEpsilon( this._tip ) ) return ( super.shape = null ); // Exit if same tip and tail.

        // create a vector representation of the arrow
        const vector = this._tip.copy().subtract( this._tail );
        const length = vector.magnitude;

        // Make sure that head height is less than arrow length.
        const headHeight = Math.min( this._headHeight, 0.99 * length );

        // Set up a coordinate frame that goes from the tail of the arrow to the tip.
        const xHatUnit = length ? vector.copy().normalize() : Vector.ZERO;
        const yHatUnit = xHatUnit.copy().rotate( Math.PI / 2 );

        // Generate the Arrow Shape.
        const arrowShape = new Shape();

        // Function to add a point to the shape.
        const addPoint = ( xHat, yHat ) => {
          const x = xHatUnit.x * xHat + yHatUnit.x * yHat + this._tail.x;
          const y = xHatUnit.y * xHat + yHatUnit.y * yHat + this._tail.y;
          if ( !arrowShape.currentPoint ) arrowShape.moveTo( x, y );
          else arrowShape.lineTo( x, y );
        };

        // Draw the arrow shape.
        if ( this._headStyle === 'closed' ) {
          if ( this._doubleHead ) {
            addPoint( 0, 0 );
            addPoint( headHeight, this._headWidth / 2 );
            addPoint( headHeight, this._tailWidth / 2 );
          }
          else addPoint( 0, this._tailWidth / 2 );
          addPoint( length - headHeight, this._tailWidth / 2 );
          addPoint( length - headHeight, this._headWidth / 2 );
          addPoint( length, 0 );
          addPoint( length - headHeight, -this._headWidth / 2 );
          addPoint( length - headHeight, -this._tailWidth / 2 );
          if ( this._doubleHead ) {
            addPoint( headHeight, -this._tailWidth / 2 );
            addPoint( headHeight, -this._headWidth / 2 );
          }
          else addPoint( 0, -this._tailWidth / 2 );
        }
        else {
          const angle = Math.atan( this._headWidth / headHeight );
          const dx = Math.cos( angle ) * this._tailWidth;
          const dy = Math.sin( angle ) * this._tailWidth;
          const lineWidth = headHeight - this._headWidth / 2 / Math.tan( angle ) + dx;
          if ( this._doubleHead ) {
            addPoint( 0, 0 );
            addPoint( headHeight, this._headWidth / 2 );
            addPoint( headHeight + dx, this._headWidth / 2 - dy );
            addPoint( lineWidth, this._tailWidth / 2 );
          }
          else addPoint( 0, this._tailWidth / 2 );
          addPoint( length - lineWidth, this._tailWidth / 2 );
          addPoint( length - headHeight - dx, this._headWidth / 2 - dy );
          addPoint( length - headHeight, this._headWidth / 2 );
          addPoint( length, 0 );
          addPoint( length - headHeight, -this._headWidth / 2 );
          addPoint( length - headHeight - dx, -this._headWidth / 2 + dy );
          addPoint( length - lineWidth, -this._tailWidth / 2 );
          if ( this._doubleHead ) {
            addPoint( lineWidth, -this._tailWidth / 2 );
            addPoint( headHeight + dx, -this._headWidth / 2 + dy );
            addPoint( headHeight, -this._headWidth / 2 );
          }
          else addPoint( 0, -this._tailWidth / 2 );
        }
        arrowShape.close();

        super.shape = arrowShape;
      }
    }

    /**
     * Creates a arrow with the tip and tail points.
     * @public
     *
     * See Arrow's constructor for detailed parameter information.
     *
     * @param {Vector} tail
     * @param {Vector} tip
     * @param {Object} [options]
     * @returns {Arrow}
     */
    static withPoints( tail, tip, options ) {
      assert( tail instanceof Vector, `invalid tail: ${ tail }` );
      assert( tip instanceof Vector, `invalid tip: ${ tip }` );
      return new Arrow( tail.x, tail.y, tip.x, tip.y, options );
    }
  }

  // @protected @override {string[]} - setter names specific to Arrow. See Path.MUTATOR_KEYS for documentation.
  Arrow.MUTATOR_KEYS = [ 'headHeight', 'headWidth', 'tailWidth', 'headStyle', ...Path.MUTATOR_KEYS ];

  return Arrow;
} );