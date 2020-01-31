// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A generic encapsulated Javascript property wrapper (a property is a value associated with an object field).
 * Supports observing and type validation.
 *
 * ## Functionality:
 *   (1) A Property notifies listeners when the value changes. Listeners can be "linked" by calling the `link()`
 *       method of a Property. IMPORTANT: if the object is being disposed, make sure to unlink your listeners
 *       to allow Javascript to garbage collect the Property. Not properly unlinking listeners can result in a
 *       memory leak! You can unlink listeners by:
 *          - Calling the `unlink` method and passing a reference to the function that was linked.
 *          - Calling the `unlinkAll` method (nothing passed in).
 *          - Calling the `dispose` method.
 *
 *   (2) A Property can validate new values when the value changes. This should be used as often as possible!
 *       There are 3 option keys that allow for this: `type`, `validValues`, and `isValidValue`.
 *       For instance:
 *       ```
 *       const exampleProperty = new Property( 5, { type: 'number', isValidValue: value => value > 0 } );
 *
 *       exampleProperty.set( 'foo-bar' );  // Will Error!
 *       exampleProperty.set( -5 );         // Will Error!
 *       exampleProperty.set( 10 );         // No Error!
 *       ```
 *       Any combination of these options may be used. See the early portion of the constructor for more documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );

  // constants
  const TYPEOF_STRINGS = [ 'string', 'number', 'boolean', 'function' ];

  class Property {

    /**
     * @param {*} value - the value of the property
     * @param {Object} [options] - key-value pairs that control the validation of the to be set values.
     *                             See the early portion of the constructor for details.
     */
    constructor( value, options ) {

      options = {

        // {string|constructor} - the type of the value. If provided, this will check that new values match this type.
        //                        If {string}, the string must be one of the types listed in TYPEOF_STRINGS.
        //                        If {constructor}, this will use `instanceof` to validate new values. Ex: `Vector`.
        type: null,

        // {*[]} - an array of valid values for this Property. If provided, this will check that new values are in
        //         this array. For instance: validValues: [ 2, 3 ].
        validValues: null,

        // {function} - custom function that validates the value. If provided, this will pass in new values and
        //              check that the function returns true. For instance: isValidValue: value => value >= 0;
        isValidValue: null,

        // rewrite options such that it overrides the defaults above if provided.
        ...options
      };

      //----------------------------------------------------------------------------------------
      // Validate options
      assert( !options.type || TYPEOF_STRINGS.includes( options.type ) || !!options.type.constructor );
      assert( !options.validValues || Util.isArray( options.validValues ) );
      assert( !options.isValidValue || typeof options.isValidValue === 'function' );

      //----------------------------------------------------------------------------------------

      // @private {*} _value - the internal value of the Property and the initial value.
      this._value = value;

      // @protected {*} _initialValue - the initial value of the Property.
      this._initialValue = value;

      // @private {function[]} _listeners - the listeners that will be notified when the value changes.
      this._listeners = [];

      // @private {boolean} _isDisposed - indicates if the Property has been disposed.
      this._isDisposed = false;

      // @private - aliases to options. See options for documentation.
      this._type = options.type;
      this._validValues = options.validValues;
      this._isValidValue = options.isValidValue;

      // validate the initial value
      this._validateValue( this._initialValue );
    }

    /**
     * Checks for equality between this Property's VALUE to another Property's VALUE.
     * Attempts to use the `equals` method if the current value contains one. Otherwise, `===` is used for equality.
     * @public
     *
     * @param {Property.<*>} other
     * @returns {boolean}
     */
    equals( other ) {
      assert( other instanceof Property, `invalid other: ${ other }` );
      return this._equalsValue( this._value, other.value );
    }

    /**
     * Gets the Property value.
     * @public
     *
     * @returns {*}
     */
    get() { return this._value; }
    get value() { return this.get(); }

    /**
     * Sets the value of the Property and notifies linked listeners. NOTE: nothing happens if the value doesn't change.
     * @public
     *
     * @param {*} value
     * @returns {Property} - for chaining.
     */
    set( value ) {
      assert( !this._isDisposed, 'cannot set value of a disposed Property' );
      if ( this._equalsValue( this.value, value ) ) return; // no-op if the value doesn't change.

      // Validate the new value before setting it.
      this._validateValue( value );

      const oldValue = this.get();
      this._value = value;

      // Notify all linked listeners.
      this._listeners.forEach( listener => { listener( this.get(), oldValue ); } );
      return this;
    }
    set value( value ) { this.set( value ); }

    /**
     * Modifies the value of this Property with the `!` operator. Works for booleans and non-booleans.
     * @public
     *
     * @returns {Property} - for chaining.
     */
    toggle() {
      this.set( !this.get() );
      return this;
    }

    /**
     * Returns the initial value of this Property.
     * @public
     *
     * @returns {*}
     */
    getInitialValue() { return this._initialValue; }
    get initialValue() { return this.getInitialValue(); }

    /**
     * Resets the Property's value to the initial value it was given when constructed.
     * @public
     *
     * @returns {Property} - for chaining.
     */
    reset() { return this.set( this._initialValue ); }

    /**
     * Registers a listener such that when this Property's value changes, the listener is called, passing both the
     * new value and old value. This method also calls the listener immediately, passing the current value as the
     * 'new' value. If this behavior isn't desired, see `lazyLink`.
     * @public
     *
     * @param {function} - listener that is called when the Property value changes, passing the new value and old value.
     * @returns {Property} - for chaining.
     */
    link( listener ) {
      this.lazyLink( listener );
      listener( this.get() ); // immediately call the listener, passing the current value.
      return this;
    }

    /**
     * Registers a listener such that when this Property's value changes, the listener is called, passing both the
     * new value and old value. Different from the `link` method, this is used when you need to register a listener
     * without an immediate callback.
     * @public
     *
     * @param {function} - listener that is called when the Property value changes, passing the new value and old value.
     * @returns {Property} - for chaining.
     */
    lazyLink( listener ) {
      assert( !this._isDisposed, 'cannot link listener of a disposed Property' );
      assert( !this.hasListener( listener ), `cannot link the same listener twice: ${ listener }` );
      this._listeners.push( listener );
      return this;
    }

    /**
     * Removes a linked listener so that it is not longer called when the Property's value changes.
     * @public
     *
     * @param {function} listener
     * @returns {Property} - for chaining.
     */
    unlink( listener ) {
      assert( this.hasListener( listener ), `listener was never registered: ${ listener }` );
      Util.arrayRemove( this._listeners, listener );
      return this;
    }

    /**
     * Removes all currently linked listeners.
     * @public
     *
     * @returns {Property} - for chaining.
     */
    unlinkAll() {
      this._listeners = [];
      return this;
    }

    /**
     * Checks whether a listener is registered with this Property.
     * @public
     *
     * @param {function} listener
     * @returns {boolean}
     */
    hasListener( listener ) {
      assert( typeof listener === 'function', `invalid listener: ${ listener }` );
      return this._listeners.includes( listener );
    }

    /**
     * Links an Object's attribute to this Property's value. Example: visibleProperty.linkAttribute( node, 'visible' );
     * Returns a handle function so it can be removed using the `unlink` method.
     * @public
     *
     * @param {Object} object
     * @param {string} attributeName
     * @returns {listener} - handler function that was registered as a listener. Use this function to unlink.
     */
    linkAttribute( object, attributeName ) {
      assert( object[ attributeName ], `object ${ object } must have attribute ${ attributeName }` );

      const handle = value => { object[ attributeName ] = value; };
      this.link( handle );
      return handle;
    }

    /**
     * Disposes the Property and ensures that the Property can be garbage collected.
     * @public
     *
     * @returns {Property} - for chaining.
     */
    dispose() {
      // remove any listeners that are still attached to this property
      this.unlinkAll();

      this._isDisposed = true;
      return this;
    }

    /**
     * Convenience method to check for equality between one value to another.
     * Attempts to use the `equals` method if the both value's contain this method. Otherwise, `===` is used to check.
     * @public
     *
     * @param {*} value1
     * @param {*} value2
     * @returns {boolean}
     */
    _equalsValue( value1, value2 ) {
      if ( value1 && value2 && value1.constructor === value2.constructor && !!value1.equals && !!value2.equals ) {
        return value1.equals( value2 );
      }
      else {
        return value1 === value2;
      }
    }

    /**
     * Validates a value based on the validation options given in the constructor.
     * @public
     *
     * @param {*} value
     */
    _validateValue( value ) {

      // Validate options.type
      assert( !this._type || ( TYPEOF_STRINGS.includes( this._type ) ?
        typeof value === this._type :
        value instanceof this._type ),
        `value ${ value } not of type ${ this._type }` );

      // Validate options.validValues
      assert( !this._validValues || this._validValues.includes( value ),
        `value ${ value } not inside the valid values: ${ this._validValues }` );

      // Validate options.isValidValue
      assert( !this._isValidValue || this._isValidValue( value ) === true,
        `value ${ value } did not pass isValidValue: ${ this._isValidValue }` );
    }
  }

  return Property;
} );