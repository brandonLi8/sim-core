// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Enum`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Enum = require( 'SIM_CORE/util/Enum' );
  const truenit = require( 'truenit' );

  return () => {

    // Define a basic Enum - should stay static.
    const DirectionsEnum = new Enum( [ 'NORTH', 'SOUTH', 'EAST', 'WEST' ] );

    // basic
    truenit.equals( DirectionsEnum.NORTH.name, 'NORTH' );
    truenit.equals( DirectionsEnum.SOUTH.name, 'SOUTH' );
    truenit.equals( DirectionsEnum.EAST.name, 'EAST' );
    truenit.equals( DirectionsEnum.WEST.name, 'WEST' );

    // includes
    truenit.ok( DirectionsEnum.includes( DirectionsEnum.NORTH ) );
    truenit.notOk( DirectionsEnum.includes( 'NORTH' ) );
    truenit.notOk( DirectionsEnum.includes( 'NORTH_WEST' ) );
    truenit.notOk( DirectionsEnum.includes( { name: 'NORTH', toString: () => 'NORTH' } ) );

    // toString
    const object = {};
    object[ DirectionsEnum.NORTH ] = 'string';
    truenit.equals( object.NORTH, 'string' );
    truenit.equals( DirectionsEnum.SOUTH.toString(), 'SOUTH' );

    // immutable
    truenit.throws( () => {
      DirectionsEnum.SOMETHING_AFTER_THE_FREEZE = 5;
    }, 'Should not be able to set things after initialization.' );
  };
} );