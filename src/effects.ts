/**
 * Abstract class of Effects. Used as a template that can be extended for multiple
 * animated sprites that aren't figured into gameplay collisions and are temporary.
 */
abstract class Effect {
  /**
   * Sprite class to be used when rendering the effect.
   */
  sprite : Sprite;
  /**
   * Horizontal position for the effect.
   */
  xPos   : number;
  /**
   * Vertical position for the effect.
   */
  yPos   : number;
  /**
   * Rotation from vertical, stored in degrees.
   */
  dir    : number;
  /**
   * Whether or not effect is set to be deleted.
   */
  done   : boolean;
  /**
   * @param xPos Horizontal position for the effect.
   * @param yPos Vertical position for the effect.
   * @param dir Rotation from vertical, stored in degrees.
   */
  constructor( xPos : number, yPos : number, dir : number ) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir = dir;
  }
}

class ExplosionEffect extends Effect {
  /**
   * Redeclared property to specify which specific sprite to use in this effect class.
   */
  sprite : ExplosionSprite;

  /**
   * @param xPos Horizontal position for the effect.
   * @param yPos Vertical position for the effect.
   * @param dir Rotation from vertical, stored in degrees.
   */
  constructor( xPos : number, yPos : number, dir : number ) {
    super( xPos, yPos, dir );
    this.sprite = new ExplosionSprite();
    this.done = false;
  }

  /**
   * Called alongside the render method. This updates the sprite to the next frame.
   * The sprite's update method's return value is stored in the done attribute to
   * determine if the effect should be removed from the rendering context.
   * @returns Whether or not the effect animation is complete
   */
  update = () : boolean => {
    this.done = this.sprite.update();
    return this.done;
  }

  /**
   * Draw the explosion's sprite to the given canvas context.
   * @param ctx canvas rendering context to draw to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.save();
    ctx.rotate( this.dir * Math.PI / 180.0 + Math.PI / 2 );
    this.sprite.render( ctx );
    ctx.restore();
  }
}
