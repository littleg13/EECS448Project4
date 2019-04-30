class Sprite extends Animated {
  width   : number;
  height  : number;
  hitbox  : Hitbox;
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

  shiftUp = ( delta = 0 ) : void => {
    this.counter.inc( delta )
  }

  shiftDown = ( delta = 0 ) : void => {
    this.counter.dec( delta );
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    this.mainRect.render( ctx );
    this.rects.map( ( rect ) => { rect.render( ctx ); } );
  }
}

class TankSprite extends Sprite {
  color   : string;
  canFire : boolean;

  /*
   *  Initialize the shape variables
   */
  leftTread   : Tread;
  rightTread  : Tread;
  body        : RoundRect;
  barrel      : Rect;
  cap         : Rect;
  turret      : Circle;

  constructor( color = "#c00" ) {
    super();
    this.width      = 40;
    this.height     = 40;
    this.hitbox     = new Hitbox( -17.5, -20, 35, 40 );
    this.leftTread  = new Tread( -17.5 );
    this.rightTread = new Tread(   7.5 );
    this.body       = new RoundRect( -12.5, -20, 25, 40, 3, color, "#000" );
    this.barrel     = new Rect( -5,   -20, 10, 25, color, "#000" );
    this.cap        = new RoundRect( -7.5, -25, 15, 7.5, 2.5, color, "#000" );
    this.turret     = new Circle( 0, 0, 10, color, "#000" );
  }

  render = ( ctx: CanvasRenderingContext2D ) : void => {
    this.getItems().map( ( item : Renderable ) => { item.render( ctx ); } );
  }

  getItems = () : Renderable[] => {
    return [ this.leftTread, this.rightTread,
             this.body, this.barrel,
             this.cap, this.turret ];
  }

  getDim = () : number[] => {
    return [ this.width, this.height ]
  }

  changeColor = ( color : string ) : void => {
    this.getItems().map( ( item ) => {
      if( item instanceof Shape ) { item.color = color; }
    } );
  }

  moveTreadsForward = ( delta = 0 ) : void => {
    this.leftTread.shiftDown( delta );
    this.rightTread.shiftDown( delta );
  }

  moveTreadsBackward = ( delta = 0 ) : void => {
    this.leftTread.shiftUp( delta );
    this.rightTread.shiftUp( delta );
  }

  moveTreadsRight = ( delta = 0 ) : void => {
    this.leftTread.shiftDown( delta );
    this.rightTread.shiftUp( delta );
  }
  moveTreadsLeft = ( delta = 0 ) : void => {
    this.leftTread.shiftUp( delta );
    this.rightTread.shiftDown( delta );
  }
}

class NameTag extends Renderable {
  playerName : string;
  healthBar  : Rect;
  healthFill : Rect;

  constructor( playerName : string, health : number = 100 ) {
    super();
    while( playerName.indexOf( "&lt;" ) != -1
        || playerName.indexOf( "&gt;" ) != -1 ) {
      playerName = playerName.replace( "&gt;", ">" ).replace( "&lt;", "<" );
    }

    this.playerName = playerName;
    this.healthBar = new RoundRect( -20, 10, 40, 10, 5, "black" );
    this.healthFill = new RoundRect( -18, 12.5, 36 * ( health / 100 ), 5, 2.5, "red" );
  }

  updateHealth = ( health : number ) : void => {
    this.healthFill.w = 36 * health / 100;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
//    ctx.font = "0.75em Consolas";
//    ctx.fillText( this.playerName, -20, 0 );
    this.healthBar.render( ctx );
    this.healthFill.render( ctx );
  }
}

class BulletSprite extends Sprite {
  hitbox : Hitbox;
  body   : Path;
  width  : number;
  height : number;
  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.hitbox = new Hitbox( -5, -15, 10, 25 );
    this.body = new Path( -5,  5, "#606060" );
    let segments = [
      new LineSegment( 5,   5 ),
      new LineSegment( 5, -10 ),
      new ArcSegment( 0, -10, 5, 0.0, Math.PI, true )
    ];
    this.body.addSegments( segments );
  }

  getDim = () : number[] => {
    return [ this.width, this.height ]
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.save();
    this.body.render( ctx );
    ctx.fillStyle = "#333";
    ctx.fillRect( -4, 2, 8, 2 );
    ctx.restore();
  }
}

class ExplosionSprite extends Sprite {
  constructor() {
    super();
  }
  render = ( ctx : CanvasRenderingContext2D ) : void => {

  }
}

class MultiShotSprite extends Sprite {
  box : RoundRect;
  hub : Circle;
  turret1 : Collection;
  turret2 : Collection;
  turret3 : Collection;

  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.box = new RoundRect( -18, -18, 36, 36, 10, "#336", "#669" ).setBorderWidth( 2 );
    let genTurret = () => {
      return new Collection( [
        new Rect( -3, -20, 6, 15, "#99c", "transparent" ).setBorderWidth( 2 ),
        new Rect( -5, -23, 10, 4, "#669", "transparent" ).setBorderWidth( 2 )
      ] );
    }
    this.turret1 = genTurret();
    this.turret2 = genTurret();
    this.turret3 = genTurret();
    this.hub = new Circle( 0, -3, 8, "#669", "transparent" ).setBorderWidth(2);
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    ctx.save();
    ctx.translate( 0, 10 ); // set up for rotations
    ctx.save();
    ctx.rotate( Math.PI / 6 );
    this.turret1.render( ctx );
    ctx.restore();
    ctx.save();
    ctx.rotate( -Math.PI / 6 );
    this.turret2.render( ctx );
    ctx.restore();
    ctx.save();
    ctx.translate( 0, -3 );
    this.turret3.render( ctx );
    ctx.restore()
    this.hub.render( ctx );
    ctx.restore();
  }
}

class BuildWallSprite extends Sprite {
  width  : number;
  height : number;
  box : RoundRect;
  bricks : Collection;

  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.box = new RoundRect( -18, -18, 36, 36, 10, "#999", "#333" ).setBorderWidth( 2 );
    this.bricks = new Collection( [
      new RoundRect( -15, -15, 18, 10, 3, "#666", "#333" ),
      new RoundRect(   5, -15, 10, 10, 3, "#666", "#333" ),
      new RoundRect( -15,  -4, 10,  8, 3, "#666", "#333" ),
      new RoundRect(  -3,  -4, 18,  8, 3, "#666", "#333" ),
      new RoundRect( -15,   5, 18, 10, 3, "#666", "#333" ),
      new RoundRect(   5,   5, 10, 10, 3, "#666", "#333" )
    ] );
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    this.bricks.render( ctx );
  }
}

class IncreaseMoveDistSprite extends Sprite {
  width  : number;
  height : number;
  box : RoundRect;
  arrows : Collection;

  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.box = new RoundRect( -18, -18, 36, 36, 10, "darkgreen", "limegreen" ).setBorderWidth( 2 );
    this.box.setBorderWidth( 2 );
    this.arrows = new Collection();
    for( let i = 0; i < 5; i++ ) {
      let color = "green";
      if( i % 2 == 0 ) {
        color = "limegreen";
      }
      let path = new Path( 0, ( -15 + i * 5 ), color, "transparent" );
      path.addSegments( [
        new LineSegment( -10, ( -5 + i * 5 ) ),
        new LineSegment(  10, ( -5 + i * 5 ) )
      ] );
      this.arrows.addItem( path );
    }
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    this.arrows.render( ctx );
  }
}

class HealthPackSprite extends Sprite {
  width  : number;
  height : number;
  box : RoundRect;
  cross : Path;
  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.box = new RoundRect( -18, -18, 36, 36, 10, "#f00", "#933" ).setBorderWidth( 2 );
    this.cross = new Path( 0, 15, "#fcc", "#933" );
    this.cross.addSegments( [
      new ArcToSegment( 5, 15, 5, 10, 5 ),
      new LineSegment( 5, 5 ),
      new LineSegment( 10, 5 ),
      new ArcToSegment( 15, 5, 15, 0, 5 ),
      new ArcToSegment( 15, -5, 10, -5, 5 ),
      new LineSegment( 5, -5 ),
      new LineSegment( 5, -10 ),
      new ArcToSegment( 5, -15, 0, -15, 5 ),
      new ArcToSegment( -5, -15, -5, -10, 5 ),
      new LineSegment( -5, -5 ),
      new LineSegment( -10, -5 ),
      new ArcToSegment( -15, -5, -15, 0, 5 ),
      new ArcToSegment( -15,  5, -10, 5, 5 ),
      new LineSegment( -5, 5 ),
      new LineSegment( -5, 10 ),
      new ArcToSegment( -5, 15, 0, 15, 5 )
    ] );
    this.box.setBorderWidth( 2 );
    this.cross.setBorderWidth( 2 );
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    this.cross.render( ctx );
  }
}
