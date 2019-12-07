// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Play pause button for stepping the sim. Often appears at the bottom center of the screen.
 *
 * Drawn to the right and reversed for backward buttons.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Property = require( 'SIM_CORE/util/Property' );
  const CircleNode = require( 'SIM_CORE/scenery/CircleNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Polygon = require( 'SIM_CORE/scenery/Polygon' );

  // constants
  const STROKE_WIDTH = 0.9;
  const DEFAULT_RADIUS = 14;

  class StepButton extends SVGNode {

    /**
     * @param {function} listener - called when the button is pressed
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( listener, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {
        radius: DEFAULT_RADIUS,
        stroke: 'black',
        fill: '#A87000',
        direction: 'forward', // forward || backward
        style: {
          userSelect: 'none'
        },
        attributes: {
          'shape-rendering': 'optimizeQuality'
        }
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.width = 2 * options.radius + STROKE_WIDTH;
      options.height = 2 * options.radius + STROKE_WIDTH;
      options.style = { ...defaults.style, ...options.style };

      super( options );

      // step icon is sized relative to the radius
      const BAR_WIDTH = options.radius * 0.15;
      const BAR_HEIGHT = options.radius * 0.9;
      const TRIANGLE_WIDTH = options.radius * 0.65;
      const TRIANGLE_HEIGHT = BAR_HEIGHT;

      this.radius = options.radius;
      this.selfCenter = new Vector( this._width / 2, this._height / 2 );

      // play button
      const button = new CircleNode( {
        radius: this.radius,
        center: this.selfCenter,
        width: this._width,
        height: this._height,
        strokeWidth: STROKE_WIDTH,
        onClick: () => {
          listener();
        },
        shapeRendering: 'geometricPrecision'
      } );

      const rectangle = new Rectangle( {
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
        x: this.selfCenter.x - 2 * BAR_WIDTH,
        y: this._height / 2 - BAR_HEIGHT / 2,
        fill: 'white',
        onClick: () => {
          listener();
        },
        shapeRendering: 'optimizeQuality'
      } );

      //----------------------------------------------------------------------------------------
      // Play button
      const triangle = new Polygon( [
        this.selfCenter.copy().addXY( 0, -TRIANGLE_HEIGHT / 2 ),
        this.selfCenter.copy().addXY( TRIANGLE_WIDTH, 0 ),
        this.selfCenter.copy().addXY( 0, TRIANGLE_HEIGHT / 2 )
      ], {
        fill: 'white',
        width: this._width,
        height: this._height,
        onClick: () => {
          listener();
        },
        shapeRendering: 'optimizeQuality'
      } );
      this.setChildren( [ button, rectangle, triangle ] );

      this.mouseover = () => {
        this.addStyle( {
          filter: 'brightness( 90% )',
          cursor: 'pointer'
        } );
      }
      this.mouseout = () => {
        this.addStyle( {
          filter: 'none',
          cursor: 'default'
        } );
      }

      if ( options.direction === 'backward' ) {
        this.style.transform = 'scaleX( -1 )';
      }
    }
  }

  return StepButton;
} );