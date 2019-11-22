// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A DOMObject that displays the frames per second (fps) along with other performance data of the simulation while
 * running in real time. For context, see https://en.wikipedia.org/wiki/Frame_rate.
 *
 * The counter is designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * It is used to help quantify one aspect of the simulation's performance. However, that's NOT to say that FPS
 * should be the only way to determine if a simulation has acceptable performance.
 *
 * The output is displayed in the upper-left corner of the browser window.
 * It updates every COUNTER_CYCLE frames and displays:
 *   (1) the average FPS for the last cycle
 *   (2) the average milliseconds per frame for the last cycle
 *   (3) the lowest the instantaneous FPS hit in the last cycle
 *   (4) the highest the instantaneous FPS hit in the last cycle
 *
 * The format that is displayed is:
 * `FPS [{{DOWN_ARROW}}low {{UP_ARROW}}high] - ms/frame`
 *
 * For instance:
 * `64.4 FPS [{{DOWN_ARROW}}50.2 {{UP_ARROW}}69.3] - 15.5 ms/frame`
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

} );