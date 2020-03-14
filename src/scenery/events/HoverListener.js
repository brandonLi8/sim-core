// Copyright © 2019-2020 Brandon Li. All rights reserved.

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
 *                  HoverListener will use a throttling technique to improve performance. See core-internal/Throttle.js
 *
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
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Throttle = require( 'SIM_CORE/core-internal/Throttle' );

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

        // {number} - throttle amount for the movement listener. See comment at the top of this file for documentation
        //            on how throttling works. This specific option controls the timeout time for timeout calls.
        movementThrottle: 15,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      assert( !options.enter || typeof options.enter === 'function', `invalid enter: ${ options.enter }` );
      assert( !options.exit || typeof options.exit === 'function', `invalid exit: ${ options.exit }` );
      assert( !options.movement || typeof options.movement === 'function', `invalid movement: ${ options.movement }` );
      assert( typeof options.movementThrottle === 'number', `invalid movementThrottle: ${ options.movementThrottle }` );

      //----------------------------------------------------------------------------------------

      // @private {HTMLElment} - the target Node element that HoverListener listens to for hover-related events.
      this._targetElement = node.element;

      // @private {function|null} - reference to the hover-related listeners that were passed in options.
      this._enterListener = options.enter;
      this._exitListener = options.exit;
      this._movementListener = options.movement;

      // @private {function} - reference our internal handlers.
      this._enterHandler = this._enter.bind( this );
      this._exitHandler = this._exit.bind( this );
      this._movementHandler = Throttle.throttle( this._move.bind( this ), options.movementThrottle );

      // Initiate hover-related listeners for the target Node.
      this._initiate();
    }

    /**
     * Initiates the hover-related listeners for the targetNode's HTML element.
     * @private
     *
     * This is the opposite of the dispose() method.
     */
    _initiate() {

      // Prefer the pointer event specification. See https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events.
      if ( Display.canUsePointerEvents ) {

        // Add event listeners for all 3 events via the pointer event specification, only if listeners  were provided.
        this._enterListener && this._targetElement.addEventListener( 'pointerover', this._enterHandler );
        this._exitListener && this._targetElement.addEventListener( 'pointerout', this._exitHandler );
        this._movementListener && this._targetElement.addEventListener( 'pointermove', this._movementHandler );
      }
      else if ( Display.canUseMSPointerEvents ) {

        // Add event listeners for all 3 events via the MS pointer event specification, only if listeners were provided.
        this._enterListener && this._targetElement.addEventListener( 'MSPointerOver', this._enterHandler );
        this._exitListener && this._targetElement.addEventListener( 'MSPointerOut', this._exitHandler );
        this._movementListener && this._targetElement.addEventListener( 'MSPointerMove', this._movementHandler );
      }
      else {

        // Otherwise, if pointer events are not supported, resort to the touch and mouse event API specification.
        // Both specifications are added to support devices that are both touchscreen and on mouse and keyboard.
        this._enterListener && this._targetElement.addEventListener( 'mouseover', this._enterHandler );
        this._exitListener && this._targetElement.addEventListener( 'mouseout', this._exitHandler );
        this._movementListener && this._targetElement.addEventListener( 'mousemove', this._movementHandler );
        this._movementListener && this._targetElement.addEventListener( 'touchmove', this._movementHandler );
      }
    }

    /**
     * The general enter handler, called when hover enter event occurs (see the comment at the top of the file).
     * If called, assumes that there is a enter listener.
     * @private
     *
     * @param {Event} event
     */
    _enter( event ) {
      assert( event, `invalid event: ${ event }` );

      // Prevents further propagation of the current event into ancestors in the scene graph.
      event.stopPropagation();

      // Prevents the default action from taken place if the event isn't handled.
      event.preventDefault();

      // Call the enterListener of this Listener.
      this._enterListener( event );
    }

    /**
     * The general exit handler, called when hover exit event occurs (see the comment at the top of the file).
     * If called, assumes that there is a exit listener.
     * @private
     *
     * @param {Event} event
     */
    _exit( event ) {
      assert( event, `invalid event: ${ event }` );

      // Prevents further propagation of the current event into ancestors in the scene graph.
      event.stopPropagation();

      // Prevents the default action from taken place if the event isn't handled.
      event.preventDefault();

      // Call the exitListener of this Listener.
      this._exitListener( event );
    }

    /**
     * The general movement handler, called when hover movement event occurs (see the comment at the top of the file).
     * If called, assumes that there is a movement listener. Should be called with a throttle technique implementation.
     * @private
     *
     * @param {Event} event
     */
    _move( event ) {
      assert( event, `invalid event: ${ event }` );

      // Prevents further propagation of the current event into ancestors in the scene graph.
      event.stopPropagation();

      // Prevents the default action from taken place if the event isn't handled.
      event.preventDefault();

      // Call the movementListener of this Listener.
      this._movementListener( event );
    }

    /**
     * Disposes the hover-related listeners from the targetNode's HTML element and releasing references.
     * @public
     *
     * This is the opposite of the _initiate() method.
     */
    dispose() {

      // Remove event listeners in the same order as they were added in the _initiate() method.
      if ( Display.canUsePointerEvents ) {
        this._enterListener && this._targetElement.removeEventListener( 'pointerover', this._enterHandler );
        this._exitListener && this._targetElement.removeEventListener( 'pointerout', this._exitHandler );
        this._movementListener && this._targetElement.removeEventListener( 'pointermove', this._movementHandler );
      }
      else if ( Display.canUseMSPointerEvents ) {
        this._enterListener && this._targetElement.removeEventListener( 'MSPointerOver', this._enterHandler );
        this._exitListener && this._targetElement.removeEventListener( 'MSPointerOut', this._exitHandler );
        this._movementListener && this._targetElement.removeEventListener( 'MSPointerMove', this._movementHandler );
      }
      else {
        this._enterListener && this._targetElement.removeEventListener( 'mouseover', this._enterHandler );
        this._exitListener && this._targetElement.removeEventListener( 'mouseout', this._exitHandler );
        this._movementListener && this._targetElement.removeEventListener( 'mousemove', this._movementHandler );
        this._movementListener && this._targetElement.removeEventListener( 'touchmove', this._movementHandler );
      }

      // Release references to ensure that the HoverListener can be garbage collected.
      this._enterHandler = null;
      this._exitHandler = null;
      this._movementHandler = null;
      this._enterListener = null;
      this._exitListener = null;
      this._movementListener = null;
    }
  }

  return HoverListener;
} );