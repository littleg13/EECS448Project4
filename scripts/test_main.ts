
/******************************************************************************/

var canvas;
var ctx;
var tank = new TankSprite( 50, 50, 0.0 );
var interval;
var degs : number;
var degDisplay;
var delta : number;
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
  if( ! ( canvas instanceof HTMLCanvasElement ) ) return;
  degDisplay = document.querySelector( "input#deg" );
  if( ! ( degDisplay instanceof HTMLInputElement ) ) return;
  ctx = getContext( canvas );
  degs = 0.0;
  delta = 0.5;
  window.addEventListener( "keydown", keyDownHandler );
  window.addEventListener( "keyup", keyUpHandler );
  interval = setInterval( loop, Math.floor( 1000 / 64 ) );
}

var loop = ():void => {
  processInput();
  render();
  degDisplay.value = degs;
}

var processInput = (): void => {
  if( keys[ "ArrowUp" ] ) {
    tank.moveForward();
  }
  if( keys[ "ArrowDown" ] ) {
    tank.moveBackward();
  }
  if( keys[ "ArrowLeft" ] ) {
    tank.rotateCCW();
  }
  if( keys[ "ArrowRight" ] ) {
    tank.rotateCW();
  }
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
  ctx.clearRect( 0, 0, 300, 300 );
  ctx.scale( 2, 2 );
  ctx.translate( tank.x, tank.y );
  ctx.rotate( tank.dir / 180.0 * Math.PI );
  tank.render( ctx );
  ctx.restore();
}
