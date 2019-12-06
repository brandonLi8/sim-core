// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * An observable property which notifies listeners when the value changes.
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
     * @param {*} value - the initial value of the property
     * @param {Object} [options]
     */
    constructor( value, options ) {

      // Defaults for options.
      const defaults = {

        // {constructor|string|null} type of the value.
        // If {string}, the string must be one of the primitive types listed in TYPEOF_STRINGS.
        // If {null}, the valueType is not checked.
        // Examples:
        // valueType: Vector
        // valueType: 'string'
        valueType: null,

        // {*[]|null} valid values for this Property. Unused if null.
        // validValues: [ 2, 3 ]
        validValues: null,

        // {function|null} function that validates the value. Single argument is the value, returns boolean.
        // Unused if null.
        // Example:
        // isValidValue: value => Util.isInteger( value ) && value >= 0;
        isValidValue: null
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      assert( !options.valueType || typeof options.valueType === 'string',
        `invalid valueType: ${ options.valueType }` );
      assert( !options.validValues || Util.isArray( options.validValues ),
        `invalid validValues: ${ options.validValues }` );
      assert( !options.isValidValue || typeof options.isValidValue === 'function',
        `invalid isValidValue: ${ options.isValidValue }` );

      //----------------------------------------------------------------------------------------

      // @private - store the internal value and the initial value
      this._value = value;

      // @protected - initial value
      this._initialValue = value;

      // @private {function[]} - the listeners that will when the value changes
      this._listeners = [];

      // @private - see defaults declaration
      this._valueType = options.valueType;
      this._validValues = options.validValues;
      this._isValidValue = options.isValidValue || () => true;

      // validate the initial value
      this._validateValue( this._value );
    }

    /**
     * Gets the property value.
     * @public
     *
     * @returns {*}
     */
    get() { return this._value; }
    get value() { return this.get(); }

    /**
     * Sets the value and notifies listeners.
     * @public
     *
     * @param {*} value
     * @returns {Property} - for chaining.
     */
    set( value ) {
      // Validate the value based on the information given in the constructor
      this._validateValue( value );

      // Get the older
      const oldValue = this.get();
      this._value = value;
      this._notifyListeners( oldValue );
      return this;
    }
    set value( value ) { this.set( value ); }


    /**
     * Returns the initial value of this Property.
     * @public
     *
     * @returns {*}
     */
    getInitialValue() { return this._initialValue; }
    get initialValue() { return this.getInitialValue(); }

    /**
     * Resets the value to the initial value.
     * @public
     *
     * @returns {Property} - for chaining.
     */
    reset() { return this.set( this._initialValue ); }

    /**
     * Adds listener and calls it immediately. The initial notification provides the current value for newValue and
     * null for oldValue.
     * @param
     *
     * @param {function} listener a function of the form listener( newValue, oldValue )
     */
    link( listener ) {
      this.lazyLink( listener );
      listener( this.get(), null );
    }

    /**
     * Add an listener to the Property, without calling it back right away. This is used when you need to register a
     * listener without an immediate callback.
     * @public
     *
     * @param {function} listener - a function with a single argument, which is the current value of the Property.
     */
    lazyLink( listener ) {
      assert( typeof listener === 'function', `invalid listener: ${ listener }` );
      assert( this._listeners.indexOf( listener ) === -1, 'Cannot add the same listener twice' );

      this._listeners.push( listener );
    }

    /**
     * Checks whether a listener is registered with this Property
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
     * Removes a listener.
     * @public
     *
     * @param {function} listener
     */
    unlink( listener ) {
      assert( this.hasListener( listener ), `listener was never registered` );
      Util.arrayRemove( this._listeners, listener );
    }

    /**
     * Removes all listeners. If no listeners are registered, this is a no-op.
     * @public
     */
    unlinkAll() {
      this._listeners = [];
    }

    /**
     * Links an object's named attribute to this property. Returns a handle so it can be removed using
     * Property.unlink(); Example: modelVisibleProperty.linkAttribute( view, 'visible' );
     * @public
     *
     * @param {Object} object
     * @param {string} attributeName
     */
    linkAttribute( object, attributeName ) {
      assert( Object.prototype.hasOwnProperty.call( object, attributeName ),
        `object ${ object } doesn't have attribute ${ attributeName }.` );
      const handle = value => { object[ attributeName ] = value; };
      this.link( handle );
      return handle;
    }

    /**
     * Unlink an listener added with linkAttribute. Note: the args of linkAttribute do not match the args of
     * unlinkAttribute: here, you must pass the listener handle returned by linkAttribute rather than object and
     * attributeName
     * @public
     *
     * @param {function} listener
     */
    unlinkAttribute( listener ) {
      this.unlink( listener );
    }

    /**
     * Modifies the value of this Property with the ! operator.  Works for booleans and non-booleans.
     * @public
     */
    toggle() {
      this.value = !this.value;
    }

    /**
     * Ensures that the Property can be garbage collected.
     * @public
     */
    dispose() {
      // remove any listeners that are still attached to this property
      this.unlinkAll();
    }

    /**
     * @param {*} oldValue
     * @private
     */
    _notifyListeners( oldValue ) {
      this._listeners.forEach( listener => {
        listener( this.get(), oldValue );
      } );
    }

    /**
     * Validates a value based on the validators given in the constructor.
     * @public
     *
     * @param {*} value
     */
    _validateValue( value ) {

      // Always validate with the function.
      assert( this._isValidValue( value ), `invalid value: ${ value }` );

      if ( this._valueType ) {
        if ( TYPEOF_STRINGS.includes( this._valueType ) ) {
          assert( typeof value === this._valueType, `invalid value: ${ value }` );
        }
        else {
          assert( value instanceof this._valueType, `invalid value: ${ value }` );
        }
      }

      if ( this._validValues ) {
        assert( this._validValues.includes( value ), `invalid value: ${ value }` );
      }
    }

  }

  return Property;
} );