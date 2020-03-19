// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * FlexBox is a Node sub-type that lays out its children in either a horizontal row or a vertical column, loosely
 * based off CSS flex-box layout. See https://css-tricks.com/snippets/css/a-guide-to-flexbox/ for context.
 *
 * FlexBox does differ from CSS flex-box slightly in its handling of verbose widths/heights. Rather than specifying the
 * width or height of the Node, it internally computes the dimensions of the FlexBox. As a result, FlexBox doesn't
 * ever expand into multiple lines or columns and doesn't support 'justify-content' or 'flex-wrap' styles.
 *
 * FlexBox does contain an API to allow for alignment along the secondary axis of the FlexBox, similar to the flex-box
 * 'align-items' style. For horizontal rows, FlexBox can align with 'top' | 'center' | 'bottom'. Similarly, for
 * vertical columns, FlexBox can align its children 'left', 'center', 'right'. You can also specify the spacing of the
 * FlexBox in between its children Nodes.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
