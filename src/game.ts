// Declared handlers, defined in main.
var sendServerUpdate = () : void => {}

class PowerupUpdate {
  row : number;
  col : number;
  type : string;
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
  distLeftThisTurn : number;
  curTurn     : string;
  curBoxDim   : number;
  tileDim     : number;
  miniDim     : number;
  bullets     : Bullet[];
  powerups    : Powerup[];
  keys        : string[];
  keyTimes;
  movedSinceLastTransmit : boolean;
  playerShot             : boolean;
  begun                  : boolean;
  won                    : boolean;
  gameTickUpdateInt      : number;
  sendServerUpdateInt    : number;

  constructor( mapDim : number ) {
    this.map = new Map( mapDim );
    this.mapDim = mapDim;
    this.scale = 1;
    this.tanks = [];
    this.curTurn = "";
    this.distLeftThisTurn = 5.0;
    this.curBoxDim = 40;
    this.tileDim   = 40;
    this.miniDim   = 10;
    this.bullets   = [];
    this.powerups  = [];
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
//        this.effects.push( new ExplosionSprite() );
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
    let [ bullX, bullY ] = [ bullet.xPos + 0.5, bullet.yPos + 0.5 ];
    return this.tanks.some( ( tank : Tank ) : boolean => {
      if( tank.userID == bullet.shooterID ) return false;
      let dirRad = tank.dir * Math.PI / 180.0;
      let [ xPos, yPos ] = [ tank.xPos + 0.5, tank.yPos + 0.5 ];
      let between = ( val, a, b ) => {
        let low = Math.min( a, b );
        let high = Math.max( a, b );
        return ( low < val && val < high );
      }
      let delX = +Math.cos( dirRad ) * 0.5;
      let delY = -Math.sin( dirRad ) * 0.5;
      return between( bullX, xPos - delX, xPos + delX ) &&
             between( bullY, yPos - delY, yPos + delY );
    } );
  }

  processInput = () : void => {
    let player = this.getPlayer();
    if( this.curTurn != localStorage.userID ) return;
    if( this.keys["ArrowLeft"] ) {
      if( !this.checkMapCollision( player, 0, -2.0 ) ) {
        player.rotateCCW( 2.0 );
        this.setPlayerMoved();
      }
    }
    if( this.keys["ArrowRight"] ) {
      if( !this.checkMapCollision( player, 0, 2.0 ) ) {
        player.rotateCW( 2.0 );
        this.setPlayerMoved();
      }
    }
    if( this.keys[" "] ) {
      if( player.canShoot && !this.getPlayerShot() ) {
        this.setPlayerShot( true );
      }
      this.keys[" "] = false;
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
        player.addPowerup( this.powerups.splice( powerupIndex, 1 )[0] );
      }
    }
    player.distanceLeft = Math.max( 0, player.distanceLeft );
  }

  recordKeyPress = ( key : string ) : void => {
    if( !this.keys[ " " ] ) {
      this.keyTimes[ key ] = new Date();
      this.keys[ " " ] = true;
    }
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
    }
  }

  updateTankHealth = ( userID : string, health : number ) : void => {
    this.getPlayer( userID ).setHealth( health );
  }

  updateTankPowerups = ( userID : string, powerups : string[] ) : void => {
    console.log( powerups );
//    this.getPlayer( userID ).addPowerups( objs );
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
    /*
    this.checkPowerupCollision( tank ).forEach( ( powerupIndex : number ) : void => {
      tank.addPowerups( this.powerups.splice( powerupIndex, 1 ) );
    } );
    */
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
      powerup.attachToLayer( this.effects );
    } );
  }

  fire = ( shooterID : string, power : number, curve : number, dist : number ) => {
    let shooter = this.getPlayer( shooterID );
    if( shooter.canShoot ) {
      let bullet = new Bullet( shooter.userID, shooter.xPos, shooter.yPos, shooter.dir, dist, power, curve );
      bullet.attachToLayer( this.effects );
      this.bullets.push( bullet );
      shooter.canShoot = false;
    }
  }

  endGame = ( winnerUserID : string ) : void => {
    this.won = true;
    alert( "Game over. Winner is: " + this.getPlayer( winnerUserID ).playerName );
    delete localStorage.userID;
    delete localStorage.lobbyCode;
  }

  showMsg = ( username : string, text : string ) => {
    let messageWindow = document.getElementById( "messageWindow" );
    let msg = document.createElement( "div" );
    if( username == this.getPlayer().playerName ) { msg.classList.add("self"); }
    msg.classList.add( "message" );

    let sender = document.createElement( "div" );
    sender.classList.add( "sender" );
    sender.innerHTML = username;

    let content = document.createElement( "div" );
    content.classList.add( "content" );
    content.innerHTML = text;
    msg.appendChild( content );
    msg.appendChild( sender );

    messageWindow.insertAdjacentElement( "beforeend", msg );
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

  renderTanks = () : void => {
    this.tanks.forEach( ( tank ) => {
      if( tank.health <= 0 ) { return; }
      this.renderTank( tank );
    });
  }

  renderTank = ( tank ) : void => {
    tank.updateImage();
    this.gameview.applyTranslate( this.tileDim * tank.xPos, this.tileDim * tank.yPos );
    this.gameview.addLayer( tank.getLayer(), -10, -10 );
    this.gameview.applyTranslate( this.tileDim / 2, this.tileDim );
    this.gameview.drawItem( tank.nameTag );
    this.gameview.popTransform();
    this.gameview.popTransform();
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

  renderEffects = () : void => {
    this.effects.clear();
    if( this.curTurn == localStorage.userID ) {
      let tank = this.getPlayer();
      this.effects.applyTranslate( ( tank.xPos + 0.5) * this.tileDim, ( tank.yPos + 0.5 ) * this.tileDim );
      this.effects.drawItem( new Circle( 0, 0, tank.distanceLeft * this.tileDim, "rgba( 238, 255, 0, 0.5 )", "#000000") );
      this.effects.popTransform();
    }
    this.renderBullets();
    this.renderPowerups();
    this.gameview.addLayer( this.effects );
  }

  renderBullets = () : void => {
    this.bullets = this.bullets.filter( ( bullet : Bullet ) => {
      bullet.render();
      if( !this.checkMapCollision( bullet, bullet.speed, 0.0 ) &&
          !this.checkBulletCollision( bullet ) ) {
        bullet.update();
        return true;
      } else {
        console.log( "Bullet collision detected" );
        return false;
      }
    });
  }

  renderLoop = () : void => {
    let [ xOffset, yOffset ] = this.getPlayerPos().map( ( val : number ) => {
      return -( val + 0.5 ) * this.tileDim;
    } );
    this.gameview.clear();
    this.gameview.applyScale( this.scale, this.scale );
    this.gameview.applyTranslate( xOffset, yOffset );
    this.gameview.center();
    this.renderMap();
    this.renderEffects();
    this.renderMinimap();
    this.renderTanks();
    this.gameview.popTransform();
    this.gameview.popTransform();
    this.gameview.popTransform();
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

  getPlayerPowerups = () : Buff[] => {
    return this.getPlayer().buffs;
  }
}
