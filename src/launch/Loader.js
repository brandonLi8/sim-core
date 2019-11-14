// Copyright © 2019 Brandon Li. All rights reserved.

/**
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  const DOMObject = require( 'SIM_CORE/display/DOMObject' );
  const assert = require( 'SIM_CORE/util/assert' );

  class Loader extends DOMObject {

    constructor( display ) {

      super( {

        text: 'ere',
        style: {
          background: 'rgb( 15, 15, 15 )',
          height: '100%'
        },

        id: 'loader'
      } );


      let loadedImages = 0;
      if ( window.simImages ) {

        window.simImages.forEach( other => {

          const image = other.image;
          const imagePath = other.src;

          image.src = imagePath;

          if ( isImageOK( image.element ) ) {
            loadedImages++;
            if ( loadedImages === window.simImages.length ) {
              console.log( 'done here')
            }
          }
          else {
            image.element.onload = () => {
              loadedImages++;
              if ( loadedImages === window.simImages.length ) {
                assert( isImageOK( image.element ), `error while loading image`)
                console.log( 'done')
              }
            }
          }
        } );
      }



        // style: {
        //   left: '0px',
        //   top: '0px',
        //   'transform-origin': '0 0',
        //   height: '100%',
        //   display: 'flex',
        //   'align-items': 'center',
        //   'align-content': 'center',
        //   'flex-direction': 'column',
        //   'justify-content': 'center',
        //   border: '2px solidired'
        // },
        // attributes: {
        //   width: "60px",
        //   height: "60px",
        //   viewBox: "0 0 80 80",
        //   "shape-rendering": "geometricPrecision",
        // }


      // this.bodyNode.appendChild( loaderNode._element );

      // const loader = new Node( {
      //   text: 'ere',
      //   type: 'svg',
      //   nameSpace: 'http://www.w3.org/2000/svg',

      //   attributes: {
      //     width: "60px",
      //     height: "60px",
      //     viewBox: "0 0 80 80",
      //     "shape-rendering": "geometricPrecision",
      //   }

      // } );

      // const inner = new Node( {

      //   type: 'path',
      //   attributes: {
      //     d: 'M40,10C57.351,10,71,23.649,71,40.5S57.351,71,40.5,71 S10,57.351,10,40.5S23.649,10,40.5,10z',
      //   },
      //     nameSpace: 'http://www.w3.org/2000/svg',

      //   style: {
      //     fill: "none",
      //     'stroke-width': "6px",
      //     stroke: '#C5C5C5',
      //     'stroke-dashoffset': 100,
      //     'stroke-dasharray': 192.617,
      //   }

      // })
      // const outer = new Node( {

      //   type: 'path',
      //   attributes: {
      //     d: "M40,10C57.351,10,71,23.649,71,40.5S57.351,71,40.5,71 S10,57.351,10,40.5S23.649,10,40.5,10z",
      //   },
      //     nameSpace: 'http://www.w3.org/2000/svg',

      //   style: {
      //     fill: "none",
      //     'stroke-width': '7px',
      //     stroke: '#2974b2',
      //     'stroke-dashoffset': 100,
      //     'stroke-dasharray': '0, 192.617',
      //   }

      // })

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

  return Loader;

} );