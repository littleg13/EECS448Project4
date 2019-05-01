abstract class Entity {
  xPos    : number;
  yPos    : number;
  width   : number;
  height  : number;
  dir     : number;
  sprite  : Sprite;
  layer   : Layer;

  attachToLayer = ( layer : Layer ) : void => {
    this.layer = layer;
  }

  projHitbox = ( linVel : number = 0, rotVel : number = 0 ) : Point[] => {
    let dirRad = ( this.dir + rotVel ) * Math.PI / 180.0;
    let dX =  linVel * Math.sin( dirRad ) + this.xPos + 0.5;
    let dY = -linVel * Math.cos( dirRad ) + this.yPos + 0.5;
    let localHitbox = this.sprite.hitbox;
    let delX = localHitbox.w / this.width;
    let offX = localHitbox.xOffset / this.width;
    let delY = localHitbox.h / this.height;
    let offY = localHitbox.yOffset / this.height;
    let corners = [
      new Point( offX       , offY        ),
      new Point( offX + delX, offY        ),
      new Point( offX + delX, offY + delY ),
      new Point( offX       , offY + delY )
    ];
    return corners.map( ( point ) => {
      let x = point.x * Math.cos( dirRad ) - point.y * Math.sin( dirRad );
      let y = point.x * Math.sin( dirRad ) + point.y * Math.cos( dirRad );
      return new Point( x + dX, y + dY );
    } );
  }
}

class Hitbox {
  xOffset : number;
  yOffset : number;
  w : number;
  h : number;

  constructor( xOffset : number, yOffset : number, w : number, h : number) {
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.w = w;
    this.h = h;
  }
}

class Tank extends Entity {
  playerName  : string;
  userID      : string;
  color       : string;
  infoCard    : PlayerCard;
  health      : number;
  canShoot    : boolean;
  sprite      : TankSprite;
  nameTag     : NameTag;
  distanceLeft: number;
  alive       : boolean;
  multiShot   : number;
  buildWall   : number;

  constructor( xPos : number, yPos : number, dir : number, playerName : string, userID : string, color : string, health : number ) {
    super();
    this.xPos   = xPos;
    this.yPos   = yPos;
    this.dir    = dir;
    this.distanceLeft = 5.0;
    this.color  = color;

    this.playerName = playerName;
    this.userID     = userID;
    this.sprite     = new TankSprite( color );
    [ this.width, this.height ] = this.sprite.getDim();
    this.nameTag    = new NameTag( playerName, health );
    this.layer      = new Layer( playerName, 60, 60 );

    this.health   = health;
    this.canShoot = false;
    this.multiShot = 0;
    this.buildWall = 0;
  }

  updateImage = () : void => {
    this.layer.clear();
    this.layer.center();
    this.layer.applyRotation( this.dir );
    this.layer.drawItem( this.sprite );
    this.layer.popTransform();
    this.layer.popTransform();
  }

  getLayer = () : Layer => {
    return this.layer;
  }

  setColor = ( color : string ) : Tank => {
    this.sprite.changeColor( color );
    return this;
  }

  moveForward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.xPos += Math.sin( dirRads ) * delta;
    this.yPos -= Math.cos( dirRads ) * delta;
    this.distanceLeft = Math.max( this.distanceLeft - delta, 0 );
    this.sprite.moveTreadsForward();
  }

  moveBackward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.xPos -= Math.sin( dirRads ) * delta;
    this.yPos += Math.cos( dirRads ) * delta;
    this.distanceLeft = Math.max( this.distanceLeft - delta, 0 );
    this.sprite.moveTreadsBackward();
  }

  rotateCW = ( delta = 1.0 ) : void => {
    this.dir = ( this.dir + delta ) % 360.0;
    this.sprite.moveTreadsRight();
  }

  rotateCCW = ( delta = 1.0 ) : void => {
    this.dir = ( this.dir - delta + 360.0 ) % 360.0;
    this.sprite.moveTreadsLeft();
  }

  addToSidebar = ( sidebar : HTMLElement ) => {
    this.infoCard = new PlayerCard( this.userID, this.playerName, this.health, this.layer );
    this.infoCard.buildCard();
    this.infoCard.setParent( sidebar );
  }

  setHealth = ( health : number ) : void => {
    this.health = health;
    if( health == 0 ) {
      this.alive = false;
    }
    this.infoCard.updateHealth( health );
    this.nameTag.updateHealth( health );
  }

  setTurn = ( isTurn : boolean = false) : void => {
    this.canShoot = true;
    this.distanceLeft = 5.0;
    this.infoCard.setTurn( isTurn );
  }

  addPowerup = ( powerup : Powerup ) : void => {
    if( powerup instanceof MultiShotToken ) this.multiShot++;
    else if( powerup instanceof BuildWallToken ) this.buildWall++;
    this.sprite.setBuffs( this.multiShot, this.buildWall );
  }

  clearPowerups = () : void => {
    this.multiShot = 0;
    this.buildWall = 0;
  }
}

class Bullet extends Entity {
  shooterID   : string;
  distToGo    : number;
  distGone    : number;
  sprite      : BulletSprite;
  power       : number;
  curve       : number;
  speed       : number;
  boom        : boolean;
  trajectory  : Point[];

  constructor( userID : string, xPos : number, yPos : number, dir : number, distToGo : number, power : number, curve : number ) {
    super();
    this.shooterID = userID;
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir  = dir;
    this.sprite = new BulletSprite();
    [ this.width, this.height ] = this.sprite.getDim();
    this.distToGo = distToGo;
    this.distGone = 0.0;
    this.power = power;
    this.curve = curve;
    this.speed = 0.5;
  }

  render = () : void => {
    this.layer.applyTranslate( ( this.xPos + 0.5 ) * this.width, ( this.yPos + 0.5 ) * this.height );
    this.layer.applyRotation( this.dir );
    this.layer.drawItem( this.sprite );
    this.layer.popTransform();
    this.layer.popTransform();
  }

  detonate = () : void => {
    this.boom = true;
  }

  update = () : boolean => {
    let dirRad = this.dir * Math.PI / 180.0;
    this.xPos += Math.sin( dirRad ) * this.speed;
    this.yPos -= Math.cos( dirRad ) * this.speed;
    this.distGone += this.speed;
    this.dir += Math.max( 0, this.distGone - this.power ) * this.curve;
    return this.boom;
  }
}

abstract class Powerup extends Entity {
  constructor( x : number, y : number ) {
    super();
    this.xPos = x;
    this.yPos = y;
  }

  render = () : void => {
    if( this.layer === undefined ) return;
    this.layer.applyTranslate( ( this.xPos + 0.5 ) * 40, ( this.yPos + 0.5 ) * 40 );
    this.layer.drawItem( this.sprite );
    this.layer.popTransform();
  }
}

class MultiShotToken extends Powerup {
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new MultiShotSprite();
  }
}

class BuildWallToken extends Powerup {
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new BuildWallSprite();
  }
}

class IncreaseMoveDistToken extends Powerup {
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new IncreaseMoveDistSprite();
  }
}

class HealthPackToken extends Powerup {
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new HealthPackSprite();
  }
}
