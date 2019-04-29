abstract class Entity {
  xPos : number;
  yPos : number;
  dir  : number;
  sprite  : Renderable;
  layer   : Layer;
  hitbox  : Hitbox;

  attachToLayer = ( layer : Layer ) : void => {
    this.layer = layer;
  }

  getHitbox = ( ) : Hitbox => {
    return this.hitbox;
  }
}

class Hitbox {
  w : number;
  h : number;

  constructor( w : number, h : number ) {
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
    this.nameTag    = new NameTag( playerName, health );
    this.layer      = new Layer( playerName, 60, 60 );
    this.hitbox     = new Hitbox( 35, 40 );

    this.health   = health;
    this.canShoot = false;
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

  addPowerups = ( powerups : Powerup[] ) : void => {
    powerups.forEach( this.addPowerup );
  }

  addPowerup = ( powerup : Powerup ) : void => {}
}

class Bullet extends Entity {
  distToGo  : number;
  distGone  : number;
  power     : number;
  curve     : number;
  boom      : boolean;

  constructor( xPos : number, yPos : number, dir : number, distToGo : number, power : number, curve : number ) {
    super();
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir  = dir;
    this.hitbox = new Rect( -5, -15, 10, 25, "green" );
    this.sprite = new BulletSprite();
    this.distToGo = distToGo;
    this.distGone = 0.0;
    this.power = power;
    this.curve = curve;
  }

  render = () : void => {
    this.layer.applyTranslate( this.xPos * 40, this.yPos * 40 );
    this.layer.applyRotation( this.dir );
    this.layer.drawItem( this.sprite );
//    this.layer.drawItem( this.hitbox );
    this.layer.popTransform();
    this.layer.popTransform();
  }

  detonate = () : void => {
    this.boom = true;
  }

  update = () : void => {
    let dirRad = this.dir * Math.PI / 180.0;
    this.xPos += Math.sin( dirRad ) * 0.5;
    this.yPos -= Math.cos( dirRad ) * 0.5;
    this.distGone += 0.5;
    this.dir += Math.max( 0, this.distGone - this.power ) * this.curve;
    if( this.distToGo <= this.distGone ) { this.detonate(); }
  }
}

abstract class Powerup extends Entity {
  constructor( x : number, y : number ) {
    super();
    this.xPos = x;
    this.yPos = y;
    console.log( this.xPos );
    this.sprite = new Rect( 0, 0, 40, 40 );
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

class Buff {}
