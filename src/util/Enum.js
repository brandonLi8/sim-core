// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * An standard Enumeration that contains a set of possible values (called members).
 *
 * An Enum can be created like this:
 *   const Colors = new Enum( [ 'RED', 'BLUE', 'GREEN' ] );
 *
 * The members are referenced like this:
 *   Colors.RED;
 *   Colors.BLUE;
 *   Colors.GREEN;
 *
 *   Colors.MEMBERS;  // [ Colors.RED, Colors.BLUE, Colors.GREEN, Colors.WEST ]
 *
 * Conventions for using Enum:
 * (1) Enum members are named like constants, using uppercase. See the example above.
 * (2) If an Enum is not closely related to some class, then put the Enum in its own .js file.
 *     Do not combine multiple Enumerations into one file.
 * (3) Members of the Enum should be documented as a Member of the instance of the Enum. For example, a method
 *     that takes an Enum value as an argument would be documented like this:
 *
 *     // @param {Enum.Member.<Colors>} color - value from Colors Enum
 *     setColor( color ) {
 *       assert( Colors.includes( color ) );
 *       // ...
 *     }
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Enum {

    /**
     * @param {string[]} keys - the possible set of values. Will create an Enum based on the provided string array.
     *                          The strings must be all caps. See comment at the top of the file for more information.
     *
     */
    constructor( keys ) {
      assert( Util.isArray( keys ) && keys.every( key => {
          return typeof key === 'string' && key.toUpperCase() === key; // ensure the key is in all caps.
        } ), `invalid keys: ${ keys }` );
      assert( [ 'includes', 'KEYS', 'MEMBERS' ], `Keys ${ keys } contains a build-in provided value.` );

      //----------------------------------------------------------------------------------------

      // @public {string[]} (read-only) - the string keys of the enumeration.
      this.KEYS = keys;

      // @public {Object[]} (read-only) - the object values of the enumeration.
      this.MEMBERS = [];

      // Assign an enumeration object value for each key.
      keys.forEach( key => {

        // Assign to this class for static referencing.
        this[ key ] = new Enum.Member( key );
        this.MEMBERS.push( this[ key ] );
      } );

      Util.deepFreeze( this ); // Freeze this object as it is now immutable.
    }

    /**
     * Checks whether the given value is a value of this enumeration.
     * @public
     *
     * @param {Enum} value - value from this Enum.
     * @returns {boolean}
     */
    includes( value ) {
      return this.MEMBERS.includes( value );
    }
  }

  // @public {Class.<Member>} - Class definition for each individual member of an Enumeration.
  Enum.Member = class Member { constructor( name ) { this.name = name; } toString() { return this.name; } };

  return Enum;
} );