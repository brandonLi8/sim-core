// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Listens to all drag-related events. Has an API to allow for listeners to attach to the 'start', 'drag', and 'end'
 * events of Dragging.
 *
 * Dragging occurs when:
 *   1. The mouse/pointer-finger is moved above the target node.
 *   2. The mouse/pointer-finger presses down on the target node. This is known as the 'start' of the drag.
 *   3. The mouse/pointer-finger, **while still pressed down**, moves to a new location. This is known as the 'drag'
 *      portion of the overall drag, and occurs each time the pointer is moved.
 *   4. The mouse/pointer-finger is released (where it is released doesn't matter).
 *
 * NOTE: Creating a new DragListener doesn't move the target node when the node is 'dragged.' However, this affect
 *       can be achieved by listening to the 'drag' portion described above. The listener will be passed the
 *       the displacement (in scenery coordinates), the cursor position (in the parent coordinate frame), and the event,
 *       to which the listener can reposition the node if desired (which won't cancel the drag event).
 *
 * NOTE: A press listener will listen to when a Node is pressed. However, is the Node is being disposed of or is no
 *       longer in use, make sure to dispose of the PressListener to allow Javascript to garbage collect the
 *       PressListener. Not disposing can result in a memory leak! See the `dispose()` method.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
