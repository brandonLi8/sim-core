// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Query Parameter parser that validates and/or retrieves a set of Query Parameters.
 *
 * ## Background:
 *  - The Query Component of a URL is indicated by the first `?`. Parameters are provided and separated by a '&'.
 *    For instance, `https://name.com?dev&bar1=5&bar2` would yield three query parameters: `dev`, `bar1=5`, `bar2`.
 *
 * ## Usage
 *  - For retrieving if a parameter exists, you can use `QueryParemeters.contains`. In this case above,
 *    `QueryParameters.contains( 'bar1' )` would return `true`.
 *
 *  - For retrieving the value of a query parameter, use `QueryParameters.get`. In the case above,
 *    `QueryParameters.get( 'bar1' )` would return 5.
 *
 *  - For validating values and providing a default when not provided, use `QueryParameters.retrieve()`.
 *    For instance, in the case above,
 *      `QueryParameters.retrieve( {
 *          bar1: {
 *            type: 'number',
 *            isValidValue: value => ( typeof value === 'number' && value >= 0 ),
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

  const QueryParameters = {

    get: () => {
      var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    const urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);

     return urlParams
    }
  }

  return QueryParameters;
} );
