// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Listens to all drag-related events, such as mouse clicks and finger presses. Has an API to allow for listeners
 * to attach to both the press and the release event of Nodes.
 *
 * A typical PressListener usage would look something like:
 * ```
 *   const nodePre sssListener = new PressListener( someNode, {
 *     press: () => { ... },
 *     release: () => { ... }
 *   } );
 * ```
 * NOTE: A press listener will listen to when a Node is pressed. However, is the Node is being disposed of or is no
 *       longer in use, make sure to dispose of the PressListener to allow Javascript to garbage collect the
 *       PressListener. Not disposing can result in a memory leak! See the `dispose()` method.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
