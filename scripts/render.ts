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

abstract class Animated extends Renderable {
  counters  : Counter[];
  items     : Renderable[];
}

abstract class Shape extends Renderable {
  color       : string;
  borderColor : string;
  constructor( color = "#fff" , borderColor = "#0000" ) {
    super();
    this.color = color;
    this.borderColor = borderColor;
  }
}

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Rect extends Shape {
  x    : number;
  y    : number;
  w    : number;
  h    : number;
  constructor( x: number, y: number, w: number, h: number,
               color = "#fff", borderColor = "#0000") {
    super( color, borderColor );
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.borderColor;
    ctx.fillRect( this.x, this.y, this.w, this.h );
    ctx.strokeRect( this.x, this.y, this.w, this.h );
    return;
  }
}

class RoundRect extends Rect {
  rad : number;
  constructor( x: number, y: number, w: number, h: number, rad: number,
               color = "#fff", borderColor = "#0000" ) {
      super( x, y, w, h, color, borderColor );
      this.rad = Math.min( rad, w, h );
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    let [ left, right, top, bottom, r ] = [ this.x, this.x + this.w,
                                            this.y, this.y + this.h, this.rad ];

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.borderColor;
    ctx.beginPath();             // clockwise path
    ctx.moveTo( left, top + r ); // begin lower top-left corner
    ctx.arcTo( left, top,        // 'true' corner
               left + r, top,    // end upper top-left corner
               r );
    ctx.lineTo( right - r, top );    // move to upper top-right corner
    ctx.arcTo( right, top,       // 'true' corner
               right, top + r,   // end lower top-right corner
               r );
    ctx.lineTo( right, bottom - r );  // move to upper bottom-right corner
    ctx.arcTo( right, bottom,
               right - r, bottom,
               r );
    ctx.lineTo( left + r, bottom );
    ctx.arcTo( left, bottom,
               left, bottom - r,
               r );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

class Circle extends Shape {
  x     : number;
  y     : number;
  radius: number;
  constructor( x: number, y: number, radius: number, color = "#fff", borderColor = "#0000" ) {
    super( color, borderColor );
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.borderColor;
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2, true );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }
}

class Tread extends Animated {
  x         : number;
  mainRect  : Rect;
  rects     : Rect[];
  counter   : Counter;

  constructor( x : number ) {
    super();
    this.x = x;
    this.mainRect = new Rect( x, -20, 10, 40, "#666", "#0000" ), // Full tread
    this.rects = [
      new Rect( x, -20, 10, 2, "#000", "#0000" ),
      new Rect( x, -15, 10, 2, "#000", "#0000" ),
      new Rect( x, -10, 10, 2, "#000", "#0000" ),
      new Rect( x,  -5, 10, 2, "#000", "#0000" ),
      new Rect( x,   0, 10, 2, "#000", "#0000" ),
      new Rect( x,   5, 10, 2, "#000", "#0000" ),
      new Rect( x,  10, 10, 2, "#000", "#0000" ),
      new Rect( x,  15, 10, 2, "#000", "#0000" )
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
          frst = new Rect( this.x, -20, 10, 1, "#000", "#0000" );
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
          last = new Rect( this.x, 19, 10, 1, "#000", "#0000" );
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

class TankSprite extends Renderable {
  x       : number;
  y       : number;
  dir     : number;
  color   : string;

  /*
   *  Initialize the shape variables
   */
  hitbox      : Rect;
  showHitbox  : boolean;
  leftTread   : Tread;
  rightTread  : Tread;
  body        : RoundRect;
  barrel      : Rect;
  cap         : Rect;
  turret      : Circle;
  constructor( x: number, y: number, dir: number, color = "#c00" ) {
    super();
    this.x = x;
    this.y = y;
    this.dir = dir;         // stored in degrees
    this.color = color;

    /*
     *  Set up the different shapes
     */
    this.hitbox     = new Rect( -20, -20, 40, 40, "#ccc", "#000" );
    this.leftTread  = new Tread( -17.5 );
    this.rightTread = new Tread(   7.5 );
    this.body       = new RoundRect( -12.5, -20, 25, 40, 2.5, color, "#000" );
    this.barrel     = new Rect( -5,   -20, 10, 25, color, "#000" );
    this.cap        = new Rect( -7.5, -25, 15, 7.5, color, "#000" );
    this.turret     = new Circle( 0, 0, 10, color, "#000" );
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    if( this.showHitbox ) { this.hitbox.render( ctx ); }
    this.getItems().map( ( item : Renderable ) => { item.render( ctx ); } );
  }

  getItems = () : Renderable[] => {
    return [ this.leftTread, this.rightTread,
             this.body, this.barrel,
             this.cap, this.turret ];
  }

  changeColor = ( color : string ) : void => {
    this.getItems().map( ( item ) => {
      if( item instanceof Shape ) { item.color = color; }
    } );
  }

  moveForward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.x += Math.sin( dirRads ) * delta;
    this.y -= Math.cos( dirRads ) * delta;
    this.leftTread.counter.dec();
    this.rightTread.counter.dec();
  }

  moveBackward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.x -= Math.sin( dirRads ) * delta;
    this.y += Math.cos( dirRads ) * delta;
    this.leftTread.counter.inc();
    this.rightTread.counter.inc();
  }

  rotateCW = ( delta = 1.0 ) : void => {
    this.dir += delta;
    this.leftTread.counter.dec();
    this.rightTread.counter.inc();
  }

  rotateCCW = ( delta = 1.0 ) : void => {
    this.dir -= delta;
    this.leftTread.counter.inc();
    this.rightTread.counter.dec();
  }
}
