/**
 * Abstract class to be extended for different entities. Entities are objects that
 * are rendered to the gameview and must be checked for collisions.
 */
abstract class Entity {
  /**
   * Horizontal position of entity.
   */
  xPos    : number;
  /**
   * Vertical positoin of entity.
   */
  yPos    : number;
  /**
   * Number of horizontal units used by entity's sprite to render.
   */
  width   : number;
  /**
   * Number of vertical units used by entity's sprite to render.
   */
  height  : number;
  /**
   * Rotation from vertical, in degrees.
   */
  dir     : number;
  /**
   * Sprite class which stores collection of renderable items that visually represent
   * the entity.
   */
  sprite  : Sprite;
  /**
   * Rendering layer to which the entity is drawn.
   */
  layer   : Layer;

  /**
   * A setter that connects the entity to a rendering layer.
   * @param layer rendering layer to attach entity to.
   */
  attachToLayer = ( layer : Layer ) : void => {
    this.layer = layer;
  }

  /**
   * Returns a list of points that represent the rectangular area the entity
   * would occupy on position change. Used for determining collisions on client.
   * @param linVel change in local vertical position of entity for collision calculations.
   * @param rotVel change in local direction of entity for collision calculations.
   */
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

/**
 * Entity class defined for each player's tank.
 */
class Tank extends Entity {
  /**
   * Displayed name for the player.
   */
  playerName  : string;
  /**
   * Unique identifier for player.
   */
  userID      : string;
  /**
   * Base color for constructing the tank sprite.
   */
  color       : string;
  /**
   * Playercard used to display player information independently of gameview.
   */
  infoCard    : PlayerCard;
  /**
   * Current health, between 0 and 100 inclusive, for player's tank.
   */
  health      : number;
  /**
   * Whether or not this player is allowed to fire at this time.
   */
  canShoot    : boolean;
  /**
   * Sprite class to render as visual representation of the tank entity.
   */
  sprite      : TankSprite;
  /**
   * Displays below player sprite. Currently only includes a healthbar.
   */
  nameTag     : NameTag;
  /**
   * The amount of distance the tank is currently allowed to move.
   */
  distanceLeft: number;
  /**
   * Whether or not the entity is "alive" and to be rendered.
   */
  alive       : boolean;
  /**
   * Number of multishot powerups the player currently has. Used to slightly alter
   * the tank sprite to display multiple barrels.
   */
  multiShot   : number;
  /**
   * Number of buildwall powerups the player currently has. Used to determine whether
   * or not to display a shadowblock in front of tank entity.
   */
  buildWall   : number;

  /**
   * @param xPos Horizontal position of the tank, in global "tile units".
   * @param yPos Vertical position of the tank, in global "tile units".
   * @param dir Rotation from vertical of the tank, in degrees.
   * @param playerName The displayed name for the player.
   * @param userID The unique identifier for the player.
   * @param color The color to be used in constructing the player sprite.
   * @param health The initial health value assigned to the tank.
   */
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

  /**
   * Rerenders the tank on its layer before it is redrawn on gameview.
   */
  updateImage = () : void => {
    this.layer.clear();
    this.layer.center();
    this.layer.applyRotation( this.dir );
    this.sprite.setMulti( this.multiShot );
    this.layer.drawItem( this.sprite );
    this.layer.popTransform();
    this.layer.popTransform();
  }

  /**
   * @return Tank entity's rendering layer.
   */
  getLayer = () : Layer => {
    return this.layer;
  }

  /**
   * Used to alter sprite in case a change in color is necessary.
   * @param color Color value to assign to the sprite.
   */
  setColor = ( color : string ) : Tank => {
    this.sprite.changeColor( color );
    return this;
  }

  /**
   * Update entity's position information and sprite animation for forward movement.
   * @param delta the amount of movement forward, default 1.0 tile units.
   */
  moveForward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.xPos += Math.sin( dirRads ) * delta;
    this.yPos -= Math.cos( dirRads ) * delta;
    this.distanceLeft = Math.max( this.distanceLeft - delta, 0 );
    this.sprite.moveTreadsForward();
  }

  /**
   * Update entity's position information and sprite animation for backward movement.
   * @param delta the amount of movement backward, default 1.0 tile units.
   */
  moveBackward = ( delta = 1.0 ) : void => {
    let dirRads = ( this.dir / 180.0 ) * Math.PI;
    this.xPos -= Math.sin( dirRads ) * delta;
    this.yPos += Math.cos( dirRads ) * delta;
    this.distanceLeft = Math.max( this.distanceLeft - delta, 0 );
    this.sprite.moveTreadsBackward();
  }

  /**
   * Update entity's position information and sprite animation for clockwise rotation.
   * @param delta the amount of rotational movement, default 1.0 degrees.
   */
  rotateCW = ( delta = 1.0 ) : void => {
    this.dir = ( this.dir + delta ) % 360.0;
    this.sprite.moveTreadsRight();
  }

  /**
   * Update the entity's position information and sprite animation for counter-clockwise rotation.
   * @param delta the amount of rotational movement, default 1.0 degrees.
   */
  rotateCCW = ( delta = 1.0 ) : void => {
    this.dir = ( this.dir - delta + 360.0 ) % 360.0;
    this.sprite.moveTreadsLeft();
  }

  /**
   * Constructs the tank entity's playercard and attaches it to a containing element.
   * @param sidebar Containing element to attach playercard to.
   */
  addToSidebar = ( sidebar : HTMLElement ) => {
    this.infoCard = new PlayerCard( this.userID, this.playerName, this.health, this.layer );
    this.infoCard.buildCard();
    this.infoCard.setParent( sidebar );
  }

  /**
   * Updates health both in data structure and in visual displays in the playercard
   * and nametag that is rendered below the tank on gameview. Update this.alive
   * to false if health reaches 0.
   * @param health New health value for tank entity.
   */
  setHealth = ( health : number ) : void => {
    this.health = health;
    if( health == 0 ) {
      this.alive = false;
    }
    this.infoCard.updateHealth( health );
    this.nameTag.updateHealth( health );
  }

  /**
   * Reset canShot and distanceLeft to prepare for the next turn.
   * @param isTurn Whether or not it is the tank entity's player's turn, default is false.
   */
  setTurn = ( isTurn : boolean = false) : void => {
    this.canShoot = true;
    this.distanceLeft = 5.0;
    this.infoCard.setTurn( isTurn );
  }

  /**
   * Updates tank entity's data for the powerup passed to the method.
   * @param powerup The powerup to be added.
   */
  addPowerup = ( powerup : Powerup ) : void => {
    if( powerup instanceof MultiShotToken ) this.multiShot++;
    else if( powerup instanceof BuildWallToken ) this.buildWall++;
  }

  /**
   * Remove all powerups from tank entity.
   */
  clearPowerups = () : void => {
    this.multiShot = 0;
    this.buildWall = 0;
  }
}

/**
 * Class used to handle bullet rendering and calculations.
 */
class Bullet extends Entity {
  /**
   * userID for player that fired the shot.
   */
  shooterID   : string;
  /**
   * Amount of distance before bullet is to be removed and replaced with an explosion effect.
   */
  distToGo    : number;
  /**
   * Amount traveled since spawning. Used to determine when to remove and replace
   * the bullet entity with an explosion effect and when to update target information.
   */
  distGone    : number;
  /**
   * Sprite class which handles rendering information.
   */
  sprite      : BulletSprite;
  /**
   * Value used to calculate curved bullet effect. Determines how far the bullet
   * travels before beginning to turn.
   */
  power       : number;
  /**
   * Value used to calculate curved bullet effect. Determines how quickly and in
   * which direction to curve bullet path.
   */
  curve       : number;
  /**
   * Value for forward change in position for each update call.
   */
  speed       : number;
  /**
   * Value to track whether or not to remove the bullet from rendering. Set to true
   * when bullet has traveled its set distance.
   */
  boom        : boolean;
  /**
   * Which item the bullet is calculated to collide with by server. Used to track
   * what to update on the end of the bullet path.
   */
  target      : any;

  /**
   * @param userID unique identifier for the player that fired the bullet
   * @param xPos horizontal position in tile units.
   * @param yPos vertical position in tile units.
   * @param dir rotation from vertical in degrees.
   * @param distToGo number of tile units to travel before removal.
   * @param power power value used in curved bullet calculations.
   * @param curve curve value used in curved bullet calculations.
   */
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
    this.target = null;
  }

  /**
   * Renders bullet on its rendering layer.
   */
  render = () : void => {
    this.layer.applyTranslate( ( this.xPos + 0.5 ) * this.width, ( this.yPos + 0.5 ) * this.height );
    this.layer.applyRotation( this.dir );
    this.layer.drawItem( this.sprite );
    this.layer.popTransform();
    this.layer.popTransform();
  }

  /**
   * Setter for target.
   * @param targetData information used to determine what other object to update on collision
   */
  setTarget = ( targetData ) : void => {
    this.target = targetData;
  }

  /**
   * Sets this.boom to true, called when bullet has reached its final distance.
   */
  detonate = () : void => {
    this.boom = true;
  }

  /**
   * Updates bullet position information and distance traveled.
   * @returns false if bullet has reached its final distance, true otherwise.
   */
  update = () : boolean => {
    let dirRad = this.dir * Math.PI / 180.0;
    this.xPos += Math.sin( dirRad ) * 0.5;
    this.yPos -= Math.cos( dirRad ) * 0.5;
    this.distGone += 0.5;
    this.dir += Math.max( 0, this.distGone - this.power ) * this.curve;
    if( this.distToGo <= this.distGone ) { return false }
    return true;
  }
}

/**
 * Abstract class to be extended for powerup tokens.
 */
abstract class Powerup extends Entity {
  /**
   * @param x Horizontal position in tile units.
   * @param y Vertical position in tile units.
   */
  constructor( x : number, y : number ) {
    super();
    this.xPos = x;
    this.yPos = y;
  }

  /**
   * Render to rendering layer the powerup token is attached to.
   */
  render = () : void => {
    if( this.layer === undefined ) return;
    this.layer.applyTranslate( ( this.xPos + 0.5 ) * 40, ( this.yPos + 0.5 ) * 40 );
    this.layer.drawItem( this.sprite );
    this.layer.popTransform();
  }
}

/**
 * Extends Powerup with specifics for a MultiShot powerup.
 */
class MultiShotToken extends Powerup {
  /**
   * @param x Horizontal position in tile units.
   * @param y Vertical position in tile units.
   */
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new MultiShotSprite();
  }
}

/**
 * Extends Powerup with specifics for a MultiShot powerup.
 */
class BuildWallToken extends Powerup {
  /**
   * @param x Horizontal position in tile units.
   * @param y Vertical position in tile units.
   */
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new BuildWallSprite();
  }
}

/**
 * Extends Powerup with specifics for a MultiShot powerup.
 */
class IncreaseMoveDistToken extends Powerup {
  /**
   * @param x Horizontal position in tile units.
   * @param y Vertical position in tile units.
   */
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new IncreaseMoveDistSprite();
  }
}

/**
 * Extends Powerup with specifics for a MultiShot powerup.
 */
class HealthPackToken extends Powerup {
  /**
   * @param x Horizontal position in tile units.
   * @param y Vertical position in tile units.
   */
  constructor( x : number, y : number ) {
    super( x, y );
    this.sprite = new HealthPackSprite();
  }
}
