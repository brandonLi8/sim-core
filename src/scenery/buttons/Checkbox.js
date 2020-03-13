// Copyright © 2019-2020 Brandon Li. All rights reserved.
// NOTE: THIS DOESNT WORK ATM!!!

/**
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Polygon = require( 'SIM_CORE/scenery/Polygon' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );


  class Checkbox extends SVGNode {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( toggleProperty, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );


      // Defaults for options.
      const defaults = {
        spacing: 5,
        boxSize: 19,

        // box
        boxStroke: 'black',
        boxFill: 'white',
        boxCornerRadius: 3,
        boxStrokeWidth: 2,

        // check
        checkFill: 'black',
        checkStroke: 'white',
        checkStrokeWidth: 0.8,

        style: {
          cursor: 'pointer'
        }
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.width = options.boxSize;
      options.height = options.boxSize;

      super( options );

      //----------------------------------------------------------------------------------------
      // Create the Rectangle Box
      const box = new Rectangle( {
        width: options.boxSize,
        height: options.boxSize,
        cornerRadius: options.boxCornerRadius,
        fill: options.boxFill,
        stroke: options.boxStroke,
        strokeWidth: options.boxStrokeWidth
      } );

      //----------------------------------------------------------------------------------------
      // Create the Check (reverse L rotated)
      const width = options.boxSize * 5 / 8;
      const height = width * 27 / 16;
      const barSize = width * 5 / 12;
      const offset = new Vector( options.boxSize * 2 / 5, options.boxSize * 1 / 4 );

      const lPoints = [
        new Vector( 0, 0 ),
        new Vector( width, 0 ),
        new Vector( width, -height ),
        new Vector( width - barSize, -height ),
        new Vector( width - barSize, -barSize ),
        new Vector( 0, -barSize )
      ].map( point => point.add( offset ).rotate( Math.PI / 4 ) );

      const check = new Polygon( lPoints, {
        fill: options.checkFill,
        stroke: options.checkStroke,
        strokeWidth: options.checkStrokeWidth
      } );

      //----------------------------------------------------------------------------------------
      // Add the Children
      this.setChildren( [ box, check ] );

      //----------------------------------------------------------------------------------------
      // Add the Toggle functionality
      this.mousedown = () => { toggleProperty.toggle(); };

      toggleProperty.link( isVisible => {
        check.style.opacity = isVisible ? 1 : 0;
      } );
    }
  }

  return Checkbox;
} );