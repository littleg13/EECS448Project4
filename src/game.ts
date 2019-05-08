/**
 * Declared here to reserve name. Defined in main.js.
 */
var sendServerUpdate = () : void => {}

/**
 * Used to structure powerup data from the server.
 */
class PowerupUpdate {
  /**
   * Tile row to display new token.
   */
  row : number;
  /**
   * Tile column to display new token.
   */
  col : number;
  /**
   * Which kind of powerup token to create.
   */
  type : string;
}

/**
 * Used to structure target data for new fire events from the server.
 */
class BulletHit {
  /**
   *
   */
  userID : string;
  /**
   * What kind of object the bullet will collide with. Either edge, map or player.
   */
  type : string;
  /**
   * Row of eventual collision.
   */
  row  : number;
  /**
   * Column of eventual collision.
   */
  col  : number;
}

/**
 * Handles coordination between different parts of the game client. Contains rendering
 * layers, map and map information, player and entity lists, and tracks user input.
 */
class Game {
  /**
   * Rendering layer to draw map to.
   */
  background  : Layer;
  /**
   * Rendering layer to compose overall gameview to.
   */
  gameview    : Layer;
  /**
   * Rendering layer to draw all entities to.
   */
  entities    : Layer;
  /**
   * Rendering layer to draw effects to.
   */
  effects     : Layer;
  /**
   * Rendering layer to draw scaled version of background map to.
   */
  minimap     : Layer;
  /**
   * Map object that contains tile information.
   */
  map         : Map;
  /**
   * Size of map object along both axes.
   */
  mapDim      : number;
  /**
   * Proportion to scale gameview rendering to.
   */
  scale       : number;
  /**
   * List of tank entities representing player information.
   */
  tanks       : Tank[];
  /**
   * List of bullet entities currently active.
   */
  bullets     : Bullet[];
  /**
   * List of powerup tokens available on the map.
   */
  powerups    : Powerup[];
  /**
   * List of explosion effects to render and update.
   */
  explosions : Effect[];
  /**
   * Amount of movement player is allowed in tile units if it is this client's turn.
   */
  distLeftThisTurn : number;
  /**
   * Unique userID for player whose turn it is.
   */
  curTurn     : string;
  /**
   * The current number of pixels within a tile.
   */
  curBoxDim   : number;
  /**
   * The number of local units within a tile.
   */
  tileDim     : number;
  /**
   * The number of pixels within a minimap tile.
   */
  miniDim     : number;
  /**
   * List of keys currently pressed.
   */
  keys        : string[];
  /**
   * Length of time specific keys have been pressed.
   */
  keyTimes;
  /**
   * Whether or not the current client has updated its tank's position since last server update.
   */
  movedSinceLastTransmit : boolean;
  /**
   * Whether or not the current client has issued a firing event since last server update.
   */
  playerShot             : boolean;
  /**
   * Whether or not the game has begun.
   */
  begun                  : boolean;
  /**
   * Whether or not the game has ended and been won.
   */
  won                    : boolean;
  /**
   * Object containing row and column data for next server update for if this
   * client's player has attempted to place a wall on the map.
   */
  buildWall              : object;
  /**
   * Interval handler for the gametick interval.
   */
  gameTickUpdateInt      : number;
  /**
   * Interval handler for the server update interval.
   */
  sendServerUpdateInt    : number;

  /**
   * @param mapDim Number of tiles to construct the game map with.
   */
  constructor( mapDim : number ) {
    this.map = new Map( mapDim );
    this.mapDim = mapDim;
    this.scale = 1;

    // Entity lists
    this.tanks       = [];
    this.bullets     = [];
    this.powerups    = [];
    this.explosions  = [];

    this.curTurn = "";
    this.distLeftThisTurn = 5.0;
    this.curBoxDim = 40;
    this.tileDim   = 40;
    this.miniDim   = 10;
    this.keys      = [];
    this.keyTimes  = {};
    this.movedSinceLastTransmit = false;
    this.playerShot = false;
    this.begun = false;
    this.won = false;
    this.initLayers();
  }

/**
*   INITIAL METHODS:
*     Here are the methods that handle setting up various game components
*
*/
  /**
   * Create rendering layers and attach them to the DOM.
   */
  initLayers = () : void => {
    let viewRadius = 10; // in tiles
    this.gameview = new Layer( "gameview", 2 * viewRadius * this.tileDim, 2 * viewRadius * this.tileDim );
    this.gameview.attachToParent( document.getElementById( "gameBody" ) );

    let canvasDim = this.mapDim * this.tileDim;

    this.entities = new Layer( "entities", canvasDim, canvasDim );
    this.entities.attachToParent( document.getElementById( "hidden" ) );

    this.effects = new Layer( "effects", canvasDim, canvasDim );
    this.effects.attachToParent( document.getElementById( "hidden" ) );

    this.background = new Layer( "background", canvasDim, canvasDim );
    this.background.attachToParent( document.getElementById( "hidden" ) );

    this.minimap = new Layer( "minimap", this.miniDim * this.mapDim, this.miniDim * this.mapDim );
    this.minimap.attachToParent( document.getElementById( "mini" ) );
  }

  /**
   * Initialize the game tick and server update intervals, and populate the sidebar
   * with playercards.
   */
  startGame = () : void => {
    this.gameTickUpdateInt = setInterval( () => { this.gameTick(); } , Math.round( 1000 / 32 ) );
    this.sendServerUpdateInt = setInterval( () => { sendServerUpdate(); }, 40 );
    this.populateSidebar();
  }

  /**
   * Create a new tank entity and append it to the the tank list.
   * @param userID unique identifer for tank.
   * @param username display name for tank.
   * @param xPos horizontal position in tile units.
   * @param yPos vertical position in tile units.
   * @param direction rotation from vertical in degrees.
   * @param distanceLeft number of tile units of allowed movement for entity.
   * @param color color to construct tank sprite with.
   * @param health current health point value for tank.
   */
  addTank = ( userID    : string, username      : string,
              xPos      : number, yPos          : number,
              direction : number, distanceLeft  : number,
              color     : string, health        : number ) : void => {
    this.tanks.push( new Tank( xPos, yPos, direction, username, userID, color, health ) );
  }

  /**
   * Add playercards to right-hand sidebar.
   */
  populateSidebar = () : void => {
    let userInfoDiv = document.getElementById("userCard");
    let lobbyInfoDiv = document.getElementById("lobbyInfo");
    userInfoDiv.innerHTML = "";
    lobbyInfoDiv.innerHTML = "";
    this.tanks.map( ( tank ) => {
      let userID = tank.userID;
      if( document.getElementById( "info" + userID ) === null ) {
        if( userID == localStorage.userID ) {
          tank.addToSidebar( userInfoDiv );
        } else {
          tank.addToSidebar( lobbyInfoDiv );
        }
      }
    });
    return;
  }
/**
*   PROCESS INPUT:
*     Here are the methods that handle input processing
*
*/
  /**
   * Determine if an entity collides with a walltile.
   * @param obj Entity to check against map.
   * @param linVel amount of change in the local vertical axis of entity.
   * @param rotVel amount of change in the entity direction, in degrees.
   */
  checkMapCollision = ( obj : Entity, linVel, rotVel ) : boolean => {
    let tiles = this.map.tiles;
    return obj.projHitbox( linVel, rotVel ).some( ( corner : Point ) : boolean => {
      let col = Math.floor( corner.x );
      let row = Math.floor( corner.y );
      let retVal = tiles[ row ][ col ].isBlocking;
      if( obj instanceof Bullet ) {
        this.map.redraw( row, col );
        this.background.applyTranslate( col * this.tileDim, row * this.tileDim );
        this.background.drawItem( this.map.getTile( row, col ) );
        this.background.popTransform();
      }
      return retVal;
    } );
  }

  /**
   * Determine if an entity collides with any powerup tokens.
   * @param obj Entity to check against powerup list.
   */
  checkPowerupCollision = ( obj : Entity ) : number => {
    let [ col, row ] = [ obj.xPos + 0.5, obj.yPos + 0.5 ].map( Math.floor );
    let retIndex = this.powerups.map( ( powerup : Powerup ) : boolean => {
      if( powerup.xPos == col && powerup.yPos == row ) return true;
      else return false;
    } ).indexOf( true );
    return retIndex;
  }

  /**
   * Determine if a bullet entity collides with a wall or player.
   * @param bullet Bullet entity to check for.
   */
  checkBulletCollision = ( bullet : Bullet ) : boolean => {
    let speed = bullet.speed;
    let [ bullX, bullY ] = [ bullet.xPos + 0.5, bullet.yPos + 0.5 ];
    bullX += speed * Math.sin( bullet.dir * Math.PI / 180.0 );
    bullY -= speed * Math.cos( bullet.dir * Math.PI / 180.0 );
    if( this.checkBulletTrajectory( bullX, bullY, bullet.shooterID ) )
      return true;
    else return false;
  }

  /**
   * Project's bullet forward along its trajectory for accurate collision detection.
   * @param bullX bullet horizontal position in tile units.
   * @param bullY bullet vertical position in tile units.
   * @param userID unique identifier for user that fired the bullet
   * @returns Whether or not the bullet has made a collision
   */
  checkBulletTrajectory = ( bullX : number, bullY : number, userID : string ) : boolean => {
    let [ bullCol, bullRow ] = [ bullX, bullY ].map( Math.floor );
    let tile = this.map.getTile( bullRow, bullCol );
    if( tile.isBlocking ) {
      this.map.redraw( bullRow, bullCol );
      this.background.applyTranslate( bullCol * this.tileDim, bullRow * this.tileDim );
      this.background.drawItem( this.map.getTile( bullRow, bullCol ) );
      this.background.popTransform();
      return true;
    } else {
      let retVal = this.tanks.some( ( tank : Tank ) : boolean => {
        if( tank.userID == userID ) return false;
        if( tank.health == 0 ) return false;
        let dirRad = tank.dir * Math.PI / 180.0;
        let [ xPos, yPos ] = [ tank.xPos + 0.5, tank.yPos + 0.5 ];
        let between = ( val, a, b ) => {
          let low = Math.min( a, b );
          let high = Math.max( a, b );
          return ( low < val && val < high );
        }
        let [ delX, delY ] = [ bullX - xPos, bullY - yPos ];
        let dist = Math.sqrt( delX * delX + delY * delY );
        return dist < 0.5;
      } );
      return retVal;
    }
  }

  /**
   * Checks this.keys to determine which if any movement or firing events should
   * be sent to server on next server update. Updates local variables appropriately.
   */
  processInput = () : void => {
    let player = this.getPlayer();
    if( this.curTurn != localStorage.userID ) return;
    if( this.keys["ArrowLeft"] ) {
      if( !this.checkMapCollision( player, 0, -4.0 ) ) {
        player.rotateCCW( 4.0 );
        this.setPlayerMoved();
      }
    }
    if( this.keys["ArrowRight"] ) {
      if( !this.checkMapCollision( player, 0, 4.0 ) ) {
        player.rotateCW( 4.0 );
        this.setPlayerMoved();
      }
    }
    if( this.keys[" "] ) {
      if( player.canShoot && !this.getPlayerShot() ) {
        this.setPlayerShot( true );
      }
      this.keys[" "] = false;
    }
    if( this.keys["e"] && player.buildWall != 0 ) {
      let [ xPos, yPos ] = [ player.xPos, player.yPos ];
      xPos += 1.5 * Math.sin( player.dir * Math.PI / 180.0 );
      yPos -= 1.5 * Math.cos( player.dir * Math.PI / 180.0 );
      let [ col, row ] = [ xPos + 0.5, yPos + 0.5 ].map( Math.floor );
      this.setBuildWall( row, col );
      player.buildWall--;
      this.keys["e"] = false;
    }

    if( player.distanceLeft <= 0 ) return;
    let deltaPos = Math.min( player.distanceLeft, 0.125 );

    if( this.keys["ArrowUp"] ) {
      if( !this.checkMapCollision( player, 0.125, 0 ) ) {
        player.moveForward( 0.125 );
        this.setPlayerMoved();
      }
    }
    if( this.keys["ArrowDown"] ) {
      if( !this.checkMapCollision( player, -0.125, 0) ) {
        player.moveBackward( 0.125 );
        this.setPlayerMoved();
      }
    }

    if( this.getPlayerMoved() ) {
      let powerupIndex = this.checkPowerupCollision( player );
      if( powerupIndex > -1 ) {
        let powerup = this.powerups.splice( powerupIndex, 1 )[0];
        player.addPowerup( powerup );
      }
    }
    player.distanceLeft = Math.max( 0, player.distanceLeft );
  }

/**
*   UPDATE METHODS:
*     Here are the methods that handle various game state updates
*
*/
  /**
   * Updates map object with 2D number array sent from server.
   * @param map 2D number array containing new map data.
   */
  updateMap = ( map : number[][] ) : void => {
    if( this.map.set ) {
      this.map.update( map );
    } else {
      this.map.setTiles( map );
      this.background.drawItem( this.map );
      this.startGame();
    }
  }

  /**
   * Updates tank entity health value on server update.
   * @param userID unique identifier for entity to update.
   * @param health health value to assign to player.
   */
  updateTankHealth = ( userID : string, health : number ) : void => {
    this.getPlayer( userID ).setHealth( health );
  }

  /**
   * Update's tank entity's powerup information based on server update.
   * @param userID unique identifier for tank to update.
   * @param powerups list of powerup names to add to tank.
   */
  updateTankPowerups = ( userID : string, powerups : string[] ) : void => {
    let player = this.getPlayer( userID );
    player.clearPowerups();
    powerups.forEach( ( powerup ) => {
      switch( powerup ) {
        case "buildWall":
          player.addPowerup( new BuildWallToken( 0, 0 ) );
          break;
        case "multiShot":
          player.addPowerup( new MultiShotToken( 0, 0 ) );
          break;
        default:
          break;
      }
    } );
  }

  /**
   * Update tank distance left.
   * @param userID unique identifier for entity to update.
   * @param distanceLeft new distance left amount.
   */
  updateTankDistanceLeft = ( userID : string, distanceLeft : number ) : void => {
    this.getPlayer( userID ).distanceLeft = distanceLeft;
  }

  /**
   * Update tank entity's position information on server update. Makes calls to
   * tank methods that also update animated effects on sprite.
   * @param userID unique identifier for tank entity.
   * @param newXPos new horizontal position for tank, in tile units.
   * @param newYPos new vertical position for tank, in tile units.
   * @param newDirection new rotation from vertical for tank, in degrees.
   */
  updateTankPosition = ( userID : string, newXPos : number, newYPos: number, newDirection : number ) : void => {
    let tank = this.getPlayer( userID );
    let deltaDir = ( ( newDirection * 180.0 / Math.PI ) - tank.dir ) % 360.0;
    if( deltaDir > 0 ) {
      tank.rotateCW( deltaDir );
    } else if( deltaDir < 0 ) {
      tank.rotateCCW( -deltaDir );
    }

    let deltaXPos = tank.xPos - newXPos;
    let deltaYPos = tank.yPos - newYPos;
    let dirRads = newDirection;
    let deltaLocalX = deltaXPos * Math.sin( -dirRads ) - deltaYPos * Math.cos( -dirRads );
    let deltaLocalY = deltaXPos * Math.sin( -dirRads ) + deltaYPos * Math.cos( -dirRads );
    if( deltaLocalY > 0 ) {
      tank.moveForward( deltaLocalY );
    } else if( deltaLocalY < 0 ) {
      tank.moveBackward( -deltaLocalY );
    }
  }

  /**
   * Updates this.curTurn and associated displays on turn change from server update.
   * @param userID unique identifier for player whose turn it now is.
   */
  updateTurn = ( userID : string ) => {
    let prevPlayer = this.getPlayer( this.curTurn );
    if( prevPlayer != undefined ) { prevPlayer.setTurn( false ); }
    this.getPlayer( userID ).setTurn( true );
    this.curTurn = userID;
  }

  /**
   * Called from main.js when server sends powerup list update. Updates powerup
   * tokens on the map, stored in this.powerups, and attaches them to the entities layer.
   * @param updates List of structured powerup update data.
   */
  updatePowerups = ( updates : PowerupUpdate[] ) : void => {
    this.powerups = updates.map( ( powerupData : PowerupUpdate ) : Powerup => {
      switch( powerupData.type ) {
        case "multiShot":
          return new MultiShotToken( powerupData.col, powerupData.row );
          break;
        case "buildWall":
          return new BuildWallToken( powerupData.col, powerupData.row);
          break;
        case "increaseMoveDist":
          return new IncreaseMoveDistToken( powerupData.col, powerupData.row );
          break;
        case "healthPack":
          return new HealthPackToken( powerupData.col, powerupData.row );
          break;
        default:
          break;
      }
    } );
    this.powerups.forEach( ( powerup : Powerup ) : void => {
      powerup.attachToLayer( this.entities );
    } );
  }

  /**
   * Updates Map object with new WallTile. Called from main when server sends
   * build wall update. Removes 1 buildWall powerup from player entity.
   * @param row Tile row to place new wall tile.
   * @param col Tile column to place new wall tile.
   */
  placeWall = ( row : number, col : number ) : void => {
    let player = this.getPlayer( this.curTurn );
    player.buildWall = Math.max( 0, player.buildWall - 1 );
    this.map.setTile( 1, row, col );
    this.map.redraw( row, col );
    this.background.drawItem( this.map );
  }

  /**
   * Create new bullet object on update from server.
   * @param shooterID unique identifier for the player who fired the bullet.
   * @param power power value for curved bullets.
   * @param curve curve value for curved bullets.
   * @param dist distance for bullet to travel.
   * @param bulletHit bullet target data for collision update.
   * @param dirOffset offset from shooter direction; used for multishot firing.
   */
  fire = ( shooterID : string, power : number, curve : number, dist : number, bulletHit : BulletHit, dirOffset : number ) => {
    let shooter = this.getPlayer( shooterID );
    if( shooter.canShoot ) {
      let bullet = new Bullet( shooter.userID, shooter.xPos, shooter.yPos, shooter.dir + dirOffset, dist, power, curve );
      bullet.setTarget( bulletHit );
      bullet.attachToLayer( this.entities );
      this.bullets.push( bullet );
    }
  }

  /**
   * End game and display alert message to declare the winner of the game match.
   * @param winnerUserID unique identifier for the player that has won.
   */
  endGame = ( winnerUserID : string ) : void => {
    window.clearInterval( this.gameTickUpdateInt );
    window.clearInterval( this.sendServerUpdateInt );
    this.won = true;
    alert( "Game over. Winner is: " + this.getPlayer( winnerUserID ).playerName );
    delete localStorage.userID;
    delete localStorage.lobbyCode;
  }

  /**
   * On server message update, add HTML elements necessary to display message in game chat.
   * @param userID unique identifier for the sender.
   * @param text text content of message.
   */
  showMsg = ( userID : string, text : string ) => {
    let messageWindow = document.getElementById( "messageWindow" );
    let msg = document.createElement( "div" );
    let username = this.getPlayer( userID ).playerName;

    if( userID == localStorage.userID ) { msg.classList.add("self"); }
    msg.classList.add( "message" );

    let sender = document.createElement( "div" );
    sender.classList.add( "sender" );
    sender.innerHTML = username;

    let content = document.createElement( "div" );
    content.classList.add( "content" );
    content.innerHTML = text;
    msg.appendChild( content );
    msg.appendChild( sender );

    let updateScroll = ( messageWindow.scrollHeight - messageWindow.offsetHeight ) == messageWindow.scrollTop;
    messageWindow.insertAdjacentElement( "beforeend", msg );
    if( updateScroll ) msg.scrollIntoView( false );
  }

/**
*   RENDERING METHODS:
*     Here are the methods that handle various rendering functions.
*
*/
  /**
   * Applies background layer to gameview layer.
   */
  renderMap = () : void => {
    this.gameview.addLayer( this.background );
  }

  /**
   * Rerenders minimap.
   */
  renderMinimap = () : void => {
    this.minimap.applyScale( this.miniDim / this.tileDim, this.miniDim / this.tileDim);
    this.minimap.addLayer( this.background );
    this.minimap.popTransform();
  }

  /**
   * Calls rendering methods for each kind of entity, and adds entities layer to gameview.
   */
  renderEntities = () : void => {
    this.entities.clear();
    this.renderBullets();
    this.renderPowerups();
    this.renderTanks();
    this.gameview.addLayer( this.entities );
  }

  /**
   * Using Array built-in forEach method, call this.renderTank for each tank in this.tanks.
   */
  renderTanks = () : void => {
    this.tanks.forEach( ( tank ) => {
      if( tank.health <= 0 ) { return; }
      this.renderTank( tank );
    });
  }

  /**
   * Render given tank to gameview. Updates blip circle on minimap. Also renders
   * shadowblock if this given tank has a buildWall powerup.
   * @param tank Tank to update and render.
   */
  renderTank = ( tank : Tank ) : void => {
    tank.updateImage();
    if( tank.buildWall != 0 ) {
      let dirRad = tank.dir * Math.PI / 180.0;
      let [ xPos, yPos ] = [ tank.xPos, tank.yPos ];
      xPos += 1.5 * Math.sin( dirRad );
      yPos -= 1.5 * Math.cos( dirRad );
      let [ col, row ] = [ xPos + 0.5, yPos + 0.5 ].map( Math.floor );
      this.entities.applyTranslate( this.tileDim * col, this.tileDim * row );
      this.entities.drawItem( new ShadowBlock() );
      this.entities.popTransform();
    }
    this.entities.applyTranslate( this.tileDim * tank.xPos, this.tileDim * tank.yPos );
    this.entities.addLayer( tank.getLayer(), -10, -10 );
    this.entities.applyTranslate( this.tileDim / 2, this.tileDim );
    this.entities.drawItem( tank.nameTag );
    this.entities.popTransform();
    this.entities.popTransform();
    // To-do: add nametag w/ health bar
    let [ xOffset, yOffset ] = [ tank.xPos, tank.yPos ].map( ( val ) => {
      return this.miniDim * ( val + 0.5 );
    } );
    this.minimap.applyTranslate( xOffset, yOffset );
    this.minimap.drawItem( new Circle( 0, 0, this.miniDim / 2, tank.color ) );
    this.minimap.popTransform();
  }

  /**
   * Render all powerup tokens on map.
   */
  renderPowerups = () : void => {
    this.powerups.forEach( ( powerup : Powerup ) : void => {
      powerup.render();
    } );
  }

  /**
   * Renders bullet entities on map, and updates them accordingly.
   */
  renderBullets = () : void => {
    this.bullets = this.bullets.filter( ( bullet : Bullet ) => {
      bullet.render();
      if( !bullet.update() ) {
        if( bullet.target.type == "player" ) {
          this.updateTankHealth( bullet.target.userID, bullet.target.newHealth );
        } else if( bullet.target.type == "map" ) {
          let [ row, col ] = [ bullet.target.row, bullet.target.col ];
          this.map.setTile( 0, row, col );
          this.background.drawItem( this.map );
        }
        this.explosions.push( new ExplosionEffect( bullet.xPos, bullet.yPos, bullet.dir ) );
        return false;
      }
      return true;
    });
  }

  /**
   * Renders current effects on effects layer, and calls updates on animated effects.
   */
  renderEffects = () : void => {
    this.effects.clear();
    if( this.curTurn == localStorage.userID ) {
      let tank = this.getPlayer();
      this.effects.applyTranslate( ( tank.xPos + 0.5) * this.tileDim, ( tank.yPos + 0.5 ) * this.tileDim );
      this.effects.drawItem( new Circle( 0, 0, tank.distanceLeft * this.tileDim, "rgba( 238, 255, 0, 0.5 )", "#000000") );
      this.effects.popTransform();
    }
    this.explosions = this.explosions.filter( ( explosion : ExplosionEffect ) : boolean => {
      let [ xPos, yPos ] = [ explosion.xPos + 0.5, explosion.yPos + 0.5 ];
      this.effects.applyTranslate( xPos * this.tileDim,
                                   yPos * this.tileDim );
      this.effects.drawItem( explosion );
      this.effects.popTransform();
      explosion.update();
      return !explosion.done;
    } );
    this.gameview.addLayer( this.effects );
  }

  /**
   * Calls all rendering methods for various types of entities in proper order.
   */
  renderLoop = () : void => {
    let [ xOffset, yOffset ] = this.getPlayerPos().map( ( val : number ) => {
      return -( val + 0.5 ) * this.tileDim;
    } );
    this.renderMap();
    this.renderMinimap();
    this.renderEffects();
    this.renderEntities();
  }

  /**
   * Manage function calls for each game tick/update.
   */
  gameTick = () : void => {
    this.renderLoop();
    this.processInput();
  }

/**
*     GET AND SET METHODS:
*       Here are the methods that handle setting and getting game state variables.
*
*/
  /**
   * @returns this.movedSinceLastTransmit.
   */
  getPlayerMoved = () : boolean => { return this.movedSinceLastTransmit; }

  /**
   * Sets this.movedSinceLastTransmit.
   * @param val Value to set this.movedSinceLastTransmit, default true.
   */
  setPlayerMoved = ( val = true ) : void => { this.movedSinceLastTransmit = val; }

  /**
   * @returns this.playerShot.
   */
  getPlayerShot = () : boolean => { return this.playerShot; }

  /**
   * Sets this.playerShot.
   * @param val Value to set this.playerShot, default false.
   */
  setPlayerShot = ( val = false ) : void => { this.playerShot = val; }

  /**
   * Get specific tank entity from this.tanks.
   * @param id Unique identifier string for desired player, default null.
   * @returns if id is null, return this client's tank, else return tank with matching id if it exists, else return null.
   */
  getPlayer = ( id = null ) : Tank => {
    if( id === null ) { id = localStorage.userID; }
    let filteredSet = this.tanks.filter( ( tank ) => { return tank.userID == id; } );
    if( filteredSet == [] ) return null;
    else return filteredSet[0];
  }

  /**
   * @returns This client's player's x and y positions.
   */
  getPlayerPos = () : number[] => {
    let player = this.getPlayer();
    return [ player.xPos, player.yPos ];
  }

  /**
   * @returns This client's player's direction.
   */
  getPlayerDir = () : number => {
    return this.getPlayer().dir;
  }

  /**
   * Return the current this.buildWall object. Used by main.js to send server update.
   */
  getBuildWall = () : object => {
    return this.buildWall;
  }

  /**
   * Set this.buildWall in preparation for server update.
   * @param row tile row where wall should be built.
   * @param col tile column where wall should be built.
   */
  setBuildWall = ( row : number, col : number ) : void => {
    if( row === undefined && col === undefined ) {
      this.buildWall = null;
    } else {
      this.buildWall = { row : row, col : col };
    }
  }
}
