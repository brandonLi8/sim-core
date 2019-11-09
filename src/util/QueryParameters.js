// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Query Parameter parser that retrieves and/or validates a set of Query Parameters.
 *
 * ## Background:
 *  - The Query Component of a URI is indicated by the first `?`, followed by parameters, which are separated by a '&'.
 *    For instance, `https://example.com?dev&bar1=5&bar2` would yield three query parameters: `dev`, `bar1=5`, `bar2`.
 *
 * ## Usage
 *  - To see if a parameter was provided, use `QueryParemeters.contains()`. In the case above,
 *    `QueryParameters.contains( 'dev' )` would return `true`.
 *
 *  - To get the value of a query parameter, use `QueryParameters.get()`. In the case above,
 *    `QueryParameters.get( 'bar1' )` would return `5`.
 *
 *  - For validating values and providing a default value, use `QueryParameters.retrieve()`.
 *    For instance, in the case above,
 *      `QueryParameters.retrieve( {
 *          bar1: {
 *            type: 'number',
 *            isValidValue: value => ( value >= 0 ),
 *            defaultValue: 0
 *          },
 *          dev: {
 *            type: 'flag'
 *          }
 *          ... // add as many parameters as you want
 *      } );`
 *    would return an object of the values. See `QueryParameters.retrieve()` for further documentation.
 *
 * NOTE: if a query parameter is present multiple times in the Query Component, the value will be the latest declared,
 *       or the furthest to the right.
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );

  // constants
  const PARSED_QUERY_PARAMETERS = parseAllQueryParameters();
  const VALID_SCHEMA_TYPES = [ 'flag', 'boolean', 'number', 'string' ];

  //----------------------------------------------------------------------------------------

  class QueryParameters {

    /**
     * Validates and retrieves a set of values based on a schema. See the doc string for context.
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
      const queryParametersRetrieved = {};

      assert( Object.getPrototypeOf( schema ) === Object.prototype, `invalid schema: ${ schema }` );

      //----------------------------------------------------------------------------------------
      // Loop through the schema and retrieve each Query Parameter value.
      Object.keys( schema ).forEach( name => {

        //----------------------------------------------------------------------------------------
        // Validate the schema objects
        const object = schema[ name ];
        assert( Object.getPrototypeOf( object ) === Object.prototype,
          `invalid schema object for ${ name }: ${ object }` );

        const type = object.type;
        assert( VALID_SCHEMA_TYPES.includes( type ),
          `${ name } of schema didn't implement 'type' correctly: ${ object }` );

        const exactValue = this.get( name );
        const parsedValue = parse( exactValue, type );

        let retrievedValue;

        // Flags
        if ( type === 'flag' ) {
          retrievedValue = this.contains( name );

          // Check that the flag was entered correctly if it exists.
          ( retrievedValue ) && assert( parsedValue === null,
            `Query Parameter ${ name } is type 'flag', which doesn't support the value ${ parsedValue }` );
        }
        else {

          // check the default value is implemented correctly
          const defaultValue = object.defaultValue;
          assert( typeof defaultValue === type,
            `schema default value for ${ name } must be a ${ type }. Invalid default value: ${ defaultValue }` );

          exactValue !== undefined && validateValue( exactValue, type, name );

          retrievedValue = this.contains( name ) ? parsedValue : defaultValue;

          assert( !this.contains( name ) || exactValue !== null,
            `Query Parameter for ${ name } requires a value as it is of type ${ type }` );

          if ( object.isValidValue && type !== 'boolean' ) {
            assert( typeof object.isValidValue === 'function', `isValidValue for ${ name } must be a function` );
            assert( object.isValidValue( retrievedValue ) === true,
              `Query Parameter for ${ name } isn't a valid value: ${ retrievedValue}` );
          }
        }

        queryParametersRetrieved[ name ] = retrievedValue;
      } );

      return queryParametersRetrieved;
    }

    /**
     * Checks if a query parameter name is apart of the URI.
     * @public
     *
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
     * @public
     *
     * IMPORTANT: flag parameter values (no value) will return `null`. Non-existent parameters will return `undefined`.
     *            It is therefore recommended to use `QueryParameters.retrieve` to specify types and get truthy values
     *            for flags.
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


  function parse( value, type ) {
    if ( type === 'number' ) {
      return Number( value );
    }
    else if ( type === 'boolean' ) {
      return value === 'true';
    }
    else {
      return value;
    }
  }

  function validateValue( value, type, name ) {
    if ( type === 'number' ) {
      assert( !isNaN( Number( value ) ), `Invalid ${ type } for Query Parameter ${ name }: ${ value }` );
    }
    else if ( type === 'boolean' ) {
      assert( value === 'false' || value === 'true', `Invalid ${ type } for Query Parameter ${ name }: ${ value }` );
    }
  }

  return QueryParameters;
} );