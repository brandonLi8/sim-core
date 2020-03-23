// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Abstract class for Gradients, specifically for LinearGradient and RadialGradient. Not meant to be instantiated
 * directly.
 *
 * A Gradient refers to smooth transition of one color to another color within a shape.
 * Gradients can be applied as 'fills' and 'strokes' in Path and Text.
 *
 * IMPORTANT: Gradient instances should be disposed when they are no longer needed. See the dispose() method.
 *
 * While code comments attempt to describe the implementation clearly, fully understanding it may require some
 * general background. Some useful references include:
 *    - https://www.w3.org/TR/SVG/pservers.html#Gradients
 *    - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  // flags
  let globalId = 1;

  class Gradient {

    /**
     * @abstract
     * NOTE: sub-types may have different arguments for their constructor.
     *
     * @param {string} type - the type of Gradient: either 'linearGradient' or 'radialGradient'
     */
    constructor( type ) {
      assert( type === 'linearGradient' || type === 'radialGradient', `invalid type: ${ type }` );
      if ( this.constructor === Gradient ) assert( false, 'Abstract class Gradient cannot be instantiated directly.' );
      if ( !Gradient._SVGElement ) Gradient._initializeGradientDOMObjects();

      // @private {string} - each Gradient needs to have a unique id to be referenced.
      this._id = `scenery-gradient-${ globalId++ }`;

      // @protected {DOMObject} - create the DOMObject that represents the definition of the gradient in the scene graph
      this._definitionElement = new DOMObject( { id: this._id, type } );

      // @private {number} - tracks the percentage of the last stop, to ensure stops are added in increasing order.
      this._lastStopPercentage = 0;

      // Add the _definitionElement to the _embededDefsElement container.
      Gradient._embededDefsElement.addChild( this._definitionElement );
    }

    /**
     * Adds a color stop to the gradient. Color stops are the colors rendered smoothly along the Gradient.
     * This color stop consists of a color value and a stop percentage offset (a decimal percentage between 0 and 100).
     *
     * IMPORTANT: Color stops should be added in order (monotonically increasing ratio values).
     * @public
     *
     * @param {string} - the css color string at the specific stop. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value.
     * @param {number} percentage - percentage along the gradient, in the range of 0 to 100
     * @returns {Gradient} - 'this' reference, for chaining
     */
    addColorStop( color, percentage ) {
      assert( typeof color === 'string', `invalid color: ${ color }` );
      assert( typeof percentage === 'number' && percentage >= 0, `invalid percentage: ${ percentage }` );
      assert( this._lastStopPercentage === 0 || percentage > this._lastStopPercentage,
        'gradient stop percentages must be monotonically increasing' );

      // Update the _lastStopPercentage flag
      this._lastStopPercentage = percentage;

      // Create the SVG stop element.
      const stopElement = new DOMObject( {
        type: 'stop',
        attributes: {
          offset: `${ percentage }%`,
          'stop-color': color
        }
      } );

      // Add the stop element to the definition
      this._definitionElement.addChild( stopElement );
      return this;
    }

    /**
     * IMPORTANT: Gradients immediately link DOMObjects to the window when instantiated. This may lead to memory
     *            leaks because the window scene graph always references the Gradient even if nothing else is
     *            referencing the Gradient, which prevents the gradient from being garbage collected.
     *
     * This method will ensure that the Gradient unlinks its inner DOMObjects from the scene-graph and allows
     * the Gradient to be garbage collected if nothing else references it.
     * @public
     */
    dispose() { this._definitionElement.dispose(); }

    /**
     * Gets the SVG fill/stroke attribute for the string to reference this gradient.
     * @public (sim-core-internal)
     *
     * @returns {string}
     */
    get SVGGradientString() { return `url(#${ this._id })`; }

    /**
     * Static method that initializes containers and elements needed for SVG gradients.
     * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs for documentation and background.
     * @private
     */
    static _initializeGradientDOMObjects() {

      // Create a SVG element as the parent of the definitions element and connect it to the document body.
      Gradient._SVGElement = new DOMObject( {
        type: 'svg',
        id: 'scenery-gradients',
        style: {
          opacity: 0,
          position: 'absolute',
          left: '-65535px', // Ensure that it is not visible to the user.
          top: '-65535px',
          width: 0,
          hegiht: 0
        }
      } );
      document.body.appendChild( Gradient._SVGElement.element );

      // Create the definitions container element and connect it to the SVG element.
      Gradient._embededDefsElement = new DOMObject( { type: 'defs' } );
      Gradient._SVGElement.addChild( Gradient._embededDefsElement );
    }
  }

  // @private {DOMObject} - parent of the _embededDefsElement that is connected to the document body.
  Gradient._SVGElement;

  // @private {DOMObject} - Container for the gradient definitions. See
  //                        https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs for background.
  Gradient._embededDefsElement;

  return Gradient;
} );