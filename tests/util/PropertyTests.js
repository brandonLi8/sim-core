// Copyright © 2019-2020 Brandon Li. All rights reserved.

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
  const Vector = require( 'SIM_CORE/util/Vector' );

  return () => {

    //----------------------------------------------------------------------------------------
    // Primitive Validation 1
    const stringProperty = new Property( 'foo', {
      type: 'string',
      validValues: [ 'foo', 'bar', 'tap' ]
    } );

    truenit.ok( stringProperty.set( 'bar' ).get() === 'bar' );
    truenit.ok( stringProperty.set( 'tap' ).value === 'tap' );
    stringProperty.value = 'foo';
    truenit.ok( stringProperty.get() === 'foo' );
    truenit.throws( () => stringProperty.set( 5 ) );
    truenit.throws( () => stringProperty.set( 'string' ) );

    //----------------------------------------------------------------------------------------
    // Primitive Validation 2
    const numberProperty = new Property( 0, {
      type: 'number',
      validValues: [ -2, 0, 2, 4, 6 ],
      isValidValue: value => ( value >= 0 )
    } );

    numberProperty.value = 4;
    truenit.ok( numberProperty.get() === 4 );
    truenit.throws( () => { numberProperty.set( -2 ); } );
    truenit.throws( () => { numberProperty.value = 1; } );

    //----------------------------------------------------------------------------------------
    // Custom Validation
    const vectorProperty1 = new Property( Vector.ZERO, {
      type: Vector,
      isValidValue: value => value.x >= 0 && value.y >= 0
    } );

    vectorProperty1.value = new Vector( 4, 5 );
    truenit.ok( vectorProperty1.value.equals( new Vector( 4, 5 ) ) );
    truenit.throws( () => { vectorProperty1.value = -2; } );
    truenit.throws( () => { vectorProperty1.value = new Vector( -1, 5 ); } );

    //----------------------------------------------------------------------------------------
    // Initialization tests
    truenit.throws( () => new Property( 0, {
      type: 'number',
      validValues: [ -2, 0, 2, 4, 6 ],
      isValidValue: value => value > 0 // doesn't pass initial value
    } ) );

    truenit.throws( () => new Property( 0, {
      type: 'number',
      validValues: [ 1, 2, 4, 6 ],  // doesn't pass initial values
      isValidValue: value => value >= 0
    } ) );

    truenit.throws( () => new Property( 'string', {
      type: 'number' // incorrect type
    } ) );

    // equals
    truenit.ok( new Property( 5 ).equals( new Property( 5 ) ) );
    truenit.notOk( new Property( 5 ).equals( new Property( 6 ) ) );
    truenit.notOk( new Property( 'string' ).equals( new Property( 6 ) ) );
    truenit.notOk( new Property( 6 ).equals( new Property( 'string' ) ) );
    truenit.notOk( new Property( new Vector( 5, 5 ) ).equals( new Property( 6 ) ) );
    truenit.notOk( new Property( 6 ).equals( new Property( new Vector( 5, 5 ) ) ) );
    truenit.ok( new Property( new Vector( 0, 0 ) ).equals( new Property( Vector.ZERO ) ) );

    // toggle
    truenit.ok( new Property( false ).toggle().toggle().toggle().value === true );

    // initialValue
    truenit.ok( new Property( false ).toggle().toggle().toggle().initialValue === false );
    truenit.ok( vectorProperty1.initialValue.equals( Vector.ZERO ) );

    // reset
    truenit.ok( new Property( false ).toggle().reset().value === false );
    truenit.ok( vectorProperty1.reset().value.equals( Vector.ZERO ) );

    //----------------------------------------------------------------------------------------
    // Link/unlink
    const obj = { type: 4 };
    const p = new Property( 6 );

    let aCalls = 0;
    let bCalls = 0;
    let cCalls = 0;
    const a = function( a ) { aCalls++; };
    const b = function( b ) { bCalls++; };
    const c = function( c ) { cCalls++; };

    p.link( a );
    p.lazyLink( b );
    p.link( c );

    const d = p.linkAttribute( obj, 'type' );

    // hasListener
    truenit.ok( p.hasListener( b ) );
    truenit.ok( p.hasListener( a ) );
    truenit.ok( p.hasListener( c ) );
    truenit.ok( p.hasListener( d ) );

    p.unlink( b );
    truenit.notOk( p.hasListener( b ) );
    p.lazyLink( b );

    truenit.ok( aCalls === 1 && bCalls === 0 && cCalls === 1 );

    p.value = 5;
    truenit.ok( obj.type === 5 );
    truenit.ok( aCalls === 2 && bCalls === 1 && cCalls === 2 );
    p.value = 10;
    truenit.ok( obj.type === 10 );
    truenit.ok( aCalls === 3 && bCalls === 2 && cCalls === 3 );

    p.reset();
    truenit.ok( obj.type === 6 && p.value === 6 );
    truenit.ok( aCalls === 4 && bCalls === 3 && cCalls === 4 );

    p.value = 6;
    truenit.ok( obj.type === 6 && p.value === 6 );
    truenit.ok( aCalls === 4 && bCalls === 3 && cCalls === 4 );

    // unlinkAll
    p.unlinkAll();
    truenit.notOk( p.hasListener( b ) );
    truenit.notOk( p.hasListener( a ) );
    truenit.notOk( p.hasListener( c ) );
    truenit.notOk( p.hasListener( d ) );

    // dispose
    p.dispose();
    truenit.throws( () => p.link( a ) );
  };
} );