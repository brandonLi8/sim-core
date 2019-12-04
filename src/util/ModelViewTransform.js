// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Transform between model and view coordinate frames, with convenience methods for conversions.
 *
 * Requires that the transform is "aligned", i.e., it can be built only from component-wise translation and scaling.
 * Equivalently, the output x coordinate should not depend on the input y, and the output y shouldn't depend on the
 * input x.
 *
 * The convention is that the y axis is inverted for the view and that the view origin as at the top-left of the
 * ScreenView. Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y is down in
 * pixel coordinates. This transform assumes that this is the case.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class ModelViewTransform {

    /**
     * @param modelBounds {Bounds} the reference rectangle in the model, must have area > 0
     * @param viewBounds {Bounds} the reference rectangle in the view, must have area > 0
     */
    constructor( modelBounds, viewBounds ) {

      assert( modelBounds instanceof Bounds && modelBounds.area > 0, `invalid modelBounds: ${ modelBounds }` );
      assert( viewBounds instanceof Bounds && viewBounds.area > 0, `invalid viewBounds: ${ viewBounds }` );

      // @public final (read-only) {Bounds}
      this.modelBounds = modelBounds;
      this.viewBounds = viewBounds;

      // @private {number} xViewToModelScale (in view units per model unit)
      this.xViewToModelScale = viewBounds.width / modelBounds.width;

      // @private {number} yViewToModelScale (in view units per model unit)
      this.yViewToModelScale = -viewBounds.height / modelBounds.height;

      // @private {number} x-offset
      this.xViewOffset = viewBounds.minX - this.xViewToModelScale * modelBounds.minX;
      this.xModelOffset = modelBounds.minX - viewBounds.minX / this.xViewToModelScale;

      // @private {number} yViewOffset
      this.yViewOffset = viewBounds.minY - this.yViewToModelScale * modelBounds.maxY;
      this.yModelOffset = modelBounds.minY - viewBounds.maxY / this.yViewToModelScale;
    }

    //----------------------------------------------------------------------------------------
    // @public Model => View
    //----------------------------------------------------------------------------------------
    modelToViewX( x ) { return this.xViewToModelScale * x + this.xViewOffset; }
    modelToViewY( y ) { return this.yViewToModelScale * y + this.yViewOffset; }
    modelToViewXY( x, y ) { return new Vector( this.modelToViewX( x ), this.modelToViewY( y ) ); }
    modelToViewPoint( point ) { return new Vector( this.modelToViewX( point.x ), this.modelToViewY( point.y ) ); }
    modelToViewBounds( bounds ) {
      return new Bounds(
        this.modelToViewX( bounds.minX ),
        this.modelToViewY( bounds.maxY ), // inverts y
        this.modelToViewX( bounds.maxX ),
        this.modelToViewY( bounds.minY )
      );
    }

    //----------------------------------------------------------------------------------------
    // @public View => Model
    //----------------------------------------------------------------------------------------
    viewToModelX( x ) { return x / this.xViewToModelScale + this.xModelOffset; }
    viewToModelY( y ) { return y / this.yViewToModelScale + this.yModelOffset; }
    viewToModelXY( x, y ) { return new Vector( this.viewToModelX( x ), this.viewToModelY( y ) ); }
    viewToModelPoint( point ) { return new Vector( this.viewToModelX( point.x ), this.viewToModelY( point.y ) ); }
    viewToModelBounds( bounds ) {
      return new Bounds(
        this.viewToModelX( bounds.minX ),
        this.viewToModelY( bounds.maxY ), // inverts y
        this.viewToModelX( bounds.maxX ),
        this.viewToModelY( bounds.minY )
      );
    }
  }

  return ModelViewTransform;
} );