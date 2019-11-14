// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Image plugin for requirejs that allows for the dynamic loading of images in the loader.
 *
 * ## Usage
 *
 *   1. In your requirejs config, add this file as a path.
 *   ```
 *    requirejs.config( {
 *      paths: {
 *
 *        image: '../node_modules/sim-core/src/util/image-plugin',
 *        ...
 *      }
 *    } );
 *   ```
 *   2. Use the plugin. For example: `const image = require( 'image!SIM_CORE/image.jpg' )`
 *
 *   If the simulation is started normally in `Sim.js`, all images will be loaded in `Loader.js`.
 *
 *   IMPORTANT: This plugin assumes that you use your namespace path to the `src` or `js` directory to reference images.
 *              In addition, your images should be located within the `image` directory (sub paths are ok).
 *
 * ## Implementation
 *
 *  - For the implementation of the loader, this plugin registers images into the global window object.
 *    This is referenced in `Loader.js` and dynamically loaded, allowing for the loader to load all images.
 *
 *  - For more background on requirejs plugins, see https://requirejs.org/docs/plugins.html.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const DOMObject = require( 'SIM_CORE/display/DOMObject' );

  return {

    /**
     * Function that is called to load a image DOMObject when the image plugin is used.
     * For more documentation: see https://requirejs.org/docs/plugins.html#api.
     * @public
     *
     * @param {string} name - the name of the image resource to load. For instance, 'image!bar' would the name 'bar'.
     * @param {function} parentRequire - local require function to load other modules. Contains many utilities.
     * @param {function} onload - function to call with the return value of the load.
     * @param {object} config - the requirejs configuration object
     */
    load: ( name, parentRequire, onload, config ) => {

      // This plugin assumes that you use your path to the `src` or `js` directory to reference the image.
      // In addition, your images should be located within the `image` directory (sub paths are ok).
      // As a result, we reference the the image path after the namespace.
      // For example: 'SIM_CORE/types/button.jpg' turns into `types/button.jpg`;
      const imagePath = name.substring( name.indexOf( '/' ) );

      // Reference the name as the true image src, adding the image directory and path.
      const imageSrc = parentRequire.toUrl( name.substring( 0, name.indexOf( '/' ) ) ) + '/../images' + imagePath;

      //----------------------------------------------------------------------------------------
      // Create the DOMObject to hold the image.
      const image = new DOMObject( {
        type: 'img'
      } );

      // If the image src fails to load, throw an error.
      image.element.onerror = error => {
        throw new Error( `invalid image src: ${ image.element.src }` );
      };

      //----------------------------------------------------------------------------------------
      // Register the image into the global window object. To be loaded in `loader.js`.
      if ( !window.simImages ) {
        window.simImages = [];
      }
      window.simImages.push( { image, src: imageSrc } );

      // Tell requirejs to export the image.
      onload( image );
    }
  };
} );