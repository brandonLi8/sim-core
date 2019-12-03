// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the far right.
 *
 * Layout of NavigationBar adapts to different text widths, icon widths, and numbers of screens, and attempts to
 * perform an 'optimal' layout. The sim title is initially constrained to a max percentage of the bar width,
 * and that's used to compute how much space is available for screen buttons.  After creation and layout of the
 * screen buttons, we then compute how much space is actually available for the sim title, and use that to
 * constrain the title's width.
 *
 * The bar is composed of a background (always pixel-perfect), and expandable content (that gets scaled as one part).
 * If we are width-constrained, the navigation bar is in a 'compact' state where the children of the content (e.g.
 * home button, screen buttons, menu, title) do not change positions. If we are height-constrained, the amount
 * available to the bar expands, so we lay out the children to fit.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const NAVIGATION_BAR_HEIGHT = 40;
  const SCREEN_SIZE = new Vector( 768, 504 );
  const TITLE_FONT_SIZE = 16;
  const TITLE_LEFT_MARGIN = 8;

  class NavigationBar extends DOMObject {

    /**
     * @param {string} title - the title string of the simulation to be displayed
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( title, options ) {

      assert( typeof title === 'string', `invalid title: ${ title }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      const defaults = {

        id: 'navigation-bar',
        style: {
          width: '100%',
          color: 'white',
          bottom: 0,
          background: 'black',
          position: 'absolute'
        }
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };

      super( options );


      // @public {DOMObject} navigationBarContent - container of all the navigation bar content.
      this.navigationBarContent = new DOMObject( {
        id: 'content',
        style: {
          height: '100%', // width set later
          border: '2px solid red',
          margin: '0 auto'
        }
      } );

      // @public {DOMObject} titleDOMObject - the title node
      this.titleDOMObject = new DOMObject( {
        text: title,
        style: {
          height: '100%',
          display: 'inline-flex',
          alignItems: 'center'
        }
      } );

      this.setChildren( [
        this.navigationBarContent,
      ] );

      this.navigationBarContent.setChildren( [
        this.titleDOMObject
      ] );
    }

    /**
     * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
     * @param
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    layout( width, height ) {

      const scale = Math.min( width / SCREEN_SIZE.x, height / SCREEN_SIZE.y );
      const navBarHeight = scale * NAVIGATION_BAR_HEIGHT;
      const navBarContentWidth = scale * SCREEN_SIZE.x;
      const titleFont = scale * TITLE_FONT_SIZE;

      this.style.height = `${ navBarHeight }px`;

      this.navigationBarContent.style.width = `${ navBarContentWidth }px`;

      this.titleDOMObject.style.fontSize = `${ titleFont }px`;
      this.titleDOMObject.style.left = `${ scale * TITLE_LEFT_MARGIN }px`;
    }
  }

  NavigationBar.SCREEN_SIZE = SCREEN_SIZE;
  NavigationBar.NAVIGATION_BAR_HEIGHT = NAVIGATION_BAR_HEIGHT;


    // // add the author and the home button to the footer
    // this.footer.appendChildren([ this.homeButton, this.title, this.author ]);


  return NavigationBar;
} );