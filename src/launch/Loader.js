// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Loader DOMObject that displays a loading page while loading the simulation.
 *
 * While loading, a variety of tasks are completed, each signaling a percentage amount closer to finishing the loader.
 * This is shown as a progress circle while launching the simulation and is removed once finished.
 *
 * Loading tasks include:
 *
 *  (1) Synchronously loading registered images from the global window object (see ../util/image-plugin).
 *      Each image loaded adds a percentage amount depending on how many images are loaded. This process is defined
 *      to be IMAGE_LOADING_BANDWIDTH of the loading bandwidth, even if there are 0 images to load (which would
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
  const DOMObject = require( 'SIM_CORE/display/DOMObject' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  // loader box (container of the loader circle)
  const LOADER_BOX_RELATIVE = 100; // Create a relative flag for all loader box content.
  const LOADER_BOX_SIZE = '15%'; // Size of loader box in percentage of the window width.
  const LOADER_BOX_MAX_WIDTH = 110; // in pixels, the largest possible loader box size
  const LOADER_BOX_MIN_WIDTH = 95; // in pixels, the smallest possible loader box size

  // loader circle
  const LOADER_CIRCLE_OUTER_RADIUS = 100; // in percentage of the LOADER_BOX_RELATIVE
  const LOADER_STROKE_WIDTH = 8; // in percentage of the LOADER_BOX_RELATIVE
  const LOADER_CIRCLE_INNER_RADIUS = ( LOADER_BOX_RELATIVE - LOADER_STROKE_WIDTH ) / 2;
  const LOADER_CIRCLE_COLOR = '#2974b2';


  class Loader extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.
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
          display: 'flex', // use a centered flex box to center the loader
          'align-items': 'center',
          'justify-content': 'center',
          border: '2px solid red'
        },

        ...options
      };

      //----------------------------------------------------------------------------------------
      // Create the loader box, the container of the progress circles, using an SVG DOMObject.
      // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg for more details.
      const loaderBox = new DOMObject( {
        type: 'svg',
        namespace: XML_NAMESPACE,
        attributes: {
          viewBox: `0 0 ${ LOADER_BOX_RELATIVE } ${ LOADER_BOX_RELATIVE }`,
          'shape-rendering': 'geometricPrecision', // Use geometricPrecision for aesthetic accuracy.
        },
        style: {
          width: LOADER_BOX_SIZE,
          maxWidth: LOADER_BOX_MAX_WIDTH,
          minWidth: LOADER_BOX_MIN_WIDTH
        }
      } );

      //----------------------------------------------------------------------------------------
      // To create the loading progress circle, overlay 2 circles on top of each other.
      // Now create the circle in the background. The circle has no fill (hollow) but has a stroke and is a complete
      // circle arc.
      const backgroundCircle = new DOMObject( {
        type: 'circle',
        namespace: XML_NAMESPACE,
        attributes: {
          r: LOADER_CIRCLE_INNER_RADIUS, // In percentage of the container.
          cx: LOADER_BOX_RELATIVE / 2, // In percentage of the container. In the exact center.
          cy: LOADER_BOX_RELATIVE / 2, // In the percentage of the container. In the exact center.
          fill: 'none', // Hollow
          'stroke-width': LOADER_STROKE_WIDTH,
          'shape-rendering': 'geometricPrecision', // Use geometricPrecision for aesthetic accuracy.
          stroke: '#A5A5A5' // light colored
        }
      } );

      //----------------------------------------------------------------------------------------
      // Now create the circle (path) in the foreground. The circle has no fill (hollow) but has a stroke.
      // This represents the percentage of bandwidth loaded (see comment at the top of the file).
      // For now, initialize with arc length 0.
      const foregroundCircle = new DOMObject( {
        type: 'path',
        namespace: XML_NAMESPACE,
        style: {
          fill: 'none', // Hollow
          'stroke-width': LOADER_STROKE_WIDTH,
          stroke: LOADER_CIRCLE_COLOR
        },
        attributes: {
          'shape-rendering': 'geometricPrecision', // Use geometricPrecision for aesthetic accuracy.
        }
      } );

      //----------------------------------------------------------------------------------------
      // Set up the initial Loader scene graph.
      loaderBox.setChildren( [ backgroundCircle, foregroundCircle ] );

      // Set up the DOM of the Loader
      options.children = [ loaderBox ];

      super( options );

      //----------------------------------------------------------------------------------------

      foregroundCircle.setAttribute( 'd', describeArc( 50, 50, LOADER_CIRCLE_INNER_RADIUS, 0, 350 ) )
      // foregroundCircle.setAttribute( 'd', getCirclePathData( 350 ) )

      // let loadedImages = 0;
      // if ( window.simImages ) {

      //   window.simImages.forEach( other => {

      //     const image = other.image;
      //     const imagePath = other.src;

      //     image.src = imagePath;

      //     if ( isImageOK( image.element ) ) {
      //       loadedImages++;
      //       if ( loadedImages === window.simImages.length ) {
      //         console.log( 'done here')
      //       }
      //     }
      //     else {
      //       image.element.onload = () => {
      //         loadedImages++;
      //         if ( loadedImages === window.simImages.length ) {
      //           assert( isImageOK( image.element ), `error while loading image` )
      //           console.log( 'done')
      //         }
      //       }
      //     }
      //   } );
      // }




      // this.bodyNode.appendChild( loaderNode._element );




      // loaderNode.addChild( loader.addChild( inner ).addChild( outer ) );
    }

  }


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

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    // console.log( d)
    return d;
}

/**
 * Creates a path attribute data structure for SVG descriptions for a circle arc path.
 * Assumes that the path starts at angle 0. Angle 360 fills an entire circular path while 0 fills none of it.
 * For more details, see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d.
 *
 * @param {number} endAngle
 * @returns {string} - the SVG data.
 */
function getCirclePathData( endAngle ) {

  // convert to radians first
  const angleInRadians = ( angleInDegrees - 90 ) * Math.PI / 180.0;

  const outerRadius = 50 - LOADER_STROKE_WIDTH / 2;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
  const startX = polarToCartesian( 0 );
  const end = polarToCartesian( startAngle );

  /**
   * The path is described in two steps:
   *   1. Move to the start of the loader circle path.
   *   2. Create an elliptical circle arc to match the end angle.
   */
  const data = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y

  ].join( ' ' );

  return data;
}

  return Loader;
} );