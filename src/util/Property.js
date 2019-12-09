// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A generic encapsulated Javascript property wrapper (a property is a value associated with an object field).
 * Supports observing and type validation.
 *
 * ## Functionality:
 *   (1) A Property notifies listeners when the value changes. Listeners can be "linked" by calling the `link`
 *       method of a Property. IMPORTANT: if the object is being disposed, make sure to unlink your listeners
 *       to allow Javascript to garbage collect the Property. Not properly unlinking listeners can result in a
 *       memory leak! You can unlink listeners by:
 *          - Calling the `unlink` method and passing a reference to the function that was linked.
 *          - Calling the `unlinkAllListeners` method (nothing passed in).
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
      assert( !options.type || ( options.type.prototype && options.type.prototype.constructor ) );
      assert( !options.validValues || Util.isArray( options.validValues ) );
      assert( !options.isValidValue || typeof options.isValidValue === 'function' );

      //----------------------------------------------------------------------------------------

      // @private - store the internal value and the initial value
      this._value = value;

      // @protected - initial value
      this._initialValue = value;

      // @private {function[]} - the listeners that will when the value changes
      this._listeners = [];

      // @private - see defaults declaration
      this._valueType = options.type;
      this._validValues = options.validValues;
      this._isValidValue = options.isValidValue;

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
      assert( this.hasListener( listener ), 'listener was never registered' );
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
      assert( !this.isValidValue || this._isValidValue( value ), `invalid value: ${ value }` );

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