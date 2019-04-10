/**
* @class Tank class holds the user's game related data.
* @param{string} username the username associated with the player
* @param{number} xPos the starting horizontal position, in tile widths.
* @param{number} yPos the starting vertical position, in tile widths.
* @param{number} direction the starting direction, in radians.
* @param{number} distanceLeft the amount of distance left to travel in a turn
* @param{string} color the color assigned to the tank
  */
class Tank {
  constructor(username, xPos, yPos, direction, distanceLeft, color, health) {
    /**
      * the starting horizontal position, in tile widths.
      * @type {number}
      */
    this.xPos = xPos;
    /**
      * the starting vertical position, in tile heights.
      * @type {number}
      */
    this.yPos = yPos;
    /**
      * the starting direction, in radians.
      * @type {number}
      */
    this.direction = direction;
    /**
      * the amount of distance left to travel in a turn
      * @type {number}
      */
    this.distanceLeft = distanceLeft;
    /**
      * the color assigned to the tank
      * @type {string}
      */
    this.color = color;
    /**
      * the username of the player
      * @type {string}
      */
    this.username = username;
    /**
      * a boolean which controls whether or not input is processed
      * @type {bool}
      */
    this.canShoot = false;
    /**
      * the health value of the player. constrained between 0 and 100
      * @type {number}
      */
    this.health = health;
    /**
      * a boolean which controls whether or not the user's tank is rendered
      * @type {bool}
      */
    this.alive = true;
  }
}
