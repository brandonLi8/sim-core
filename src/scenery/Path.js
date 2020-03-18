// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Before reading the documentation of this file, it is recommended to read `SIM_CORE/util/Shape` for context.
 *
 * A Path Node that draws and displays a Shape. Will shift the Shape's bounds so that the Path's origin (0, 0) is at the
 * top-left of its localBounds. Contains an API to specify the fill, stroke, etc of the rendered Path. See
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path.
 *
 * The fill and stroke can be either a Gradient instance of any valid css color string. See
 * https://www.w3schools.com/colors/default.asp for context.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Gradient = require( 'SIM_CORE/scenery/gradients/Gradient' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Path extends Node {

    /**
     * @param {Shape|null} shape - The shape of the Path.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( shape, options ) {
      assert( !shape || shape instanceof Shape, `invalid shape: ${ shape }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.type, 'path sets type' );

      options = {
        fill: null,             // {string|Gradient} - Sets the fill color of the Path. See `set fill()`.
        stroke: null,           // {string|Gradient} - Sets the stroke color of the Path. See `set stroke()`.
        strokeWidth: 1,         // {number} - Sets the stroke width of this Path. See `set strokeWidth()`.
        shapeRendering: 'auto', // {string} - Sets the shape-rendering method of this Path. See `set shapeRendering()`.

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      options.type = 'path'; // Set the type to a path element.
      options.shape = shape; // Set to the provided shape so that the shape is set in the mutate() call in Node.
      super( options );

      // @private {*} - see options declaration for documentation. Contains getters and setters. Set to what was
      //                provided as they were set in the mutate() call in Node's constructor.
      this._fill = options.fill;
      this._stroke = options.stroke;
      this._strokeWidth = options.strokeWidth;
      this._shapeRendering = options.shapeRendering;

      // @private {Shape|null} - the Shape object of this Path.
      this._shape = options.shape;
    }

    /**
     * ES5 getters of properties specific to Path. Traditional Accessors methods aren't included to reduce the memory
     * footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get fill() { return this._fill; }
    get stroke() { return this._stroke; }
    get strokeWidth() { return this._strokeWidth; }
    get shapeRendering() { return this._shapeRendering; }
    get shape() { return this._shape; }

    //----------------------------------------------------------------------------------------

    /**
     * Sets the inner-fill color of the Shape. See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill.
     * @public
     *
     * @param {string|Gradient|null} fill - any valid css color string or a Gradient instance.
     */
    set fill( fill ) {
      if ( fill === this._fill ) return; // Exit if setting to the same 'fill'
      assert( !fill || typeof fill === 'string' || fill instanceof Gradient, `invalid fill: ${ fill }` );
      this._fill = fill;
      this.element.setAttribute( 'fill', fill instanceof Gradient ? fill.SVGGradientString : fill );
    }

    /**
     * Sets the outline stroke-color of the Shape. See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke
     * @public
     *
     * @param {string|Gradient|null} stroke - any valid css color string or a Gradient instance.
     */
    set stroke( stroke ) {
      if ( stroke === this._stroke ) return; // Exit if setting to the same 'stroke'
      assert( !stroke || typeof stroke === 'string' || stroke instanceof Gradient, `invalid stroke: ${ stroke }` );
      this._stroke = stroke;
      this.element.setAttribute( 'stroke', stroke instanceof Gradient ? stroke.SVGGradientString : stroke );
    }

    /**
     * Sets the outline stroke-width of the Shape. See
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width.
     * @public
     *
     * @param {number} strokeWidth
     */
    set strokeWidth( strokeWidth ) {
      if ( strokeWidth === this._strokeWidth ) return; // Exit if setting to the same 'strokeWidth'
      assert( typeof strokeWidth === 'number', `invalid strokeWidth: ${ strokeWidth }` );
      this._strokeWidth = strokeWidth;
      this.layout( this.screenViewScale );
    }

    /**
     * Sets the method of rendering of this Path. See
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering.
     * @public
     *
     * @param {string} shapeRendering - must be 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision'
     */
    set shapeRendering( shapeRendering ) {
      if ( shapeRendering === this._shapeRendering ) return; // Exit if setting to the same 'shapeRendering'
      assert( [ 'auto', 'optimizeSpeed', 'crispEdges', 'geometricPrecision' ].includes( shapeRendering ),
        `invalid shapeRendering: ${ shapeRendering }` );
      this._shapeRendering = shapeRendering;
      this.element.setAttribute( 'shape-rendering', shapeRendering );
    }

    /**
     * Sets the Shape of the Path, which determines the shape of its appearance. The Shape is then frozen with
     * Util.deepFreeze. Null indicates that there is no Shape and nothing is drawn.
     * @public
     *
     * @param {Shape|null} shape
     */
    set shape( shape ) {
      if ( shape === this._shape ) return; // Exit if setting to the same 'shape'
      assert( !shape || shape instanceof Shape, `invalid shape: ${ shape }` );
      this._shape = shape ? Util.deepFreeze( shape ) : null;

      // Set the width and height of this Path
      this.width = shape ? shape.bounds.width : 0;
      this.height = shape ? shape.bounds.height : 0;

      // Set the Bounds of this Node.
      if ( shape ) { this._bounds.set( this._shape.bounds ); }
      this.layout( this.screenViewScale );
    }

    /**
     * @override
     * Layouts the Path, ensuring that the Shape is correctly in its top-left corner with 0 transformations before
     * calling the super class's layout method. Correctly scales the shape within the ScreenView.
     * @public (sim-core-internal)
     *
     * @param {number|null} scale - scenery scale, in terms of window pixels per ScreenView coordinate.
     */
    layout( scale ) {
      if ( !scale ) return; // Exit if no scale was provided.

      if ( this._shape ) { // Set the Element's d-attribute to render the Shape.
        this.element.setAttribute( 'd', this._shape.getSVGPath( this._shape.bounds.bottomLeft.negate(), scale ) );
        this.element.setAttribute( 'stroke-width', this._strokeWidth * scale );
      }
      super.layout( scale );
    }
  }

  // @protected @override {string[]} - setter names specific to Node. See Node.MUTATOR_KEYS for documentation.
  Path.MUTATOR_KEYS = [ 'shape', 'fill', 'stroke', 'strokeWidth', 'shapeRendering', ...Node.MUTATOR_KEYS ];

  return Path;
} );