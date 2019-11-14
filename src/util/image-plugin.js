// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Image plugin for requirejs that allows for the dynamic loading of images in the loader.
 *
 * ## Usage
 *   1. In your requirejs config, add this file as a path.
 *   ```
 *    requirejs.config( {
 *      paths: {
 *
 *        image: '../node_modules/sim-core/src/image',
 *        ...
 *      }
 *    } );
 *   ```
 *   2. Use the plugin. For example: `const image = require( 'image!SIM_CORE/image.jpg' )`
 *
 *   If the simulation is started normally in `Sim.js`, all images will be loaded in `Loader.js`.
 *
 * ## Implementation
 *  - For the implementation of the loader, this plugin registers images into the global window object.
 *    This is referenced in `Loader.js` and dynamically loaded, allowing for the loader to load all images.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
