// Copyright © 2019 Brandon Li. All rights reserved.
/* eslint no-console: 0 */

/**
 * Main class encapsulation for a simulation. Provides:
 *  - Sim Query Parameters
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const FPSCounter = require( 'SIM_CORE/core-internal/FPSCounter' );
  const Loader = require( 'SIM_CORE/core-internal/Loader' );
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );
  const Util = require( 'SIM_CORE/util/Util' );
  const NavigationBar = require( 'SIM_CORE/core-internal/NavigationBar' );
  const Screen = require( 'SIM_CORE/Screen' );

  // constants
  const PACKAGE_OBJECT = JSON.parse( require( 'text!REPOSITORY/package.json' ) );
  const SIM_CORE_QUERY_PARAMETERS = QueryParameters.retrieve( {

    /**
     * Enables assertions, which are disable unless this parameter is provided.
     * See './util/assert.js' for more details.
     * For internal testing only.
     */
    ea: {
      type: 'flag'
    },

    /**
     * Disables the fps in the top left is provided.
     * See './core-internal/FPSCounter' for more details.
     * For internal testing only.
     */
    fps: {
      type: 'flag'
    },

    /**
     * Logs the current version of the simulation if provided.
     * For internal testing only.
     */
    version: {
      type: 'flag'
    },

    /**
     * Provides a border of the ScreenView instances.
     * For internal testing only.
     */
    dev: {
      type: 'flag'
    }
  } );

  //----------------------------------------------------------------------------------------

  class Sim {

    /**
     * @param {Screen} screen - the screen to display
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             All options are specific to this class. See below details.
     */
    constructor( screen, options ) {

      assert( screen instanceof Screen, `invalid screen: ${ screen }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {string} - the name of the simulation. Defaults to an attempted title case conversion from the package name.
        name: PACKAGE_OBJECT.name ? Util.toTitleCase( PACKAGE_OBJECT.name ) : '',

        // override
        ...options
      };

      window.isMobile = ( () => {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      } )();
      //----------------------------------------------------------------------------------------
      // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
      // see https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
      window.addEventListener( 'pageshow', function( event ) {
        if ( event.persisted ) {
          window.location.reload();
        }
      } );

      // Log the current version of the simulation if the query parameter was provided.
      if ( SIM_CORE_QUERY_PARAMETERS.version ) {
        console.log( `${ options.name }: v${ PACKAGE_OBJECT.version }` );
      }

      // Enable assertion if the query parameter was provided.
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();

      // Initialize a display and loader
      const display = new Display();
      const loader = new Loader();

      display.addChild( loader );

      // Add the FPSCounter if the query parameter was provided.
      if ( SIM_CORE_QUERY_PARAMETERS.fps ) {
        const counter = new FPSCounter();
        counter.start();
        display.addChild( counter );
      }

      // Add the navigation bar
      const navigationBar = new NavigationBar( options.name );

      display.addChild( navigationBar );

      display.addChild( screen );
      screen.initializeModelAndView();


      if ( SIM_CORE_QUERY_PARAMETERS.dev ) {
        screen._view.enableDevBorder();
      }

      window.onresize = () => {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        navigationBar.layout( windowWidth, windowHeight );

        const screenHeight = windowHeight - parseFloat( navigationBar.style.height );
        screen.style.height = `${ screenHeight }px`;

        screen._view.layout( windowWidth, screenHeight );
      };
      window.onresize();

      let lastStepTime = new Date();

      const stepper = () => {

        const currentTime = new Date();
        const ellapsedTime = Util.convertFrom( currentTime - lastStepTime, Util.MILLI );
        lastStepTime = currentTime;

        screen._model.step && screen._model.step( ellapsedTime );

        window.requestAnimationFrame( stepper );

        window.onresize();
      };
      window.requestAnimationFrame( stepper );

      if ( window.isMobile ) {
        document.addEventListener( 'touchmove', event => {
          if ( event.scale !== 1 ) { event.preventDefault(); }
        }, false );
      }
    }
  }

  return Sim;
} );