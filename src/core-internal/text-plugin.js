// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific text plugin for requirejs that allows for the dynamic loading of raw text, parsed into a string.
 *
 * ## Usage
 *   (1) In your requirejs config, add this file as a path.
 *       ```
 *       requirejs.config( {
 *         paths: {
 *           text: '../node_modules/sim-core/src/core-internal/text-plugin',
 *           ...
 *         }
 *       } );
 *       ```
 *   (2) Use the plugin syntax. For example: `const text = require( 'text!example/exam' )`
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

