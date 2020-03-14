// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Before reading the documentation of this file, it is recommended to read `./DOMObject.js` for context.
 *
 * ## General Description
 * A Display represents the true root DOMObject of the entire simulation. All Nodes, Screens, Navigation Bars, etc.
 * should be in the sub-tree of a single Display. The Display is instantiated once at the start of the sim in Sim.js.
 * Generally, Displays shouldn't be public-facing to sim-specific code. Instead, Screens should be instantiated and
 * passed to Sim.js, which will add the Screen elements to the sub-tree of Display.
 *
 * A Display will connect its the inner DOMObject element to the HTML Body element. Thus, nothing should subtype Display
 * as it should be the only DOMObject with a hard-coded parent element. In addition, the Display should never be
 * disposed of as long as the simulation is running and should never disconnected from the Body element. Display will
 * also provide CSS styles for the Body element for sim-specific code. If you are unfamiliar with the typical Body
 * and HTML elements in a global HTML file, visit https://www.w3.org/TR/html401/struct/global.html.
 *
 * ## Events
 * Currently, Display has two events that can be triggered. See the on()/off() methods for registering listeners for
 * these events. The arguments that are passed to the listeners are forwarded from the arguments (after the first
 * argument) of the trigger() method. These two events are:
 *   - resize - triggered when the browser window is resized. The width and height of the window (in pixels) are passed
 *              to registered listeners.
 *   - frame - triggered on each new frame step of the simulation. It uses requestAnimationFrame (see
 *             https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). The time since the last
 *             frame is passed to registered listeners.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const StandardSimQueryParameters = require( 'SIM_CORE/StandardSimQueryParameters' );
  const Throttle = require( 'SIM_CORE/core-internal/Throttle' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Display extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of the Display.
     *                             All options are passed to the super class. Some options of the super-class are
     *                             set by Display. See the early portion of the constructor for details.
     */
    constructor( options ) {

      // Some options are set by Display. Assert that they weren't provided.
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.style, 'Display sets style.' );
      assert( !options || !options.type, 'Display sets type.' );
      assert( !options || !options.text, 'Display should not have text' );
      assert( !options || !options.id || !options.class || !options.attributes, 'Display sets attributes' );

      options = {

        // defaults
        type: 'div',
        style: {
          height: '100%',
          width: '100%',
          fontFamily: 'Arial, sans-serif'
        },
        id: 'display',

        // Rewrite options so that the passed-in options overrides the defaults.
        ...options
      };
      super( options );

      // @private {Object} - maps event names to registered listeners. See comment at the top of the file for context.
      this._eventListeners = { 'resize': [], 'frame': [] };
    }

    /**
     * Initiates the Display, which will connect the inner DOMObject of the Display element to the HTML Body element to
     * initiate rendering of the entire scene-graph. Will also provide favorable CSS styles for the Body element. Will
     * also call initiateEvents().
     * @public
     *
     * @returns {Display} - for chaining
     */
    initiate() {

      // Retrieve the HTML element. See https://www.w3schools.com/jsref/met_document_getelementsbytagname.asp.
      const bodyElement = document.getElementsByTagName( 'body' )[ 0 ];

      // Connect the inner DOMObject element to the HTML Body element. This will render the Display's sub-graph.
      bodyElement.appendChild( this.element );

      // Reference the bodyElement as the parent of the Display.
      this._parent = bodyElement;

      // Stylize the Body element with favorable CSS styles for the simulation.
      DOMObject.addElementStyles( bodyElement, {

        // Ensure that the simulation is the full width and height in the browser window.
        maxWidth: '100%',
        maxHeight: '100%',
        height: '100%',
        width: '100%',
        padding: 0,
        margin: 0,

        // Ensure that the Display page cannot scroll and the simulation is fixed in the window.
        overflow: 'hidden',
        position: 'fixed',

        // Miscellaneous
        fontSmoothing: 'antialiased',
        touchAction: 'none', // forward all pointer events
        contentZooming: 'none',

        // Safari-on-ios
        overflowScrolling: 'touch',
        tapHighlightColor: 'rgba( 0, 0, 0, 0 )',
        touchCallout: 'none',
        userDrag: 'none'
      } );

      //----------------------------------------------------------------------------------------

      // Set up the 'resize' event. Use throttling technique to improve performance. See core-internal/Throttle.js.
      window.onresize = Throttle.throttle( () => {
        this._trigger( 'resize', window.innerWidth, window.innerHeight );
      }, StandardSimQueryParameters.resizeThrottle, true );

      // Immediately invoke the resize event.
      window.onresize();

      // Set up the 'frame' event.
      let lastStepTime = Date.now(); // flag that tracks the last time the step listener has been called.
      const stepper = () => {
        const currentTime = Date.now();
        const ellapsedTime = Util.convertFrom( currentTime - lastStepTime, Util.MILLI );
        lastStepTime = currentTime;
        this._trigger( 'frame', ellapsedTime );
        Display._requestAnimationFrame( stepper );
      };
      Display._requestAnimationFrame( stepper );

      return this;
    }

    /**
     * Registers a listener such that when the eventName is triggered, the listener is called, passing the arguments
     * (after the first argument) of the trigger() method. Use off() to unlink listeners.
     * @public
     *
     * @param {string} eventName - the name for the event channel.
     * @param {function} listener - listener that is called when the event is triggered, forwarding arguments.
     */
    on( eventName, listener ) {
      assert( eventName === 'resize' || eventName === 'frame', `invalid eventName: ${ eventName }` );
      assert( typeof listener === 'function', `invalid listener: ${ listener }` );
      this._eventListeners[ eventName ].push( listener );
      if ( eventName === 'resize' ) listener( window.innerWidth, window.innerHeight );
    }

    /**
     * Remove a registered listener (added with on()) from the specified event type.
     * @public
     *
     * @param {string} eventName - the name for the event channel.
     * @param {function} listener - listener to unlink.
     */
    off( eventName, listener ) {
      assert( eventName === 'resize' || eventName === 'frame', `invalid eventName: ${ eventName }` );
      assert( this._eventListeners[ eventName ].includes( listener ), `invalid listener: ${ listener }` );
      Util.arrayRemove( this._eventListeners[ eventName ], listener );
    }

    /**
     * Triggers an event with the specified name and arguments.
     * @private
     *
     * @param {string} eventName - the name for the event channel.
     * @param {forwardedListenerArgs...} - arguments to pass to the registered listeners of this event.
     * @public
     */
    _trigger( eventName, ...forwardedListenerArgs ) {
      assert( eventName === 'resize' || eventName === 'frame', `invalid eventName: ${ eventName }` );
      this._eventListeners[ eventName ].forEach( ( listener ) => {
        listener( ...forwardedListenerArgs );
      } );
    }
  }

  // @private {function} - scans through potential default `requestAnimationFrame` functions
  Display._requestAnimationFrame = ( window.requestAnimationFrame
                                       || window.webkitRequestAnimationFrame
                                       || window.mozRequestAnimationFrame
                                       || window.msRequestAnimationFrame
                                       || ( ( callback ) => { window.setTimeout( callback, 1000 / 60 ); } )
                                   ).bind( window );

  // @public (read-only) {boolean} - indicates if pointer events are supported for the DOM.
  Display.canUsePointerEvents = !!( window.navigator && window.navigator.pointerEnabled || window.PointerEvent );

  // @public (read-only) {boolean} - indicates if pointer events (MS specification) are supported for the DOM.
  Display.canUseMSPointerEvents = !!( window.navigator && window.navigator.msPointerEnabled );

  return Display;
} );