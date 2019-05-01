abstract class Effect {
  sprite : Sprite;
  xPos   : number;
  yPos   : number;
  dir    : number;
  done   : boolean;
  constructor( xPos : number, yPos : number, dir : number ) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir = dir;
  }
}

class ExplosionEffect extends Effect {
  sprite : ExplosionSprite;

  constructor( xPos : number, yPos : number, dir : number ) {
    super( xPos, yPos, dir );
    this.sprite = new ExplosionSprite();
    this.done = false;
  }

  update = () : boolean => {
    this.done = this.sprite.update();
    return this.done;
  }

  render = ( ctx : CanvasRenderingContext2D ) : void => {
    ctx.save();
    ctx.rotate( this.dir * Math.PI / 180.0 + Math.PI / 2 );
    this.sprite.render( ctx );
    ctx.restore();
  }
}
