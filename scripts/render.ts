/*  Overview:
 *  Class Point
 *    - x
 *    - y
 *
 *  Superclass Entity
 *    - shapes {Shapes[]}
 *    - dimension {number}
 *    - foreCtx {HTMLCanvasContext}
 *    - backCtx {HTMLCanvasContext}
 *    - render()
 *
 *  Superclass Shape
 *    - render()
 *
 *  Subclass Rect
 *    - corner {Point}
 *    - size {Point}
 *
 *  Subclass Arc
 *    - center {Point}
 *    - radius {number}
 *    - start {number} = 0
 *    - end {number} = Math.PI * 2
 *    - clockwise {bool} = true
 *
 */

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Counter {
  value   : number;
  delta   : number;
  max     : number;
  parent  : object;
  onInc   : () => void;
  onDec   : () => void;

  constructor( initial: number, delta = 1, max = Infinity ) {
    this.value = initial;
    this.delta = delta;
    this.max = max;
  }

  inc = () : void => {
    this.value = ( this.value + this.delta ) % this.max;
    this.onInc();
  };

  dec = () : void => {
    // extra max term added bc % returns - for - numbers
    this.value = ( this.value + this.max - this.delta ) % this.max;
    this.onDec();
  }

  get = () : number => {
    return this.value;
  }

  setParent = ( parent : object ) : void => {
    this.parent = parent;
  }
}

abstract class Renderable {
  render: ( ctx: CanvasRenderingContext2D ) => void;
}

abstract class Shape extends Renderable {
  color: string;
  borderColor: string;
}

class Rect extends Shape {
  x    : number;
  y    : number;
  w    : number;
  h    : number;
  constructor( x: number, y: number, w: number, h: number, color = "#fff", borderColor = "#0000") {
    super();
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.borderColor = borderColor;
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = this.color;
    ctx.fillRect( this.x, this.y, this.w, this.h );
    ctx.strokeStyle = this.borderColor;
    ctx.strokeRect( this.x, this.y, this.w, this.h );
    return;
  }
}

class Circle extends Shape {
  x     : number;
  y     : number;
  radius: number;
  constructor( x: number, y: number, radius: number, color: string ) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = this.color;
    ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2, true );
    ctx.fill();
    return;
  }
}

class Animated extends Renderable {
  counters  : Counter[];
  items     : Renderable[];
}

class Tread extends Animated {
  x         : number;
  mainRect  : Rect;
  rects     : Rect[];
  counter   : Counter;

  constructor( x : number ) {
    super();
    this.x = x;
    this.mainRect = new Rect( x, -15, 10, 30, "#666", "#0000" ), // Full tread
    this.rects = [
      new Rect( x, -15, 10, 2, "#000", "#0000" ),
      new Rect( x, -10, 10, 2, "#000", "#0000" ),
      new Rect( x,  -5, 10, 2, "#000", "#0000" ),
      new Rect( x,   0, 10, 2, "#000", "#0000" ),
      new Rect( x,   5, 10, 2, "#000", "#0000" ),
      new Rect( x,  10, 10, 2, "#000", "#0000" )
    ];
    /*
      Counter states:
      0 - [11000 11000 11000 11000 11000 11000 11000]
      1 - [01100 01100 01100 01100 01100 01100 01100]
      2 - [00110 00110 00110 00110 00110 00110 00110]
      3 - [00011 00011 00011 00011 00011 00011 00011]
      4 - [10001 10001 10001 10001 10001 10001 10001]
      5 - rolls over to 0...
    */
    this.counter = new Counter( 0, 1, 5 );
    this.counter.setParent( this );
    this.counter.onInc = () : void => {
      let frst;
      let last;
      let moveUp = ( rect: Rect ): Rect => { rect.y++; return rect; }
      switch( this.counter.get() ) {
        case 4: // on increase, previous state was 3
          // remove last tread, change height, push back
          last = this.rects.pop();
          last.h = 1;
          this.rects.push( last );

          // move treads
          this.rects.map( moveUp );

          // new tread, height = 1, very bottom
          frst = new Rect( this.x, -15, 10, 1, "#000", "#0000" );
          this.rects.unshift( frst );
          break;
        case 0: // on increase, previous state was 4
          // delete last tread
          this.rects.pop();

          // get first tread (only 1 pixel high)
          frst = this.rects.shift();
          frst.h = 2;
          // move treads up 1
          this.rects.map( moveUp );
          // put back frst into array
          this.rects.unshift( frst );
          break;
        default:
          this.rects.map( moveUp );
          break;
      }
    }
    this.counter.onDec = () : void => {
      let frst;
      let last;
      let moveDown = ( rect: Rect ): Rect => { rect.y--; return rect; }
      switch( this.counter.get() ) {
        case 4: // on decrease, previous state was 0
          // take first element, change height
          frst = this.rects.shift();
          frst.h = 1;

          // change treads, put back first
          this.rects.map( moveDown );
          this.rects.unshift( frst );

          // create and add new last tread
          last = new Rect( this.x, 14, 10, 1, "#000", "#0000" );
          this.rects.push( last );
          break;
        case 3: // on decrease, previous state was 4
          // delete the bottom tread
          this.rects.shift();

          // get last tread, change height, push back
          last = this.rects.pop();
          last.h = 2;
          this.rects.push( last );
          // move treads down 1
          this.rects.map( moveDown );
          break;
        default:
          this.rects.map( moveDown );
          break;
      }
    }
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    this.mainRect.render( ctx );
    this.rects.map( ( rect ) => { rect.render( ctx ); } );
  }
}

class Sprite extends Renderable {
  items : Renderable[];
  constructor() { super(); this.items = []; }

  addShape = ( item: Renderable ) : void => {
    this.items.push( item );
    return;
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    this.items
    for( let i = 0; i < this.items.length; i++ ) {
      this.items[i].render( ctx );
    }
    return;
  }
}

/******************************************************************************/

var canvas;
var ctx;
var tank = new Sprite();
[ new Tread( -15 ),
  new Tread(   5 ),
  new Rect(  -5, -20, 11, 35, "#f00", "#000" ) ].map( (x) => { tank.addShape( x ) });
var interval;
var degs : number;
var degDisplay;
var delta : number;
var keys = {
  "ArrowUp"     : false,
  "ArrowDown"   : false,
  "ArrowLeft"   : false,
  "ArrowRight"  : false
};

var getContext = ( canvas : HTMLCanvasElement ): CanvasRenderingContext2D | void => {
  let ctx = canvas.getContext( "2d" );
  if( ctx instanceof CanvasRenderingContext2D ) return ctx;
}

var main = (): void => {
  canvas = document.getElementById( "canvas" );
  if( ! ( canvas instanceof HTMLCanvasElement ) ) return;
  degDisplay = document.querySelector( "input#deg" );
  if( ! ( degDisplay instanceof HTMLInputElement ) ) return;
  ctx = getContext( canvas );
  degs = 0.0;
  delta = 0.5;
  window.addEventListener( "keydown", keyDownHandler );
  window.addEventListener( "keyup", keyUpHandler );
  interval = setInterval( loop, Math.floor( 1000 / 64 ) );
}

var loop = ():void => {
  processInput();
  render();
  degDisplay.value = degs;
}

var processInput = (): void => {
  let leftTread = tank.items[0];
  let rightTread = tank.items[1];
  if( ! ( leftTread instanceof Tread ) || ! ( rightTread instanceof Tread ) ) return;
  if( keys[ "ArrowUp" ] ) {
    leftTread.counter.dec();
    rightTread.counter.dec();
  }
  if( keys[ "ArrowDown" ] ) {
    leftTread.counter.inc();
    rightTread.counter.inc();
  }
  if( keys[ "ArrowLeft" ] ) {
    degs -= 1.0;
    leftTread.counter.inc();
    rightTread.counter.dec();
  }
  if( keys[ "ArrowRight" ] ) {
    degs += 1.0;
    leftTread.counter.dec();
    rightTread.counter.inc();
  }
}

var keyDownHandler = ( evt : KeyboardEvent ): void => {
  keys[ evt.key ] = true;
  return;
}

var keyUpHandler = ( evt : KeyboardEvent ): void => {
  keys[ evt.key ] = false;
  return;
}

var render = (): void => {
  ctx.save();
  ctx.clearRect( 0, 0, 300, 300 );
  ctx.scale(3, 3);
  ctx.translate( 60, 60 );
  ctx.rotate( degs / 180.0 * Math.PI );
  tank.render( ctx );
  ctx.restore();
}
