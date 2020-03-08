// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Screen represents the different sections of the simulation. When starting the simulation in Sim.js, Screens
 * instances are supplied in the config object.
 *
 * Screens have two primary arguments that are both functions that initialize the Screen's model and view respectively.
 * The function should return the Model and ScrenView instance. These are provided through functions instead of solely
 * passing in the instance to schedule work functions that are executed and animated in the loading progress circle.
 * See core-internal/Loader.js for more documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const ScrenView = require( 'SIM_CORE/core-internal/ScreenView' );


  class Screen extends DOMObject {

    /**
     * @param {Object} config - required object literal that provides configuration information for the simulation.
     *                          See the early portion of this static method for details.
     * @param {typeof Object} createModel - function that instantiates and returns the screen Model object
     * @param {function(Object):ScrenView} createView - function that instantiates and returns the screen's ScrenView
     *                                                  with the model passed as the only argument.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( config createModel, createView, options ) {
      assert( Object.getPrototypeOf( config ) === Object.prototype, `invalid config: ${ config }` );

      config = {

        // {Class.<Object>} - function that instantiates and returns the screen's Model object.
        modelGenerator: config.modelGenerator,

        // {Class.<ScrenView>} createView - function that instantiates and returns the screen's ScrenView
        //                                                 with the model passed as the only argument.
        viewGenerator: config.viewGenerator,

        // {string} - the name of the Screen, displayed in the navigation-bar.
        name: config.name,

        ...config
      };


      // Some options are set by Screen. Assert that they weren't provided.
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.style, 'Screen sets style.' );
      assert( !options || !options.type, 'Screen sets type.' );
      assert( !options || !options.text, 'Screen should not have text' );
      assert( !options || !options.id || !options.class || !options.attributes, 'Screen sets attributes' );
      assert( !options || !options.children, 'Screen sets children.' );

      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      const defaults = {

        // Custom to this class
        // {string|null} name of the Screen, as displayed to the user.
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