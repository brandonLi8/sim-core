// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Listens to all hover-related events on top of a Node, such as pointer hovers and pointer movements.
 *
 * ## Description of Hover Events:
 *    - Enters - Occurs when a user moves a un-pressed mouse or a pressed pointer/finger over and into a Node. The event
 *               only fires ONCE each time a pointer is moved into the Node.
 *
 *    - Exits - Occurs when a user moves a un-pressed mouse or a pressed pointer/finger from the Node to out of the
 *              Node. The event only fires ONCE each time a pointer is moved out of the Node.
 *
 *    - Movements - Movements occur each time a user moves a mouse over a Node. Movements on mobile occur when moving a
 *                  touch pointer across the touch surface. Unlike Drag events, these movements stop as soon as the
 *                  mouse/pointer exits the Node.

 * A typical HoverListener usage would look something like:
 * ```
 *   const nodeHoverListener = new HoverListener( someNode, {
 *     enter: () => { ... },
 *     exit: () => { ... },
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
  const Display = require( 'SIM_CORE/scenery/Display' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class HoverListener {

    /**
     * @param {Node|Display} node - the target Node that HoverListener listens to for hover-related events.
     * @param {Object} [options] - key-value pairs that control the functionality of the HoverListener. Subclasses
     *                             may have different options for their API. See the early portion of the constructor
     *                             for details.
     */
    constructor( node, options ) {
      assert( node instanceof Node || node instanceof Display, `invalid node: ${ node }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {function(Event)|null} - Called once when the mouse enters the hover state (see comment at the top).
        enter: null,

        // {function(Event)|null} - Called once when the mouse leaves the hover state (see comment at the top).
        exit: null,

        // {function(Event)|null} - Called when mouse or pressed pointer moves over the node (see comment at the top).
        movement: null,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      assert( !options.enter || typeof options.enter === 'function', `invalid enter: ${ options.enter }` );
      assert( !options.exit || typeof options.exit === 'function', `invalid exit: ${ options.exit }` );
      assert( !options.movement || typeof options.movement === 'function', `invalid movement: ${ options.movement }` );

      //----------------------------------------------------------------------------------------

      // @private {Node} - the target Node that HoverListener listens to for hover-related events.
      this._targetNode = node;

      // @private {function|null} - reference to the hover-related listeners that were passed in options.
      this._enterListener = options.enter;
      this._exitListener = options.exit;
      this._movementListener = options.movement;

      // @private {function} - reference our internal handlers.
      this._enterHandler = this._enter.bind( this );
      this._exitHandler = this._exit.bind( this );

      // Initiate enter and exit listeners for the target Node.
      this._initiate();
    }

    /**
     * Initiates the enter and exit listeners for the targetNode's HTML element.
     * @private
     *
     * This is the opposite of the dispose() method.
     */
    _initiate() {

      // Prefer the pointer event specification. See https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events.
      if ( HoverListener.canUsePointerEvents ) {

        // Add event listeners for both presses and releases via the pointer event specification, only if listeners
        // were provided.
        this._enterListener && this._targetNode.element.addEventListener( 'pointerdown', this._enterHandler );
        this._exitListener && this._targetNode.element.addEventListener( 'pointerup', this._exitHandler );
      }
      else if ( HoverListener.canUseMSPointerEvents ) {

        // Add event listeners for both presses and releases via the MS pointer event specification, only if listeners
        // were provided.
        this._enterListener && this._targetNode.element.addEventListener( 'MSPointerDown', this._enterHandler );
        this._exitListener && this._targetNode.element.addEventListener( 'MSPointerUp', this._exitHandler );
      }
      else {

        // Otherwise, if pointer events are not supported, resort to the touchstart (mobile) and mousedown (mouse-click)
        // specification. Both listeners are added to support devices that are both touchscreen and on mouse and
        // keyboard.
        this._enterListener && this._targetNode.element.addEventListener( 'touchstart', this._enterHandler );
        this._enterListener && this._targetNode.element.addEventListener( 'mousedown', this._enterHandler );

        this._exitListener && this._targetNode.element.addEventListener( 'touchend', this._exitHandler );
        this._exitListener && this._targetNode.element.addEventListener( 'mouseup', this._exitHandler );
      }
    }

    /**
     * The general enter handler, called when enter down event occurs, such as a finger enter or a mouse click.
     * If called, assumes that there is a enter listener.
     * @protected
     *
     * This can be overridden (with super-calls) when custom enter behavior is needed for a sub-type.
     *
     * @param {Event} event
     */
    _enter( event ) {
      assert( event, `invalid event: ${ event }` );

      // Assign a `pressHandled` flag field in the event object. This is done so that the same event isn't 'pressed'
      // twice, particularly in devices that register both a 'mouse-down' and a 'touchstart'. This `pressHandled`
      // field is undefined in the event, but set to true in this method.
      if ( !!event.pressHandled ) return; // If the field is defined, the event has already been handled, so do nothing.
      event.pressHandled = true; // Set the pressHandled event to true in case the _enter is called with the same event.

      // Prevents further propagation of the current event into ancestors in the scene graph.
      event.stopPropagation();

      // Prevents the default action from taken place if the event isn't handled.
      event.preventDefault();

      // Call the pressListener of this Listener.
      this._enterListener( this._getEventParentLocation( event ), event );
    }

    /**
     * The general exit handler, called when enter exit event occurs, such as a finger exit or a mouse exit.
     * If called, assumes that there is a exit listener. Will only fire if the pointer exit occurs on top of the
     * Node.
     * @protected
     *
     * This can be overridden (with super-calls) when custom exit behavior is needed for a sub-type.
     *
     * @param {Event} event
     */
    _exit( event ) {
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
      this._exitListener( event );
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

      // Using the window enter location, subtract the top-left of the Node's window bounds and divide by the
      // screenViewScale to get the location of the event in the target Node's local coordinate system.
      const nodeLocalPressLocation = windowPressLocation
                                      .subtractXY( nodeWindowBounds.x, nodeWindowBounds.y )
                                      .divide( this._targetNode.screenViewScale );

      // Convert the location to the target Node's parent coordinate system.
      return this._targetNode.topLeft.add( nodeLocalPressLocation );
    }

    /**
     * Disposes the enter and exit listeners from the targetNode's HTML element and releasing references.
     * @public
     *
     * This is the opposite of the _initiate() method.
     */
    dispose() {

      // Remove event listeners in the same order as they were added in the _initiate() method.
      if ( HoverListener.canUsePointerEvents ) {
        this._enterListener && this._targetNode.element.removeEventListener( 'pointerdown', this._enterHandler );
        this._exitListener && this._targetNode.element.removeEventListener( 'pointerup', this._exitHandler );
      }
      else if ( HoverListener.canUseMSPointerEvents ) {
        this._enterListener && this._targetNode.element.removeEventListener( 'MSPointerDown', this._enterHandler );
        this._exitListener && this._targetNode.element.removeEventListener( 'MSPointerUp', this._exitHandler );
      }
      else {
        this._enterListener && this._targetNode.element.removeEventListener( 'touchstart', this._enterHandler );
        this._enterListener && this._targetNode.element.removeEventListener( 'mousedown', this._enterHandler );
        this._exitListener && this._targetNode.element.removeEventListener( 'touchend', this._exitHandler );
        this._exitListener && this._targetNode.element.removeEventListener( 'mouseup', this._exitHandler );
      }

      // Release references to ensure that the HoverListener can be garbage collected.
      this._enterHandler = null;
      this._exitHandler = null;
      this._enterListener = null;
      this._exitListener = null;
    }
  }

  // @public (read-only) {boolean} - indicates if pointer events are supported.
  HoverListener.canUsePointerEvents = !!( window.navigator && window.navigator.pointerEnabled || window.PointerEvent );

  // @public (read-only) {boolean} - indicates if pointer events (MS specification) are supported.
  HoverListener.canUseMSPointerEvents = !!( window.navigator && window.navigator.msPointerEnabled ) ;

  return HoverListener;
} );