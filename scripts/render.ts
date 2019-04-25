class Layer {
  canvas  : HTMLCanvasElement;
  ctx     : CanvasRenderingContext2D;
  id      : string;
  parent  : HTMLElement;
  width   : number;
  height  : number;

  constructor( id : string, width = 40, height = 40 ) {
    let canvas = document.createElement( "canvas" );
    if( !( canvas instanceof HTMLCanvasElement ) ) { return null; }

    let ctx = canvas.getContext( "2d" );
    if( !( ctx instanceof CanvasRenderingContext2D ) ) { return null; }

    canvas.setAttribute( "id", id );
    canvas.width = width;
    canvas.height = height;
    this.canvas = canvas;
    this.ctx    = ctx;
    this.id     = id;
    this.width  = width;
    this.height = height;
  }

  attachToParent = ( parent : Element ) : void => {
    parent.appendChild( this.canvas );
  }

  applyRotation = ( deg : number ) : void => {
    this.ctx.save();
    this.ctx.rotate( deg * Math.PI / 180.0 );
  }

  applyTranslate = ( x : number, y : number ) : void => {
    this.ctx.save();
    this.ctx.translate( x, y );
  }

  applyScale = ( x : number, y : number ) : void => {
    this.ctx.save();
    this.ctx.scale( x, y );
  }

  popTransform = () : void => {
    this.ctx.restore();
  }

  center = () : void => {
    this.applyTranslate( this.width / 2, this.height / 2 );
  }

  clear = () : void => {
    this.ctx.clearRect(0, 0, this.width, this.height );
  }

  drawItem = ( item : Renderable ) : void => {
    item.render( this.ctx );
  }

  addLayer = ( image : Layer, dx = 0, dy = 0 ) : void => {
    this.ctx.drawImage( image.getImage(), dx, dy );
  }

  getImage = () : HTMLCanvasElement => {
    return this.canvas;
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
    if( delta < 0 ) { delta = -delta; }
    this.max = max;
  }

  inc = ( delta = 0 ) : void => {
    delta = Math.max( delta, this.delta );
    // extra max term added bc % returns - for - numbers
    for( let i = 0; i < delta; i++ ) {
      this.value = ( this.value + this.max + 1 ) % this.max;
      this.onInc();
    }
  };

  dec = ( delta = 0 ) : void => {
    delta = Math.max( delta, this.delta );
    // extra max term added bc % returns - for - numbers
    for( let i = 0; i < delta; i++ ) {
      this.value = ( this.value + this.max - 1 ) % this.max;
      this.onDec();
    }
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
