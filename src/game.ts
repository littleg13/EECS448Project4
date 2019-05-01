// Declared handlers, defined in main.
var sendServerUpdate = () : void => {}

class PowerupUpdate {
  row : number;
  col : number;
  type : string;
}

class BulletHit {
  userID : string;
  type : string;
  row  : number;
  col  : number;
}

class Game {
  background  : Layer;
  gameview    : Layer;
  entities    : Layer;
  effects     : Layer;
  minimap     : Layer;
  map         : Map;
  mapDim      : number;
  scale       : number;
  tanks       : Tank[];
  bullets     : Bullet[];
  powerups    : Powerup[];
  explosions : Effect[];
  distLeftThisTurn : number;
  curTurn     : string;
  curBoxDim   : number;
  tileDim     : number;
  miniDim     : number;
  keys        : string[];
  keyTimes;
  movedSinceLastTransmit : boolean;
  playerShot             : boolean;
  begun                  : boolean;
  won                    : boolean;
  buildWall              : object;
  gameTickUpdateInt      : number;
  sendServerUpdateInt    : number;

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
    this.buildWall = null;
    this.begun = false;
    this.won = false;
    this.initLayers();
  }

/**
*   INITIAL METHODS:
*     Here are the methods that handle setting up various game components
*
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

  startGame = () : void => {
    this.gameTickUpdateInt = setInterval( () => { this.gameTick(); } , Math.round( 1000 / 32 ) );
    this.sendServerUpdateInt = setInterval( () => { sendServerUpdate(); }, 40 );
    this.populateSidebar();
  }

  addTank = ( userID    : string, username      : string,
              xPos      : number, yPos          : number,
              direction : number, distanceLeft  : number,
              color     : string, health        : number ) : void => {
    this.tanks.push( new Tank( xPos, yPos, direction, username, userID, color, health ) );
  }

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

  checkPowerupCollision = ( obj : Entity ) : number => {
    let [ col, row ] = [ obj.xPos + 0.5, obj.yPos + 0.5 ].map( Math.floor );
    let retIndex = this.powerups.map( ( powerup : Powerup ) : boolean => {
      if( powerup.xPos == col && powerup.yPos == row ) return true;
      else return false;
    } ).indexOf( true );
    return retIndex;
  }

  checkBulletCollision = ( bullet : Bullet ) : boolean => {
    let speed = bullet.speed;
    let [ bullX, bullY ] = [ bullet.xPos + 0.5, bullet.yPos + 0.5 ];
    bullX += speed * Math.sin( bullet.dir * Math.PI / 180.0 );
    bullY -= speed * Math.cos( bullet.dir * Math.PI / 180.0 );
    if( this.checkBulletTrajectory( bullX, bullY, bullet.shooterID ) )
      return true;
    else return false;
  }

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
  updateMap = ( map : number[][] ) : void => {
    if( this.map.set ) {
      this.map.update( map );
    } else {
      this.map.setTiles( map );
      this.background.drawItem( this.map );
      this.startGame();
    }
  }

  updateTankHealth = ( userID : string, health : number ) : void => {
    this.getPlayer( userID ).setHealth( health );
  }

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

  updateTankDistanceLeft = ( userID : string, distanceLeft : number ) : void => {
    this.getPlayer( userID ).distanceLeft = distanceLeft;
  }

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

  updateTurn = ( userID : string ) => {
    let prevPlayer = this.getPlayer( this.curTurn );
    if( prevPlayer != undefined ) { prevPlayer.setTurn( false ); }
    this.getPlayer( userID ).setTurn( true );
    this.curTurn = userID;
  }

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

  placeWall = ( row : number, col : number ) : void => {
    this.map.setTile( 1, row, col );
    this.map.redraw( row, col );
    this.background.drawItem( this.map );
  }

  fire = ( shooterID : string, power : number, curve : number, dist : number, bulletHit : BulletHit, dirOffset : number ) => {
    let shooter = this.getPlayer( shooterID );
    if( shooter.canShoot ) {
      let bullet = new Bullet( shooter.userID, shooter.xPos, shooter.yPos, shooter.dir + dirOffset, dist, power, curve );
      bullet.setTarget( bulletHit );
      bullet.attachToLayer( this.entities );
      this.bullets.push( bullet );
    }
  }

  endGame = ( winnerUserID : string ) : void => {
    window.clearInterval( this.gameTickUpdateInt );
    window.clearInterval( this.sendServerUpdateInt );
    this.won = true;
    alert( "Game over. Winner is: " + this.getPlayer( winnerUserID ).playerName );
    delete localStorage.userID;
    delete localStorage.lobbyCode;
  }

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
  renderMap = () : void => {
    this.gameview.addLayer( this.background );
  }

  renderMinimap = () : void => {
    this.minimap.applyScale( this.miniDim / this.tileDim, this.miniDim / this.tileDim);
    this.minimap.addLayer( this.background );
    this.minimap.popTransform();
  }

  renderEntities = () : void => {
    this.entities.clear();
    this.renderBullets();
    this.renderPowerups();
    this.renderTanks();
    this.gameview.addLayer( this.entities );
  }

  renderTanks = () : void => {
    this.tanks.forEach( ( tank ) => {
      if( tank.health <= 0 ) { return; }
      this.renderTank( tank );
    });
  }

  renderTank = ( tank ) : void => {
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

  renderPowerups = () : void => {
    this.powerups.forEach( ( powerup : Powerup ) : void => {
      powerup.render();
    } );
  }

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

  renderLoop = () : void => {
    let [ xOffset, yOffset ] = this.getPlayerPos().map( ( val : number ) => {
      return -( val + 0.5 ) * this.tileDim;
    } );
    this.renderMap();
    this.renderMinimap();
    this.renderEffects();
    this.renderEntities();
  }

  gameTick = () : void => {
    this.renderLoop();
    this.processInput();
  }

/**
*     GET AND SET METHODS:
*       Here are the methods that handle setting and getting game state variables.
*
*/
  getPlayerMoved = () : boolean => { return this.movedSinceLastTransmit; }

  setPlayerMoved = ( val = true ) : void => { this.movedSinceLastTransmit = val; }

  getPlayerShot = () : boolean => { return this.playerShot; }

  setPlayerShot = ( val = false ) : void => { this.playerShot = val; }

  getPlayer = ( id = null ) : Tank => {
    if( id === null ) { id = localStorage.userID; }
    let filteredSet = this.tanks.filter( ( tank ) => { return tank.userID == id; } );
    if( filteredSet == [] ) return null;
    else return filteredSet[0];
  }

  getPlayerPos = () : number[] => {
    let player = this.getPlayer();
    return [ player.xPos, player.yPos ];
  }

  getPlayerDir = () : number => {
    return this.getPlayer().dir;
  }

  getPlayerPowerups = () : void => {}

  getBuildWall = () : object => {
    return this.buildWall;
  }

  setBuildWall = ( row : number, col : number ) : void => {
    if( row === undefined && col === undefined ) {
      this.buildWall = null;
    } else {
      this.buildWall = { row : row, col : col };
    }
  }
}
