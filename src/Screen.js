// Copyright © 2019 Brandon Li. All rights reserved.

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

  /**
   * @param {function} createModel
   * @param {function} createView - function( model )
   * @param {Object} [options]
   */
  class Screen {

    constructor( createModel, createView, options ) {

      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {string|null} name of the sim, as displayed to the user.
        name: null,

        // {string} background color of the Screen
        background: 'white',

        ...options
      };

      // @public (read-only)
      this.name = options.name;

      // @private
      this._createModel = createModel;
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
      this._view = this._createView();
    }

    // Initialize both the model and view
    initializeModelAndView() {
      this.initializeModel();
      this.initializeView();
    }
  }

  return Screen;
} );