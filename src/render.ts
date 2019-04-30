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

  resize = () : void => {}

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

  popTransforms = ( num : number ) : void => {
    for( let i = 0; i < num; i++ ) this.popTransform();
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

  constructor( initial: number, delta = 1, max = Infinity ) {
    this.value = initial;
    this.delta = delta;
    if( delta < 0 ) { delta = -delta; }
    this.max = max;
  }

  onInc = () : void => {};
  onDec = () : void => {};

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
  borderWidth : number;
  constructor( color = "#fff" , borderColor = "#0000" ) {
    super();
    this.color = color;
    this.borderColor = borderColor;
    this.borderWidth = 1;
  }

  applyStyle = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.borderWidth;
    ctx.strokeStyle = this.borderColor;
  }

  setBorderWidth = ( width : number ) : any => {
    this.borderWidth = width;
    return this;
  }
}

class Path extends Shape {
  segments    : PathSegment[];
  initX       : number;
  initY       : number;
  constructor( initX = 0, initY = 0, color = "#f00", borderColor = "#000" ) {
    super( color, borderColor );
    this.initX = initX;
    this.initY = initY;
    this.segments = [];
  }

  addSegments = ( segments : PathSegment[] ) : void => {
    segments.forEach( ( segment ) => { this.addSegment( segment ); } );
  }

  addSegment = ( segment : PathSegment ) : void => {
    this.segments.push( segment );
  }

  removeSegment = () : PathSegment => {
    return this.segments.pop();
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.beginPath();
    ctx.moveTo( this.initX, this.initY );
    this.segments.forEach( ( segment : PathSegment ) => {
      segment.render( ctx );
    });
    ctx.closePath();
    this.applyStyle( ctx );
    ctx.fill();
    ctx.stroke();
  }
}

abstract class PathSegment extends Renderable {
}

class MoveToSegment extends PathSegment {
  x : number;
  y : number;
  constructor( x : number, y : number ) {
    super();
    this.x = x;
    this.y = y;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.moveTo( this.x, this.y );
  }
}

class LineSegment extends PathSegment {
  x  : number;
  y  : number;
  constructor( x : number, y : number ) {
    super();
    this.x = x;
    this.y = y;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.lineTo( this.x, this.y );
  }
}

class ArcSegment extends PathSegment {
  x : number;
  y : number;
  r : number;
  startAngle    : number;
  endAngle      : number;
  antiClockwise : boolean;

  constructor( x : number, y : number, r : number, startAngle = 0.0, endAngle = Math.PI * 2, antiClockwise = false ) {
    super();
    this.x = x;
    this.y = y;
    this.r = r;
    this.startAngle = startAngle;
    this.endAngle   = endAngle;
    this.antiClockwise = antiClockwise;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.arc( this.x, this.y, this.r, this.startAngle, this.endAngle, this.antiClockwise );
  }
}

class ArcToSegment extends PathSegment {
  x1  : number;
  y1  : number;
  x2  : number;
  y2  : number;
  rad : number;
  constructor( x1 : number, y1 : number, x2 : number, y2 : number, rad : number ) {
    super();
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.rad = rad;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.arcTo( this.x1, this.y1, this.x2, this.y2, this.rad );
  }
}

class QuadraticSegment extends PathSegment {
  cx  : number;
  cy  : number;
  x   : number;
  y   : number;
  constructor( cx : number, cy : number, x : number, y : number ) {
    super();
    this.cx = cx;
    this.cy = cy;
    this.x = x;
    this.y = y;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.quadraticCurveTo( this.cx, this.cy, this.x, this.y );
  }
}

class BezierSegment extends PathSegment {
  cx1   : number;
  cy1   : number;
  cx2   : number;
  cy2   : number;
  x     : number;
  y     : number;
  constructor( cx1 : number, cy1 : number, cx2 : number, cy2 : number, x : number, y : number ) {
    super();
    this.cx1 = cx1;
    this.cy1 = cy1;
    this.cx2 = cx2;
    this.cy2 = cy2;
    this.x = x;
    this.y = y;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.bezierCurveTo( this.cx1, this.cy1, this.cx2, this.cy2, this.x, this.y );
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
    this.applyStyle( ctx );
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

    this.applyStyle( ctx );
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
    this.applyStyle( ctx );
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2, true );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }
}

class Collection extends Renderable {
  items : Renderable[];
  constructor( items : Renderable[] = [] ) {
    super();
    this.items = items;
  }

  mapItems = ( f : ( item : Renderable ) => any ) : any[] => {
    return this.items.map( f );
  }

  applyToItems = ( f : ( item : Renderable ) => Renderable ) : void => {
    this.items.forEach( f );
  }

  addItems = ( items : Renderable[] ) : void => {
    items.forEach( ( item : Renderable ) => { this.addItem( item ) } );
    return;
  }

  addItem = ( item : Renderable ) : void => {
    this.items.push( item );
    return;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.items.forEach( ( item : Renderable ) => {
      item.render( ctx );
    });
    return;
  }
}
