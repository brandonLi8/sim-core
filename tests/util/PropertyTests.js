// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Property`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Property = require( 'SIM_CORE/util/Property' );
  const truenit = require( 'truenit' );

  const PropertyTester = () => {

    //----------------------------------------------------------------------------------------
    // Test unlink
    //----------------------------------------------------------------------------------------
    const p = new Property( 1 );
    const a = function( a ) {};
    const b = function( b ) {};
    const c = function( c ) {};
    p.link( a );
    p.link( b );
    p.link( c );
    truenit.ok( p.hasListener( b ) );
    p.unlink( b );
    truenit.ok( p.hasListener( a ) );
    truenit.ok( p.hasListener( c ) );
    truenit.notOk( p.hasListener( b ) );
  };

  return PropertyTester;
} );