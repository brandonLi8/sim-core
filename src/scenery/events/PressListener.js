// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Listens to all presses and down events, such as mouse clicks and finger presses. Has an API to allow for listeners
 * to attach to both the press and the release event of Nodes.
 *
 * A typical PressListener usage would look something like:
 * ```
 *   const nodePressListener = new PressListener( someNode, {
 *     press: () => { ... },
 *     release: () => { ... }
 *   } );
 * ```
 * NOTE: A press listener will listen to when a Node is pressed. However, is the Node is being disposed of or is no
 *       longer in use, make sure to dispose of the PressListener to allow Javascript to garbage collect the
 *       PressListener. Not disposing can result in a memory leak! See the `dispose()` method.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class PressListener {

    /**
     * @param {Node|Display} node - the target Node that PressListener listens to for press events.
     * @param {Object} [options] - key-value pairs that control the functionality of the PressListener.  Subclasses
     *                             may have different options for their API. See the early portion of the constructor
     *                             for details.
     */
    constructor( node, options ) {
      assert( node instanceof Node || node instanceof Display, `invalid node: ${ node }` );
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

      // @private {Node} - the target Node that PressListener listens to for press events.
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
      if ( PressListener.canUsePointerEvents ) {

        // Add event listeners for both presses and releases via the pointer event specification, only if listeners
        // were provided.
        this._pressListener && this._targetNode.element.addEventListener( 'pointerdown', this._pressHandler );
        this._releaseListener && this._targetNode.element.addEventListener( 'pointerup', this._releaseHandler );
      }
      else if ( PressListener.canUseMSPointerEvents ) {

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
     * Disposes the press and release listeners from the targetNode's HTML element and releasing references.
     * @public
     *
     * This is the opposite of the _initiate() method.
     */
    dispose() {

      // Remove event listeners in the same order as they were added in the _initiate() method.
      if ( PressListener.canUsePointerEvents ) {
        this._pressListener && this._targetNode.element.removeEventListener( 'pointerdown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'pointerup', this._releaseHandler );
      }
      else if ( PressListener.canUseMSPointerEvents ) {
        this._pressListener && this._targetNode.element.removeEventListener( 'MSPointerDown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'MSPointerUp', this._releaseHandler );
      }
      else {
        this._pressListener && this._targetNode.element.removeEventListener( 'touchstart', this._pressHandler );
        this._pressListener && this._targetNode.element.removeEventListener( 'mousedown', this._pressHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'touchend', this._releaseHandler );
        this._releaseListener && this._targetNode.element.removeEventListener( 'mouseup', this._releaseHandler );
      }

      // Release references to ensure that the PressListener can be garbage collected.
      this._pressHandler = null;
      this._releaseHandler = null;
      this._pressListener = null;
      this._releaseListener = null;
    }
  }

  // @public (read-only) {boolean} - indicates if pointer events are supported.
  PressListener.canUsePointerEvents = !!( window.navigator && window.navigator.pointerEnabled || window.PointerEvent );

  // @public (read-only) {boolean} - indicates if pointer events (MS specification) are supported.
  PressListener.canUseMSPointerEvents = !!( window.navigator && window.navigator.msPointerEnabled ) ;

  return PressListener;
} );