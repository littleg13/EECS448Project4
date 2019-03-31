var canvas, ctx;
var interval;
var width, height;
var delta = width / 20;
var map;
var player;
var tanks = [];
var bullets = [];
var keys = [];      // Active keys; ture on keyDown, false on keyUp;

var handleKeyDown = function (evt) {
  keys[ evt.key ] = true;
}

var handleKeyUp = function (evt) {
  keys[ evt.key ] = false;
}

var init = function() {
  canvas = document.getElementById('canvas');
  width = canvas.width;
  height = canvas.height;
  ctx = canvas.getContext('2d');
  delta = height / 20;
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp, true);
  map = [
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]
  ];
  tanks = [{ xPos: 10, yPos: 10, dir: 0, registerHit: function() {console.log("Hit recorded");}}];
  player = { xPos: 5, yPos: 5, dir: 90 * Math.PI / 180, cooldown: 0};
  interval = setInterval(loop, Math.floor(1000/32));
}

var renderCheckerboard = function() {
  for(let row = 0; row < height/20; row++) {
    for(let col = 0; col < width/20; col++) {
      if( (row + col) % 2 == 0 ) {
        ctx.fillStyle = "black";
      } else {
        ctx.fillStyle = "white";
      }
      ctx.fillRect(col * delta, row * delta, delta, delta);
    }
  }
}

var renderMap = function() {
  for( let row = 0; row < map.length; row++ ) {
    for( let col = 0; col < map[row].length; col++ ) {
      ctx.fillStyle = "black";
      ctx.fillRect( col * delta, row * delta, delta, delta );
      if( !map[row][col] ) {
        ctx.fillStyle = "white";
        ctx.fillRect( col * delta + 1, row * delta + 1, delta - 2, delta - 2 );
      }
    }
  }
}

var fire = function() {
  if( player.cooldown != 0 ) return;
  var proj = { xPos: player.xPos, yPos: player.yPos, dir: player.dir };
  player.cooldown = 50;
  bullets.push(proj);
}

var renderPlayer = function() {
  ctx.save();
  ctx.fillStyle = "red";
  ctx.fillRect( Math.floor(player.xPos) * delta, Math.floor(player.yPos) * delta, 30, 30 );
  ctx.translate( delta * (player.xPos + 0.5), delta * (player.yPos + 0.5) );
  ctx.rotate( player.dir );
  ctx.fillStyle = 'grey';
  ctx.fillRect( -15, -15, 10, 30 );
  ctx.fillRect( 5, -15, 10, 30 );
  ctx.fillStyle = 'red';
  ctx.fillRect( -5, -15, 10, 30 );
  ctx.restore();
}

var renderTanks = function() {
  tanks.map( function(tank) {
    ctx.save();
    ctx.fillStyle = "green";
    ctx.fillRect( Math.floor(tank.xPos) * delta, Math.floor(tank.yPos) * delta, 30, 30 );
    ctx.translate( delta * (tank.xPos + 0.5), delta * (tank.yPos + 0.5) );
    ctx.rotate( tank.dir );
    ctx.fillStyle = 'grey';
    ctx.fillRect( -15, -15, 10, 30 );
    ctx.fillRect( 5, -15, 10, 30 );
    ctx.fillStyle = 'green';
    ctx.fillRect( -5, -15, 10, 30 );
    ctx.restore();
  } );
}

var isClearAhead = function() {
  let nextXPos = Math.floor( player.xPos + Math.sin( player.dir ) );
  let nextYPos = Math.floor( player.yPos - Math.cos( player.dir ) );
  return( map[nextYPos][nextXPos] == 0);
}

var isClearBehind = function() {
  let lastXPos = Math.floor( player.xPos - Math.sin( player.dir ) );
  let lastYPos = Math.floor( player.yPos + Math.cos( player.dir ) );
  return( map[lastYPos][lastXPos] == 0);
}

var acceptInput = function() {
  forward = isClearAhead();
  backward = isClearBehind();
  if( keys["ArrowLeft"] ) {
    player.dir -= 0.1;
  }
  if( keys["ArrowRight"] ) {
    player.dir += 0.1;
  }
  if( keys["ArrowUp"] && forward ) {
    player.xPos += Math.sin( player.dir ) * 0.1;
    player.yPos -= Math.cos( player.dir ) * 0.1;
  }
  if( keys["ArrowDown"] && backward ) {
    player.xPos -= Math.sin( player.dir ) * 0.1;
    player.yPos += Math.cos( player.dir ) * 0.1;
  }
  if( keys[" "] ) {
    fire();
  }
}

var checkCollision = function(bullet) {
  let [ col, row ] = [ bullet.xPos, bullet.yPos ].map( x => Math.floor(x) );
  if( col < 0 || col > width / delta || row < 0 || row > height / delta ) {
    bullets.pop(bullet);
    return;
  }
  if( map[row][col] != 0 ) {
    map[row][col]--;
    bullets.pop(bullet);
  }
  tanks.map( function(tank) {
    if( Math.floor(bullet.xPos) == Math.floor(tank.xPos) && Math.floor(bullet.yPos) == Math.floor(tank.yPos) ) {
      tank.registerHit();
      tanks.pop(tank);
      bullets.pop(bullet);
    }
  });
}

var loop = function() {
  renderMap();
  renderPlayer();
  renderTanks();
  acceptInput();
  player.cooldown -= ( player.cooldown == 0 ? 0 : 1 );
  for(let i = 0; i < bullets.length; i++) {
    let temp = bullets[i];
    temp.xPos += Math.sin( temp.dir ) * 0.5;
    temp.yPos -= Math.cos( temp.dir ) * 0.5;
    checkCollision( temp );
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.fillRect( Math.floor(temp.xPos) * delta, Math.floor(temp.yPos) * delta, 30, 30 );
    ctx.fillStyle = 'purple';
    ctx.translate( temp.xPos * delta, temp.yPos * delta );
    ctx.fillRect( 0, 0, 10, 10 );
    ctx.restore();
  }
}

init();
