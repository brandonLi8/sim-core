// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Query Parameter parser that retrieves and/or validates a set of Query Parameters.
 * Supports type coercion, defaults, error checking, types. etc.
 *
 * ## Background:
 *  - The Query Component of a URI is indicated by the first ?, followed by the parameters, which are separated by &s.
 *    For instance, https://example.com?dev&bar1=5&bar2=true would yield three query parameters: dev, bar1=5, bar2=true.
 *
 * ## Usage
 *  - The main method of this module is QueryParameters.retrieve(). It validates values, provides a default value,
 *    and coerces the values to different types. For instance, in the case above,
 *      QueryParameters.retrieve( {
 *         bar1: {
 *           type: 'number',                         // checks values are numbers. See VALID_SCHEMA_TYPES.
 *           isValidValue: value => ( value >= 0 ),  // validator that is called to validate numbers.
 *           defaultValue: 0                         // default value if the query parameter isn't present in the URI.
 *         },
 *         dev: {
 *           type: 'flag'                            // checks for presence of ?dev. Values (like ?dev=8) error out.
 *         },
 *         otherBar: {
 *           type: 'string',
 *           defaultValue: 'value'
 *         }
 *         // ... add as many as you want.
 *      } );`
 *    would return: {
 *      bar1: 5,           // coerced as a number type. 5 because ?bar1=5 is present in the URI.
 *      dev: true,         // coerced as a boolean type. true because ?dev is present in the URI.
 *      otherBar: 'value'  // uses the default since ?otherBar isn't present in the URI
 *    }
 *    See QueryParameters.retrieve() for further documentation.
 *
 *  - You can also check if a parameter is present with QueryParameters.contains(). In the case above,
 *    QueryParameters.contains( 'dev' ) would return true but QueryParameters.contains( 'count' ) would return false.
 *
 *  - To get the non-coerced exact value of a query parameter, use QueryParameters.get(). In the case above,
 *    QueryParameters.get( 'bar2' ) would return 'true' as a string.
 *
 * NOTE: if a query parameter is present multiple times in the Query Component, the value would be the latest declared,
 *       or the furthest to the right.
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );

  // constants
  const PARSED_QUERY_PARAMETERS = parseAllQueryParameters();
  const VALID_SCHEMA_TYPES = [ 'flag', 'boolean', 'number', 'string' ];

  class QueryParameters {

    /**
     * Retrieves, validates, and coerces a set of values based on a schema. See the top comments for context.
     * @public
     *
     * @param {Object} schema - Schema that contains the set of values to retrieve. For instance,
     *                            QueryParameters.retrieve( { // schema
     *                                parameterName: {  // object
     *                                  type: 'number',
     *                                  defaultValue: 0
     *                                }
     *                            } );
     *                          - All objects must contain a 'type' key-value pair. See VALID_SCHEMA_TYPES for the
     *                            possible types.
     *                          - All objects except for `type: 'flag'` must provide a default value.
     *                          - Each object may contain a 'isValidValue' key-value which provides a function that
     *                            checks if a value is valid (not type). This option will be ignored for flags
     *                            and booleans (which will have a built in type checker).
     *                          - Flag types will retrieve `true` if it exists and `false` if it doesn't.
     *
     * @returns {Object} - parsed into an object literal with the keys as the parameter names.
     */
    static retrieve( schema ) {
      // validate the schema
      validateSchema( schema );

      const queryParametersRetrieved = {}; // the output

      //----------------------------------------------------------------------------------------
      // Loop through the schema and retrieve each Query Parameter value.
      Object.keys( schema ).forEach( name => {

        const object = schema[ name ]; // objects of the schema
        const type = object.type; // convenience reference to the type, which has been validated in validateSchema
        const defaultValue = ( type === 'flag') ? false : object.defaultValue; // reference the default value
        const value = this.get( name ); // value parsed from the URI. Undefined if the parameter isn't present.
        const isValidValue = object.isValidValue;

        // Correct using the default value if the parameter isn't present in the URI and coercing its type if it is.
        const correctedValue = this.contains( name ) ? coerceType( value, type, name ) : defaultValue;

        // Check that the value is valid if provided.
        assert( !isValidValue || isValidValue( correctedValue ),
          `value ${ correctedValue } for ?${ name } didn't pass isValidValue()` );

        queryParametersRetrieved[ name ] = correctedValue;
      } );

      return queryParametersRetrieved;
    }

    /**
     * Checks if a query parameter name is apart of the URI.
     * @public
     * @static
     * @param {string} name - the query parameter name
     * @returns {boolean}
     */
    static contains( name ) {
      assert( typeof name === 'string', `invalid name ${ name }` );

      // Get the result from the already parsed query parameters.
      return PARSED_QUERY_PARAMETERS.hasOwnProperty( name );
    }

    /**
     * Gets the value for a single query parameter.
     *
     * IMPORTANT: flag parameter values (no value) will return `null`. Non-existent parameters will return `undefined`.
     *            It is therefore recommended to use `QueryParameters.retrieve` to specify types and get truthy values
     *            for flags.
     * @public
     *
     * @param {string} name - the query parameter name
     * @returns {*} - query parameter value
     */
    static get( name ) {
      assert( typeof name === 'string', `invalid name ${ name }` );

      // Get the value from the already parsed query parameters.
      return PARSED_QUERY_PARAMETERS[ name ];
    }
  }

  //----------------------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------------------

  /**
   * Parses all query parameters of the URI into an object literal. Values without the value operator ('=') are given
   * the value `null`.
   *
   * This function is for internal use (not public facing). For performance reasons, this function should be called once
   * at startup.
   *
   * For background of implementation, see:
   *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent
   *  - https://www.w3schools.com/jsref/prop_loc_search.asp
   *
   * @returns {Object} - parsed into an object literal with the keys as the parameter names.
   */
  function parseAllQueryParameters() {

    const parsedQueryParameters = {};

    // Get the Query Component or the URI and split each argument (separated by '&') into an array.
    const queryComponents = window.location.search.substring( 1 ).split( '&' );

    queryComponents.forEach( component => {

      if ( component !== '' ) {
        // Parse the component by spitting it from the first '=' sign.
        const parsedComponent = component.split( '=', 2 );

        const name = parsedComponent[ 0 ];
        const value = parsedComponent.length === 2 ? parsedComponent[ 1 ] : null; // null if no '=' is provided (a flag).
        parsedQueryParameters[ name ] = value ? decodeURIComponent( value ) : value;
      }
    } );

    return parsedQueryParameters;
  }

  /**
   * Coerces input from QueryParameters.get() to a type assuming the URI contains the parameter. Validates new values.
   *
   * @param {*} value - value to coerce
   * @param {*} type - the type to coerce into. See VALID_SCHEMA_TYPES.
   * @param {*} name - the name of the query parameter for validating.
   * @param
   */
  function coerceType( value, type, name ) {

    if ( type === 'number' ) {
      // coerce into a number
      const coercedValue = Number( value );
      assert( !isNaN( coercedValue ), `invalid number value for ?${ name }: ${ value }` );
      return coercedValue;
    }
    else if ( type === 'boolean' ) {
      // coerce into a boolean
      assert( value === 'true' || value === 'false', `invalid boolean value for ?${ name }: ${ value }` );
      return value === 'true';
    }
    else if ( type === 'flag' ) {
      // for flags, error if there is a value. returns true as this function assumes the URI contains the parameter.
      assert( value === null, `value for ?${ name } shouldn't exist: ${ value } for 'flag' parameter types` );
      return true;
    }
    else {
      return value; // nothing to coerce, leave as-is
    }
  }

  /**
   * Validates a schema. See `QueryParameters.retrieve()` for background.
   *
   * This function checks that (annotated in the function):
   *  1. Schema is a object literal
   *  2. Each key of schema corresponds to a object literal.
   *  3. Each object of schema contains a 'type' key with a value in VALID_SCHEMA_TYPES.
   *  4. Each object of schema that isn't `type: 'flag` has a default value that is the correct type.
   *  5. Objects of schema with the optional `isValidValue` is a function.
   *  6. The default value (for not type: flag) passes `isValidValue` (if it exists).
   *
   * @param {Object} schema
   */
  function validateSchema( schema ) {

    // test 1
    assert( Object.getPrototypeOf( schema ) === Object.prototype, `invalid schema: ${ schema }` );

    Object.keys( schema ).forEach( name => {

      const object = schema[ name ];

      // test 2
      assert( Object.getPrototypeOf( object ) === Object.prototype, `invalid object for ?${ name }: ${ object }` );

      // test 3
      assert( VALID_SCHEMA_TYPES.includes( object.type ), `invalid type for ?${ name }: ${ object.type }` );

      // test 4
      assert( object.type === 'flag' || typeof object.defaultValue === object.type,
        `invalid defaultValue for ?${ name }: ${ object.defaultValue }` );

      // test 5
      assert( !object.isValidValue || typeof object.isValidValue === 'function',
        `invalid isValidValue for ?${ name }: ${ object.isValidValue }` );

      // test 6
      assert( !( object.type !== 'flag' && object.isValidValue ) || object.isValidValue( object.defaultValue ),
        `invalid defaultValue for ?${ name } doesn't pass isValidValue(): ${ object.defaultValue }` );
    } );
  }

  return QueryParameters;
} );