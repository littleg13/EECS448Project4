/**
 * Class that structures map tiles and provides a convenient interface to update current map.
 * Also provides rendering method to easily redraw map to background layer.
 */
class Map extends Renderable {
  /**
   * 2D array of MapTiles used to render map.
   */
  tiles : MapTile[][];
  /**
   * Tiles queued to be redrawn.
   */
  toRedraw : number[][];
  /**
   * Whether or not the map's initial state has been set by server update.
   */
  set : boolean
  /**
   * Number of rows in map.
   */
  rowCount : number
  /**
   * Number of cols in map.
   */
  colCount : number
  /**
   * @param mapDim Dimensions of map; same value is used for both row and column count.
   */
  constructor( mapDim : number ) {
    super();
    this.tiles = [];
    this.toRedraw = [];
    this.rowCount = mapDim;
    this.colCount = mapDim;
    this.set = false;
    for( let i = 0; i < mapDim; i++ ) {
      this.tiles[ i ] = [];
      this.toRedraw[ i ] = [];
      for( let j = 0; j < mapDim; j++ ) {
        this.tiles[ i ][ j ] = null;
        this.toRedraw[ i ][ j ] = null;
      }
    }
  }

  /**
   * Redraw a range of tiles from this.toRedraw to current tile list.
   * @param startRow which row to begin redraw at.
   * @param numRows number of rows to be redrawn.
   * @param startCol which column to begin redraw at.
   * @param numCosl number of columns to be redrawn.
   */
  redrawRange = ( startRow : number, numRows : number,
                  startCol : number, numCols : number ) : void => {
    for( let row = startRow; row < startRow + numRows; row++ ) {
      for( let col = startCol; col < startCol + numCols; col++ ) {
        this.redraw( row, col );
      }
    }
  }

  /**
   * Replaces the tile in this.tiles with tile type corresponding to value in
   * this.toRedraw at specified position.
   * @param row The row of the tile to be redrawn.
   * @param col The column of the tile to be redrawn.
   */
  redraw = ( row : number, col : number ) : void => {
    if( this.toRedraw[ row ][ col ] == null ) return;
    let val = this.toRedraw[ row ][ col ];
    if( val  < 0 ) this.tiles[ row ][ col ] = new OuterWallTile();
    if( val == 0 ) this.tiles[ row ][ col ] = new FloorTile();
    if( val >  0 ) this.tiles[ row ][ col ] = new WallTile( val );
    this.toRedraw[ row ][ col ] = null;
  }

  /**
   * Render the map tiles to a given canvas rendering context.
   * @param ctx The canvas rendering context to draw the map to.
   */
  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.save();
    this.tiles.forEach( ( row : MapTile[], yIndex ) => {
      ctx.save();
      row.forEach( ( tile : MapTile, xIndex ) => {
        tile.render( ctx );
        ctx.translate( 40, 0 );
      } );
      ctx.restore();
      ctx.translate( 0, 40 );
    } );
    ctx.restore();
  }

  /**
   * Called on server map update. Queues a redraw value if update is different than current value.
   * @param tiles a 2D array of numbers corresponding to tile types.
   */
  update = ( tiles: number[][] ) : void => {
    tiles.forEach( ( row, i ) => {
      row.forEach( ( val, j ) => {
        let compare = ( val < -1 && this.tiles[ i ][ j ] instanceof OuterWallTile ) ||
                      ( val == 0 && this.tiles[ i ][ j ] instanceof FloorTile ) ||
                      ( val  > 0 && this.tiles[ i ][ j ] instanceof WallTile);
        if( compare ) return;
        this.toRedraw[ i ][ j ] = val;
      } );
    } );
  }

  /**
   * Directly sets a tile in this.tiles to a new MapTile corresponding to a passed value.
   * @param val The value corresponding to a tile type.
   * @param row The row of the tile to be set.
   * @param col The column of the tile to be set.
   */
  setTile = ( val : number, row : number, col : number ) : void => {
    console.log( "setting tile" );
    if( val  < 0 ) { this.tiles[ row ][ col ] = new OuterWallTile(); }
    if( val == 0 ) { this.tiles[ row ][ col ] = new FloorTile(); }
    if( val >  0 ) { this.tiles[ row ][ col ] = new WallTile( val ); }
  }

  /**
   * Directly sets a batch of tiles from passed integer values corresponding to tile types.
   * @param tiles a 2D array of numbers that correspond to tile types.
   */
  setTiles = ( tiles : number[][] ) : void => {
    tiles.forEach( ( row, i ) => {
      row.forEach( ( val, j ) => {
          if( val  < 0 ) { this.tiles[ i ][ j ] = new OuterWallTile(); };
          if( val == 0 ) { this.tiles[ i ][ j ] = new FloorTile(); };
          if( val >  0 ) { this.tiles[ i ][ j ] = new WallTile( val ); };
        } );

    } );
    this.redrawRange( 0, this.rowCount, 0, this.colCount );
    this.set = true;
  }

  /**
   * @param row The row of the tile to be returned.
   * @param col The column of the tile to be returned.
   * @returns The MapTile object of the specified tile.
   */
  getTile = ( row : number, col : number ) : MapTile => {
    return this.tiles[ row ][ col ];
  }
}

/**
 * Class to be extended for different types of map tiles.
 */
class MapTile extends Renderable {
  /**
   * Whether or not the tile is to be considered in collision detection.
   */
  isBlocking : boolean;
  /**
   * A collection of renderables that are used to render the tile.
   */
  items : Collection;
  constructor() {
    super();
    this.isBlocking = false;
  }
}

class WallTile extends MapTile {
  /**
   * A counter object that tracks the number of hits on a WallTile before it is
   * replaced with a FloorTile.
   */
  health : Counter;
  /**
   * @param initHealth The initial value for this.health, default is 5.
   */
  constructor( initHealth : number = 5 ) {
    super();
    this.isBlocking = true;
    let items = [
      new RoundRect(  0,  0, 40, 40, 3, "#000000", "transparent" ),
      new RoundRect(  1,  2, 18,  7, 3, "#c0c0c0", "transparent" ),
      new RoundRect( 21,  2, 18,  7, 3, "#c0c0c0", "transparent" ),
      new RoundRect(  1, 11,  8,  7, 3, "#a0a0a0", "transparent" ),
      new RoundRect( 11, 11, 18,  7, 3, "#a0a0a0", "transparent" ),
      new RoundRect( 31, 11,  8,  7, 3, "#a0a0a0", "transparent" ),
      new RoundRect(  1, 20, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect( 21, 20, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect(  1, 29,  8,  7, 3, "#606060", "transparent" ),
      new RoundRect( 11, 29, 18,  7, 3, "#606060", "transparent" ),
      new RoundRect( 31, 29,  8,  7, 3, "#606060", "transparent" )
    ];
    this.items = new Collection( items );
    this.health = new Counter( initHealth );
  }

  /**
   * Updates health counter by a given amount of damage.
   * @param damage The amount of damage to decrease health by.
   */
  onHit = ( damage : number ) : void => {
    this.health.dec( damage );
    this.update();
  }

  /**
   * Called from this.onHit. Updates renderables to reflect current health.
   */
  update = () : void => {
    let val = this.health.get();
    this.items.mapItems( ( item : Renderable ) => {
      if( item instanceof RoundRect ) {
        item.rad = val;
      }
      return item;
    } );
  }

  /**
   * Renders WallTile items to given canvas rendering context.
   * @param ctx Canvas rendering context to render to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.items.render( ctx );
  }
}

/**
 * Distinct wall tile for the outer walls. It does not have health as they are
 * indestructible. Slightly different coloration to keep them distinct from
 * ordinary wall tiles.
 */
class OuterWallTile extends MapTile {
  constructor( ) {
    super();
    this.isBlocking = true;
    let items = [
      new RoundRect(  0,  0, 40, 40, 3, "#000000", "transparent" ),
      new RoundRect(  1,  2, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect( 21,  2, 18,  7, 3, "#909090", "transparent" ),
      new RoundRect(  1, 11,  8,  7, 3, "#606060", "transparent" ),
      new RoundRect( 11, 11, 18,  7, 3, "#606060", "transparent" ),
      new RoundRect( 31, 11,  8,  7, 3, "#303030", "transparent" ),
      new RoundRect(  1, 20, 18,  7, 3, "#303030", "transparent" ),
      new RoundRect( 21, 20, 18,  7, 3, "#303030", "transparent" ),
      new RoundRect(  1, 29,  8,  7, 3, "#101010", "transparent" ),
      new RoundRect( 11, 29, 18,  7, 3, "#101010", "transparent" ),
      new RoundRect( 31, 29,  8,  7, 3, "#101010", "transparent" )
    ];
    this.items = new Collection( items );
  }

  /**
   * Renders tile items to given canvas rendering context.
   * @param ctx Canvas rendering context to render to.
   */
  render = ( ctx : CanvasRenderingContext2D ) : void => {
    this.items.render( ctx );
  }
}

/**
 * Basic floor tile, used to manage rendering.
 */
class FloorTile extends MapTile {
  constructor() {
    super();
  }

  /**
   * Renders tile to given canvas rendering context.
   * @param ctx Canvas rendering context to render to.
   */
  render = ( ctx: CanvasRenderingContext2D ) : void => {
    ctx.fillStyle = "#963";
    ctx.fillRect( 0, 0, 40, 40 );
  }
}
