// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Listens to all hover-related events on top of a Node, such as pointer hovers and pointer movements.
 *
 * ## Description of Hover Events:
 *    - Hovers - Hovers occur when a user places a mouse over a Node, but not when the mouse is pressed down. Generally,
 *               hovers are exclusive to desktop-like devices that use a mouse, and don't trigger on purely touch-screen
 *               devices. HoverListener contains an API to listen to both the entering and leaving portions of hovering.
 *
 *    - Movements - Movements occur when a user moves a mouse over a Node. Movements on mobile occur when moving a
 *                  touch pointer across the touch surface. Unlike Drag events, these movements stop as soon as the
 *                  mouse/pointer exits the Node.

 * A typical HoverListener usage would look something like:
 * ```
 *   const nodeHoverListener = new HoverListener( someNode, {
 *     enter: () => { ... },
 *     release: () => { ... },
 *     movement: () => { ... }
 *   } );
 * ```
 * NOTE: A hover listener will add listeners to the Node. However, if the Node is being disposed of or is no
 *       longer in use, make sure to dispose of the HoverListener to allow Javascript to garbage collect the
 *       HoverListener. Not disposing can result in a memory leak! See the `dispose()` method.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class HoverListener {

    /**
     * @param {Node} node - the target Node that HoverListener listens to for press events.
     * @param {Object} [options] - key-value pairs that control the functionality of the HoverListener.  Subclasses
     *                             may have different options for their API. See the early portion of the constructor
     *                             for details.
     */
    constructor( node, options ) {
      assert( node instanceof Node, `invalid node: ${ node }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {function(Vector, Event)|null} - Called when the press down (mouse-down) event is fired, or, in other words,
        //                                  when the Node is pressed, with the press location (parent-coordinate) passed
        press: null,

        // {function(Event)|null} - Called when the press release (mouse-up) event is fired. Will only fire if the
        //                          pointer release occurs on top of the Node.
        release: null,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      assert( !options.press || typeof options.press === 'function', `invalid press: ${ options.press }` );
      assert( !options.release || typeof options.release === 'function', `invalid release: ${ options.release }` );

      //----------------------------------------------------------------------------------------

      // @private {Node} - the target Node that HoverListener listens to for press events.
      this._targetNode = node;

      // @private {function|null} - reference to the press down and release listeners that were passed in options.
      this._pressListener = options.press;
      this._releaseListener = options.release;

      // @private {function} - reference our internal press and release handlers.
      this._pressHandler = this._press.bind( this );
      this._releaseHandler = this._release.bind( this );

      // Initiate press and release listeners for the target Node.
      this._initiate();
    }

    /**
     * Initiates the press and release listeners for the targetNode's HTML element.
     * @private
     *
     * This is the opposite of the dispose() method.
     */
    _initiate() {

      // Prefer the pointer event specification. See https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events.
      if ( HoverListener.canUsePointerEvents ) {

        // Add event listeners for both presses and releases via the pointer event specification, only if listeners
        // were provided.
        this._pressListener && this._targetNode.element.addEventListener( 'pointerdown', this._pressHandler );
        this._releaseListener && this._targetNode.element.addEventListener( 'pointerup', this._releaseHandler );
      }
      else if ( HoverListener.canUseMSPointerEvents ) {

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
      if ( !!event.pressHandled ) return; // If the field is defined, the event has already been handled, so do nothing.
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
      if ( !!event.releaseHandled ) return;
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
        !!event.clientX ? event.clientX : event.touches[ 0 ].clientX,
        !!event.clientY ? event.clientY : event.touches[ 0 ].clientY
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
     * Disposes the press and release listeners from the targetNode's HTML element and releasing references.
     * @public
     *
     * This is the opposite of the _initiate() method.
     */
    dispose() {

      // Remove event listeners in the same order as they were added in the _initiate() method.
      if ( HoverListener.canUsePointerEvents ) {
        this._pressListener && this._targetNode.element.removeEventListener( 'pointerdown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'pointerup', this._releaseHandler );
      }
      else if ( HoverListener.canUseMSPointerEvents ) {
        this._pressListener && this._targetNode.element.removeEventListener( 'MSPointerDown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'MSPointerUp', this._releaseHandler );
      }
      else {
        this._pressListener && this._targetNode.element.removeEventListener( 'touchstart', this._pressHandler );
        this._pressListener && this._targetNode.element.removeEventListener( 'mousedown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'touchend', this._releaseHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'mouseup', this._releaseHandler );
      }

      // Release references to ensure that the HoverListener can be garbage collected.
      this._pressHandler = null;
      this._releaseHandler = null;
      this._pressListener = null;
      this._releaseListener = null;
    }
  }

  // @public (read-only) {boolean} - indicates if pointer events are supported.
  HoverListener.canUsePointerEvents = !!( window.navigator && window.navigator.pointerEnabled || window.PointerEvent );

  // @public (read-only) {boolean} - indicates if pointer events (MS specification) are supported.
  HoverListener.canUseMSPointerEvents = !!( window.navigator && window.navigator.msPointerEnabled ) ;

  return HoverListener;
} );