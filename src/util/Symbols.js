// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Abstraction of standard symbols used in sim-development, stored in a object literal.
 * Used for ease of changing in all locations if needed in the future.
 *
 * Use by directly accessing the value through a template literal.
 * For instance:
 *     Good: const expression = `190 ${ Symbols.TIMES } 180`;
 *     Bad:  const expression = `190 \u00d7 180`; || const expression = `190 * 180`;
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
define( require => {
  'use strict';

  const Symbols = {

    //----------------------------------------------------------------------------------------
    // Binary Operators
    PLUS: '+',
    MINUS: '\u2212',
    TIMES: '\u00d7',
    DIVIDE: '\u00f7',
    DOT: '\u22c5',

    //----------------------------------------------------------------------------------------
    // Unary Operators
    UNARY_PLUS: '+',
    UNARY_MINUS: '-',

    //----------------------------------------------------------------------------------------
    // Relational Operators
    EQUAL_TO: '=',
    NOT_EQUAL_TO: '\u2260',
    GREATER_THAN: '>',
    LESS_THAN: '<',
    LESS_THAN_OR_EQUAL: '\u2264',
    GREATER_THAN_OR_EQUAL: '\u2265',

    //----------------------------------------------------------------------------------------
    // Other Symbols
    PERCENT: '%',
    INFINITY: '\u221E',
    PI: '\u03c0',
    PLUS_OR_MINUS: '\u00B1',
    THETA: '\u03B8',
    DEGREES: '\u00B0',
    NO_VALUE: '\u2014' // em dash
    OMEGA: '\u03C9',
    ALPHA: '\u03B1'

  };

  return Symbols;
} );