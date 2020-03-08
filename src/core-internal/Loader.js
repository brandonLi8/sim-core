// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Loader DOMObject that displays a loading page while the simulation is loading and launches the simulation.
 *
 * While loading, a variety of tasks are completed, each signaling a percentage amount closer to finishing the loader.
 * This is shown as a progress circle while launching the simulation and is removed once finished.
 *
 * Loading tasks include:
 *  (1) Synchronously initializing the entire model and view hierarchies of the sim-specific code for every screen (see
 *      Screen.js). This ensures that the simulation source code has been loaded and instantiated. This process is
 *      defined to be SIM_SOURCE_LOADING_BANDWIDTH% of the loading bandwidth. There must be at least one screen to load.
 *
 *  (2) Synchronously loading registered images from the global window object (see ../util/image-plugin).
 *      Each image loaded adds a percentage amount depending on how many images are loaded. This process is defined
 *      to be IMAGE_LOADING_BANDWIDTH% of the loading bandwidth, even if there are 0 images to load (which would
 *      launch really quickly). This portion of the loading will be sped up with cached images.
 *
 *  (3) Synchronously ensuring that the DOM is fully loaded and ready to be manipulated with all simulation rendering
 *      in place. This is defined as DOM_LOADING_BANDWIDTH% of the loading bandwidth, even if the DOM is fully ready
 *      already. This portion of the loading should not be greatly affected by caching.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Screen = require( 'SIM_CORE/Screen' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Text = require( 'SIM_CORE/scenery/Text' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const SIM_SOURCE_LOADING_BANDWIDTH = 35 + Math.random() * 10; // Random number from 35 to 45
  const IMAGE_LOADING_BANDWIDTH = 20 + Math.random() * 15;      // Random number from 20 to 35
  const DOM_LOADING_BANDWIDTH = 100 - IMAGE_LOADING_BANDWIDTH - SIM_SOURCE_LOADING_BANDWIDTH;

  class Loader extends DOMObject {

    /**
     * @param {string} simName - the name of the simulation, displayed in the Loader
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( simName, options ) {

      // Some options are set by Loader. Assert that they weren't provided.
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.style, 'Loader sets style.' );
      assert( !options || !options.type, 'Loader sets type.' );
      assert( !options || !options.text, 'Loader sets text.' );
      assert( !options || !options.id || !options.class || !options.attributes, 'Loader sets attributes' );
      assert( !options || !options.children, 'Loader sets children.' );

      options = {
        backgroundColor: '#0f0f0f',  // {string} - the backdrop color of the loader
        loaderCircleBg: '#A5A5A5',   // {string} - the background color of the loader circle
        loaderCircleFg: '#2974b2',   // {string} - the foreground color of the loader circle
        loaderTitleColor: '#F1F1F1', // {string} - the font color of the text of the sim name near the top of the Loader
        loaderCircleRadius: 43,      // {number} - the inner-radius of the loader circle, in the standard scenery frame
        loaderCircleStrokeWidth: 11, // {number} - the stroke-width of the loader circle, in the standard scenery frame
        titleCircleMargin: 90,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      // Set the style of the Loader
      options.style = {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        backgroundColor: options.backgroundColor
      };
      super( options );

      // @private {ScreenView} - initialize a ScreenView for the Loader to use scenery Nodes and to properly guarantee
      //                         all loader content is scaled and positioned properly.
      this._loaderScreenView = new ScreenView( { id: 'loader-screen-view' } );

      // @private {Text} - Create the Text Node that displays the title of the simulation in the loader.
      this._titleLabel = new Text( simName, {
        center: this._loaderScreenView.viewBounds.center.subtractXY( 0, options.titleCircleMargin ),
        maxWidth: this._loaderScreenView.viewBounds.width,
        fill: options.loaderTitleColor,
        fontSize: 30,
        strokeWidth: 2
      } );

      // @private {Path} - Create the Path that renders the background circle of the loader circle. Set it to a Shape
      //                   with a full circle, as it does for the entirety of the Loader's lifespan.
      this._backgroundCirclePath = new Path( new Shape().moveTo( 0, 0 )
                                               .arc( options.loaderCircleRadius, 0, 2 * Math.PI - Util.EPSILON ), {
        fill: 'none', // transparent inside
        stroke: options.loaderCircleBg,
        strokeWidth: options.loaderCircleStrokeWidth,
        center: this._loaderScreenView.viewBounds.center.addXY( 0, options.titleCircleMargin / 2 ),
      } );

      // @private {Path} - Create the Path that renders the foregroundCircle circle of the loader circle.
      this._foregroundCirclePath = new Path( null, {
        fill: 'none', // transparent inside
        stroke: options.loaderCircleFg,
        strokeWidth: options.loaderCircleStrokeWidth + 1, // add 1 to give illusion that it is fully filling background
        center: this._loaderScreenView.viewBounds.center.addXY( 0, options.titleCircleMargin / 2 ),
      } );

      // Layout the scene graph of the Loader.
      this.addChild( this._loaderScreenView
                      .setChildren( [ this._titleLabel, this._backgroundCirclePath, this._foregroundCirclePath ]
                    ) );

      // @private {number} the percentage amount that the loader has completed.
      this._percentage = 0;

      // @private {number} reference the loader circle radius.
      this._loaderCircleRadius = 43;
    }

    /**
     * Begins loading the Loader, which will execute the tasks listed at the top of this file and incrementally
     * increase the arc of the Loader circle, signaling the progression as the simulation is loaded.
     * @public
     *
     * @param {string[]} simScreens - all screens of the simulation
     */
    start( simScreens ) {
      assert( Util.isArray( simScreens ) && simScreens.length && simScreens.every( screen => screen instanceof Screen ),
        `invalid simScreens: ${ simScreens }` );

      this.incrementLoader( 90 )

    }

    /**
     * Increments the Loader to a new percentage by updating the arc of the foregroundCircle to signal a percentage
     * amount to completing the Loader portion of the simulation.
     * @private
     *
     * The foregroundCircle arc is drawn in a standard loader circle orientation, starting vertically up and rotating
     * clockwise (wihtout considierng the flipped y-axis of the view).
     *
     * @param {number} loadedPercentage - the percentage that the loader has completed
     */
    incrementLoader( loadedPercentage ) {
      if ( loadedPercentage === this._percentage ) return; // Exit if setting to the same percentage.
      assert( typeof loadedPercentage === 'number', `invalid loadedPercentage: ${ loadedPercentage }` );

      // Update the percentage field of the Loader. Subtract EPSILON so that full circles are fully rendered.
      this._percentage = loadedPercentage - Util.EPSILON;

      // Create the shape rendered for the foregroundCircle.
      const foregroundCircleShape = new Shape()
        .moveTo( 0, 0 )
        .arc( this._loaderCircleRadius, - Math.PI / 2, - Math.PI / 2 +  2 * Math.PI * this._percentage / 100 );

      // Set the shape of the foregroundCircle to render the new Shape.
      this._foregroundCirclePath.shape = foregroundCircleShape;

      // Reposition the foregroundCircle to match the backgroundColor so that their arcs are on top of each other.
      if ( this._percentage < 50 ) this._foregroundCirclePath.topLeft = this._backgroundCirclePath.topCenter;
      else this._foregroundCirclePath.center = this._backgroundCirclePath.center;
    }

    layout( width, height ) {
      this._loaderScreenView.layout( width, height );
    }




    //   //----------------------------------------------------------------------------------------

    //   let loadedImages = 0;
    //   let loadedPercentage = 0;

    //   const tw = () => {
    //     const percentage = 1 / window.simImages.length * IMAGE_LOADING_BANDWIDTH;
    //     loadedPercentage += percentage;
    //     foregroundCircle.setAttribute( 'd', getCirclePathData( loadedPercentage ) );
    //   };

    //   const startLoadingTime = Date.now();


    //   const finishDom = () => {
    //     foregroundCircle.setAttribute( 'd', getCirclePathData( IMAGE_LOADING_BANDWIDTH ) );

    //     isReady( () => {

    //       loadedPercentage = 99.99;
    //       window.setTimeout( () => {
    //         foregroundCircle.setAttribute( 'd', getCirclePathData( loadedPercentage ) );
    //         window.setTimeout( () => this.dispose(), 400 );
    //       }, Math.max( ( Date.now() - startLoadingTime ) * DOM_LOADING_BANDWIDTH / 100 * ( Math.random() * 3 ), 100 ) );
    //     } );
    //   };
    //   if ( window.simImages ) {
    //     let i = 0;

    //     const step = () => {
    //       const simImage = window.simImages[ i ];
    //       const image = simImage.image;
    //       const imagePath = simImage.src;

    //       const dt = Date.now();

    //       image.element.onload = () => {
    //         loadedImages++;
    //         assert( isImageOK( image.element ), 'error while loading image' );
    //         tw( loadedImages );
    //         i++;
    //         if ( loadedImages !== window.simImages.length ) {
    //           window.setTimeout( step, Math.max( ( Date.now() - dt ) * 4.5, 80 ) );
    //         }
    //         else {
    //           finishDom();
    //         }
    //       };
    //       image.src = imagePath;
    //     };
    //     step();
    //   }
    //   else {
    //     window.setTimeout( () => {
    //       foregroundCircle.setAttribute( 'd', getCirclePathData( 30.9 ) );

    //       window.setTimeout( finishDom, 800 );
    //     }, 500 );
    //   }
    // }
  }

  //----------------------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------------------

  // Taken from http://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-in-javascript
  function isImageOK( img ) {

    // During the onload event, IE correctly identifies any images that
    // weren't downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if ( !img.complete ) {
      return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if ( typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0 ) {
      return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
  }

// function that checks if a node is ready
function isReady( callback ) {
  // in case the document is already rendered
  if ( document.readyState !== 'loading' ) callback();
  // modern browsers
  else if ( document.addEventListener )
    document.addEventListener( 'DOMContentLoaded', callback );
  // IE <= 8
  else document.attachEvent( 'onreadystatechange', function() {
    if ( document.readyState === 'complete' ) callback();
  } );
}

  return Loader;
} );