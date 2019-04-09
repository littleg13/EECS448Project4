
class Tank {
  constructor(username, xPos, yPos, direction, distanceLeft, color) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.direction = direction;
    this.distanceLeft = distanceLeft;
    this.color = color;
    this.size = 30;
    this.username = username;
    this.canShoot = false;
    this.health = 100;
    this.alive = true;
  }

}
