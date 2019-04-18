
/******************************************************************************/

var canvas;
var backgroundElem;
var ctx;
var bkg;
var width;
var height;
var tank = new TankSprite( 5, 5, 0.0 );
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

var getContext = ( canvas : HTMLCanvasElement ): CanvasRenderingContext2D | void => {
  let ctx = canvas.getContext( "2d" );
  if( ctx instanceof CanvasRenderingContext2D ) return ctx;
}

var main = (): void => {
  canvas = document.getElementById( "canvas" );
  backgroundElem = document.getElementById( "background" );
  if( ! ( canvas instanceof HTMLCanvasElement ) ) return;
  if( ! ( backgroundElem instanceof HTMLCanvasElement ) ) return;
  ctx = getContext( canvas );
  bkg = getContext( backgroundElem );
  map.render( bkg );
  width  = canvas.width;
  height = canvas.height;
  window.addEventListener( "keydown", keyDownHandler );
  window.addEventListener( "keyup", keyUpHandler );
  interval = setInterval( loop, Math.floor( 1000 / 64 ) );
}

var loop = ():void => {
  render();
  processInput();
}

var processInput = (): void => {
  if( ( keys[ "ArrowUp" ] || keys[ "w" ] ) && checkMapCollision( tank, 0.125, 0.0 ) ) {
    tank.moveForward( 0.125 );
  } else if( ( keys[ "ArrowDown" ] || keys[ "s" ] ) && checkMapCollision( tank, -0.125, 0.0 ) ) {
    tank.moveBackward( 0.125 );
  } else if( ( keys[ "ArrowLeft" ] || keys[ "a" ] ) && checkMapCollision( tank, 0.0, -1.25 ) ) {
    tank.rotateCCW( 1.25 );
  } else if( ( keys[ "ArrowRight" ] || keys[ "d" ] ) && checkMapCollision( tank, 0.0, 1.25 ) ) {
    tank.rotateCW( 1.25 );
  } else if( keys[ " " ] ) {
    console.log("fire");
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

var render = (): void => {
  ctx.save();
  ctx.clearRect( 0, 0, width, height );
  ctx.translate( width / 2, height / 2 );
  ctx.save();
  ctx.translate( -( tank.x * 40 + 20 ), -( tank.y * 40 + 20 ) );
  ctx.drawImage( backgroundElem, 0, 0 );
  ctx.restore();

  ctx.rotate( tank.dir / 180.0 * Math.PI );
  tank.render( ctx );

  ctx.restore();
}
