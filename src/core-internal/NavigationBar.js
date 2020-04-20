// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * The navigation bar at the bottom of the simulation.
 *
 * For a single-screen sim, it shows the name of the sim at the far left. For multi-screen sims, it shows the name at
 * the far left with screen-icon Buttons in the center. These Buttons allow the user to select the active Screen.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Screen = require( 'SIM_CORE/Screen' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const Text = require( 'SIM_CORE/scenery/Text' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class NavigationBar extends DOMObject {

    /**
     * @param {string} title
     * @param {Screen[]} screens
     * @param {Property.<Screen>} activeScreenProperty
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( title, screens, activeScreenProperty, options ) {
      assert( typeof title === 'string', `invalid title: ${ title }` );
      assert( screens.every( screen => screen instanceof Screen ), `invalid screens: ${ screens }` );
      assert( activeScreenProperty instanceof Property, `invalid activeScreenProperty: ${ activeScreenProperty }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {Bounds} - the Bounds of the navigation-bar coordinate system, which are safe to draw in for all window sizes
        layoutBounds: new Bounds( 0, 0, 768, 40 ),

        // {number} - percentage of the height navigation-bar in pixels, relative to the height of the browser. This is
        //            only applied if the window width is larger than the layoutBounds width.
        heightRatio: 40 / 504,

        // {number} - percentage of the height navigation-bar in pixels, relative to the width of the browser. This is
        //            only applied if the window width is smaller than the layoutBounds width.
        constrainedHeightRatio: 40 / 768,

        // {number} - the left margin of the title
        titleLeftMargin: 8,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      // Set the style of the NavigationBar
      options.style = {
        width: '100%',
        color: 'white',
        bottom: 0,
        background: 'black',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
      };
      options.id = 'navigation-bar';

      super( options );

      //----------------------------------------------------------------------------------------

      // @private {number} - reference the ratios from the options declaration.
      this._heightRatio = options.heightRatio;
      this._constrainedHeightRatio = options.constrainedHeightRatio;

      // @private {ScreenView} - initialize a ScreenView for the NavigationBar to use scenery Nodes and to properly
      //                          guarantee content is scaled and positioned properly.
      this._screenView = new ScreenView( { id: 'navigation-bar-screen-view', layoutBounds: options.layoutBounds } );

      // @private {Text} - Create the Text Node that displays the title of the simulation.
      this._titleLabel = new Text( title, {
        centerY: options.layoutBounds.centerY,
        left: options.titleLeftMargin,
        fill: 'white',
        fontSize: 16
      } );

      // Layout the scene graph of the NavigationBar.
      this.addChild( this._screenView.setChildren( [ this._titleLabel ] ) );
    }

    /**
     * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
     * @param
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    layout( width, height ) {

      // Set the height of the NavigationBar, in pixels.
      const navigationBarHeight = Math.min( this._constrainedHeightRatio * width, this._heightRatio * height );
      this.style.height = `${ navigationBarHeight }px`;

      // Call the layout method of the screen view
      this._screenView.layout( width, navigationBarHeight );
    }
  }

  return NavigationBar;
} );