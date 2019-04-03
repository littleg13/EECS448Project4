
class Game {
  constructor(mapDim) {
    this.ctx;
    this.map = [];
    this.mapDim = mapDim;
    this.tanks = {};
    this.turn = '';
    this.player;
    this.gridBoxDim;
    this.bullets = [];
    this.keys = [];
    this.movedSinceLastTransmit = false;
    this.init();
  }

  init() {
    this.initCanvas();
    this.initMap();
    this.addTank('localStorage.userID', 'buttplug', 5, 5, 90 * Math.PI / 180, 'green');
  }

  initCanvas() {
    this.canvas = document.getElementById('canvas');
    this.width = canvas.width;
    this.height = canvas.height;
    this.gridBoxDim = this.height / this.mapDim;
    console.log(this.mapDim);
    this.ctx = canvas.getContext('2d');
  }

  initMap() {
    for(let i=0;i<this.mapDim;i++){
      this.map[i] = [];
      for(let j=0;j<this.mapDim;j++){
        let mapVal = 0;
        if(i == 0 || i == this.mapDim-1 || j == 0 || j == this.mapDim-1){
          mapVal = -1;
        }
        this.map[i][j] = mapVal;
      }
    }
  }

  renderMap() {
    for( let row = 0; row < this.map.length; row++ ) {
      for( let col = 0; col < this.map[row].length; col++ ) {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect( col * this.gridBoxDim, row * this.gridBoxDim, this.gridBoxDim, this.gridBoxDim );
        if( !this.map[row][col] ) {
          this.ctx.fillStyle = "white";
          this.ctx.fillRect( col * this.gridBoxDim + 1, row * this.gridBoxDim + 1, this.gridBoxDim - 2, this.gridBoxDim - 2 );
        }
      }
    }
  }

  addTank(userID, username, xPos, yPos, direction, color) {
    this.tanks[userID] = new Tank(username ,xPos, yPos, direction, color);
  }

  updateTankPosition(userID, newXPos, newYPos, newDirection) {
    this.tanks[userID].xPos = newXPos;
    this.tanks[userID].yPos = newyPos;
    this.tanks[userID].direction = newDirection;
  }


  renderTanks() {
    for(let key in this.tanks) {
      let tank = this.tanks[key];
      this.renderTank(tank);
    }
  }

  renderTank(tank) {
    this.ctx.save();
    this.ctx.fillStyle = tank.color;
    this.ctx.fillRect( Math.round(tank.xPos) * this.gridBoxDim, Math.round(tank.yPos) * this.gridBoxDim, 30, 30 );
    this.ctx.translate( this.gridBoxDim * (tank.xPos + 0.5), this.gridBoxDim * (tank.yPos + 0.5) );
    this.ctx.rotate( tank.direction );
    this.ctx.fillStyle = 'grey';
    this.ctx.fillRect( -15, -15, 10, 30 );
    this.ctx.fillRect( 5, -15, 10, 30 );
    this.ctx.fillStyle = tank.color;
    this.ctx.fillRect( -5.5, -20, 11, 35 );
    this.ctx.restore();
  }

  renderBullets() {
    for(let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      bullet.xPos += Math.sin( bullet.direction ) * 0.5;
      bullet.yPos -= Math.cos( bullet.direction ) * 0.5;
      //checkCollision( bullet );
      this.ctx.save();
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect( Math.round(bullet.xPos) * this.gridBoxDim, Math.round(bullet.yPos) * this.gridBoxDim, 30, 30 );
      this.ctx.fillStyle = 'purple';
      this.ctx.translate( bullet.xPos * this.gridBoxDim, bullet.yPos * this.gridBoxDim );
      this.ctx.fillRect( 0, 0, 10, 10 );
      this.ctx.restore();
    }
  }

  fire(shooterID, power, curve) {
    let shooter = this.tanks[shooterID];
    var proj = { xPos: shooter.xPos, yPos: shooter.yPos, direction: shooter.direction };
    this.bullets.push(proj);
  }

  checkMapCollision(obj, linearVelocity, rotationalVelocity) {
    let increment = -linearVelocity;
    let map = this.map;
    // Straight distance between center of "Tank" corner of "Tank"
    let dimension = obj.size/(2*this.gridBoxDim);
    let toReturn = true;
    let canvas = this.ctx;
    let corners = [[dimension, dimension+increment],
      [dimension, -dimension+increment],
      [-dimension, dimension+increment],
      [-dimension, -dimension+increment]];
    corners.forEach(function(corner) {
      let x = (corner[0])*Math.cos(obj.direction + rotationalVelocity) - (corner[1])*Math.sin(obj.direction + rotationalVelocity);
      let y = (corner[0])*Math.sin(obj.direction + rotationalVelocity) + (corner[1])*Math.cos(obj.direction + rotationalVelocity);
      x += obj.xPos;
      y += obj.yPos;
      // canvas.fillStyle = 'red';
      // canvas.fillRect((x+0.45)*30, (y+0.45)*30, 3, 3);

      x = Math.round(x);
      y = Math.round(y);
      if(map[y][x] != 0){
        toReturn = corner;
        return;
      }
    });
    return(toReturn);
  }

  processInput() {
    let player = this.tanks['localStorage.userID'];
    if( this.keys["ArrowLeft"] ) {
      if(this.checkMapCollision(player, 0, -0.1) == true) {
        player.direction -= 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowRight"] ) {
      if(this.checkMapCollision(player, 0, 0.1) == true) {
        player.direction += 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowUp"] ) {
      if(this.checkMapCollision(player, .1, 0) == true) {
        player.xPos += Math.sin( player.direction ) * 0.1;
        player.yPos -= Math.cos( player.direction ) * 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowDown"] ) {
      if(this.checkMapCollision(player, -.1, 0) == true) {
        player.xPos -= Math.sin( player.direction ) * 0.1;
        player.yPos += Math.cos( player.direction ) * 0.1;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys[" "] ) {
      this.fire('localStorage.userID');
    }
    this.tanks['localStorage.userID'] = player;
  }

  gameTick() {
    this.renderMap();
    this.renderTanks();
    this.processInput();
    this.renderBullets();
  }

  playerMoved() {
    return this.movedSinceLastTransmit;
  }

  getPlayerPos() {
    return [this.tanks['localStorage.userID'].xPos, this.tanks['localStorage.userID'].yPos];
  }

  getPlayerDir() {
    return (this.tanks['localStorage.userID'].direction)%(Math.PI * 2);
  }

  resetLastMoved() {
    this.movedSinceLastTransmit = false;
  }
};
