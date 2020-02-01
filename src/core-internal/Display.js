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
 * provide CSS styles for the Body elements for sim-specific code. If you are unfamiliar with the typical Body
 * and HTML elements in a global HTML file, visit https://www.w3.org/TR/html401/struct/global.html.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  // constants


  class Display extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.
     *                             Changes the API of DOMObject. See the early portion of the constructor for details.
     */
    constructor( options ) {

      if ( options ) {
        assert( Object.getPrototypeOf( options ) === Object.prototype, `Extra prototype on Options: ${ options }` );
        assert( !options.style, 'Display sets style.' );  // This class sets the style.
        assert( !options.type, 'Display sets type.' );    // This class sets the type.
        assert( !options.innerHTML && !options.text, 'Display should be a container' );
        assert( !options.id && !options.class && !options.attributes, 'Display sets attributes' );
      }

      //----------------------------------------------------------------------------------------

      options = {
        type: 'div',

        style: {
          height: '100%',
          position: 'relative',
          fontFamily: 'Arial, sans-serif',
          display: 2
        },

        id: 'display',
        ...options
      };

      super( options );

      //----------------------------------------------------------------------------------------
      // reference the HTML and BODY objects.

      // @private {HTMLElement}
      this.bodyObject = document.getElementsByTagName( 'body' )[ 0 ];

      // @private {HTMLElement}
      this.htmlObject = document.getElementsByTagName( 'html' )[ 0 ];

      // connect this object to the Body object.
      this.bodyObject.appendChild( this.element );
      this._parent = this.bodyObject;


      //----------------------------------------------------------------------------------------
      // stylize the HTML and BODY objects

      function setStyle( element, style ) {
        Object.keys( style ).forEach( key => {
          element.style[ key ] = style[ key ];
        } );
      }

      setStyle( this.htmlObject, {
        height: '100%',
        position: 'relative',
        padding: 0,
        margin: 0
      } );

      setStyle( this.bodyObject, {
        maxWidth: '100%',   // full width and height
        maxHeight: '100%',
        height: '100%',
        width: '100%',
        padding: 0,
        margin: 0,
        position: 'fixed',
        overflow: 'hidden',
        background: '#FFF',
        overflowScrolling: 'touch',
        touchAction: 'none', // forward all pointer events
        fontSmoothing: 'antialiased',
        userDrag: 'none',
        touchCallout: 'none',
        tapHighlightColor: 'rgba( 0, 0, 0, 0 )'
      } );
    }
  }

  return Display;
} );