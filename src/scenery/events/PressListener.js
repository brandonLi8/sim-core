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

  }

  // @public (read-only) {boolean} - indicates if pointer events are supported.
  PressListener.canUsePointerEvents = !!( window.navigator && window.navigator.pointerEnabled || window.PointerEvent );

  // @public (read-only) {boolean} - indicates if pointer events (MS specification) are supported.
  PressListener.canUseMSPointerEvents = !!( window.navigator && window.navigator.msPointerEnabled ) ;

  return PressListener;
} );