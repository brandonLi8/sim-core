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

        // {function(Event)|null} - Called when the drag event starts. See the comment at the top of the file.
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

      //----------------------------------------------------------------------------------------

      // @private {Node} - the target Node that DragListener listens to for drag-related events.
      this._targetNode = node;

      // @private {function|null} - reference to the listeners that were passed in options.
      this._startListener = options.start;
      this._endListener = options.end;
      this._dragListener = options.drag;

      // @private {function} - reference our internal listener handlers.
      this._startHandler = this._start.bind( this );
      this._endHandler = this._end.bind( this );
      this._dragHandler = this._drag.bind( this );

      // Initiate drag-related listeners for the target Node.
      this._initiate();
    }

    /**
     * Initiates the drag-related listeners for the targetNode's HTML element.
     * @private
     *
     * This is the opposite of the dispose() method.
     */
    _initiate() {

      // Prefer the pointer event specification. See https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events.
      if ( Display.canUsePointerEvents ) {

        // Add event listeners for both presses and releases via the pointer event specification, only if listeners
        // were provided.
        this._pressListener && this._targetNode.element.addEventListener( 'pointerdown', this._pressHandler );
        this._releaseListener && this._targetNode.element.addEventListener( 'pointerup', this._releaseHandler );
      }
      else if ( Display.canUseMSPointerEvents ) {

        // Add event listeners for both presses and releases via the MS pointer event specification, only if listeners
        // were provided.
        this._pressListener && this._targetNode.element.addEventListener( 'MSPointerDown', this._pressHandler );
        this._releaseListener && this._targetNode.element.addEventListener( 'MSPointerUp', this._releaseHandler );
      }
      else {

        // Otherwise, if pointer events are not supported, resort to the touchstart (mobile) and mousedown (mouse-click)
        // specification. Both listeners are added to support devices that are both touchscreen and on mouse and
        // keyboard.
        this._pressListener && this._targetNode.element.addEventListener( 'touchstart', this._pressHandler );
        this._pressListener && this._targetNode.element.addEventListener( 'mousedown', this._pressHandler );

        this._releaseListener && this._targetNode.element.addEventListener( 'touchend', this._releaseHandler );
        this._releaseListener && this._targetNode.element.addEventListener( 'mouseup', this._releaseHandler );
      }
    }

    /**
     * The general press handler, called when press down event occurs, such as a finger press or a mouse click.
     * If called, assumes that there is a press listener.
     * @protected
     *
     * This can be overridden (with super-calls) when custom press behavior is needed for a sub-type.
     *
     * @param {Event} event
     */
    _press( event ) {
      assert( event, `invalid event: ${ event }` );

      // Assign a `pressHandled` flag field in the event object. This is done so that the same event isn't 'pressed'
      // twice, particularly in devices that register both a 'mouse-down' and a 'touchstart'. This `pressHandled`
      // field is undefined in the event, but set to true in this method.
      if ( event.pressHandled !== undefined ) return; // If the field is defined, the event has already been handled.
      event.pressHandled = true; // Set the pressHandled event to true in case the _press is called with the same event.

      // Prevents further propagation of the current event into ancestors in the scene graph.
      event.stopPropagation();

      // Prevents the default action from taken place if the event isn't handled.
      event.preventDefault();

      // Call the pressListener of this Listener.
      this._pressListener( this._getEventParentLocation( event ), event );
    }

    /**
     * The general release handler, called when press release event occurs, such as a finger release or a mouse release.
     * If called, assumes that there is a release listener. Will only fire if the pointer release occurs on top of the
     * Node.
     * @protected
     *
     * This can be overridden (with super-calls) when custom release behavior is needed for a sub-type.
     *
     * @param {Event} event
     */
    _release( event ) {
      assert( event, `invalid event: ${ event }` );

      // Assign a `releaseHandled` flag field in the event object. This is done so that the same event isn't 'released'
      // twice, particularly in devices that register both a 'mouse-up' and a 'touchend'. This `releaseHandled`
      // field is undefined in the event, but set to true in this method.
      if ( event.releaseHandled !== undefined ) return;
      event.releaseHandled = true;

      // Prevents further propagation of the current event into ancestors in the scene graph.
      event.stopPropagation();

      // Prevents the default action from taken place if the event isn't handled.
      event.preventDefault();

      // Call the releaseListener of this Listener.
      this._releaseListener( event );
    }

    /**
     * Gets where an event took place, in the browsers window coordinate frame.
     * @protected
     *
     * @param {Event} event
     * @returns {Vector}
     */
    _getEventWindowLocation( event ) {
      return new Vector(
        event.clientX !== undefined ? event.clientX : event.touches[ 0 ].clientX,
        event.clientY !== undefined ? event.clientY : event.touches[ 0 ].clientY
      );
    }

    /**
     * Gets where an event took place, in the targetNode's parent coordinate frame.
     * @protected
     *
     * @param {Event} event
     * @returns {Vector}
     */
    _getEventParentLocation( event ) {

      // First compute the target Node's window coordinates in pixels.
      const nodeWindowBounds = this._targetNode.element.getBoundingClientRect();

      // Get where the event took place in the window coordinate frame.
      const windowPressLocation = this._getEventWindowLocation( event );

      // Using the window press location, subtract the top-left of the Node's window bounds and divide by the
      // screenViewScale to get the location of the event in the target Node's local coordinate system.
      const nodeLocalPressLocation = windowPressLocation
                                      .subtractXY( nodeWindowBounds.x, nodeWindowBounds.y )
                                      .divide( this._targetNode.screenViewScale );

      // Convert the location to the target Node's parent coordinate system.
      return this._targetNode.topLeft.add( nodeLocalPressLocation );
    }

    /**
     * Disposes the drag-related listeners from the targetNode's HTML element and releasing references.
     * @public
     *
     * This is the opposite of the _initiate() method.
     */
    dispose() {

      // Remove event listeners in the same order as they were added in the _initiate() method.
      if ( Display.canUsePointerEvents ) {
        this._pressListener && this._targetNode.element.removeEventListener( 'pointerdown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'pointerup', this._releaseHandler );
      }
      else if ( Display.canUseMSPointerEvents ) {
        this._pressListener && this._targetNode.element.removeEventListener( 'MSPointerDown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'MSPointerUp', this._releaseHandler );
      }
      else {
        this._pressListener && this._targetNode.element.removeEventListener( 'touchstart', this._pressHandler );
        this._pressListener && this._targetNode.element.removeEventListener( 'mousedown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'touchend', this._releaseHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'mouseup', this._releaseHandler );
      }

      // Release references to ensure that the DragListener can be garbage collected.
      this._pressHandler = null;
      this._releaseHandler = null;
      this._pressListener = null;
      this._releaseListener = null;
    }
  }

  return DragListener;
} );