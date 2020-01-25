// Copyright © 2019-2020 Brandon Li. All rights reserved.

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
  const CircleNode = require( 'SIM_CORE/scenery/CircleNode' );
  const Polygon = require( 'SIM_CORE/scenery/Polygon' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const STROKE_WIDTH = 0.9;
  const DEFAULT_RADIUS = 18;

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
        },
        mousedown: () => {
          listener();
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
      this.selfCenter = new Vector( this.width / 2, this.height / 2 );

      // play button
      const button = new CircleNode( {
        radius: this.radius,
        center: this.selfCenter,
        width: this.width,
        height: this.height,
        strokeWidth: STROKE_WIDTH,
        shapeRendering: 'geometricPrecision'
      } );

      const rectangle = new Rectangle( {
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
        x: this.selfCenter.x - 2 * BAR_WIDTH,
        y: this.height / 2 - BAR_HEIGHT / 2,
        fill: 'white',
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
        width: this.width,
        height: this.height,
        shapeRendering: 'optimizeQuality'
      } );
      this.setChildren( [ button, rectangle, triangle ] );

      this.mouseover = () => {
        this.addStyle( {
          filter: 'brightness( 90% )',
          cursor: 'pointer'
        } );
      };
      this.mouseout = () => {
        this.addStyle( {
          filter: 'none',
          cursor: 'default'
        } );
      };

      if ( options.direction === 'backward' ) {
        this.style.transform = 'scaleX( -1 )';
      }
    }
  }

  return StepButton;
} );