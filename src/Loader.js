// Copyright © 2019 Brandon Li. All rights reserved.

/**
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  const Node = require( 'SIM_CORE/scenery/DOMobject' );

  class Loader {

    constructor() {
      // @private {DOM} the body node
      this.bodyNode = document.getElementsByTagName( "body" )[ 0 ];
      // @private {DOM} the html node ( this is the true root )
      this.htmlNode = document.getElementsByTagName( "html" )[ 0 ];


      function setStyle( node, style ) {
        let keys = Object.keys( style );
        for ( var i = 0; i < keys.length; i++ ){
          node.style[ keys[ i ] ] = style[ keys[ i ] ];
        }
      }

      setStyle( this.htmlNode, {
        maxWidth: "100%",
        maxHeight: "100%",

        overflow: "hidden",

        height: "100%",
        width: "100%",
        position: "relative",
        margin: "0",
        padding: "0",
        background: "rgb( 238 , 239 , 241 )"
      } );

      setStyle( this.bodyNode, {
        maxWidth: "100%",
        overflow: "hidden",
        height: "100%",
        maxHeight: "100%",
        maxWidth: "100%",
        background: "none",
        padding: "0",
        margin: "0",
        lineHeight: "1.5",
        color: "#333",
        userSelect: "none",
        width: "100%",
        position: "relative",
        margin: "0",
        padding: "0"
      } )


      const loaderNode = new Node( {

        text: 'ere',
        style: {
          left: '0px',
          top: '0px',
          'transform-origin': '0 0',
          height: '100%',
          display: 'flex',
          'align-items': 'center',
          'align-content': 'center',
          'flex-direction': 'column',
          'justify-content': 'center',
          border: '2px solidired'
        },
        attributes: {
          width: "60px",
          height: "60px",
          viewBox: "0 0 80 80",
          "shape-rendering": "geometricPrecision",
        }
      } );



      this.bodyNode.appendChild( loaderNode._element );

      const loader = new Node( {
        text: 'ere',
        type: 'svg',
        nameSpace: 'http://www.w3.org/2000/svg',

        attributes: {
          width: "60px",
          height: "60px",
          viewBox: "0 0 80 80",
          "shape-rendering": "geometricPrecision",
        }

      } );

      const inner = new Node( {

        type: 'path',
        attributes: {
          d: 'M40,10C57.351,10,71,23.649,71,40.5S57.351,71,40.5,71 S10,57.351,10,40.5S23.649,10,40.5,10z',
        },
          nameSpace: 'http://www.w3.org/2000/svg',

        style: {
          fill: "none",
          'stroke-width': "6px",
          stroke: '#C5C5C5',
          'stroke-dashoffset': 100,
          'stroke-dasharray': 192.617,
        }

      })
      const outer = new Node( {

        type: 'path',
        attributes: {
          d: "M40,10C57.351,10,71,23.649,71,40.5S57.351,71,40.5,71 S10,57.351,10,40.5S23.649,10,40.5,10z",
        },
          nameSpace: 'http://www.w3.org/2000/svg',

        style: {
          fill: "none",
          'stroke-width': '7px',
          stroke: '#2974b2',
          'stroke-dashoffset': 100,
          'stroke-dasharray': '0, 192.617',
        }

      })

      loaderNode.addChild( loader.addChild( inner ).addChild( outer ) );
    }

  }

  return Loader;

} );