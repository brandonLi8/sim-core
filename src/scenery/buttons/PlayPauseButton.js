// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Play pause button for starting/stopping the sim. Often appears at the bottom center of the screen.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const CircleNode = require( 'SIM_CORE/scenery/CircleNode' );
  const Polygon = require( 'SIM_CORE/scenery/Polygon' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );

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
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );


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

      this.selfCenter = new Vector( this.width / 2, this.height / 2 );
      // play button
      const button = new CircleNode( {
        radius: this.radius,
        center: this.selfCenter,
        width: this.width,
        height: this.height,
        strokeWidth: STROKE_WIDTH
      } );

      const pauseRectangle1 = new Rectangle( {
        type: 'rect',
        width: PAUSE_BUTTON_WIDTH,
        height: PAUSE_BUTTON_HEGIHT,
        x: this.selfCenter.x - PAUSE_BUTTON_WIDTH - PAUSE_BUTTON_MARGIN,
        y: this.height / 2 - PAUSE_BUTTON_HEGIHT / 2,
        fill: 'white'
      } );
      const pauseRectangle2 = new Rectangle( {
        type: 'rect',
        width: PAUSE_BUTTON_WIDTH,
        height: PAUSE_BUTTON_HEGIHT,
        x: this.selfCenter.x + PAUSE_BUTTON_MARGIN,
        y: this.height / 2 - PAUSE_BUTTON_HEGIHT / 2,
        fill: 'white'
      } );
      const pauseButton = new SVGNode( {
        children: [ pauseRectangle1, pauseRectangle2 ],
        width: this.width,
        height: this.height
      } );

      //----------------------------------------------------------------------------------------
      // Play button
      const playButton = new Polygon( [
        this.selfCenter.copy().addXY( 2 / Math.sqrt( 3 ) * TRIANGLE_LENGTH / 2, 0 ),
        this.selfCenter.copy().subtractXY( 1 / Math.sqrt( 3 ) * TRIANGLE_LENGTH / 2, -TRIANGLE_LENGTH / 2 ),
        this.selfCenter.copy().subtractXY( 1 / Math.sqrt( 3 ) * TRIANGLE_LENGTH / 2, TRIANGLE_LENGTH / 2 )
      ], {
        fill: 'white',
        width: this.width,
        height: this.height
      } );
      this.setChildren( [ button, playButton, pauseButton ] );

      this.mouseover = () => {
        this.addStyles( {
          filter: isPlayingProperty.value ? 'brightness( 130% )' : 'brightness( 90% )',
          cursor: 'pointer'
        } );
      };
      this.mouseout = () => {
        this.addStyles( {
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