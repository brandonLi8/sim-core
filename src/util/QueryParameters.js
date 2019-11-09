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
  const EXACT_QUERY_PARAMETERS = parseExactQueryParameters();
  const VALID_SCHEMA_TYPES = [ 'flag', 'boolean', 'number', 'string' ];

  //----------------------------------------------------------------------------------------

  class QueryParameters {


    /**
     * Checks if a query parameter name is apart of the URI.
     * @public
     *
     * @param {string} name - the query parameter name
     * @returns {boolean}
     */
    contains( name ) {
      assert( typeof name === 'string', `invalid name ${ name }` );

      return EXACT_QUERY_PARAMETERS.hasOwnProperty( name );
    }

    /**
     * Gets the value for a single query parameter. If the query parameter is a flag, this returns `true`.
     * If the parameter isn't apart of the URI, this returns 'null'. All other values are straight forward.
     * @public
     *
     * @param {string} name - the query parameter name
     * @returns {*|null} - query parameter value
     */
    static get( name ) {
      assert( typeof name === 'string', `invalid name ${ name }` );

      // Get the value from the parsed query parameters.
      const value = EXACT_QUERY_PARAMETERS.hasOwnProperty( name ) ?  EXACT_QUERY_PARAMETERS[ name ] : null;
      return value === '' ? true : value; // true if the value is the empty string, signaling a flag.
    }
  }

  //----------------------------------------------------------------------------------------

  /**
   * Parses all query parameters of the URI exactly how it appears into an object literal. Values without
   * the value operator ('=') are given an empty string. This function is for internal use (not public facing).
   * For performance reasons, this function should be called once at startup.
   *
   * For context, see:
   *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent
   *  - https://www.w3schools.com/jsref/prop_loc_search.asp
   *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
   *
   * @returns {Object}
   */
  function parseExactQueryParameters() {

    // Get the Query Component of the URI
    const queryComponent = window.location.search.substring( 1 );
    const searchRegEx = /([^&=]+)=?([^&]*)/g;
    let matches = searchRegEx.exec( queryComponent );
    const parameters = {};

    while ( matches ) {
      parameters[ decodeURIComponent( matches[ 1 ] ) ] = decodeURIComponent( matches[ 2 ] );
      matches = searchRegEx.exec( queryComponent );
    }
    return parameters;
  }

  return QueryParameters;
} );