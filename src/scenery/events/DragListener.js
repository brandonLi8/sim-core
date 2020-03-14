// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Listens to all drag-related events. Has an API to allow for listeners to attach to the 'start', 'drag', and 'end'
 * events of Dragging.
 *
 * Dragging occurs when:
 *   1. The mouse/pointer-finger is moved above the target node.
 *   2. The mouse/pointer-finger presses down on the target node. This is known as the 'start' of the drag.
 *   3. The mouse/pointer-finger, **while still pressed down**, moves to a new location. This is known as the 'drag'
 *      portion of the overall drag, and occurs each time the pointer is moved.
 *   4. The mouse/pointer-finger is released (where it is released doesn't matter).
 *
 * NOTE: Creating a new DragListener doesn't move the target node when the node is 'dragged.' However, this affect
 *       can be achieved by listening to the 'drag' portion described above. The listener will be passed the
 *       the displacement (in scenery coordinates), the cursor position (in the parent coordinate frame), and the event,
 *       to which the listener can reposition the node if desired (which won't cancel the drag event).
 *
 * NOTE: A drag listener will listen to when a Node is pressed. However, is the Node is being disposed of or is no
 *       longer in use, make sure to dispose of the DragListener to allow Javascript to garbage collect the
 *       DragListener. Not disposing can result in a memory leak! See the `dispose()` method.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const PressListener = require( 'SIM_CORE/scenery/events/PressListener' );
  const Vector = require( 'SIM_CORE/util/Vector' );
  const HoverListener = require( 'SIM_CORE/scenery/events/HoverListener' );

  class DragListener extends PressListener {

    /**
     * @param {Node} node - the target Node that DragListener listens to for drag-related events.
     * @param {Object} [options] - key-value pairs that control the functionality of the DragListener. Although
     *                             DragListener extends PressListener, ALL options are specific to this class!
     */
    constructor( node, options ) {
      assert( node instanceof Node, `invalid node: ${ node }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      // Assert that super-class options aren't provided.
      assert( !options || !options.press, 'DragListener does not have a press option.' );
      assert( !options || !options.release, 'DragListener does not have a release option.' );


      options = {

        // {function(Vector, Event)|null} - Called when the drag event starts. See the comment at the top of the file.
        start: null,

        // {function(Event)|null} - Called when the drag event ends. See the comment at the top of the file.
        end: null,

        // {function(Vector, Vector, Event)|null} - Called on each movement in the drag event, passing the displacement,
        //                                          the cursor position (parent coordinates), and the event object.
        //                                          See the comment at the top of the file for details.
        drag: null,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      assert( !options.start || typeof options.start === 'function', `invalid start: ${ options.start }` );
      assert( !options.end || typeof options.end === 'function', `invalid end: ${ options.end }` );
      assert( !options.drag || typeof options.drag === 'function', `invalid drag: ${ options.drag }` );

      super( node );

      //----------------------------------------------------------------------------------------

      // @private {function|null} - reference to the listeners that were passed in options.
      this._startListener = options.start;
      this._endListener = options.end;
      this._dragListener = options.drag;

      //----------------------------------------------------------------------------------------

      // Tell the PressListener to call the start method to start the drag. Then call _initiate to link the listener.
      this._pressListener = ( location, event ) => { this._start( location, event ); }
      this._initiate();
    }

    /**
     * The general start handler, called when drag is started. TODO doc
     * @private
     *
     * @param {Vector} location - the location the drag was started, in the parent coordinate frame.
     * @param {Event} event
     */
    _start( location, event ) {

      if ( this._startListener ) this._startListener( location, event );
      assert( event.dragHoverListener === undefined, `event already has dragged-start handled` );

      const lastDragLocation = location.copy();
      const dragDisplacement = Vector.ZERO.copy();

      // Assign a drag listener to the event object.
      event.dragHoverListener = new HoverListener( require( 'SIM_CORE/Sim' ).display, {
        movement: ( movementEvent ) => {
          if ( this._dragListener ) {
            const cursorPosition = this._getEventParentLocation( movementEvent );
            dragDisplacement.set( cursorPosition ).subtract( lastDragLocation );
            lastDragLocation.set( cursorPosition );
            this._dragListener( dragDisplacement, cursorPosition, movementEvent );
          }
        }
      } );
      event.dragPressListener = new PressListener( require( 'SIM_CORE/Sim' ).display, {
        press: ( pressEvent ) => {
          console.log( 'pres', pressEvent )
        },
        release: ( releaseEvent ) => {
          console.log(  event, releaseEvent );
          event.dragHoverListener.dispose();
          event.dragPressListener.dispose();
          this._endListener && this._endListener( releaseEvent )
        }
      } );
    }
  }

  return DragListener;
} );