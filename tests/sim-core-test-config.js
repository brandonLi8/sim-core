// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Testing RequireJS configuration file for the sim. Paths are relative to the location of this file.
 *
 * IMPORTANT: This config is for testing only! For sim use, see `./sim-core-main.js`
 *
 * To test: run `npm test`
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
( () => {
  'use strict';
  //----------------------------------------------------------------------------------------
  // Configure a browser environment to create a window object.
  require( 'browser-env' )();

  // Function that loads a script tag.
  const loadURL = ( scriptPath ) => {
    const script = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = scriptPath;
    script.async = false;
    document.head.appendChild( script );
    console.loG
  };

  loadURL( '../src/util/Assert.js' );



} )();
// module.exports = ( () => {

//   // modules
//   const requirejs = require( 'requirejs' );


//   //----------------------------------------------------------------------------------------
//   // Configure a browser environment to create a window object.
//   require( 'browser-env' )();

//   // Function that loads a script tag.
//   const loadURL = ( scriptPath ) => {
//     const script = document.createElement( 'script' );
//     script.type = 'text/javascript';
//     script.src = scriptPath;
//     script.async = false;
//     document.head.appendChild( script );
//   };

//   loadURL( '../src/util/Assert.js' );


//   console.log( "Page location is " + window.location.href)

//   // function assert() {}


//   // window.assert = 5;


//   requirejs.config( {

//     deps: [ 'TESTS/sim-core-test-runner.js' ],

//     paths: {
//       SIM_CORE: '../src',
//       TESTS: '.'
//     }
//   } );
// } )();