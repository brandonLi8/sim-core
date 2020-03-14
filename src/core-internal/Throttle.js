// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Class that applies a throttle implementation on a function.
 *
 * See https://stackoverflow.com/questions/25991367/difference-between-throttling-and-debouncing-a-function before
 * reading the documentation in this file.
 *
 * Throttling works by limiting how frequently a handler or listener will be called by setting a timeout
 * between calls, giving a more reasonable rate of calls. The throttle method also implements a final debounce, which
 * enforces the listener to be invoked again after an amount of time of inactivity. This is done to be safe when
 * restricting the rate of invocations of a function, and particularly ensures the listener is called again even when
 * the action stops in the middle of a throttle cycle.
 *
 * The throttle method is intended to be used for resize listeners, drag listeners, etc, which can significantly
 * improve the performance of the simulation when dealing with costly listeners.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );

  class Throttle {

    /**
     * Creates a throttled optimized function that only calls the listener at most once per every waitTime milliseconds.
     * See the comment at the top of the file for more documentation. Will forward all of the passed arguments to the
     * throttled function to the listener.
     * @public
     *
     * @param {function(..*)} listener - the listener of a action that needs to be throttled
     * @param {number} waitTime - the minimum time between invocations of the listener
     * @returns {function(..*)} - the throttled optimized function
     */
    static throttle( listener, waitTime ) {

      // Flag that indicates if we need to throttle and temporarily stop invocations of the listener.
      let throttled = false;

      // Flag that indicates if the throttle function is called when it is in a throttle cycle. This is the final
      // debounce referenced at the top of the file, which enforces the listener to be invoked again after an amount of
      // time of inactivity. This ensures the listener is called again even when the action stops. However, if the
      // throttled function is called again before the backup debounce invocation is triggered, it is canceled. This
      // essentially keeps the reduction of listener calls to at most once per waitTime milliseconds.
      let backupDebouncedScheduled = false;

      // Create the throttled function.
      const throttleFunction = ( ...args ) => {

        // If we are out of a throttle cycle, and there is no backupDebouncedScheduled, we are essentially at a clean
        // invocation.
        if ( !throttled && !backupDebouncedScheduled ) {

          // Now that we are at a clear invocation of the listener, indicate a new throttle cycle.
          throttled = true;

          // Call the listener, forwarding all of the passed arguments from the throttled function to the listener.
          listener( ...args );

          // Set a timeout to clear the throttle cycle for the next invocation.
          setTimeout( () => {
            throttled = false;
          }, waitTime );
        }

        // If we are inside a throttle cycle, and there is no backupDebouncedScheduled, we need to schedule a
        // backup debounce cycle.
        else if ( throttled && !backupDebouncedScheduled ) {

          // Indicate that a backup debounce cycle has started.
          backupDebouncedScheduled = true;

          // Set a timeout to clear the backup debounce cycle for the next throttle cycle.
          setTimeout( () => {

            // Clear the backup debounce cycle.
            backupDebouncedScheduled = false;

            // Call the throttle function, as the backupDebouncedScheduled has been completed.
            throttleFunction( ...args );

          }, 2 * waitTime ); // Double the wait time as backups normally occur right after a throttle cycle starts.
        }
      };
      return throttleFunction;
    }
  }

  return Throttle;
} );