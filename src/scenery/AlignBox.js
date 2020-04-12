// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * AlignBox is a Node sub-type that aligns a content Node within a fixed bounds, meaning the width and
 * height of the AlignBox is never changed.
 *
 * AlignBox can be used across multiple icons or content Nodes that need to take up space for visual alignment inside
 * of RadioButtons or Panels.
 *
 * AlignBox does not currently support dynamic content bounds, although there are plans to do that in the future.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  class AlignBox extends Node {

    /**
     * @param {Node} content - Node wrapped by the AlignBox
     * @param {number} fixedWidth - the fixed width of the AlignBox
     * @param {number} fixedHeight - the fixed height of the AlignBox
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     */
    constructor( content, fixedWidth, fixedHeight, options ) {
      assert( content instanceof Node, `invalid content: ${ content }` );
      assert( typeof fixedWidth === 'number', `invalid fixedWidth: ${ fixedWidth }` );
      assert( typeof fixedHeight === 'number', `invalid fixedHeight: ${ fixedHeight }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {string} - determines how the content is aligned relative to the fixed bounds: 'left', 'center', or 'right'.
        xAlign: 'center',

        // {string} - determines how the content is aligned relative to the fixed bounds: 'top', 'center', or 'bottom'.
        yAlign: 'center',

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      super( options );

      //----------------------------------------------------------------------------------------

      // Add a spacer to align ensure that the Bounds of the AlignBox is fixed.
      const spacer = new Node( { width: fixedWidth, height: fixedHeight } );

      // Strip center to centerX or centerY
      const xAlignKey = options.xAlign === 'center' ? 'centerX' : options.xAlign;
      const yAlignKey = options.yAlign === 'center' ? 'centerY' : options.yAlign;

      // Align the content relative to the spacer
      content[ xAlignKey ] = spacer[ xAlignKey ];
      content[ yAlignKey ] = spacer[ yAlignKey ];

      // Set the children of the AlignBox. Use super.addChild as our addChild method is blocked off.
      super.addChild( spacer );
      super.addChild( content );

      // Set the width and height of this Node
      this.width = fixedWidth;
      this.height = fixedHeight;

      // Apply any additional Bounds mutators
      this.mutate( options );
    }

    /**
     * @override
     * Ensures that addChild isn't called on an AlignBox.
     * @override
     * @public
     *
     * @param {Node} child
     */
    addChild( child ) { assert( false, 'cannot add children to AlignBoxes' ); }

    /**
     * @override
     * This method is called when a child's Bounds changes. In Node, this method is responsible for adjusting its
     * Bounds and recursively calling the method for each parent up the ancestor tree.
     * @protected
     *
     * Since the width and the height of this Bounds never changes, this function is overridden such that it only
     * forwards the method call to the parent.
     */
    _recomputeAncestorBounds() {
      if ( this.parent instanceof Node ) this.parent._recomputeAncestorBounds();
    }

    /**
     * Creates an AlignBox with a fixedWidth that is specified but the fixedHeight is the current height of the content.
     * @public
     *
     * @param {Node} content - Node wrapped by the AlignBox
     * @param {number} fixedWidth - the fixed width of the AlignBox
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     * @returns {AlignBox}
     */
    static withWidth( content, fixedWidth, options ) {
      return new AlignBox( content, fixedWidth, content.height, options );
    }

    /**
     * Creates an AlignBox with a fixedHeight that is specified but the fixedWidth is the current width of the content.
     * @public
     *
     * @param {Node} content - Node wrapped by the AlignBox
     * @param {number} fixedHeight - the fixed height of the AlignBox
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     * @returns {AlignBox}
     */
    static withHeight( content, fixedHeight, options ) {
      return new AlignBox( content, content.width, fixedHeight, options );
    }
  }

  return AlignBox;
} );