// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Display represents the root DOMObject of the document object model in HTML.
 *
 * Displays have the following responsibilities:
 *  - Connects the DOMObject to the HTML Body Object.
 *  - Stylize the body and html objects for sim-specific code.
 *
 * Displays are a separate subtype of DOMObject. Nothing should subtype Display.
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
          position: 'relative'
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
        position: 'relative',
        overflow: 'hidden',
        background: '#FFF'
      } );

    }
  }

  return Display;
} );