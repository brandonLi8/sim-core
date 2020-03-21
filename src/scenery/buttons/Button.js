// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A base-class abstraction for all Button Node sub-types. This class is generally not meant to be used within
 * sim-specific code. Rather, use any of its subclasses.
 *
 * The Button class is responsible for:
 *   - Handling Drag/Hover/Press Listeners for handling user interaction with the Button.
 *   - Positioning content on-top of a background Path sub-type.
 *   - Providing a static method that makes a Button's background look 3D by highlighting and shading different portions
 *     of a Gradient based off a base-color and returning the Gradient (to be applied as the 'fill' of a Path).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */


