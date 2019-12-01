// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific image plugin for requirejs that allows for the dynamic loading of images in the loader.
 * If the simulation is started normally, all images will be loaded inside of `Loader.js` when the sim is launched.
 *
 * ## Usage
 *   (1) In your requirejs config, add this file as a path and a reference to the image directory.
 *       ```
 *       requirejs.config( {
 *         paths: {
 *
 *           image: '../node_modules/sim-core/src/util/image-plugin',
 *           IMAGES: '../images'
 *          ...
 *         }
 *       } );
 *       ```
 *   (2) Use the plugin syntax. For example: `const image = require( 'image!IMAGES/image.jpg' )`
 *
 * This plugin registers images into the global window object to be loaded later.
 * This is referenced in `Loader.js` and dynamically loaded, allowing for the loader to load all images.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  return {

    /**
     * Function that is called to load a image DOMObject when the image plugin is used.
     * For more documentation: see https://requirejs.org/docs/plugins.html#api.
     * @public
     *
     * @param {string} name - the name of the image resource to load. For example, 'image!bar' would have the name 'bar'
     * @param {function} parentRequire - local require function to load other modules. Contains many utilities.
     * @param {function} onload - function to call with the return value of the load.
     * @param {object} config - the requirejs configuration object
     */
    load( name, parentRequire, onload, config ) {

      // Reference the name as the true image src, adding the image directory and path.
      const imageSrc = parentRequire.toUrl( name );

      // Create the DOMObject to hold the image.
      const image = new DOMObject( {
        type: 'img'
      } );

      // If the image src fails to load, throw an error.
      image.element.onerror = error => {
        assert.always( false, `invalid image src: ${ image.element.src }` );
      };

      //----------------------------------------------------------------------------------------
      // Register the image into the global window object. To be loaded in `loader.js`.
      if ( !window.simImages ) {
        window.simImages = [];
      }
      window.simImages.push( {
        image,
        src: imageSrc
      } );

      // Tell requirejs to export the image.
      onload( image );
    }
  };
} );