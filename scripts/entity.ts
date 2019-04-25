abstract class Entity {
  xPos : number;
  yPos : number;
  dir  : number;
  sprite  : Renderable;
  layer   : Layer;
}

class Tank extends Entity {
  playerName  : string;
  userID      : string;
  health      : number;
  canShoot    : boolean;
  sprite      : TankSprite;
  distanceLeft: number;
  alive       : boolean;

  constructor( xPos : number, yPos : number, dir : number, playerName : string, userID : string, color : string, health : number ) {
    super();
    this.xPos   = xPos;
    this.yPos   = yPos;
    this.dir    = dir;
    this.distanceLeft = 5.0;

    this.playerName = playerName;
    this.userID     = userID;
    this.sprite     = new TankSprite( color );
    this.layer      = new Layer( playerName, 60, 60 );

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
    this.dir += delta;
    this.sprite.moveTreadsRight();
  }

  rotateCCW = ( delta = 1.0 ) : void => {
    this.dir -= delta;
    this.sprite.moveTreadsLeft();
  }

  addToSidebar = ( sidebar : Element ) => {
    console.log( sidebar );
    let cardDiv = document.createElement( "div" );
    cardDiv.classList.add( "playerCard" );
    cardDiv.setAttribute( "id", "info" + this.userID );

    let usernameDiv = document.createElement( "div" );
    usernameDiv.classList.add( "username" );
    usernameDiv.innerHTML = this.playerName;

    let healthDiv = document.createElement( "div" );
    healthDiv.classList.add( "tankHealth" );
    healthDiv.innerHTML = this.health + "/100";

    let spriteDiv = document.createElement( "div" );
    spriteDiv.classList.add( "tankSprite" );
    cardDiv.appendChild( usernameDiv );
    cardDiv.appendChild( healthDiv );
    cardDiv.appendChild( spriteDiv );
    this.layer.attachToParent( spriteDiv );
    sidebar.appendChild( cardDiv );
  }

  setHealth = ( health : number ) : void => {
    this.health = health;
    if( health == 0 ) {
      this.alive = false;
    }
  }
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
    this.sprite = new BulletSprite();
    this.distToGo = distToGo;
    this.distGone = 0.0;
    this.power = power;
    this.curve = curve;
  }

  attachToLayer = ( layer : Layer ) : void => {
    this.layer = layer;
  }

  render = () : void => {
    this.layer.drawItem( this.sprite );
  }

  detonate = () : void => {
    this.boom = true;
  }

  update = () : void => {
    let dirRad = this.dir * Math.PI / 180.0;
    this.xPos += Math.sin( dirRad ) * 0.5;
    this.yPos -= Math.cos( dirRad ) * 0.5;
    this.distGone += 0.5;
    if( this.distToGo <= this.distGone ) { this.detonate(); }
  }
}
