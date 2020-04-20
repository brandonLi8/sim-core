// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Screen represents the different sections of the simulation. The different screens can be seen at the navigation bar
 * at the bottom of the Sim. When starting the simulation (in Sim.js), Screens instances are supplied in the config
 * object.
 *
 * Screens instantiate its Model and View Objects respectively inside of functions, with the Class itself passed in the
 * config parameter. This is done instead of solely passing in an instance of the Objects to schedule work functions
 * that are executed in the Loader. Each task function that is completed is animated in the loading progress circle.
 * See core-internal/Loader.js for more documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );

  class Screen extends DOMObject {

    /**
     * @param {Object} config - required object literal that provides configuration information for the simulation.
     *                          See the early portion of this static method for details.
     */
    constructor( config ) {
      assert( Object.getPrototypeOf( config ) === Object.prototype, `invalid config: ${ config }` );

      config = {

        // {Class.<Object>} - the **class** (not instance) of the Model Object of the Screen. This class is instantiated
        //                    in the Screen class (see doc at the top of this file for the reason) with no arguments.
        model: config.model,

        // {Class.<Object>} - the **class** (not instance) of the ScrenView of the Screen. This class is instantiated in
        //                    the Screen class (see doc at the top of this file for the reason), passing in the Model
        //                    as the only argument.
        view: config.view,

        // {string} - the name of the Screen, displayed in the navigation-bar.
        name: config.name,

        // {string} (optional) - the icon of the Screen, displayed in the navigation-bar.
        icon: config.icon,

        // {string} (optional) - the background color of the Screen behind the ScrenView
        background: config.background || 'white',

        ...config
      };

      // If assertions were enabled with ?ea, check that the config Object that was passed in is correct.
      if ( assert.enabled ) {
        assert( config.model && !!config.model.constructor, `invalid config.model: ${ config.model }` );
        assert( config.view && !!config.view.constructor && config.view.prototype instanceof ScreenView,
          `invalid config.view: ${ config.view }` );
        assert( typeof config.name === 'string', `invalid config.name: ${ config.name }` );
        assert( typeof config.background === 'string', `invalid config.background: ${ config.background }` );
      }

      //----------------------------------------------------------------------------------------

      super( {
        style: {
          width: '100%',
          top: 0,
          background: config.background,
          display: 'flex', // Create a Flex-box to center the ScreenView.
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center'
        }
      } );

      // @public (read-only) {string} - the name of the Screen.
      this.name = config.name;

      // @public (read-only) {Node} - the icon of the Screen.
      this.icon = config.icon;

      // @public (read-only) {ScreenView} view - the view of the Screen. To be set in start().
      this.view;

      // @public (read-only) {Class.<Object>} model - the model of the Screen. To be set in start().
      this.model;

      // @private {Object} - reference to the passed in config Object.
      this._config = config;
    }

    /**
     * Initialize both the Screen's model and view classes, and adds the view as a child to render the Screen.
     * @public
     *
     * See the comment at the top of this file for documentation of why these objects are instantiated here.
     * In essence, this method is the work function that should be executed in the Loader, and signals a percentage
     * amount closer to finishing the loading portion of the simulation.
     *
     * @param {Display} display - the display to add the ScreenView to as a child to be rendered. Sim.js will adjust
     *                            visibility based on what is selected in the navigation-bar.
     */
    start( display ) {

      // First create and instantiate the model.
      this.model = new this._config.model();

      // Create the view and pass the model in.
      this.view = new this._config.view( this.model );

      // Add the view as a child to render the Screen.
      display.addChild( this.addChild( this.view ) );
    }
  }

  return Screen;
} );