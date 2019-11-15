// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A DOMObject that displays a loading page and loads all the images of the simulation.
 *
 * Uses registered images from the global window object (see ../util/image-plugin) and loads all images synchronously.
 * Shows a progress in a loading circle bar to show the progress of loading images.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/display/DOMObject' );

  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';
  const LOADER_BOX_SIZE = 100; // in pixels
  const BACKGROUND_COLOR = 'rgb( 15, 15, 15 )';
  const LOADER_STROKE_WIDTH = 6; // in pixels

  class Loader extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      if ( options ) {
        // changes to the API means excluding some of the options.
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
          // background: BACKGROUND_COLOR,
          height: '100%',
          display: 'flex', // use a centered flex box to center the loader
          'align-items': 'center',
          'align-content': 'center',
          'justify-content': 'center'
        },

        ...options
      };

      //----------------------------------------------------------------------------------------
      // Create the Loader content DOM using SVG.
      // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg

      // Create the container of the loader circles
      const loaderCircleContainer = new DOMObject( {
        type: 'svg',
        namespace: XML_NAMESPACE,
        attributes: {
          viewBox: '0 0 100 100', // Create a relative unit in terms of percent for the children
          'shape-rendering': 'geometricPrecision',
        },
        style: {
          width: LOADER_BOX_SIZE,   // size the loader in terms of the constant flag
          height: LOADER_BOX_SIZE,  // size the loader in terms of the constant flag
          background: 'white'
        }
      } );

      // To create the loading circle, we overlay 2 circles on top of each other.
      // Create the circle in the background. The circle has no fill but has a stroke.
      const backgroundCircle = new DOMObject( {
        type: 'circle',
        namespace: XML_NAMESPACE,
        attributes: {
          r: 50 - LOADER_STROKE_WIDTH / 2,
          cx: 50,
          cy: 50,
          fill: 'none',
          'stroke-width': LOADER_STROKE_WIDTH,
          stroke: '#C5C5C5' // light colored
        },
        style: {
          'stroke-dashoffset': 100,
        }
      } );

      const foregroundCircle = new DOMObject( {
        type: 'path',
        namespace: XML_NAMESPACE,
        style: {
          fill: 'none',
          'stroke-width': LOADER_STROKE_WIDTH,
          stroke: '#2974b2'
        }
      } );


      loaderCircleContainer.setChildren( [ backgroundCircle, foregroundCircle ] );


      foregroundCircle.setAttribute( 'd', describeArc(50, 50, 50 - LOADER_STROKE_WIDTH / 2, 0, 230 ) )
      //----------------------------------------------------------------------------------------
      // Set up the DOM of the Loader
      options.children = [ loaderCircleContainer ];

      super( options );

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

    return d;
}
  return Loader;

} );