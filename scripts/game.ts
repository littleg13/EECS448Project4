// Declared handlers, defined in main.
var handleKeyUp = ( evt : Event ) : void => {}
var handleKeyDown = ( evt : Event ) : void => {}
var sendServerUpdate = () : void => {}

class Game {
  background  : Layer;
  gameview    : Layer;
  map         : Map;
  mapDim      : number;
  scale       : number;
  tanks       : Tank[];
  distLeftThisTurn : number;
  curTurn     : string;
  curBoxDim   : number;
  tileDim     : number;
  bullets     : Bullet[];
  keys        : string[];
  keyTimes;
  movedSinceLastTransmit : boolean;
  playerShot             : boolean;
  begun                  : boolean;
  won                    : boolean;
  gameTickUpdateInt      : number;
  sendServerUpdateInt    : number;

  constructor( mapDim : number ) {
    this.map = new Map();
    this.mapDim = mapDim;
    this.scale = 1;
    this.tanks = [];
    this.curTurn = "";
    this.distLeftThisTurn = 5.0;
    this.curBoxDim = 40;
    this.tileDim   = 40;
    this.bullets   = [];
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
    this.gameview = new Layer( "gameview", 800, 800 );
    this.background = new Layer( "background", this.mapDim * this.tileDim, this.mapDim * this.tileDim );
    this.gameview.attachToParent( document.getElementById( "center" ) );
    this.background.attachToParent( document.getElementById( "hidden" ) );
  }

  startGame = () : void => {
    this.gameTickUpdateInt = setInterval( () => { this.gameTick(); } , Math.floor( 1000 / 32 ) );
    this.sendServerUpdateInt = setInterval( () => { sendServerUpdate(); }, 40 );
  }

  addTank = ( userID    : string, username      : string,
              xPos      : number, yPos          : number,
              direction : number, distanceLeft  : number,
              color     : string, health        : number ) : void => {
    this.tanks.push( new Tank( xPos, yPos, direction, username, userID, color, health ) );
  }

  populateSidebar = () : void => {
    let userInfoDiv = document.getElementById("userInfo");
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
  checkMapCollision = ( obj, linVel, rotVel ) : boolean => {
    return true;
/*    let toReturn = true;
    let map = this.map;
    let corners =
      [ [ -0.5, -0.5 - linVel ],
        [ -0.5,  0.5 - linVel ],
        [  0.5, -0.5 - linVel ],
        [  0.5,  0.5 - linVel ] ];
    corners.forEach( ( corner ) => {
      let theta = ( obj.dir + rotVel ) * Math.PI / 180.0;
      let x = corner[0] * Math.cos( theta )
            - corner[1] * Math.sin( theta )
            + obj.x + 0.5;
      let y = corner[0] * Math.sin( theta )
            + corner[1] * Math.cos( theta )
            + obj.y + 0.5;
      let col = Math.floor( x );
      let row = Math.floor( y );
      if( map.tiles[ row ][ col ].isBlocking ) {
        toReturn = false;
        return false;
      }
    });
    return toReturn;*/
  }

  processInput = () : void => {
    let player = this.getPlayer();
    if( this.curTurn != localStorage.userID ) return;
    if( this.keys["ArrowLeft"] || this.keys["a"] ) {
      if( this.checkMapCollision( player, 0, -1.0 ) ) {
        player.rotateCCW();
        this.setPlayerMoved();
      }
    }
    if( this.keys["ArrowRight"] || this.keys["d"] ) {
      if( this.checkMapCollision( player, 0, 1.0 ) ) {
        player.rotateCW();
        this.setPlayerMoved();
      }
    }
    if( this.keys[" "] ) {
      if( player.canShoot && !this.getPlayerShot() ) {
        this.setPlayerShot( true );
      }
      this.keys[ " " ] = false;
    }

    if( player.distanceLeft <= 0 ) return;
    let deltaPos = Math.min( player.distanceLeft, 0.125 );

    if( this.keys["ArrowUp"] || this.keys["w"] ) {
      if( this.checkMapCollision( player, 0.125, 0 ) ) {
        player.moveForward( 0.125 );
        this.setPlayerMoved();
      }
    }
    if( this.keys["ArrowDown"] || this.keys["s"] ) {
      if( this.checkMapCollision( player, -0.125, 0) ) {
        player.moveBackward( 0.125 );
        this.setPlayerMoved();
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
    this.map.update( map );
    this.background.drawItem( this.map );
  }

  updateTankHealth = ( userID : string, health : number ) : void => {
    this.getPlayer( userID ).setHealth( health );
  }

  updateTankPosition = ( userID : string, newXPos : number, newYPos: number, newDirection : number ) : void => {
    console.log( { xPos : newXPos, yPos : newYPos, dir : newDirection });
    let tank = this.getPlayer( userID );
    let deltaDir = newDirection - tank.dir;
    if( deltaDir < 0 ) {
      tank.rotateCCW( deltaDir );
    } else if( deltaDir > 0 ) {
      tank.rotateCW( deltaDir );
    }

    let deltaXPos = tank.xPos - newXPos;
    let deltaYPos = tank.yPos - newYPos;
    let dirRads = newDirection * Math.PI / 180.0;
    let deltaLocalY = deltaXPos * Math.sin( dirRads ) + deltaYPos * Math.cos( dirRads );
    if( deltaLocalY > 0 ) {
      tank.moveForward( deltaLocalY );
    } else if( deltaLocalY < 0 ) {
      tank.moveBackward( deltaLocalY );
    }
  }

  updateTurn = ( userID : string ) => {
    let player = this.getPlayer( userID );
    player.canShoot = true;
    player.distanceLeft = 5.0;
    this.curTurn = userID;
  }

  fire = ( shooterID : string, power : number, curve : number, dist : number ) => {
    let shooter = this.getPlayer( shooterID );
    if( shooter.canShoot ) {
      let bullet = new Bullet( shooter.xPos + 0.5, shooter.yPos + 0.5, shooter.dir, dist, power, curve );
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
    msg.classList.add( "message" );

    let sender = document.createElement( "div" );
    sender.classList.add( "sender" );
    sender.innerHTML = username + ": ";
    msg.appendChild( sender );

    let content = document.createElement( "div" );
    content.classList.add( "content" );
    content.innerHTML = text;
    msg.appendChild( content );

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

  renderTanks = () : void => {
    this.tanks.map( ( tank ) => {
      if( tank.health <= 0 ) { return; }
      this.renderTank( tank );
    });
  }

  renderTank = ( tank ) : void => {
    tank.updateImage();
    this.gameview.applyTranslate( this.tileDim * tank.xPos, this.tileDim * tank.yPos );
    if( tank.userID == this.curTurn ) {
      this.gameview.drawItem( new Circle( 20, 20, tank.distanceLeft * this.tileDim, "#eeff007f", "#000000ff") );
    }
    this.gameview.addLayer( tank.getLayer(), -10, -10 ); // Account for the padding on the sprite's canvas
    this.gameview.popTransform();
  }
/**
* To-do:
*   [ ] - Collision Check
*   [ ] - One collision, trigger animation
*   [ ] - Create animation
*/
  renderBullets = () : void => {
    this.bullets = this.bullets.filter( ( bullet : Bullet ) => {
      this.gameview.applyTranslate( bullet.xPos * this.tileDim, bullet.yPos * this.tileDim );
      this.gameview.applyRotation( bullet.dir );
      this.gameview.drawItem( bullet.sprite );
      this.gameview.popTransform();
      this.gameview.popTransform();
      // update bullet position
      bullet.update();
      return ( !bullet.boom );
    });
  }

  renderLoop = () : void => {
    this.gameview.applyScale( this.scale, this.scale );
    this.renderMap();
    this.renderBullets();
    this.renderTanks();
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
    let filteredSet = this.tanks.filter( ( tank ) => { return tank.userID = id; } );
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


}
