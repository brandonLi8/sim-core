// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Before reading the documentation of this file, it is recommended to read `./DOMObject.js` for context.
 *
 * A Display represents the true root DOMObject of the entire simulation. All Nodes, Screens, Navigation Bars, etc.
 * should be in the sub-tree of a single Display. The Display is instantiated once at the start of the sim in Sim.js.
 * Generally, Displays shouldn't be public-facing to sim-specific code. Instead, Screens should be instantiated and
 * passed to Sim.js, which will add the Screen elements to the Display as children.
 *
 * A Display will connect its the inner DOMObject element to the HTML Body element. Thus, nothing should subtype Display
 * as it should be the only DOMObject with a hard-coded parent element. In addition, the Display should never be
 * disposed of as long as the simulation is running and should never disconnect from the Body element. Display will also
 * provide CSS styles for the Body element for sim-specific code. If you are unfamiliar with the typical Body
 * and HTML elements in a global HTML file, visit https://www.w3.org/TR/html401/struct/global.html.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

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
      assert( !options || !options.innerHTML && !options.text, 'Display should not have text or innerHTML' );
      assert( !options || ( !options.id && !options.class && !options.attributes ), 'Display sets attributes' );

      options = {

        // defaults
        type: 'div',
        style: {
          height: '100%',
          width: '100%',
          fontFamily: 'Arial, sans-serif'
        },
        id: 'sim-display',

        // Rewrite options so that the passed-in options overrides the defaults.
        ...options
      };
      super( options );
    }

    /**
     * Initiates the Display, which will connect its the inner DOMObject element to the HTML Body element to render
     * the entire scene-graph. Will also provide favorable CSS styles for the Body element.
     *
     * @returns {Display} - for chaining
     */
    initiate() {

      // Retrieve the HTML and BODY elements. See https://www.w3schools.com/jsref/met_document_getelementsbytagname.asp.
      const bodyElement = document.getElementsByTagName( 'body' )[ 0 ];
      const htmlElement = document.getElementsByTagName( 'html' )[ 0 ];

      // Connect the inner DOMObject element to the HTML Body element. This will render the Display's sub-graph.
      bodyElement.appendChild( this.element );

      // Reference the bodyElement as the parent of the Display.
      this._parent = bodyElement;

      // Stylize the Body element with favorable CSS styles for the simulation.
      DOMObject.addElementStyle( bodyElement, {

        // Ensure that the simulation is the full width and height in the browser window.
        maxWidth: '100%',
        maxHeight: '100%',
        height: '100%',
        width: '100%',
        padding: 0,
        margin: 0,

        // Ensure that the Display page cannot scroll and the simulation is fixed.
        overflow: 'hidden',
        position: 'fixed',

        // Miscellaneous
        fontSmoothing: 'antialiased',
        touchAction: 'none', // forward all pointer events

        // Safari-on-ios
        overflowScrolling: 'touch',
        tapHighlightColor: 'rgba( 0, 0, 0, 0 )',
        touchCallout: 'none',
        userDrag: 'none'
      } );
    }
  }

  return Display;
} );