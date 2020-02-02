// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A 3 by 2 transformation Matrix, for identifying 2D CSS transformations. Supports a conversion to pixels given the
 * ScreenView scalings.
 *
 * There are 3 main transformations that are supported:
 * ### Scaling:
 *  Scaling works by multiplying the current width and height by a scalar value. There are generally 2 scalar values:
 *  one for x-scaling and one for y-scaling. Scale factors can by any number, including negatives and decimals.
 *  Negative scaling has the the effect of flipping the element about the respective axis. See setScale() for more doc.
 *
 * ### Rotation:
 *  Rotation is the amount of rotation of the element. Positive rotations are clockwise and negative rotations are
 *  counter-clockwise. Rotation are in radians. See setRotation() for more information.
 *
 * ## Translation:
 *  Translation is a shift in position of the element, relative to the original position. It is given in
 *  scenery coordinates (see Node.js for more information), and is represented in a Vector (x, y). See setTranslation()
 *  for more documentation.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix for context.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );


  return Transformation;
}