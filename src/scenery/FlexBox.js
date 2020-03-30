// Copyright © 2020 Brandon Li. All rights reserved.

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

      // @private {string} - The orientation of the FlexBox. See the comment at the top of the file for context.
      this._orientation = orientation;

      // @private {boolean} - Indicates if we are in the process of updating the layout of the FlexBox. Used
      //                      to reduce the number of _recomputeAncestorBounds calls while layouting.
      this._isUpdatingLayout = false;

      // @private {*} - see options declaration for documentation. Contains getters and setters. Set to null for now.
      this._spacing;
      this._align;

      // At this point, call mutate to ensure that any location setters provided are correctly mutated and our
      // properties are correctly set. in Node.mutate()
      this.mutate( options );
    }

    /**
     * ES5 getters of properties specific to FlexBox. Traditional Accessors methods aren't included to reduce the memory
     * footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get orientation() { return this._orientation; }
    get spacing() { return this._spacing; }
    get align() { return this._align; }

    /*----------------------------------------------------------------------------*
     * Mutators
     *----------------------------------------------------------------------------*/

    /**
     * Sets the spacing between each Node along the primary axis.
     * @public
     *
     * @param {number}
     */
    set spacing( spacing ) {
      if ( !this._orientation || spacing === this._spacing ) return; // Exit if setting to the same 'spacing'
      assert( typeof spacing === 'number' && spacing >= 0, `invalid spacing: ${ spacing }` );
      this._spacing = spacing;
      this._updateLayout();
    }

    /**
     * Sets the alignment of child Nodes along the secondary axis of the FlexBox.
     * @public
     *
     * For vertical column FlexBoxes, the following align values are allowed:
     * - left
     * - center
     * - right
     *
     * For horizontal row FlexBoxes, the following align values are allowed:
     * - top
     * - center
     * - bottom
     *
     * @param {string} align
     */
    set align( align ) {
      if ( !this._orientation || align === this._align ) return; // Exit if setting to the same 'align'
      assert( ( this._orientation === 'vertical' && [ 'left', 'center', 'right' ].includes( align ) )
           || ( this._orientation === 'horizontal' && [ 'top', 'center', 'bottom' ].includes( align ) ),
           `invalid align: ${ align }` );
      this._align = align;
      this._updateLayout();
    }

    /**
     * Layouts the FlexBox in the orientation that it was constructed with and matches the properties of this FlexBox.
     * Called whenever child bounds changes, alignment changes, spacing changes, or when children are added of removed.
     * @private
     *
     * NOTE: this will mutate the location of its children.
     */
    _updateLayout() {
      if ( !this._align || this._spacing === undefined ) return; // Exit if the FlexBox is degenerate.
      this._isUpdatingLayout = true; // Indicate that we are now updating our layout.

      // First step: compute the maximum width and height of the children of this FlexBox. This is used for
      //             alignment on the secondary axis.
      let maxChildWidth = 0;
      let maxChildHeight = 0;
      this.children.forEach( child => {
        if ( child.width > maxChildWidth ) maxChildWidth = child.width;
        if ( child.height > maxChildHeight ) maxChildHeight = child.height;
      } );


      // Flag that keeps track of the last Node's "position" along the primary axis, which is the 'left' of horizontal
      // FlexBoxes and the 'top' of vertical FlexBoxes
      let lastNodePosition = 0;

      // Object that maps information necessary for layouting
      // Position Key: the modifying key of the child along the primary axis
      // Alignment Key: the location key of the child along the secondary axis
      // Alignment Value: the location value of the alignment key of the child along the secondary axis
      const layoutInformation = this._orientation === 'vertical' ? {
        positionKey: 'top',
        sizeKey: 'height',
        alignmentKey: this._align === 'center' ? 'centerX' : this._align,
        alignmentValue: { left: 0, right: maxChildWidth, center: maxChildWidth / 2 }
      } : {
        positionKey: 'left',
        sizeKey: 'width',
        alignmentKey: this._align === 'center' ? 'centerY' : this._align,
        alignmentValue: { top: 0, bottom: maxChildHeight, center: maxChildHeight / 2 }
      };

      // Second step is to reposition each children along both the primary and secondary axis.
      this.children.forEach( child => {
        // position the child along the primary axis
        child[ layoutInformation.positionKey ] = lastNodePosition;

        // position the child along the secondary axis
        child[ layoutInformation.alignmentKey ] = layoutInformation.alignmentValue[ this._align ];

        // update the lastNodePosition flag to include spacing
        lastNodePosition += child[ layoutInformation.sizeKey ] + this._spacing;
      } );
      this._isUpdatingLayout = false; // Indicate that we are now done updating our layout of our children.
      super._recomputeAncestorBounds();
    }

    /**
     * @override
     * Ensures that the FlexBox is formatted when children are added.
     * @public
     *
     * @param {Node} child
     * @returns {Node} - Returns 'this' reference, for chaining
     */
    addChild( child ) {
      assert( child instanceof Node, `invalid child: ${ child }` );
      super.addChild( child );

      this._updateLayout();
      return this;
    }

    /**
     * @override
     * Called when this Node's Bounds changes due to a child's Bounds changing or when a child is added or removed.
     * Also responsible for recursively calling the method for each parent up to either the ScreenView or to the
     * point where a Node doesn't have a parent.
     * @protected
     *
     * This is overridden so that the layout of the FlexBox updates when a child changes.
     */
    _recomputeAncestorBounds() {
      if ( this._isUpdatingLayout === false ) this._updateLayout();
      super._recomputeAncestorBounds();
    }
  }

  // @protected @override {string[]} - setter names specific to FlexBox. See Node.MUTATOR_KEYS for documentation.
  FlexBox.MUTATOR_KEYS = [ 'spacing', 'align', ...Node.MUTATOR_KEYS ];

  return FlexBox;
} );