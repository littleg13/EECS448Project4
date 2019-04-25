var gameview    : Layer;
var background  : Layer;
var tank = new Tank( 5, 5, 0, "Test", "asdf", "#c00", 100 );
var bullets = [];
var interval;
var map = new Map();
let tileGen : number[][];
tileGen = [];
for( let row = 0; row < 50; row++ ) {
  tileGen[ row ] = [];
  for( let col = 0; col < 50; col++ ) {
    tileGen[ row ][ col ] = 0;
    if( row == 0 || col == 0 || row == 49 || col == 49 )
      tileGen[ row ][ col ] = -1;
    if( ( ( row + col ) * ( row - col ) + 1 ) % 35 == 0 )
      tileGen[ row ][ col ] = -1;
  }
}
map.tiles = tileGen.map( ( row ) => {
     return row.map( ( val ) => {
       if( val === 0 ) return new FloorTile();
       else return new WallTile();
     });
   });
var keys = {
  "ArrowUp"     : false,
  "ArrowDown"   : false,
  "ArrowLeft"   : false,
  "ArrowRight"  : false
};

var main = (): void => {
  gameview    = new Layer( "game", 800, 800 );
  background  = new Layer( "background", map.tiles.length * 40, map.tiles.length * 40 );
  gameview.attachToParent( document.getElementById("visible") );
  background.attachToParent( document.getElementById("hidden") );
  background.drawItem( map );

  tank.addToSidebar( document.getElementById("sidebar") );

  window.addEventListener( "keydown", keyDownHandler );
  window.addEventListener( "keyup", keyUpHandler );
  interval = setInterval( loop, Math.floor( 1000 / 64 ) );
}

var loop = ():void => {
  render();
  processInput();
}

var processInput = (): void => {
  if( ( keys[ "ArrowUp" ] || keys[ "w" ] ) ) {
    tank.moveForward( 0.125 );
  } else if( ( keys[ "ArrowDown" ] || keys[ "s" ] ) ) {
    tank.moveBackward( 0.125 );
  }
  if( ( keys[ "ArrowLeft" ] || keys[ "a" ] ) ) {
    tank.rotateCCW( 1.25 );
  } else if( ( keys[ "ArrowRight" ] || keys[ "d" ] ) ) {
    tank.rotateCW( 1.25 );
  }
  if( keys[ " " ] && tank.canShoot ) {
  }
}

var checkMapCollision = ( obj, linVel, rotVel ) : boolean => {
  let toReturn = true;
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
  return toReturn;
}

var keyDownHandler = ( evt : KeyboardEvent ): void => {
  keys[ evt.key ] = true;
  return;
}

var keyUpHandler = ( evt : KeyboardEvent ): void => {
  keys[ evt.key ] = false;
  return;
}

var setFrameRate = ( frameRate : number ): void => {
  clearInterval( interval );
  interval = setInterval( loop, Math.round( 1000 / frameRate) );
  return;
}

var render = (): void => {
  gameview.clear();
  gameview.center();
  gameview.applyTranslate( -( tank.xPos * 40 + 20 ), -( tank.yPos * 40 + 20) );
  gameview.addLayer( background );
/*
  bullets.map( ( bullet ) => {
    bullet.update();
    ctx.save();
    ctx.translate( ( bullet.x * 40 ), ( bullet.y * 40 ) );
    ctx.rotate( bullet.dir * Math.PI / 180.0 );
    bullet.render( ctx );
    ctx.restore();
  });*/

  gameview.popTransform();
  tank.updateImage();
  gameview.addLayer( tank.getLayer() );
  gameview.popTransform();
}
