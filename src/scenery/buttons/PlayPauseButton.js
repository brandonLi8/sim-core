// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Play pause button for starting/stopping the sim. Often appears at the bottom center of the screen.
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
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Polygon = require( 'SIM_CORE/scenery/Polygon' );

  // constants
  const STROKE_WIDTH = 2;
  const DEFAULT_RADIUS = 28;
  const PAUSE_BUTTON_WIDTH = 9;
  const PAUSE_BUTTON_HEGIHT = 27;
  const PAUSE_BUTTON_MARGIN = 2;
  const TRIANGLE_LENGTH = 28;

  class PlayPauseButton extends SVGNode {

    /**
     * @param {Property.<boolean>} isPlayingProperty
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( isPlayingProperty, options ) {

      assert( isPlayingProperty instanceof Property && typeof isPlayingProperty.value === 'boolean',
        `invalid isPlayingProperty: ${ isPlayingProperty }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {
        radius: DEFAULT_RADIUS,
        stroke: '#996600',
        style: {
          userSelect: 'none'
        },
        mousedown: () => {
          isPlayingProperty.toggle();
        }
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.width = 2 * options.radius + STROKE_WIDTH;
      options.height = 2 * options.radius + STROKE_WIDTH;
      options.style = { ...defaults.style, ...options.style };

      super( options );

      this.radius = options.radius;

      this.selfCenter = new Vector( this._width / 2, this._height / 2 );
      // play button
      const button = new CircleNode( {
        radius: this.radius,
        center: this.selfCenter,
        width: this._width,
        height: this._height,
        strokeWidth: STROKE_WIDTH
      } );

      const pauseRectangle1 = new Rectangle( {
        type: 'rect',
        width: PAUSE_BUTTON_WIDTH,
        height: PAUSE_BUTTON_HEGIHT,
        x: this.selfCenter.x - PAUSE_BUTTON_WIDTH - PAUSE_BUTTON_MARGIN,
        y: this._height / 2 - PAUSE_BUTTON_HEGIHT / 2,
        fill: 'white'
      } );
      const pauseRectangle2 = new Rectangle( {
        type: 'rect',
        width: PAUSE_BUTTON_WIDTH,
        height: PAUSE_BUTTON_HEGIHT,
        x: this.selfCenter.x + PAUSE_BUTTON_MARGIN,
        y: this._height / 2 - PAUSE_BUTTON_HEGIHT / 2,
        fill: 'white'
      } );
      const pauseButton = new SVGNode( {
        children: [ pauseRectangle1, pauseRectangle2 ],
        width: this._width,
        height: this._height
      } );

      //----------------------------------------------------------------------------------------
      // Play button
      const playButton = new Polygon( [
        this.selfCenter.copy().addXY( 2 / Math.sqrt( 3 ) * TRIANGLE_LENGTH / 2, 0 ),
        this.selfCenter.copy().subtractXY( 1 / Math.sqrt( 3 ) * TRIANGLE_LENGTH / 2, -TRIANGLE_LENGTH / 2 ),
        this.selfCenter.copy().subtractXY( 1 / Math.sqrt( 3 ) * TRIANGLE_LENGTH / 2, TRIANGLE_LENGTH / 2 )
      ], {
        fill: 'white',
        width: this._width,
        height: this._height
      } );
      this.setChildren( [ button, playButton, pauseButton ] );

      this.mouseover = () => {
        this.addStyle( {
          filter: isPlayingProperty.value ? 'brightness( 130% )' : 'brightness( 90% )',
          cursor: 'pointer'
        } );
      };
      this.mouseout = () => {
        this.addStyle( {
          filter: 'none',
          cursor: 'default'
        } );
      };

      isPlayingProperty.link( isPlaying => {
        playButton.style.opacity = isPlaying ? 0 : 1;
        pauseButton.style.opacity = isPlaying ? 1 : 0;

        button.addAttributes( {
          fill: isPlaying ? '#D48D00' : '#FFAA00'
        } );

      } );
    }
  }

  return PlayPauseButton;
} );