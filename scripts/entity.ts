class Entity {
  xPos : number;
  yPos : number;
  dir  : number;

  sprite  : Renderable;
  layer   : Layer;
}

class Tank extends Entity {
  playerName  : string;
  health      : number;
  canShoot    : boolean;
  sprite      : TankSprite;

  constructor( xPos : number, yPos : number, dir : number,
               playerName : string, color : string, health : number ) {
    super();
    this.xPos   = xPos;
    this.yPos   = yPos;
    this.dir    = dir;

    this.playerName = playerName;
    this.sprite     = new TankSprite( color );
    this.layer      = new Layer( playerName, 60, 60 );
    this.layer.getImage().classList.add( "TankSprite" );

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
    this.sprite.moveTreadsForward();
  }

  moveBackward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.xPos -= Math.sin( dirRads ) * delta;
    this.yPos += Math.cos( dirRads ) * delta;
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

  addToSidebar = ( sidebar : HTMLElement ) => {
    this.layer.attachToParent( sidebar );
  }
}
