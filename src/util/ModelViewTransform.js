// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Utility for transforming between model and view coordinate frames, with convenience methods for conversions.
 *
 * Requires a one-to-one transformation, that can be built from just component-wise translations and scalings. The input
 * coordinate should correlate to one and only one output transformation. Equivalently, both the view and model bounds
 * must also be one-to-one, such that every x correlates to one and only one y.
 *
 * The convention is that the y-axis is inverted for the view and that the view origin as at the top-left of the
 * ScreenView. This transformation utility assumes that this is the case and will invert y-axis transformations.
 * Inverting the y-axis allows for a natural and conventional model y-axis, with the positive y upwards.
 *
 * See `tests/util/ModelViewTransformTests` (relative to sim-core) for an example Bounds setup and usage case.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const B = ( minPoint, maxPoint ) => Bounds.withPoints( minPoint, maxPoint );

  class ModelViewTransform {

    /**
     * @param {Bounds} modelBounds - Bounds of the model. Must be finite and have a positive area (width & height > 0).
     * @param {Bounds} viewBounds - Bounds of the view. Must be finite and have a positive area (width & height > 0).
     */
    constructor( modelBounds, viewBounds ) {
      assert( modelBounds instanceof Bounds, `invalid modelBounds: ${ modelBounds }` );
      assert( viewBounds instanceof Bounds, `invalid viewBounds: ${ viewBounds }` );
      assert( modelBounds.isFinite() && modelBounds.area > 0, 'modelBounds must be finite and have a positive area' );
      assert( viewBounds.isFinite() && viewBounds.area > 0, 'viewBounds must be finite and have a positive area' );

      // @private {number} - the scale of the bounds, in model units per view unit.
      this._xScale = modelBounds.width / viewBounds.width;
      this._yScale = -( modelBounds.height / viewBounds.height ); // negative because the view scale is inverted

      // @private {number} - the offsets.
      this._xViewOffset = viewBounds.minX - modelBounds.minX / this._xScale;
      this._yViewOffset = viewBounds.minY - modelBounds.maxY / this._yScale;
      this._xModelOffset = modelBounds.minX - viewBounds.minX * this._xScale;
      this._yModelOffset = modelBounds.minY - viewBounds.maxY * this._yScale;
    }

    //----------------------------------------------------------------------------------------
    // @public Model to View transformations.
    //----------------------------------------------------------------------------------------

    // Coordinate transformations
    modelToViewX( x ) { return x / this._xScale + this._xViewOffset; }
    modelToViewY( y ) { return y / this._yScale + this._yViewOffset; }
    modelToViewXY( x, y ) { return new Vector( this.modelToViewX( x ), this.modelToViewY( y ) ); }

    // Width/Height transformations
    modelToViewDeltaX( x ) { return x / this._xScale; }
    modelToViewDeltaY( y ) { return y / this._yScale; }
    modelToViewDelta( pt ) { return new Vector( this.modelToViewDeltaX( pt.x ), this.modelToViewDeltaY( pt.y ) ); }

    // Utilities
    modelToViewPoint( pt ) { return new Vector( this.modelToViewX( pt.x ), this.modelToViewY( pt.y ) ); }
    modelToViewBounds( b ) { return B( this.modelToViewPoint( b.leftTop ), this.modelToViewPoint( b.rightBottom ) ); }

    //----------------------------------------------------------------------------------------
    // @public View to Model transformations.
    //----------------------------------------------------------------------------------------

    // Coordinate transformations
    viewToModelX( x ) { return x * this._xScale + this._xModelOffset; }
    viewToModelY( y ) { return y * this._yScale + this._yModelOffset; }
    viewToModelXY( x, y ) { return new Vector( this.viewToModelX( x ), this.viewToModelY( y ) ); }

    // Width/Height transformations
    viewToModelDeltaX( x ) { return x * this._xScale; }
    viewToModelDeltaY( y ) { return y * this._yScale; }
    viewToModelDelta( pt ) { return new Vector( this.viewToModelDeltaX( pt.x ), this.viewToModelDeltaY( pt.y ) ); }

    // Utilities
    viewToModelPoint( pt ) { return new Vector( this.viewToModelX( pt.x ), this.viewToModelY( pt.y ) ); }
    viewToModelBounds( b ) { return B( this.viewToModelPoint( b.leftTop ), this.viewToModelPoint( b.rightBottom ) ); }
  }

  return ModelViewTransform;
} );