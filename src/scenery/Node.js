// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A node for the Scenery scene graph. Supports general directed acyclic graphics (DAGs).
 * Handles multiple layers with assorted types (Canvas 2D, SVG, DOM, WebGL, etc.).
 *
 * ## General description of Nodes
 *
 * In Scenery, the visual output is determined by a group of connected nodes (generally known as a scene graph).
 * Each node has a list of 'child' nodes. When a node is visually displayed, its child nodes (children) will also be
 * displayed, along with their children, etc. There is typically one 'root' node that is passed to the Scenery Display
 * whose descendants (nodes that can be traced from the root by child relationships) will be displayed.
 *
 * For instance, say there are nodes named A, B, C, D and E, who have the relationships:
 * - B is a child of A (thus A is a parent of B)
 * - C is a child of A (thus A is a parent of C)
 * - D is a child of C (thus C is a parent of D)
 * - E is a child of C (thus C is a parent of E)
 * where A would be the root node. This can be visually represented as a scene graph, where a line connects a parent
 * node to a child node (where the parent is usually always at the top of the line, and the child is at the bottom):
 * For example:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *
 * Additionally, in this case:
 * - D is a 'descendant' of A (due to the C being a child of A, and D being a child of C)
 * - A is an 'ancestor' of D (due to the reverse)
 * - C's 'subtree' is C, D and E, which consists of C itself and all of its descendants.
 *
 * Note that Scenery allows some more complicated forms, where nodes can have multiple parents, e.g.:
 *
 *   A
 *  / \
 * B   C
 *  \ /
 *   D
 *
 * In this case, D has two parents (B and C). Scenery disallows any node from being its own ancestor or descendant,
 * so that loops are not possible. When a node has two or more parents, it means that the node's subtree will typically
 * be displayed twice on the screen. In the above case, D would appear both at B's position and C's position. Each
 * place a node would be displayed is known as an 'instance'.
 *
 * Each node has a 'transform' associated with it, which determines how its subtree (that node and all of its
 * descendants) will be positioned. Transforms can contain:
 * - Translation, which moves the position the subtree is displayed
 * - Scale, which makes the displayed subtree larger or smaller
 * - Rotation, which displays the subtree at an angle
 * - or any combination of the above that uses an affine matrix (more advanced transforms with shear and combinations
 *   are possible).
 *
 * Say we have the following scene graph:
 *
 *   A
 *   |
 *   B
 *   |
 *   C
 *
 * where there are the following transforms:
 * - A has a 'translation' that moves the content 100 pixels to the right
 * - B has a 'scale' that doubles the size of the content
 * - C has a 'rotation' that rotates 180-degrees around the origin
 *
 * If C displays a square that fills the area with 0 <= x <= 10 and 0 <= y <= 10, we can determine the position on
 * the display by applying transforms starting at C and moving towards the root node (in this case, A):
 * 1. We apply C's rotation to our square, so the filled area will now be -10 <= x <= 0 and -10 <= y <= 0
 * 2. We apply B's scale to our square, so now we have -20 <= x <= 0 and -20 <= y <= 0
 * 3. We apply A's translation to our square, moving it to 80 <= x <= 100 and -20 <= y <= 0
 *
 * Nodes also have a large number of properties that will affect how their entire subtree is rendered, such as
 * visibility, opacity, etc.
 *
 * ## Creating nodes
 *
 * Generally, there are two types of nodes:
 * - Nodes that don't display anything, but serve as a container for other nodes (e.g. Node itself, HBox, VBox)
 * - Nodes that display content, but ALSO serve as a container (e.g. Circle, Image, Text)
 *
 * When a node is created with the default Node constructor, e.g.:
 *   var node = new Node();
 * then that node will not display anything by itself.
 *
 * Generally subtypes of Node are used for displaying things, such as Circle, e.g.:
 *   var circle = new Circle( 20 ); // radius of 20
 *
 * Almost all nodes (with the exception of leaf-only nodes like Spacer) can contain children.
 *
 * ## Connecting nodes, and rendering order
 *
 * To make a 'childNode' become a 'parentNode', the typical way is to call addChild():
 *   parentNode.addChild( childNode );
 *
 * To remove this connection, you can call:
 *   parentNode.removeChild( childNode );
 *
 * Adding a child node with addChild() puts it at the end of parentNode's list of child nodes. This is important,
 * because the order of children affects what nodes are drawn on the 'top' or 'bottom' visually. Nodes that are at the
 * end of the list of children are generally drawn on top.
 *
 * This is generally easiest to represent by notating scene graphs with children in order from left to right, thus:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *
 * would indicate that A's children are [B,C], so C's subtree is drawn ON TOP of B. The same is true of C's children
 * [D,E], so E is drawn on top of D. If a node itself has content, it is drawn below that of its children (so C itself
 * would be below D and E).
 *
 * This means that for every scene graph, nodes instances can be ordered from bottom to top. For the above example, the
 * order is:
 * 1. A (on the very bottom visually, may get covered up by other nodes)
 * 2. B
 * 3. C
 * 4. D
 * 5. E (on the very top visually, may be covering other nodes)
 *
 * ## Trails
 *
 * For examples where there are multiple parents for some nodes (also referred to as DAG in some code, as it represents
 * a Directed Acyclic Graph), we need more information about the rendering order (as otherwise nodes could appear
 * multiple places in the visual bottom-to-top order.
 *
 * A Trail is basically a list of nodes, where every node in the list is a child of its previous element, and a parent
 * of its next element. Thus for the scene graph:
 *
 *   A
 *  / \
 * B   C
 *  \ / \
 *   D   E
 *    \ /
 *     F
 *
 * there are actually three instances of F being displayed, with three trails:
 * - [A,B,D,F]
 * - [A,C,D,F]
 * - [A,C,E,F]
 * Note that the trails are essentially listing nodes used in walking from the root (A) to the relevant node (F) using
 * connections between parents and children.
 *
 * The trails above are in order from bottom to top (visually), due to the order of children. Thus since A's children
 * are [B,C] in that order, F with the trail [A,B,D,F] is displayed below [A,C,D,F], because C is after B.
 *
 * ## Events
 *
 * There are a number of events that can be triggered on a Node (usually when something changes or happens). Currently
 * Node effectively inherits the Events type, and thus has the on()/off() and onStatic()/offStatic() methods for
 * handling these types of event listeners. It is generally preferred to use the "static" forms, which have improved
 * performance (but come with the restriction that a listener being fired should NOT trigger any listeners getting
 * added or removed as a side-effect).
 *
 * The following events are exposed non-Scenery usage:
 *
 * - childrenChanged - This is fired only once for any single operation that may change the children of a Node. For
 *                     example, if a Node's children are [ a, b ] and setChildren( [ a, x, y, z ] ) is called on it,
 *                     the childrenChanged event will only be fired once after the entire operation of changing the
 *                     children is completed.
 * - selfBounds - This event can be fired synchronously, and happens with the self-bounds of a Node is changed.
 * - childBounds - This is fired asynchronously (usually as part of a Display.updateDisplay()) when the childBounds of
 *                 the node is changed.
 * - localBounds - This is fired asynchronously (usually as part of a Display.updateDisplay()) when the localBounds of
 *                 the node is changed.
 * - bounds - This is fired asynchronously (usually as part of a Display.updateDisplay()) when the bounds of the node is
 *            changed.
 * - transform - Fired synchronously when the transform (transformation matrix) of a Node is changed. Any change to a
 *               Node's translation/rotation/scale/etc. will trigger this event.
 * - visibility - Fired synchronously when the visibility of the Node is toggled.
 * - opacity - Fired synchronously when the opacity of the Node is changed.
 * - pickability - Fired synchronously when the pickability of the Node is changed
 * - clip - Fired synchronously when the clipArea of the Node is changed.
 *
 * While the following are considered scenery-internal and should not be used externally:
 *
 * - childInserted - For a single added child Node.
 * - childRemoved - For a single removed child Node.
 * - childrenReordered - Provides a given range that may be affected by the reordering
 * - localBoundsOverride - When the presence/value of the localBounds override is changed.
 * - inputEnabled - When the inputEnabled property is changed.
 * - rendererBitmask - When this node's bitmask changes (generally happens synchronously to other changes)
 * - hint - Fired synchronously when various hints change
 * - addedInstance - Fires when an Instance is added to the Node.
 * - removedInstance - Fires when an Instance is removed from the Node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );

  class Node {
    /**
     *
     * Creates a Node with options that can overide the defaults. The defaults
     * is a object type that describes the type of node.
     * The defaults are in the constructor as this.defaults = { ...
     * Everything in the options can override the defualts.
     * @public
     * @constructor
     *
     * @param {Object} [options] - Object with its attributes.
     *
     */
    constructor( options ) {
      // make sure the options is a object
      assert(
        typeof options === "object",
        "@param Options must be a object type"
      );
      // the defualts
      const defaults = {
        // {string} @optional the type of the object ie. (div, img, etc.)
        type: "div",
        // {string} @optional the text inside (null means no text)
        text: null,
        // {string} @optional the innerHtml (null means no text)
        innerHTML: null,
        // {object} @optional style the node. Use conventional javascript styling.
        style: null,
        // **ONLY** on type "img" @optional {string} the src for the image
        src: null,
        // **ONLY** on type "a" @optional {string} the href for the link
        href: null,
        // {boolean} is it draggable?
        draggable: false,
        // {function} only on draggable = true, function called on drag
        drag: null,
        // {function} only on draggable = true, function called on drag release
        dragClose: null,
        // {nameSpace} usually for svg's
        nameSpace: null, 
        // {string} @optional the id for the node
        id: null,
        // {string} @optional the class for the node
        class: null,

        // {object} the object with all of the 'attributes' of the node
        // ie. r and anything else!
        attributes: null
      };

      // merge them with user provided options overriding
      options = { ...defaults, ...options };

      // @public {object} the options to the node.
      this.options = options;

      // make sure that the node type is a string
      assert(
        typeof options.type === "string",
        "@param Options.type must be a string type. Instead it is a "
        + ( options.type && options.type.__proto__.constructor.name || 'null' )
      );

      // create node with javascript api

      // @public {DOM} - the actual DOM object inside
      if ( options.nameSpace ){ // for svg with nameSpace
        this.DOMobject = document.createElementNS( 
          options.nameSpace,
          options.type 
        );
      }
      else { // for everthing else
        this.DOMobject = document.createElement( 
          options.type 
        );
      }

      // set id
      if ( options.id ){ 
        this.DOMobject.setAttribute( "id", options.id );
      }
      // set class
      if ( options.class ){
        this.DOMobject.className = options.class;
      }

      // create the text child
      if ( options.text ) {
        // make sure that it is a valid string
        assert(
          options.text.__proto__.constructor.name === "String",
          "@param Options.text must be of String type. Instead it was a "
          + options.text.__proto__.constructor.name
        );
        // create the text node and add it
        var textNode = document.createTextNode( options.text );
        this.DOMobject.appendChild( textNode );
      }

      // create the innerHTML
      if ( options.innerHTML ) {
        // make sure that it is a valid string
        assert(
          options.innerHTML.__proto__.constructor.name === "String",
          "@param Options.innerHTML must be of String type. "
          + " Instead it was a " 
          + options.innerHTML.__proto__.constructor.name
        );
        // make it the innerHTML
        this.DOMobject.innerHTML = options.innerHTML;
      }

      // set style
      if ( options.style ) {
        this.setStyle( options.style );
      }

      // @public {array} the children of this node
      this.children = [];

      // @public {node} the parrent of the node
      this.parent = null;

      // On image nodes set the image if given
      if ( options.src && options.type === "img" ) {
        assert(
          options.src.__proto__.constructor.name === "String",
          "@param Options.src must be of String type. Instead it was a "
          + options.src.__proto__.constructor.name
        );
        // javascript will check that it is a legit image
        this.DOMobject.src = options.src;
      }

      // On link nodes set the href if given
      if ( options.href && options.type === "a" ) {
        assert(
          options.href.__proto__.constructor.name === "String",
          "@param Options.href must be of String type. Instead it was a "
          + options.href.__proto__.constructor.name
        );
        // javascript will check that it is a legit image
        this.DOMobject.href = options.href;
      }


      if ( options.draggable && options.draggable === true )
        this.setupDrag();

      // now add the attributes to the node
      if ( options.attributes ){
        let keys = Object.keys( options.attributes );
        // loop through and add each attribute
        for ( var i = 0; i < keys.length; i++ ) {
          var attribute = keys[ i ];
          this.DOMobject.setAttribute( 
            attribute,
            options.attributes[ attribute ]
          );
        }
      }

      // @public {animation} the animation of this node
      this.animation = null;
      // note: nodes can only have one animation at a time
    }
    /**
     * @public
     * Add NODES to this node
     * @param {Node} children - the nodes being addeed
     *
     * Usage: node.addChildren( node1, node2 )
     * for adding one child, just provide one parameter
     * @return {Node} - Returns 'this' reference, for chaining
     */
    addChildren( ...children ) {
      // loop through each provided child and add it
      for ( var i = 0; i < children.length; i++ ) {
        var addedNode = children[ i ]
        // must be type node
        assert(
          addedNode.__proto__.constructor.name === "Node",
          "@param otherNode must be of node type. Instead you tried adding a " +
          addedNode.__proto__.constructor.name
        );
        // if it is already one of our children, ignore;
        if ( this.children.includes( addedNode ) ) continue;

        this.children.push( addedNode ); // add it to the list first
        addedNode.parent = this; // set the addedNodes parent to 'this'
        // add it to the actual DOM
        this.DOMobject.appendChild( addedNode.DOMobject );
      }
      return this; // allow chaining
    }
    /**
     * @public
     * Remove a child
     * @param {node} removedChildren - the nodes being removed
     *
     * Usage: node.addChildren( node1, node2 )
     * for adding one child, just provide one parameter
     *
     * This doesn't technically dispose the memory of the children, rather remove
     * the connections between the children and this node. This node is left in
     * the heap and javascript handles the memory.
     * 
     * @returns {Node} - Returns 'this' reference, for chaining
     */
    removeChildren( ...removedChildren ) {
      for ( var i = 0; i < removedChildren.length; i++ ) {
        var node = removedChildren[ i ]
        // make sure we are removing a node
        assert(
          node && node.__proto__.constructor.name === "Node",
          "@param node must be of node type. Instead you tried removing a " +
          ( ( node && node.__proto__.constructor.name ) || null )
        );
        // make sure that it is a child of ours
        assert(
          this.children.includes( node ), 
          "Cannot remove child as the given node isn't a child of this node"
        );

        // remove it from the list
        this.children.splice( this.children.indexOf( node ), 1 );
        this.DOMobject.removeChild( node.DOMobject );
        node.parent = null;
      }
      return this; // allow chaining
    }
    /**
     * @public
     * Remove all children associated with this node
     * This doesn't technically dispoe the memory of the children, rather remove
     * the connections between the children and this node. 
     *
     * @returns {Node} - Returns 'this' reference, for chaining
     */
    removeAllChildren() {
      // children have to exist first
      if ( this.children.length == 0 ) return;
      this.removeChildren( ...this.children );
      return this; // allow chaining
    }
    /**
     * @public
     * Create a event listener
     * @param {String} event - the event ie. (keydown etc.)
     * @param {function} callBack - event caled when event happens
     */
    addEventListener( event, callBack ) {
      this.DOMobject.addEventListener( event, callBack );
    }
    /**
     * @public
     * Remove itself by dispposing ( children preserved ).
     * This will remove the connection to all it's children and its connection to
     * the parent. 
     *
     * Technically the children are preserved, but if this node is part of the DOM
     * this children will no longer be displayed but can be re-added if you have
     * a pointer to it.
     */
    dispose() {
      if ( !this.parent ) return;
      this.removeAllChildren();
      if ( this.parent == document.getElementsByTagName( "body" )[0] ) {
        this.parent.removeChildren( this.DOMobject );
        this.parent = null;
        return;
      }
      this.parent.removeChildren( this );
      this.parent = null;
    }
    /**
     * @public
     * Get the parent DOM OBJECT
     * @return {DOM} - the dom element
     */
    get parentDOM() {
      return this.DOMobject.parentElement;
    }
    /**
     * @public
     * Get the parent NODE
     * @return {Node} - the node element
     */
    get parentNode() {
      return this.parent;
    }
    /**
     * @public
     * get the id
     * @return {string} - the id of the node
     */
    get id() {
      return this.DOMobject.id;
    }
    /**
     * @public
     * get the class
     * @return {string} - the class of the node
     */
    get class() {
      return this.DOMobject.className;
    }
    /**
     * @public
     * change the style of the node;
     * @param {object} options - the attributes that are changing
     */
    setStyle( style ) {
      if ( !style ) return;
      let keys = Object.keys( style );
      for ( var i = 0; i < keys.length; i++ ) {
        this.DOMobject.style[ keys[ i ] ] = style[ keys[ i ] ];
      }
    }
    
    /**
     * Sets up the node to be draggable. Usually the node has to have the position
     * "absolute" or position "fixed".
     * 
     * Dragging events will propogate down its tree respectively.
     * @public
     */
    setupDrag() {
      let node = this.DOMobject;
      let options = this.options;
      // keep track of positions
      var position1 = 0,
          position2 = 0,
          position3 = 0,
          position4 = 0;
      // start drag event listener
      node.onmousedown = dragMouseDown;

      function dragMouseDown( event ) {
        event = event || window.event;
        event.preventDefault();
        // mouse cursor
        position3 = event.clientX;
        position4 = event.clientY;

        document.onmouseup = closeDrag;
        document.onmousemove = drag;
      }

      function drag( event ) {
        event = event || window.event;
        event.preventDefault();
        // new position
        position1 = position3 - event.clientX;
        position2 = position4 - event.clientY;
        position3 = event.clientX;
        position4 = event.clientY;
        node.style.top = node.offsetTop - position2 + "px";
        node.style.left = node.offsetLeft - position1 + "px";
   
        call( options.drag ); // call user provided drag method
      }

      function closeDrag() {
        // on the release
        document.onmouseup = null; // remove event listeners
        document.onmousemove = null;

        
        call( options.dragClose );
      }
      // calls a function, checks that it is function and calls it
      function call( func ) {
        if ( func ) {
          assert(
            typeof func === "function",
            "@param drag functions must be a function"
          )
          func() // call user provided drag method
        }
      }
    }
    /**
     * @public
     * Reset the animation to put the node in the original spot before the
     * animation
     */
    resetAnimation() {
      if ( this.animation ) {
        this.animation.pause();
        this.animation.cancel();
      }
    }
  }

  return Node;
} );