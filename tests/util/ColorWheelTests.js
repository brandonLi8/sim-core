// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/ColorWheel`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const ColorWheel = require( 'SIM_CORE/util/ColorWheel' );
  const truenit = require( 'truenit' );

  return () => {

    //----------------------------------------------------------------------------------------
    // Detection Tests
    //----------------------------------------------------------------------------------------

    // isRgb
    truenit.ok( ColorWheel.isRgb( 'rgb( 100, 10, 0)' ) );
    truenit.ok( ColorWheel.isRgb( 'rgb(100%, 10   , 0 )' ) );
    truenit.notOk( ColorWheel.isRgb( 'rgb(   100, 10, 3,   3   )' ) );
    truenit.notOk( ColorWheel.isRgb( 'rgba(100, 10, 0, 0)' ) );
    truenit.notOk( ColorWheel.isRgb( 'rgb( 155 193, 139 )' ) );
    truenit.ok( ColorWheel.isRgb( 'rgb( 100%, 100%, 100%)' ) );

    // isRgba
    truenit.ok( ColorWheel.isRgba( 'rgba( 100, 10, 0, 0.8)' ) );
    truenit.ok( ColorWheel.isRgba( 'rgba(100%, 10   ,5, 0.5 )' ) );
    truenit.notOk( ColorWheel.isRgba( 'rgb(100, 10, 3, 3)' ) );
    truenit.ok( ColorWheel.isRgba( 'rgba(100, 10, 0, 100%)' ) );
    truenit.ok( ColorWheel.isRgba( 'rgba( 100%, 100%, 100%, 0%)' ) );

    // isHex
    truenit.notOk( ColorWheel.isHex( '#FF' ) );
    truenit.ok( ColorWheel.isHex( '#FFF' ) );
    truenit.ok( ColorWheel.isHex( '#FFFD' ) );
    truenit.notOk( ColorWheel.isHex( '#ABCD5' ) );
    truenit.ok( ColorWheel.isHex( '#ABCD56' ) );
    truenit.notOk( ColorWheel.isHex( '#ABCD567' ) );
    truenit.ok( ColorWheel.isHex( '#ABCD5678' ) );

    // isHsl
    truenit.ok( ColorWheel.isHsl( 'hsl(270, 60%, 70%)' ) );
    truenit.notOk( ColorWheel.isHsl( 'hsl(270, 60, 70%)' ) );
    truenit.notOk( ColorWheel.isHsl( 'hsl(270, 60%, 70)' ) );
    truenit.ok( ColorWheel.isHsl( 'hsl(27, 60%, 90%)' ) );
    truenit.notOk( ColorWheel.isHsl( 'hsl(280, 60, 70)' ) );
    truenit.notOk( ColorWheel.isHsl( 'hsl(270grad, 60%, 70%)' ) );

    // isHsla
    truenit.ok( ColorWheel.isHsla( 'hsla(270, 60%, 70%, 0.880)' ) );
    truenit.ok( ColorWheel.isHsla( 'hsla(270, 60%, 70%, 80)' ) );
    truenit.notOk( ColorWheel.isHsla( 'hsla(270, 60, 70%, 4)' ) );
    truenit.notOk( ColorWheel.isHsla( 'hsla(270, 60%,    70, 4)' ) );
    truenit.ok( ColorWheel.isHsla( 'hsla(27, 60%, 90%, 80%)' ) );
    truenit.notOk( ColorWheel.isHsla( 'hsla(280, 60, 70, 4)' ) );
    truenit.notOk( ColorWheel.isHsla( 'hsla(270grad, 60%, 70%, 4)' ) );

    // isKeyword
    truenit.ok( ColorWheel.isKeyword( 'seashell' ) );
    truenit.ok( ColorWheel.isKeyword( 'plum' ) );
    truenit.ok( ColorWheel.isKeyword( 'orangered' ) );
    truenit.ok( ColorWheel.isKeyword( 'navy' ) );
    truenit.notOk( ColorWheel.isKeyword( 'notacolor' ) );
    truenit.ok( ColorWheel.isKeyword( 'blue' ) );

    //----------------------------------------------------------------------------------------
    // Conversion Tests
    //----------------------------------------------------------------------------------------

    // parseRgb
    truenit.arrayEquals( ColorWheel.parseRgb( 'rgb( 100, 10, 0)' ), [ 100, 10, 0, 1 ] );
    truenit.arrayEquals( ColorWheel.parseRgb( 'rgb(100%, 10   , 0 )' ), [ 255, 10, 0, 1 ] );
    truenit.arrayEquals( ColorWheel.parseRgb( 'rgba(100, 10, 3, 3)' ), [ 100, 10, 3, 1 ] );
    truenit.arrayEquals( ColorWheel.parseRgb( 'rgba(300, 10, 0, 0.7)' ), [ 255, 10, 0, 0.7 ] );
    truenit.arrayEquals( ColorWheel.parseRgb( 'rgba(100, 10, 0, 100%)' ), [ 100, 10, 0, 1 ] );
    truenit.arrayEquals( ColorWheel.parseRgb( 'rgba( 100%, 100%, 50%, 50%)' ), [ 255, 255, 128, 0.5 ] );



    // truenit.ok( ColorWheel.keywordToRGBA( 'maroon' ) ); //false
    // truenit.ok( ColorWheel.keywordToRGBA( 'blue' ) );// false
    // truenit.ok( ColorWheel.hslToRGBA( 'hsl(270, 60%, 70%)' ) );//rgb(179, 133, 224)
    // truenit.ok( ColorWheel.hslToRGBA( 'hsla(27, 60%, 90%, 0.5)' ) );//rgba(245, 228, 214, 0.5)

  };
} );