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
  const Path = require( 'SIM_CORE/scenery/Path' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Text = require( 'SIM_CORE/scenery/Text' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const SIM_SOURCE_LOADING_BANDWIDTH = 50 + Math.random() * 10;
  const DOM_LOADING_BANDWIDTH = 15 + Math.random() * 10;
  const IMAGE_LOADING_BANDWIDTH = 100 - SIM_SOURCE_LOADING_BANDWIDTH - DOM_LOADING_BANDWIDTH;

  class Loader extends DOMObject {

    /**
     * @param {Class.<Sim>} Sim - the sim class.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( Sim, options ) {

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
        titleFontSize: 30,

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

      // @private {number} reference the loader circle radius.
      this._loaderCircleRadius = options.loaderCircleRadius;

      // @private {number} the percentage amount that the loader has completed.
      this._percentage = 0;

      // @private {ScreenView} - initialize a ScreenView for the Loader to use scenery Nodes and to properly guarantee
      //                         all loader content is scaled and positioned properly.
      this._loaderScreenView = new ScreenView( { id: 'loader-screen-view' } );

      // @private {Text} - Create the Text Node that displays the title of the simulation in the loader.
      this._titleLabel = new Text( Sim.simName, {
        center: this._loaderScreenView.viewBounds.center.subtractXY( 0, options.titleCircleMargin ),
        maxWidth: this._loaderScreenView.viewBounds.width,
        fill: options.loaderTitleColor,
        fontSize: options.titleFontSize,
        strokeWidth: 2
      } );

      // @private {Path} - Create the Path that renders the background circle of the loader circle. Set it to a Shape
      //                   with a full circle, as it does for the entirety of the Loader's lifespan.
      this._backgroundCirclePath = new Path( new Shape()
                                            .arc( Vector.ZERO, options.loaderCircleRadius, 0, 2 * Math.PI - Util.EPSILON ), {
        fill: 'none', // transparent inside
        stroke: options.loaderCircleBg,
        strokeWidth: options.loaderCircleStrokeWidth,
        center: this._loaderScreenView.viewBounds.center.addXY( 0, options.titleCircleMargin / 2 )
      } );

      // @private {Path} - Create the Path that renders the foregroundCircle circle of the loader circle.
      this._foregroundCirclePath = new Path( null, {
        fill: 'none', // transparent inside
        stroke: options.loaderCircleFg,
        strokeWidth: options.loaderCircleStrokeWidth + 0.1, // add .1 to give illusion that it is fully filling
        center: this._loaderScreenView.viewBounds.center.addXY( 0, options.titleCircleMargin / 2 )
      } );

      // Layout the scene graph of the Loader.
      this.addChild( this._loaderScreenView
                      .setChildren( [ this._titleLabel, this._backgroundCirclePath, this._foregroundCirclePath ]
                    ) );

      Sim.display.on( 'resize', this.layout.bind( this ) );
    }

    /**
     * Layouts the Loader, ensuring that the Loader content fully scales and fits inside of the browser window.
     * @public (sim-core-internal)
     *
     * @param {number} width - window width in pixels
     * @param {number} height - window height in pixels
     */
    layout( width, height ) { this._loaderScreenView.layout( width, height ); }

    /**
     * Begins loading the Loader, which will execute the tasks listed at the top of this file and incrementally
     * increase the arc of the Loader circle, signaling the progression as the simulation is loaded.
     * @public
     *
     * @param {Class.<Sim>} Sim - the sim class.
     */
    load( Sim, simScreens ) {

      this.synchronousLoadScreens( Sim );
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

      // // Update the percentage field of the Loader. Subtract EPSILON so that full circles are fully rendered.
      this._percentage = loadedPercentage - Util.EPSILON;

      // Create the shape rendered for the foregroundCircle.
      const foregroundCircleShape = new Shape()
        .arc( Vector.ZERO, this._loaderCircleRadius, -Math.PI / 2, - Math.PI / 2 + 2 * Math.PI * this._percentage / 100 );

      // Set the shape of the foregroundCircle to render the new Shape.
      this._foregroundCirclePath.shape = foregroundCircleShape;

      // Reposition the foregroundCircle to match the backgroundColor so that their arcs are on top of each other.
      if ( loadedPercentage < 50 ) this._foregroundCirclePath.topLeft = this._backgroundCirclePath.topCenter;
      else this._foregroundCirclePath.topRight = this._backgroundCirclePath.topRight;
    }


    /**
     * Executes step of 1st Loading tasks: synchronously loading the entire model and view hierarchies for every screen.
     * This has been consoldated down into one method (start()) for Screens (See Screen.js). Once this is finished, this
     * will call the second step of Loading tasks: synchronousLoadSimImages()
     * @public
     *
     * @param {Class.<Sim>} Sim - the sim class.
     */
    synchronousLoadScreens( Sim ) {

      // Create a function that loads all Screens from a given index of Sim.screens.
      const initializeScreensFromIndex = ( index ) => {
        setTimeout( () => {
          Sim.screens[ index ].start( Sim.display );

          // Increment the loader circle.
          const percentageIncrease = 1 / Sim.screens.length * SIM_SOURCE_LOADING_BANDWIDTH;
          const initialIncrease = percentageIncrease * ( 0.4 + Math.random() * 0.1 );
          const finalIncrease = percentageIncrease - initialIncrease;
          this.incrementLoader( this._percentage + initialIncrease );

          setTimeout( () => {
            this.incrementLoader( this._percentage + finalIncrease );
            if ( index + 1 < Sim.screens.length ) initializeScreensFromIndex( index + 1 );
            else this.synchronousLoadSimImages( Sim ); // Once this has finished, call the second step
          }, 800 / Math.pow( 2 * Sim.screens.length, Sim.screens.length * 2 ) );
        },
          // Add a slight delay between each initializeScreensFromIndex call to make it easier to see increments. This
          // delay gets smaller for more screens making it move reasonably quickly for more screens.
          300 / Math.pow( Sim.screens.length, 0.01 ) );
      };
      setTimeout( () => { initializeScreensFromIndex( 0 ); }, 300 ); // pause for a few milliseconds before starting
    }

    /**
     * Executes step of 2nd Loading tasks: synchronously load registered images from the image-plugin
     * (see ../util/image-plugin). Images are in the window.simImages field. Once this is finished, this
     * will call the last step of Loading tasks: synchronousFinishDOM()
     * @public
     *
     * @param {Class.<Sim>} Sim - the sim class.
     */
    synchronousLoadSimImages( Sim ) {
      if ( window.simImages ) {
        // Create a function that load all images from a given index of window.simImages.
        const loadImageFromIndex = ( index ) => {
          setTimeout( () => {

            // Load the image data.
            const simImage = window.simImages[ index ];
            const image = simImage.image;
            const imagePath = simImage.src;

            // Listen to when the image has loaded.
            image.element.onload = () => {
              assert( this.isImageOk( image.element ), 'error while loading image' );

              // Increment the loader circle.
              this.incrementLoader( this._percentage + 1 / window.simImages.length * IMAGE_LOADING_BANDWIDTH );

              if ( index + 1 < window.simImages.length ) loadImageFromIndex( index + 1 );
              else this.synchronousFinishDOM( Sim ); // Once this has finished, call the 3rd step of the loading process
            };

            // Now set the src of the image.
            image.src = imagePath;
          },
            // Add a slight delay between each loadImageFromIndex call to make it easier to see increments. This
            // delay gets smaller for more images making it move reasonably quickly for more images.
            300 / window.images.length );
        };
        setTimeout( () => { loadImageFromIndex( 0 ); }, 200 ); // pause for a few milliseconds before starting
      }
      else {
        // No images to load: go ahead and complete the rest of the IMAGE_LOADING_BANDWIDTH
        setTimeout( () => {
          this.incrementLoader( this._percentage + IMAGE_LOADING_BANDWIDTH );
          this.synchronousFinishDOM( Sim ); // Once this has finished, call the 3rd step of the loading process.
        }, 600 ); // pause for a few milliseconds before.
      }
    }

    /**
     * Executes step of 3rd and final Loading task: synchronously ensuring that the DOM is fully loaded and set in
     * place. Once this is finished, this will dispose of the Loader.
     * @public
     *
     * @param {Class.<Sim>} Sim - the sim class.
     */
    synchronousFinishDOM( Sim ) {
      // Step of 3 Loading tasks: synchronously ensuring that the DOM is fully loaded and set in place.
      setTimeout( () => {

        // Tell the Sim that we have finished loading Screens.
        Sim.finishLoadingScreens();

        // Listen to when the DOM has finished loading.
        this.addDOMFinishedListener( () => {

          // At this point the Loader has finished, so increment to the rest.
          this.incrementLoader( 100 );
          setTimeout( () => { this.dispose(); }, 100 ); // Slight pause before disposing.
        } );
      }, DOM_LOADING_BANDWIDTH * 30 ); // pause for a few milliseconds before.
    }

    /**
     * Adds a listener to when the document DOM has been fully loaded and ready to be manipulated.
     * @public
     *
     * @param {function} listener - listener function to call when the document DOM has been fully loaded.
     */
    addDOMFinishedListener( listener ) {

      // First check if it has already been completely loaded.
      // See https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
      if ( document.readyState !== 'loading' ) return listener(); // Use return to exit.

      // Next check if the browser supports addEventListener. If so, listen to the DOMContentLoaded event.
      if ( document.addEventListener ) return document.body.addEventListener( 'DOMContentLoaded', listener );

      // Otherwise, use document.attachEvent to listen to when the readyState is 'complete'
      document.attachEvent( 'onreadystatechange', () => {
        if ( document.body.readyState === 'complete' ) listener();
      } );
    }

    /**
     * Checks if an image has been loaded without any errors and is correctly displayed in the document.
     * Solution from http://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-in-javascript.
     * @public
     *
     * @param {HTMLImageElement} image
     * @returns {boolean} - if the image is 'ok'
     */
    isImageOk( image ) {
      // During the onload event, IE correctly identifies any images that weren't downloaded as not complete.
      // Others should too. Gecko-based browsers act like NS4 in that they report this incorrectly.
      if ( !image.complete ) return false;

      // However, they do have two very useful properties: naturalWidth and naturalHeight. These give the true size of
      // the image. If it failed to load, either of these should be zero.
      if ( typeof image.naturalWidth !== 'undefined' && image.naturalWidth === 0 ) return false;

      // No other way of checking: assume it’s ok.
      return true;
    }
  }
  return Loader;
} );