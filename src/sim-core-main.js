// Copyright © 2019-2020 Brandon Li. All rights reserved.

define( [
  'SIM_CORE/core-internal/Display',
  'SIM_CORE/core-internal/DOMObject',
  'SIM_CORE/core-internal/FPSCounter',
  'SIM_CORE/core-internal/Loader',
  'SIM_CORE/core-internal/NavigationBar',

  'SIM_CORE/scenery/components/buttons/Checkbox',
  'SIM_CORE/scenery/components/buttons/PlayPauseButton',
  'SIM_CORE/scenery/components/buttons/StepButton',
  'SIM_CORE/scenery/components/buttons/TimeControlBox',

  'SIM_CORE/scenery/CircleNode',
  'SIM_CORE/scenery/LineNode',
  'SIM_CORE/scenery/Node',
  'SIM_CORE/scenery/Polygon',
  'SIM_CORE/scenery/Rectangle',
  'SIM_CORE/scenery/ScreenView',
  'SIM_CORE/scenery/components/SliderNode',
  'SIM_CORE/scenery/SVGNode',
  'SIM_CORE/scenery/Text',
  'SIM_CORE/scenery/VectorNode',

  'SIM_CORE/util/assert',
  'SIM_CORE/util/Bounds',
  'SIM_CORE/util/DerivedProperty',
  'SIM_CORE/util/ModelViewTransform',
  'SIM_CORE/util/Multilink',
  'SIM_CORE/util/Property',
  'SIM_CORE/util/QueryParameters',
  'SIM_CORE/util/Symbols',
  'SIM_CORE/util/Util',
  'SIM_CORE/util/Vector',

  'SIM_CORE/Screen',
  'SIM_CORE/Sim'
], () => { 'use strict'; } );