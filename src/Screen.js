// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Screen represents different sections of the simulation.
 *
 * When creating a new Sim, instances of Screens are supplied as the arguments.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );


  class Screen extends DOMObject {

    /**
     * @param {function} createModel
     * @param {function} createView - function( model )
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( createView, options ) {

      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      const defaults = {

        // Custom to this class
        // {string|null} name of the sim, as displayed to the user.
        name: null,

        // Passed to the superclass
        style: {
          width: '100%',
          top: 0,
          background: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center'
        }
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };

      super( options );

      // @public (read-only)
      this.name = options.name;

      // @private
      // this._createModel = createModel;
      this._createView = createView;

      // Construction of the model and view are delayed and controlled to enable features like
      // a) faster loading when only loading certain screens
      // b) showing a loading progress bar <not implemented>
      this._model = null; // @private
      this._view = null;  // @private
    }

    /**
     * Initialize the model.  Clients should use either this or initializeModelAndView
     * Clients may want to use this method to gain more control over the creation process
     * @public
     */
    initializeModel() {
      assert( this._model === null, 'there was already a model' );
      this._model = this._createModel();
    }

    /**
     * Initialize the view.  Clients should use either this or initializeModelAndView
     * Clients may want to use this method to gain more control over the creation process
     * @public
     */
    initializeView() {
      assert( this._view === null, 'there was already a model' );
      // assert( this._model !== null, 'model must be created first' );
      this._view = this._createView( );

      this.addChild( this._view );
    }

    // Initialize both the model and view
    initializeModelAndView() {
      // this.initializeModel();
      this.initializeView();
    }
  }

  return Screen;
} );