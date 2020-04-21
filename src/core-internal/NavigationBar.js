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
  const Button = require( 'SIM_CORE/scenery/components/buttons/Button' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const FlexBox = require( 'SIM_CORE/scenery/FlexBox' );
  const Multilink = require( 'SIM_CORE/util/Multilink' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Screen = require( 'SIM_CORE/Screen' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const Text = require( 'SIM_CORE/scenery/Text' );

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

        // screen-icons
        screenIconHeight: 26,          // {number} the height of the screen icons
        screenIconWidth: 38,           // {number} the width of the screen icons
        maxIconWidthProportion: 0.85,  // {number} max proportion of the background width occupied by screen-icon
        maxIconHeightProportion: 0.85, // {number} max proportion of the background height occupied by screen-icon
        screenIconLabelFontSize: 9.5,  // {number} - the font-size of the screen icon labels

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

      //----------------------------------------------------------------------------------------

      // Add screen icons if applicable
      if ( screens.length > 1 ) {

        // Create the Container of that Screen Icons
        const screenIcons = FlexBox.horizontal( { spacing: 18 } );

        screens.forEach( screen => {

          // Allow the Screen to override the icon options.
          const screenIconOptions = {
            screenIconHeight: options.screenIconHeight,
            screenIconWidth: options.screenIconWidth,
            maxIconWidthProportion: options.maxIconWidthProportion,
            maxIconHeightProportion: options.maxIconHeightProportion,
            screenIconLabelFontSize: options.screenIconLabelFontSize,
            ...screen.screenIconOptions
          };

          // Constrain the Icon's width and height
          const icon = screen.icon || new Node();
          icon.maxWidth = screenIconOptions.screenIconWidth * screenIconOptions.maxIconWidthProportion;
          icon.maxHeight = screenIconOptions.screenIconHeight * screenIconOptions.maxIconHeightProportion;

          // Create the background
          const background = new Rectangle(
            screenIconOptions.screenIconWidth,
            screenIconOptions.screenIconHeight, {
              fill: 'white'
            } );
          icon.center = background.center; // alignment

          // Create the icon Label
          const label = new Text( screen.name, {
            fontSize: screenIconOptions.screenIconLabelFontSize,
            topCenter: background.bottomCenter,
            fill: 'white'
          } );

          // Create the Screen Icon wrapper Node
          const screenIcon = new Node().setChildren( [ background, icon, label ] );

          // Create an overlay to adjust pointer-areas
          const overlay = new Rectangle( screenIcon.width, screenIcon.height, { fill: 'none' } );

          // Create the Button wrapper of the Screen Icon
          const screenIconButton = new Button( overlay, screenIcon );

          // Observe when the Button is interacted with to adjust appearance or when the active screen changes and
          // change the activeScreenProperty. The Multilink is never disposed as NavigationBars are never disposed.
          new Multilink( [ screenIconButton.interactionStateProperty, activeScreenProperty ],
            ( interactionState, activeScreen ) => {
              if ( interactionState === Button.interactionStates.IDLE ) {
                screenIconButton.opacity = activeScreen === screen ? 1 : 0.5;
              }
              if ( interactionState === Button.interactionStates.HOVER ) {
                screenIconButton.opacity = activeScreen === screen ? 0.9 : 0.4;
              }
              if ( interactionState === Button.interactionStates.PRESSED ) {
                screenIconButton.opacity = activeScreen === screen ? 0.95 : 0.6;
              }
              if ( interactionState === Button.interactionStates.RELEASED ) activeScreenProperty.value = screen;
            } );

          // Add the Screen Icon Button
          screenIcons.addChild( screenIconButton );
        } );

        screenIcons.center = this._screenView.layoutBounds.center;
        this._screenView.addChild( screenIcons );
      }
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