// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * FlexBox is a Node sub-type that lays out its children in either a horizontal row or a vertical column, loosely
 * based off CSS flex-box layout. See https://css-tricks.com/snippets/css/a-guide-to-flexbox/ for context.
 *
 * FlexBox does differ from CSS flex-box slightly in its handling of verbose widths/heights. Rather than specifying the
 * width or height of the Node, it internally computes the dimensions of the FlexBox. As a result, FlexBox doesn't
 * ever expand into multiple lines or columns and doesn't support 'justify-content' or 'flex-wrap' equivalent styles.
 *
 * ## Terminology:
 *   - Primary axis: the axis in the same direction of as the FlexBox. For instance, if the FlexBox is a horizontally
 *                   row, the primary axis starts from the left of the first Node and ends at the right of the last.
 *   - Secondary axis: the axis in the opposite direction of the primary axis. For instance, if the FlexBox is a
 *                     horizontal row, its secondary axis starts from the bottom of its Bounds and ends at the top.
 *
 * ## Alignment:
 *   - FlexBox does contain an API to allow for alignment along the secondary axis of the FlexBox, similar to the
 *     flex-box 'align-items' style. For horizontal rows, FlexBox can align with 'top' or 'center' or 'bottom'.
 *     Similarly, for vertical columns, FlexBox can align its children 'left', 'center', or 'right'. You can also
 *     specify the spacing of the FlexBox in between its children Nodes.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  class FlexBox extends Node {

    /**
     * @param {string} orientation - the type of FlexBox: either 'horizontal' (a row) or 'vertical' (a column)
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of the FlexBox.
     *                             Contains an extended API specific to FlexBox and some super-class options are
     *                             constricted. See the code where the options are set in the early portion of the
     *                             constructor for details.
     */
    constructor( orientation, options ) {
      assert( orientation === 'horizontal' || orientation === 'vertical', `invalid orientation: ${ orientation }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'FlexBox sets attributes' );
      assert( !options || !options.width, 'FlexBox sets width' );
      assert( !options || !options.height, 'FlexBox sets height' );

      options = {

        // {number} - spacing between each Node along the primary axis. See `set spacing()` for doc.
        spacing: 0,

        // {string} - how Nodes are lined up in the secondary axis. See `set align()` for doc.
        //            If orientation is 'horizontal', align must be 'top', 'center', or 'bottom'.
        //            If orientation is 'vertical', align must be 'left', 'center', or 'right'.
        align: 'center',

        // Rewrite options so that the passed-in options overrides the defaults.
        ...options
      };
      super( options );
    }
  }

  return FlexBox;
} );