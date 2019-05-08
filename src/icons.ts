/**
 * Class used for client-side collision calculations.
 */
class Hitbox {
  /**
   * Horizontal offset in local units for hitbox.
   */
  xOffset : number;
  /**
   * Vertical offset in local units for hitbox.
   */
  yOffset : number;
  /**
   * Width along local horizontal axis for hitbox.
   */
  w : number;
  /**
   * Height along local vertical axis for hitbox.
   */
  h : number;

  /**
   * @param xOffset Horizontal offset in local units for hitbox.
   * @param yOffset Vertical offset in local units for hitbox.
   * @param w Width along local horizontal axis for hitbox.
   * @param h Height along local vertical axis for hitbox.
   */
  constructor( xOffset : number, yOffset : number, w : number, h : number) {
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.w = w;
    this.h = h;
  }
}

/**
 * Generic class for collections of renderable objects that may contain animated features.
 */
class Sprite extends Animated {
  /**
   * Number of local units the sprite is defined across horizontally.
   */
  width   : number;
  /**
   * Number of local units the sprite is defined across vertically.
   */
  height  : number;
  /**
   * Hitbox used to calculate collisions for entities using this sprite.
   */
  hitbox  : Hitbox;
}

/**
 * Sprite used to encapsulate tread animation for tank sprites.
 */
class Tread extends Sprite {
  /**
   * The x offset in local sprite units.
   */
  x         : number;
  /**
   * Rect that renders first, the main body of the tread.
   */
  mainRect  : Rect;
  /**
   * The smaller rectangles that represent the treads.
   */
  rects     : Rect[];
  /**
   * Counter that tracks the current state of the animation.
   */
  counter   : Counter;

  /**
   * @param x the x offset in local units to render the tread.
   */
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

  /**
   * Advance the tread state upwards by so many frames.
   * @param delta The number of frames to increment.
   */
  shiftUp = ( delta = 0 ) : void => {
    this.counter.inc( delta )
  }

  /**
   * Advance the tread state downwards by so many frames.
   * @param delta The number of frames to decrement.
   */
  shiftDown = ( delta = 0 ) : void => {
    this.counter.dec( delta );
  }

  /**
   * Render the tread to the given canvas context.
   * @param ctx the canvas context to render the tread to.
   */
  render = ( ctx: CanvasRenderingContext2D ) : void => {
    this.mainRect.render( ctx );
    this.rects.map( ( rect ) => { rect.render( ctx ); } );
  }
}

/**
 * Class containing the rendering information for the tank sprites.
 */
class TankSprite extends Sprite {
  /**
   * Color used for colored tank renderables.
   */
  color   : string;
  canFire : boolean;

  /*
   *  Initialize the shape variables
   */
  /**
   * Tread object for lefthand side of tank.
   */
  leftTread   : Tread;
  /**
   * Tred object for righthand side of tank.
   */
  rightTread  : Tread;
  /**
   * RoundRect for main body of tank.
   */
  body        : RoundRect;
  /**
   * Rect for barrel of tank.
   */
  barrel      : Rect;
  /**
   * Rect for the cap of the barrel.
   */
  cap         : Rect;
  /**
   * Circle for the turrent of the tank. Centered on sprite.
   */
  turret      : Circle;
  /**
   * Whether or not to alter rendering to display multishot powerup.
   */
  multiShot   : boolean;

  /**
   * @param color Color to render tank with, default is #c00.
   */
  constructor( color = "#c00" ) {
    super();
    this.width      = 40;
    this.height     = 40;
    this.hitbox     = new Hitbox( -17.5, -20, 35, 40 );
    this.leftTread  = new Tread( -17.5 );
    this.rightTread = new Tread(   7.5 );
    this.body       = new RoundRect( -12.5, -20, 25, 40, 3, color, "#000" );
    this.barrel     = new Rect( -5, -20, 10, 25, color, "#000" );
    this.cap        = new RoundRect( -7.5, -25, 15, 7.5, 2.5, color, "#000" );
    this.turret     = new Circle( 0, 0, 10, color, "#000" );
    this.color      = color;
    this.multiShot  = false;
  }

  /**
   * Render the tank sprite to the given rendering context.
   * @param ctx The canvas rendering context to draw to.
   */
  render = ( ctx: CanvasRenderingContext2D ) : void => {
    if( this.multiShot ) {
      this.leftTread.render( ctx );
      this.rightTread.render( ctx );
      this.body.render( ctx );
      this.getAuxBarrel().render( ctx );
      ctx.save();
      ctx.rotate( Math.PI / 6 );
      this.getAuxBarrel().render( ctx );
      ctx.restore();
      ctx.save();
      ctx.rotate( -Math.PI / 6 );
      this.getAuxBarrel().render( ctx );
      ctx.restore();
      this.turret.render( ctx );
    } else {
      this.getItems().forEach( (item) => { item.render( ctx ) } );
    }
  }

  /**
   * Return a list of the tank sprite's primary renderables.
   */
  getItems = () : Renderable[] => {
    return [ this.leftTread, this.rightTread,
                  this.body, this.barrel,
                   this.cap, this.turret ];
  }

  /**
   * Set this.multiShot; true if passed value is > 0, else false. Called from
   * Tank class.
   * @param num Number of multishot powerups owned by tank.
   */
  setMulti = ( num : number ) : void => {
    this.multiShot = ( num > 0 );
  }

  /**
   * Helper function to create renderables for extra barrels. Used to render
   * altered sprite for multishot powerup.
   * @returns Collection of renderables for altered multishot sprite.
   */
  getAuxBarrel = () : Collection => {
    return new Collection ( [
      new Rect( -4, -22.5, 8, 20, this.color, "#000" ),
      new RoundRect( -7, -27.5, 14, 5, 2.5, this.color, "#000" )
    ] );
  }

  /**
   * @returns List of sprite width and height, in local units.
   */
  getDim = () : number[] => {
    return [ this.width, this.height ]
  }

  /**
   * Set renderables colors where applicable to a new color value.
   * @param color Color to set items to.
   */
  changeColor = ( color : string ) : void => {
    this.getItems().map( ( item ) => {
      if( item instanceof Shape ) { item.color = color; }
    } );
  }

  /**
   * Helper function to pass updates to Tread sprites on Tank.moveForward.
   @param delta number of frames to update.
   */
  moveTreadsForward = ( delta = 0 ) : void => {
    this.leftTread.shiftDown( delta );
    this.rightTread.shiftDown( delta );
  }

  /**
   * Helper function to pass updates to Tread sprites on Tank.moveBackward.
   @param delta number of frames to update.
   */
  moveTreadsBackward = ( delta = 0 ) : void => {
    this.leftTread.shiftUp( delta );
    this.rightTread.shiftUp( delta );
  }

  /**
   * Helper function to pass updates to Tread sprites on Tank.rotateCW.
   @param delta number of frames to update.
   */
  moveTreadsRight = ( delta = 0 ) : void => {
    this.leftTread.shiftDown( delta );
    this.rightTread.shiftUp( delta );
  }

  /**
   * Helper function to pass updates to Tread sprites on Tank.rotateCCW.
   @param delta number of frames to update.
   */
  moveTreadsLeft = ( delta = 0 ) : void => {
    this.leftTread.shiftUp( delta );
    this.rightTread.shiftDown( delta );
  }
}

/**
 * Renderable item used to display tank healthbar on gameview.
 */
class NameTag extends Renderable {
  /**
   * Display name for player represented by the tank.
   */
  playerName : string;
  /**
   * Rect object to render as background for healthbar.
   */
  healthBar  : Rect;
  /**
   * Rect object to render as measure of current health.
   */
  healthFill : Rect;

  /**
   * @param playerName display name of player.
   * @param health Current health to display in healthbar, out of 100. Default is 100.
   */
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

  /**
   * Update the width of this.healthFill for new health value.
   * @param health Health value to determine healthFill width.
   */
  updateHealth = ( health : number ) : void => {
    this.healthFill.w = 36 * health / 100;
  }

  /**
   * Render nametag items to canvas context.
   * @param ctx Canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
//    ctx.font = "0.75em Consolas";
//    ctx.fillText( this.playerName, -20, 0 );
    this.healthBar.render( ctx );
    this.healthFill.render( ctx );
  }
}

class BulletSprite extends Sprite {
  /**
   * Hitbox used in collision calculations.
   */
  hitbox : Hitbox;
  /**
   * Path that defines the primary body of the sprite.
   */
  body   : Path;
  /**
   * Number of local units used for sprite along horizontal axis.
   */
  width  : number;
  /**
   * Number of local units used for sprite along vertical axis.
   */
  height : number;

  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.hitbox = new Hitbox( 0, -15, 0, 25 );
    this.body = new Path( -5,  5, "#606060" );
    let segments = [
      new LineSegment( 5,   5 ),
      new LineSegment( 5, -10 ),
      new ArcSegment( 0, -10, 5, 0.0, Math.PI, true )
    ];
    this.body.addSegments( segments );
  }

  /**
   * @returns List of sprite dimensions in local units.
   */
  getDim = () : number[] => {
    return [ this.width, this.height ]
  }

  /**
   * Draw sprite renderables to a canvas rendering context.
   * @param ctx The canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.save();
    this.body.render( ctx );
    ctx.fillStyle = "#333";
    ctx.fillRect( -4, 2, 8, 2 );
    ctx.restore();
  }
}

/**
 * Sprite used when a player has a buildwall powerup.
 */
class ShadowBlock extends Sprite {
  items : Collection;
  constructor( ) {
    super();
    let items = [
      new RoundRect(  0,  0, 40, 40, 3, "rgba( 0, 0, 0, 0.5 )", "transparent" ),
      new RoundRect(  1,  2, 18,  7, 3, "rgba( 112, 112, 112, 0.5 )", "transparent" ),
      new RoundRect( 21,  2, 18,  7, 3, "rgba( 112, 112, 112, 0.5 )", "transparent" ),
      new RoundRect(  1, 11,  8,  7, 3, "rgba( 80, 80, 80, 0.5 )", "transparent" ),
      new RoundRect( 11, 11, 18,  7, 3, "rgba( 80, 80, 80, 0.5 )", "transparent" ),
      new RoundRect( 31, 11,  8,  7, 3, "rgba( 80, 80, 80, 0.5 )", "transparent" ),
      new RoundRect(  1, 20, 18,  7, 3, "rgba( 48, 48, 48, 0.5 )", "transparent" ),
      new RoundRect( 21, 20, 18,  7, 3, "rgba( 48, 48, 48, 0.5 )", "transparent" ),
      new RoundRect(  1, 29,  8,  7, 3, "rgba( 16, 16, 16, 0.5 )", "transparent" ),
      new RoundRect( 11, 29, 18,  7, 3, "rgba( 16, 16, 16, 0.5 )", "transparent" ),
      new RoundRect( 31, 29,  8,  7, 3, "rgba( 16, 16, 16, 0.5 )", "transparent" )
    ];
    this.items = new Collection( items );
  }

  /**
   * Draw sprite renderables to a canvas rendering context.
   * @param ctx The canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.items.render( ctx );
  }
}

class ExplosionSprite extends Sprite {
  radii1 : Point[];
  radii2 : Point[];
  numPoints: number;
  innerVar : number;
  outerVar : number;
  growth   : number;
  counter : Counter;

  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    this.radii1 = [];
    this.radii2 = [];
    this.innerVar = 10;
    this.outerVar = 10;
    this.growth = 1;
    this.numPoints = 32;
    this.counter = new Counter( 0, 1, 32 );
    this.counter.dec();
    let innerR = 10;
    let outerR = 20;

    for( let i = 0; i < this.numPoints / 2; i++ ) {
      let p1 = new Point( innerR, outerR );
      let p2 = new Point( innerR / 2, outerR / 2 );
      p1.x += ( Math.random() - 0.5 ) * this.innerVar;
      p1.y += ( Math.random() - 0.5 ) * this.outerVar;
      p2.x += ( Math.random() - 0.5 ) * this.innerVar / 2;
      p2.y += ( Math.random() - 0.5 ) * this.outerVar / 2;
      this.radii1.push( p1 );
      this.radii2.push( p2 );
    }
  }

  update = () : boolean => {
    let count = this.counter.get();
    let growth = this.growth * count / this.counter.max;
    if( count == 0 ) {
      return true;
    }
    this.radii1 = this.radii1.map( ( p : Point ) : Point => {
      let innerR = p.x;
      let outerR = p.y;
      return new Point( innerR + growth,
                        outerR + growth );
    } );
    this.radii2 = this.radii2.map( ( p : Point ) : Point => {
      let innerR = p.x;
      let outerR = p.y;
      return new Point( innerR + growth / 2,
                        outerR + growth / 2 );
    } );
    this.counter.dec();
    return false;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    let a = this.counter.get() / this.counter.max;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo( 0, -this.radii1[0].x );
    this.radii1.forEach( ( p : Point ) => {
      let innerR = p.x;
      let outerR = p.y;
      ctx.lineTo( 0, -innerR );
      ctx.rotate( 2 * Math.PI / this.numPoints );
      ctx.lineTo( 0, -outerR );
      ctx.rotate( 2 * Math.PI / this.numPoints );
    } );
    ctx.lineTo( 0, -this.radii1[0].x );
    ctx.closePath();
    ctx.fillStyle = "rgba( 255, 0, 0, " + a + " )";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo( 0, 0 );
    this.radii2.forEach( ( p : Point ) => {
      let innerR = p.x;
      let outerR = p.y;
      ctx.lineTo( 0, -innerR );
      ctx.rotate( 2 * Math.PI / this.numPoints );
      ctx.lineTo( 0, -outerR );
      ctx.rotate( 2 * Math.PI / this.numPoints );
    } );
    ctx.lineTo( 0, -this.radii2[0].x );
    ctx.closePath();
    ctx.fillStyle = "rgba( 255, 255, 0, " + a + " )";
    ctx.fill();
    ctx.restore();
  }
}

class MultiShotSprite extends Sprite {
  /**
   * Number of local units used for sprite along horizontal axis.
   */
  width  : number;
  /**
   * Number of local units used for sprite along vertical axis.
   */
  height : number;
  /**
   * Main body rectangle for sprite.
   */
  box : RoundRect;
  /**
   * Circle for unique multishot token.
   */
  hub : Circle;
  /**
   * Collection of items used to render turrets for unique multishot token.
   */
  turret1 : Collection;
  /**
   * Collection of items used to render turrets for unique multishot token.
   */
  turret2 : Collection;
  /**
   * Collection of items used to render turrets for unique multishot token.
   */
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

  /**
   * Draws powerup sprite to rendering context.
   * @param ctx Canvas rendering context to draw sprite to.
   */
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
  /**
   * Number of local units used for sprite along horizontal axis.
   */
  width  : number;
  /**
   * Number of local units used for sprite along vertical axis.
   */
  height : number;
  /**
   * Main body rectangle for sprite.
   */
  box : RoundRect;
  /**
   * Collection of RoundRects used for the unique BuildWall sprite.
   */
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

  /**
   * Draws powerup sprite to rendering context.
   * @param ctx Canvas rendering context to draw sprite to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    this.bricks.render( ctx );
  }
}

class IncreaseMoveDistSprite extends Sprite {
  /**
   * Number of local units used for sprite along horizontal axis.
   */
  width  : number;
  /**
   * Number of local units used for sprite along vertical axis.
   */
  height : number;
  /**
   * Main body rectangle for sprite.
   */
  box : RoundRect;
  /**
   * Collection of paths used to render arrows unique to multishot sprite.
   */
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

  /**
   * Draws powerup sprite to rendering context.
   * @param ctx Canvas rendering context to draw sprite to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    this.arrows.render( ctx );
  }
}

/**
 * Rendering information for HealthPack powerup.
 */
class HealthPackSprite extends Sprite {
  /**
   * Number of local units used for sprite along horizontal axis.
   */
  width  : number;
  /**
   * Number of local units used for sprite along vertical axis.
   */
  height : number;
  /**
   * Main body rectangle for sprite.
   */
  box : RoundRect;
  /**
   * Cross/plus-sign used for HealthPack.
   */
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

  /**
   * Draws powerup sprite to rendering context.
   * @param ctx Canvas rendering context to draw sprite to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.box.render( ctx );
    this.cross.render( ctx );
  }
}
