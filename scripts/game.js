class Game {
  constructor(mapDim) {
    this.ctx;
    this.map = [];
    this.mapDim = mapDim;
    this.scale = 1.0;
    this.tanks = {};
    this.turn = '';
    this.distLeftThisTurn = 5;
    this.player;
    this.gridBoxDim;
    this.bullets = [];
    this.keys = [];
    this.movedSinceLastTransmit = false;
    this.playerShot = false;
    this.begun = false;
    this.init();
  }

  init() {
    this.initCanvas();
    this.initMap();
  }

  begin() {
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    gameTickUpdateInt = setInterval(mainLoop, Math.floor(1000/32));
    sendServerUpdateInt = setInterval(sendServerUpdate, 40);
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
    for( let i = 0 ; i < this.mapDim; i++ ){
      this.map[i] = [];
      for( let j = 0 ; j < this.mapDim; j++ ){
        let mapVal = 0;
        if( i == 0 || i == this.mapDim - 1 || j == 0 || j == this.mapDim - 1 ) {
          mapVal = -1;
        }
        this.map[i][j] = mapVal;
      }
    }
  }

  renderMap() {
    this.ctx.fillStyle = "rgb(127, 255, 195)";
    this.ctx.fillRect( 0, 0, this.gridBoxDim * this.mapDim, this.gridBoxDim * this.mapDim );
    for( let row = 0; row < this.map.length; row++ ) {
      for( let col = 0; col < this.map[row].length; col++ ) {
        this.ctx.save();
        this.ctx.translate( col * this.gridBoxDim, row * this.gridBoxDim, this.gridBoxDim, this.gridBoxDim );
        this.ctx.scale( this.scale, this.scale );
        if( this.map[row][col] == -1 ) {
          this.ctx.fillStyle = "#000000";
          this.ctx.fillRect( 0, 0, 40, 40 );
          this.ctx.fillStyle = "#C0C0C0";
          this.ctx.fillRect(  1,  2, 18, 7 );
          this.ctx.fillRect( 21,  2, 18, 7 );
          this.ctx.fillStyle = "#A0A0A0";
          this.ctx.fillRect(  1, 11,  8, 7 );
          this.ctx.fillRect( 11, 11, 18, 7 );
          this.ctx.fillRect( 31, 11,  8, 7 );
          this.ctx.fillStyle = "#909090";
          this.ctx.fillRect(  1, 20, 18, 7 );
          this.ctx.fillRect( 21, 20, 18, 7 );
          this.ctx.fillStyle = "#606060";
          this.ctx.fillRect(  1, 29,  8, 7 );
          this.ctx.fillRect( 11, 29, 18, 7 );
          this.ctx.fillRect( 31, 29,  8, 7 );
        }
        this.ctx.restore();
      }
    }
  }

  updateMap(map) {
    this.map = map
  }

  addTank(userID, username, xPos, yPos, direction, distanceLeft, color) {
    this.tanks[userID] = new Tank(username ,xPos, yPos, direction, distanceLeft, color);
  }

  updateTankPosition(userID, newXPos, newYPos, newDirection) {
    this.tanks[userID].xPos = newXPos;
    this.tanks[userID].yPos = newYPos;
    this.tanks[userID].direction = newDirection;
  }

  updateTankhealth(userID, newHealth) {
    if( newHealth == 0 ) {
      this.killTank( userID );
    }
    this.tanks[userID].health = newHealth;
  }

  killTank( userID ) {
    delete this.tanks[userID];
  }

  renderTanks() {
    for( let key in this.tanks ) {
      let tank = this.tanks[key];
      this.renderTank( key, tank );
    }
  }

  renderTank(userID, tank) {
    this.ctx.save();
    this.ctx.fillStyle = tank.color;
    this.ctx.fillRect( Math.round(tank.xPos) * this.gridBoxDim + 1, Math.round(tank.yPos) * this.gridBoxDim + 1, this.gridBoxDim-2, this.gridBoxDim-2);
    this.ctx.translate( this.gridBoxDim * (tank.xPos + 0.5), this.gridBoxDim * (tank.yPos + 0.5) );
    this.ctx.scale( this.scale, this.scale );
    this.ctx.rotate( tank.direction );

    // Movement Radius
    if(userID == localStorage.userID && this.turn == userID && tank.distanceLeft > 0){
      this.ctx.beginPath();
      this.ctx.arc( 0, 0, ( tank.distanceLeft + 0.5 ) * this.gridBoxDim , 0, Math.PI * 2 );
      this.ctx.fillStyle = 'rgba( 238, 255, 0, 0.5 )';
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect( -17, -17, 34, 34 );
    this.ctx.fillRect( 5, -15, 10, 30 );
    this.ctx.fillStyle = 'grey';
    this.ctx.fillRect( -15, -15, 10, 30 );
    this.ctx.fillRect( 5, -15, 10, 30 );
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect( -7.5, -22, 15, 39 );
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
      this.ctx.fillRect( Math.round(bullet.xPos) * this.gridBoxDim, Math.round(bullet.yPos) * this.gridBoxDim, this.gridBoxDim, this.gridBoxDim );
      this.ctx.fillStyle = 'purple';
      this.ctx.translate( bullet.xPos * this.gridBoxDim, bullet.yPos * this.gridBoxDim );
      this.ctx.fillRect( 0, 0, 10, 10 );
      this.ctx.restore();
    }
  }

  fire(shooterID, power, curve) {
    let shooter = this.tanks[shooterID];
    if(shooter.canShoot){
      var proj = { xPos: shooter.xPos, yPos: shooter.yPos, direction: shooter.direction };
      this.bullets.push(proj);
      this.tanks[shooterID].canShoot = false;
    }
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
    let player = this.tanks[localStorage.userID];
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
    if( this.keys[" "] ) {
      if(this.turn == localStorage.userID && player.canShoot){
        this.playerShot = true;
        this.fire(localStorage.userID);
        player.canShoot = false;
      }
    }

    if( player.distanceLeft <= 0 ) return;                // Cancel if no more moving
    let deltaPos = Math.min( player.distanceLeft, 0.1 );  // Constrain movement w/in dist limit

    if( this.keys["ArrowUp"] ) {
      if(this.checkMapCollision(player, 0.1, 0) == true) {
        player.xPos += Math.sin( player.direction ) * deltaPos;
        player.yPos -= Math.cos( player.direction ) * deltaPos;
        player.distanceLeft -= deltaPos;
        this.movedSinceLastTransmit = true;
      }
    }
    if( this.keys["ArrowDown"] ) {
      if(this.checkMapCollision(player, -0.1, 0) == true) {
        player.xPos -= Math.sin( player.direction ) * deltaPos;
        player.yPos += Math.cos( player.direction ) * deltaPos;
        player.distanceLeft -= deltaPos;
        this.movedSinceLastTransmit = true;
      }
    }
    player.distanceLeft = Math.max( 0.0, player.distanceLeft );
  }

  gameTick() {
    this.renderMap();
    this.renderTanks();
    this.processInput();
    this.renderBullets();
  }

  advanceTurn(userID) {
    this.turn = userID;
    this.tanks[userID].canShoot = true;
    this.tanks[userID].distanceLeft = 5;
  }

  playerMoved() {
    return this.movedSinceLastTransmit;
  }

  getPlayerShot() {
    return this.playerShot;
  }

  resetPlayerShot() {
    this.playerShot = false;
  }

  getPlayerPos() {
    return [this.tanks[localStorage.userID].xPos, this.tanks[localStorage.userID].yPos];
  }

  getPlayerDir() {
    return (this.tanks[localStorage.userID].direction) % (Math.PI * 2);
  }

  resetLastMoved() {
    this.movedSinceLastTransmit = false;
  }
};
