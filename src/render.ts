/**
 * A class to manage a canvas element, its rendering context, width, height and
 * position within the DOM.
 */
class Layer {
  /**
   * The canvas element itself.
   */
  canvas  : HTMLCanvasElement;
  /**
   * The canvas' rendering context.
   */
  ctx     : CanvasRenderingContext2D;
  /**
   * The ID assigned to the canvas element.
   */
  id      : string;
  /**
   * A reference to the element containing the canvas element.
   */
  parent  : HTMLElement;
  /**
   * The width of the canvas.
   */
  width   : number;
  /**
   * The height of the canvas.
   */
  height  : number;

  /**
   * @param id The id to be assigned to the created canvas element.
   * @param width The width to be assigned to the created canvas element.
   * @param height The heiht to be assigned to the created canvas element.
   */
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

  /**
   * Attaches the canvas element to a containing element.
   * @param parent Container to attach to.
   */
  attachToParent = ( parent : Element ) : void => {
    parent.appendChild( this.canvas );
  }

  /**
   * Saves context state and applies a rotation to it.
   * @param deg Rotation in degrees.
   */
  applyRotation = ( deg : number ) : void => {
    this.ctx.save();
    this.ctx.rotate( deg * Math.PI / 180.0 );
  }

  /**
   * Saves context state and applies a translation to it.
   * @param x Horizontal translation value.
   * @param y Vertical translation value.
   */
  applyTranslate = ( x : number, y : number ) : void => {
    this.ctx.save();
    this.ctx.translate( x, y );
  }

  /**
   * Saves context state and applies a scale to it.
   * @param x Horizontal scaling value.
   * @param y Vertical scaling value.
   */
  applyScale = ( x : number, y : number ) : void => {
    this.ctx.save();
    this.ctx.scale( x, y );
  }

  /**
   * Removes a number of transformations from the canvas context
   * @param num Nunber of transforms to remove.
   */
  popTransforms = ( num : number ) : void => {
    for( let i = 0; i < num; i++ ) this.popTransform();
  }

  /**
   * Restores canvas context to previous state.
   */
  popTransform = () : void => {
    this.ctx.restore();
  }

  /**
   * Apply a translation that makes 0,0 the center of the canvas layer.
   */
  center = () : void => {
    this.applyTranslate( this.width / 2, this.height / 2 );
  }

  /**
   * Clear the canvas of all drawn data.
   */
  clear = () : void => {
    this.ctx.clearRect(0, 0, this.width, this.height );
  }

  /**
   * Draw a renderable to the canvas context.
   * @param item Renderable to be rendered.
   */
  drawItem = ( item : Renderable ) : void => {
    item.render( this.ctx );
  }

  /**
   * Copies the image data from one Layer object onto this layer's canvas.
   * @param image Layer to be drawn.
   * @param dx Horizontal offset.
   * @param dy Vertical offset.
   */
  addLayer = ( image : Layer, dx = 0, dy = 0 ) : void => {
    this.ctx.drawImage( image.getImage(), dx, dy );
  }

  /**
   * @returns This layer's canvas HTML object which can be used to supply image data.
   */
  getImage = () : HTMLCanvasElement => {
    return this.canvas;
  }
}

/**
 * A class to maintain a counting value, one which potentially wraps around a set value.
 */
class Counter {
  /**
   * Current count
   */
  value   : number;
  /**
   * Default step between counts.
   */
  delta   : number;
  /**
   * Maximum count for counters that wrap around.
   */
  max     : number;
  /**
   * A reference to the parent object that holds this counter.
   */
  parent  : object;

  /**
   * @param initial Initial value for counter.
   * @param delta Step for counter.
   * @param max Maximum count for counter.
   */
  constructor( initial: number, delta = 1, max = null ) {
    this.value = initial;
    this.delta = delta;
    if( delta < 0 ) { delta = -delta; }
    this.max = max;
  }

  /**
  * Placeholder, called on increment. Implemented in parent when created if needed.
   */
  onInc = () : void => {};
  /**
   * Placeholder, called on decrement. Implemented in parent when created if needed.
   */
  onDec = () : void => {};

  /**
   * Increments value by step or supplied delta.
   * @param delta optional step value if different than counter's set step.
   */
  inc = ( delta = 0 ) : void => {
    delta = Math.max( delta, this.delta );
    // extra max term added bc % returns - for - numbers
    for( let i = 0; i < delta; i++ ) {
      this.value++;
      if( this.max != null ) {
        this.value = ( this.value + this.max ) % this.max;
      }
      this.onInc();
    }
  };

  /**
   * Decrement value by step or supplied delta.
   * @param delta optional step value if different than counter's set step.
   */
  dec = ( delta = 0 ) : void => {
    delta = Math.max( delta, this.delta );
    // extra max term added bc % returns - for - numbers
    for( let i = 0; i < delta; i++ ) {
      this.value--;
      if( this.max != null ) {
        this.value = ( this.value + this.max ) % this.max;
      }
      this.onDec();
    }
  }

  /**
   * @returns current counter value.
   */
  get = () : number => {
    return this.value;
  }

  /**
   * Sets the counter's parent to a given object.
   * @param parent Object ot be set as parent.
   */
  setParent = ( parent : object ) : void => {
    this.parent = parent;
  }
}

/**
 * Abstract class for objects that can be rendered.
 */
abstract class Renderable {
  render: ( ctx: CanvasRenderingContext2D ) => void;
}

/**
 * Abstract class for renderable objects that can also be updated.
 */
abstract class Animated extends Renderable {
  /**
   * Placeholder update function, implemented in subclass if needed.
   */
  update = () : boolean => { return false; }
}

/**
 * Abstract class for renderable items that have single fill color and stroke colors.
 */
abstract class Shape extends Renderable {
  /**
   * Fill color.
   */
  color       : string;
  /**
   * Stroke color.
   */
  borderColor : string;
  /**
   * Stroke width.
   */
  borderWidth : number;

  /**
   * @param color fill color.
   * @param borderColor stroke color.
   */
  constructor( color = "#fff" , borderColor = "#0000" ) {
    super();
    this.color = color;
    this.borderColor = borderColor;
    this.borderWidth = 1;
  }

  /**
   * Applies changes to rendering context fill and stroke styles to match shape's values.
   * @param ctx Rendering context to apply styles to.
   */
  applyStyle = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.borderWidth;
    ctx.strokeStyle = this.borderColor;
  }

  /**
   * Set shape's borderWidth to a given width.
   * @param width the new stroke width.
   * @returns The shape object this method is called on.
   */
  setBorderWidth = ( width : number ) : any => {
    this.borderWidth = width;
    return this;
  }
}

/**
 * A class to collect path segment objects to make managing complex paths simpler.
 */
class Path extends Shape {
  /**
   * A list of path segments.
   */
  segments    : PathSegment[];
  /**
   * Initial horizontal position.
   */
  initX       : number;
  /**
   * Initial vertical position.
   */
  initY       : number;
  /**
   * @param initX initial horizontal position.
   * @param initY initial vertical position.
   * @param color fill color.
   * @param borderColor stroke color.
   */
  constructor( initX = 0, initY = 0, color = "#f00", borderColor = "#000" ) {
    super( color, borderColor );
    this.initX = initX;
    this.initY = initY;
    this.segments = [];
  }

  /**
   * Add a list of segments to path.
   * @param segments the list of segments to be added.
   */
  addSegments = ( segments : PathSegment[] ) : void => {
    segments.forEach( ( segment ) => { this.addSegment( segment ); } );
  }

  /**
   * Add a single segment to path.
   * @param segment The segment to be added.
   */
  addSegment = ( segment : PathSegment ) : void => {
    this.segments.push( segment );
  }

  /**
   * Remove the last path segment in this.segments.
   * @return The PathSegment removed.
   */
  removeSegment = () : PathSegment => {
    return this.segments.pop();
  }

  /**
   * Renders the path to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
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

/**
 * Abstract class to be extended for each type of path segment.
 */
abstract class PathSegment extends Renderable {
}

/**
 * A segment to call a moveTo.
 */
class MoveToSegment extends PathSegment {
  /**
   * The horizontal position to move to.
   */
  x : number;
  /**
   * The vertical position to move to.
   */
  y : number;
  /**
   * @param x The horizontal position to move to.
   * @param y the vertical position to move to.
   */
  constructor( x : number, y : number ) {
    super();
    this.x = x;
    this.y = y;
  }

  /**
   * Renders the path segment to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.moveTo( this.x, this.y );
  }
}

/**
 * A segment to call lineTo.
 */
class LineSegment extends PathSegment {
  /**
   * The horizontal position for the line to end at.
   */
  x  : number;
  /**
   * The vertical position for the line to end at.
   */
  y  : number;
  /**
   * @param x The horizontal position for the line to end at.
   * @param y The vertical position for the line to end at
   */
  constructor( x : number, y : number ) {
    super();
    this.x = x;
    this.y = y;
  }

  /**
   * Renders the path segment to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.lineTo( this.x, this.y );
  }
}

/**
 * A PathSegment that creates an arc around a given point.
 */
class ArcSegment extends PathSegment {
  /**
   * The horizontal positon of the center of the arc.
   */
  x : number;
  /**
   * The vertical position of the center of the arc.
   */
  y : number;
  /**
   * The radius of the arc.
   */
  r : number;
  /**
   * The starting angle of the arc, in radians.
   */
  startAngle    : number;
  /**
   * The ending angle of the arc, in radians.
   */
  endAngle      : number;
  /**
   * Whether or not to draw the arc counter-clockwise.
   */
  antiClockwise : boolean;

  /**
   * @param x The horizontal positon of the center of the arc.
   * @param y The vertical position of the center of the arc.
   * @param r The radius of the arc.
   * @param startAngle The starting angle of the arc, in radians.
   * @param endAngle The ending angle of the arc, in radians.
   * @param antiClockwise Whether or not to draw the arc counter-clockwise.
   */
  constructor( x : number, y : number, r : number, startAngle = 0.0, endAngle = Math.PI * 2, antiClockwise = false ) {
    super();
    this.x = x;
    this.y = y;
    this.r = r;
    this.startAngle = startAngle;
    this.endAngle   = endAngle;
    this.antiClockwise = antiClockwise;
  }

  /**
   * Renders the path segment to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.arc( this.x, this.y, this.r, this.startAngle, this.endAngle, this.antiClockwise );
  }
}

/**
 * A PathSegment that handles an arcTo call.
 */
class ArcToSegment extends PathSegment {
  /**
   * Horizontal position of the first control point.
   */
  x1  : number;
  /**
   * Vertical position of the first control point.
   */
  y1  : number;
  /**
   * Horizontal position of the second control point.
   */
  x2  : number;
  /**
   * Vertical position of the second control point.
   */
  y2  : number;
  /**
   * The radius of the arc segment.
   */
  rad : number;
  /**
   * @param x1 Horizontal position of the first control point.
   * @param y1 Vertical position of the first control point.
   * @param x2 Horizontal position of the second control point.
   * @param y2 Vertical position of the second control point.
   * @param rad The radius of the arc segment.
   */
  constructor( x1 : number, y1 : number, x2 : number, y2 : number, rad : number ) {
    super();
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.rad = rad;
  }

  /**
   * Renders the path segment to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.arcTo( this.x1, this.y1, this.x2, this.y2, this.rad );
  }
}

/**
 * A PathSegment to handle a quadraticCurveTo call.
 */
class QuadraticSegment extends PathSegment {
  /**
   * The horizontal position of the control point.
   */
  cx  : number;
  /**
   * The vertical position of the control point.
   */
  cy  : number;
  /**
   * The horizontal position of the end point.
   */
  x   : number;
  /**
   * The vertical position of the end point.
   */
  y   : number;
  /**
   * @param cx The horizontal position of the control point.
   * @param cy The vertical position of the control point.
   * @param x The horizontal position of the end point.
   * @param y The vertical position of the end point.
   */
  constructor( cx : number, cy : number, x : number, y : number ) {
    super();
    this.cx = cx;
    this.cy = cy;
    this.x = x;
    this.y = y;
  }

  /**
   * Renders the path segment to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.quadraticCurveTo( this.cx, this.cy, this.x, this.y );
  }
}

class BezierSegment extends PathSegment {
  /**
   * The horizontal position of the first control point.
   */
  cx1   : number;
  /**
   * The vertical position of the first control point.
   */
  cy1   : number;
  /**
   * The horizontal position of the second control point.
   */
  cx2   : number;
  /**
   * The vertical position of the second control point.
   */
  cy2   : number;
  /**
   * The horizontal position of the end point.
   */
  x     : number;
  /**
   * The vertical position of the end point.
   */
  y     : number;
  /**
   * @param cx1 The horizontal position of the first control point.
   * @param cy1 The vertical position of the first control point.
   * @param cx2 The horizontal position of the second control point.
   * @param cy2 The vertical position of the second control point.
   * @param x The horizontal position of the end point.
   * @param y The vertical position of the end point.
   */
  constructor( cx1 : number, cy1 : number, cx2 : number, cy2 : number, x : number, y : number ) {
    super();
    this.cx1 = cx1;
    this.cy1 = cy1;
    this.cx2 = cx2;
    this.cy2 = cy2;
    this.x = x;
    this.y = y;
  }

  /**
   * Renders the path segment to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.bezierCurveTo( this.cx1, this.cy1, this.cx2, this.cy2, this.x, this.y );
  }
}

/**
 * A class to hold information about a 2D point.
 */
class Point {
  /**
   * The horizontal value.
   */
  x: number;
  /**
   * The vertical value.
   */
  y: number;
  /**
   * @param x The horizontal value.
   * @param y The vertical value.
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

/**
 * A class that maintains information to render a rectangle.
 */
class Rect extends Shape {
  /**
   * The horizontal position of the start of the rectangle.
   */
  x    : number;
  /**
   * The vertical position of the start of the rectange.
   */
  y    : number;
  /**
   * The horizontal length of the rectangle.
   */
  w    : number;
  /**
   * The vertical length of the rectangle.
   */
  h    : number;
  /**
   * @param x Horizotnal coordinate to begin the shape.
   * @param y Vertical coordinate to begin the shape.
   * @param w The horizontal length to draw the shape, goes right/positive from x.
   * @param h The vertical length to draw the shape, goes down/positive from y.
   * @param color The fill color for the shape.
   * @param borderColor the stroke color for the shape.
   */
  constructor( x: number, y: number, w: number, h: number,
               color = "#fff", borderColor = "#0000") {
    super( color, borderColor );
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  /**
   * Renders the item to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx: CanvasRenderingContext2D ) : void => {
    this.applyStyle( ctx );
    ctx.fillRect( this.x, this.y, this.w, this.h );
    ctx.strokeRect( this.x, this.y, this.w, this.h );
    return;
  }
}

/**
 * Extension of Rect. Has a single radius that is applied to each corner.
 */
class RoundRect extends Rect {
  /**
   * Radius by which to round each corner.
   */
  rad : number;

  /**
   * @param x Horizontal coordinate to begin the shape.
   * @param y Vertical coordinate to begin the shape.
   * @param w The horizontal length to draw the shape, goes right/positive from x.
   * @param h The vertical length to draw the shape, goes down/positive from y.
   * @param rad The radius of each corner.
   */
  constructor( x: number, y: number, w: number, h: number, rad: number,
               color = "#fff", borderColor = "#0000" ) {
      super( x, y, w, h, color, borderColor );
      this.rad = Math.min( rad, w, h );
  }

  /**
   * Renders the item to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
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
  /**
   * Horizontal position of the center of the circle.
   */
  x     : number;
  /**
   * Vertical position of the center of the circle.
   */
  y     : number;
  /**
   * Radius of the circle.
   */
  radius: number;
  /**
   * @param x Horizontal position of the center of the circle.
   * @param y Vertical position of the center of the circle.
   * @param radius Radius of the circle.
   * @param color Fill color of the circle.
   * @param borderColor Stroke color of the circle.
   */
  constructor( x: number, y: number, radius: number, color = "#fff", borderColor = "#0000" ) {
    super( color, borderColor );
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  /**
   * Renders the circle to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
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

/**
 * Class that handles a list of renderables and enables mapping to and easily
 * rendering all of the renderables at once.
 */
class Collection extends Renderable {
  /**
   * List of renderables.
   */
  items : Renderable[];

  /**
   * @param items Initial list of items.
   */
  constructor( items : Renderable[] = [] ) {
    super();
    this.items = items;
  }

  /**
   * Applies a function to renderables and returns the new list. Does not alter
   * this objects items.
   * @param f function to apply to each renderable.
   * @returns List of return values from mapping.
   */
  mapItems = ( f : ( item : Renderable ) => any ) : any[] => {
    return this.items.map( f );
  }

  /**
   * Applies function to each item. Items are mutated.
   * @param f function to apply to each renderable.
   */
  applyToItems = ( f : ( item : Renderable ) => Renderable ) : void => {
    this.items.forEach( f );
  }

  /**
   * Add a list of items to this.items.
   * @param items List of renderables to add to Collection.
   */
  addItems = ( items : Renderable[] ) : void => {
    items.forEach( ( item : Renderable ) => { this.addItem( item ) } );
    return;
  }

  /**
   * Adds a single item to the collection
   * @param item Renderable to be added.
   */
  addItem = ( item : Renderable ) : void => {
    this.items.push( item );
    return;
  }

  /**
   * Renders each item to the given canvas rendering context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.items.forEach( ( item : Renderable ) => {
      item.render( ctx );
    });
    return;
  }
}
