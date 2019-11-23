// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Loader DOMObject that displays a loading page while the simulation is loading and launches the simulation.
 *
 * While loading, a variety of tasks are completed, each signaling a percentage amount closer to finishing the loader.
 * This is shown as a progress circle while launching the simulation and is removed once finished.
 *
 * Loading tasks include:
 *
 *  (1) Synchronously loading registered images from the global window object (see ../util/image-plugin).
 *      Each image loaded adds a percentage amount depending on how many images are loaded. This process is defined
 *      to be IMAGE_LOADING_BANDWIDTH% of the loading bandwidth, even if there are 0 images to load (which would
 *      launch really quickly). This portion of the loading will be sped up with cached images.
 *
 *  (2) Synchronously ensuring that the DOM is fully loaded and ready to be manipulated with all simulation rendering
 *      ready. This is defined as DOM_LOADING_BANDWIDTH of the loading bandwidth, even if the DOM is fully ready
 *      already. This portion of the loading should not be greatly affected by caching.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  //----------------------------------------------------------------------------------------
  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  // Relative size of all loader circles, as a percent.
  const LOADER_CIRCLE_RELATIVE = 100;
  const LOADER_RADIUS = LOADER_CIRCLE_RELATIVE / 2;

  // Relative view box for the loader circle content, with the origin at the center: <minX, minY, width, height>.
  const LOADER_CIRCLE_VIEW_BOX = `-${ LOADER_RADIUS } `.repeat( 2 ) + `${ LOADER_CIRCLE_RELATIVE } `.repeat( 2 );

  // Width of loader circle (which would match pixels with the height) relative to the window.
  const LOADER_CIRCLE_WIDTH = '15%';
  const LOADER_CIRCLE_MAX_SIZE = 180; // the largest possible loader circle size, in pixels.
  const LOADER_CIRCLE_MIN_SIZE = 105; // the smallest possible loader circle size, in pixels.

  // Outer radius (including the stroke) of the loader circle in percentage relative to LOADER_CIRCLE_RELATIVE.
  const LOADER_CIRCLE_OUTER_RADIUS = LOADER_RADIUS;
  const LOADER_STROKE_WIDTH = 8; // in percentage, relative to LOADER_CIRCLE_RELATIVE
  const LOADER_CIRCLE_INNER_RADIUS = ( LOADER_CIRCLE_RELATIVE - LOADER_STROKE_WIDTH ) / 2; // in percentage

  // Loading bandwidths. See comment at the top of the file.
  const IMAGE_LOADING_BANDWIDTH = 70 + Math.random() * 10;
  const DOM_LOADING_BANDWIDTH = 100 - IMAGE_LOADING_BANDWIDTH;
  const MIN = 600;

  class Loader extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      if ( options ) {
        // Changes to the API means excluding some of the options.
        assert( Object.getPrototypeOf( options ) === Object.prototype, `Extra prototype on Options: ${ options }` );
        assert( !options.style, 'Loader sets options.style.' );
        assert( !options.type, 'Loader sets options.type.' );
        assert( !options.innerHTML && !options.text, 'Loader should be a container with no inner content.' );
        assert( !options.id && !options.class && !options.attributes, 'Loader sets options.attributes' );
        assert( !options.children, 'Loader sets children.' );
      }

      options = {
        id: 'loader',
        style: {
          background: 'rgb( 15, 15, 15 )',
          height: '100%',
          display: 'flex', // use a centered flex box to center the loader circle
          'justify-content': 'center'
        },
        ...options
      };


      //----------------------------------------------------------------------------------------
      // To create the loading progress circle, overlay 2 circles on top of each other.
      // First, create the circle in the background. The circle has no fill (hollow) but has a stroke and is a complete
      // circle arc.
      const backgroundCircle = new DOMObject( {
        type: 'circle',
        namespace: XML_NAMESPACE,
        attributes: {
          fill: 'none',
          r: LOADER_CIRCLE_INNER_RADIUS, // In percentage of the container.
          cx: Vector.ZERO.x, // Center the circle
          cy: Vector.ZERO.y, // Center the circle
          'stroke-width': LOADER_STROKE_WIDTH,
          'shape-rendering': 'geometricPrecision', // Use geometricPrecision for aesthetic accuracy.
          stroke: '#A5A5A5' // light colored
        }
      } );

      //----------------------------------------------------------------------------------------
      // Create the circle (as a path) in the foreground. The circle has no fill (hollow) but has a stroke.
      // This represents the percentage of bandwidth loaded (see comment at the top of the file).
      // For now, initialize with arc length 0.
      const foregroundCircle = new DOMObject( {
        type: 'path',
        namespace: XML_NAMESPACE,
        style: {
          fill: 'none',
          'stroke-width': LOADER_STROKE_WIDTH,
          stroke: '#2974b2'
        },
        attributes: {
          'shape-rendering': 'geometricPrecision', // Use geometricPrecision for aesthetic accuracy.
        }
      } );


      //----------------------------------------------------------------------------------------
      // Create the container of the background and foreground circles, using an SVG DOMObject.
      // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg for more details.
      const loaderCircleContainer = new DOMObject( {
        type: 'svg',
        namespace: XML_NAMESPACE,
        attributes: {
          viewBox: LOADER_CIRCLE_VIEW_BOX,
          'shape-rendering': 'geometricPrecision', // Use geometricPrecision for aesthetic accuracy.
        },
        style: {
          width: LOADER_CIRCLE_WIDTH,
          maxWidth: LOADER_CIRCLE_MAX_SIZE,
          minWidth: LOADER_CIRCLE_MIN_SIZE,
          transform: 'scale( 1, -1 )'  // Invert the y-axis to match traditional cartesian coordinates.
        }
      } );

      //----------------------------------------------------------------------------------------
      // Set up the initial Loader scene graph.
      options.children = [ loaderCircleContainer.setChildren( [ backgroundCircle, foregroundCircle ] ) ];

      super( options );

      //----------------------------------------------------------------------------------------

      let loadedImages = 0;
      let loadedPercentage = 0;

      const incrementImageLoad = () => {
        const percentage = 1 / window.simImages.length * IMAGE_LOADING_BANDWIDTH;
        loadedPercentage += percentage;
        foregroundCircle.setAttribute( 'd', getCirclePathData( loadedPercentage ) );
      }

      const startLoadingTime = new Date();


      const finishDom = () => {
        foregroundCircle.setAttribute( 'd', getCirclePathData( IMAGE_LOADING_BANDWIDTH ) );

        isReady( () => {

          loadedPercentage = 99.99;
          window.setTimeout( () => {
            foregroundCircle.setAttribute( 'd', getCirclePathData( loadedPercentage ) );
            window.setTimeout( () => this.dispose(), 400 );
          }, Math.max( ( new Date() - startLoadingTime ) * DOM_LOADING_BANDWIDTH / 100 * ( Math.random() * 9 ), MIN ) );
        } );
      }
      if ( window.simImages ) {
        let i = 0;

        const step = () => {
          const simImage = window.simImages[ i ];
          const image = simImage.image;
          const imagePath = simImage.src;

          const dt = new Date();

          image.element.onload = () => {
            loadedImages++;
            assert( isImageOK( image.element ), `error while loading image` )
            incrementImageLoad( loadedImages );
            i++;
            if ( loadedImages !== window.simImages.length ) {
              window.setTimeout( step, Math.max( ( new Date() - dt ) * 4.5, 80 ) );
            }
            else {
              finishDom();
            }
          }
          image.src = imagePath;
        };
        step();
      }
      else {
        window.setTimeout( finishDom, 200 );
      }






    }
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
function isReady( callback ){
  // in case the document is already rendered
  if ( document.readyState !== 'loading' ) callback();
  // modern browsers
  else if ( document.addEventListener )
    document.addEventListener( 'DOMContentLoaded', callback );
  // IE <= 8
  else document.attachEvent( 'onreadystatechange', function(){
    if ( document.readyState == 'complete' ) callback();
  } )
}


  /**
   * Creates the 'd' attribute data structure for SVG descriptions for a circle arc path.
   * Assumes that the path starts at angle 0 and rotates about the origin. Angle 360 fills an entire circular path while
   * 0 fills none of it. For more details, see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d.
   *
   * @param {number} percentage - the percentage of the arc length relative to a full circle
   * @returns {string} - the SVG data.
   */
  function getCirclePathData( percentage ) {

    // Get the angle of rotation by multiplying the percentage (as a decimal) by 2PI radians.
    const angle = percentage / 100 * Math.PI * 2; // in radians

    // Adjust the angle so that it is relative to the y-axis. (For instance, angle: 90 is really angle 0 when drawn)
    const adjustedAngle = Math.PI / 2 - angle;

    // Get the starting and end Vectors as points.
    const endVector = new Vector( 0, LOADER_CIRCLE_INNER_RADIUS ).setAngle( adjustedAngle );
    const startVector = new Vector( 0, LOADER_CIRCLE_INNER_RADIUS );

    const largeArcFlag = percentage > 50 ? 1 : 0;
    const sweepFlag = 0;

    return [

      // The first step is to move to the starting coordinate.
      // Represented as M X Y in the result string
      'M', startVector.x, startVector.y,

      // The second step is to move to the end coordinate in a circular path
      // Represented as A startRadius endRadius startAngle largeArcFlag sweepFlag endX endY
      'A', LOADER_CIRCLE_INNER_RADIUS, LOADER_CIRCLE_INNER_RADIUS, 0, largeArcFlag, sweepFlag, endVector.x, endVector.y

    ].join( ' ' );
  }


  return Loader;
} );