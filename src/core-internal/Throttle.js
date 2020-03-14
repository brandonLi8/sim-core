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
