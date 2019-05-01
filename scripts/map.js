var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map(mapDim) {
        var _this = _super.call(this) || this;
        _this.redrawRange = function (startRow, numRows, startCol, numCols) {
            for (var row = startRow; row < startRow + numRows; row++) {
                for (var col = startCol; col < startCol + numCols; col++) {
                    _this.redraw(row, col);
                }
            }
        };
        _this.redraw = function (row, col) {
            if (_this.toRedraw[row][col] == null)
                return;
            var val = _this.toRedraw[row][col];
            if (val < 0)
                _this.tiles[row][col] = new OuterWallTile();
            if (val == 0)
                _this.tiles[row][col] = new FloorTile();
            if (val > 0)
                _this.tiles[row][col] = new WallTile(val);
            _this.toRedraw[row][col] = null;
        };
        _this.render = function (ctx) {
            ctx.save();
            _this.tiles.forEach(function (row, yIndex) {
                ctx.save();
                row.forEach(function (tile, xIndex) {
                    tile.render(ctx);
                    ctx.translate(40, 0);
                });
                ctx.restore();
                ctx.translate(0, 40);
            });
            ctx.restore();
        };
        _this.update = function (tiles) {
            tiles.forEach(function (row, i) {
                row.forEach(function (val, j) {
                    var compare = (val < -1 && _this.tiles[i][j] instanceof OuterWallTile) ||
                        (val == 0 && _this.tiles[i][j] instanceof FloorTile) ||
                        (val > 0 && _this.tiles[i][j] instanceof WallTile);
                    if (compare)
                        return;
                    _this.toRedraw[i][j] = val;
                });
            });
        };
        _this.setTile = function (val, row, col) {
            if (val < 0) {
                _this.tiles[row][col] = new OuterWallTile();
            }
            if (val == 0) {
                _this.tiles[row][col] = new FloorTile();
            }
            if (val > 0) {
                _this.tiles[row][col] = new WallTile(val);
            }
        };
        _this.setTiles = function (tiles) {
            tiles.forEach(function (row, i) {
                row.forEach(function (val, j) {
                    if (val < 0) {
                        _this.tiles[i][j] = new OuterWallTile();
                    }
                    ;
                    if (val == 0) {
                        _this.tiles[i][j] = new FloorTile();
                    }
                    ;
                    if (val > 0) {
                        _this.tiles[i][j] = new WallTile(val);
                    }
                    ;
                });
            });
            _this.redrawRange(0, _this.rowCount, 0, _this.colCount);
            _this.set = true;
        };
        _this.getTile = function (row, col) {
            return _this.tiles[row][col];
        };
        _this.tiles = [];
        _this.toRedraw = [];
        _this.rowCount = mapDim;
        _this.colCount = mapDim;
        _this.set = false;
        for (var i = 0; i < mapDim; i++) {
            _this.tiles[i] = [];
            _this.toRedraw[i] = [];
            for (var j = 0; j < mapDim; j++) {
                _this.tiles[i][j] = null;
                _this.toRedraw[i][j] = null;
            }
        }
        return _this;
    }
    return Map;
}(Renderable));
var MapTile = /** @class */ (function (_super) {
    __extends(MapTile, _super);
    function MapTile() {
        var _this = _super.call(this) || this;
        _this.isBlocking = false;
        return _this;
    }
    return MapTile;
}(Renderable));
var WallTile = /** @class */ (function (_super) {
    __extends(WallTile, _super);
    function WallTile(initHealth) {
        if (initHealth === void 0) { initHealth = 5; }
        var _this = _super.call(this) || this;
        _this.onHit = function (damage) {
            _this.health.dec(damage);
            _this.update();
        };
        _this.update = function () {
            var val = _this.health.get();
            _this.items.mapItems(function (item) {
                if (item instanceof RoundRect) {
                    item.rad = val;
                }
                return item;
            });
        };
        _this.render = function (ctx) {
            _this.items.render(ctx);
        };
        _this.isBlocking = true;
        var items = [
            new RoundRect(0, 0, 40, 40, 3, "#000000", "transparent"),
            new RoundRect(1, 2, 18, 7, 3, "#c0c0c0", "transparent"),
            new RoundRect(21, 2, 18, 7, 3, "#c0c0c0", "transparent"),
            new RoundRect(1, 11, 8, 7, 3, "#a0a0a0", "transparent"),
            new RoundRect(11, 11, 18, 7, 3, "#a0a0a0", "transparent"),
            new RoundRect(31, 11, 8, 7, 3, "#a0a0a0", "transparent"),
            new RoundRect(1, 20, 18, 7, 3, "#909090", "transparent"),
            new RoundRect(21, 20, 18, 7, 3, "#909090", "transparent"),
            new RoundRect(1, 29, 8, 7, 3, "#606060", "transparent"),
            new RoundRect(11, 29, 18, 7, 3, "#606060", "transparent"),
            new RoundRect(31, 29, 8, 7, 3, "#606060", "transparent")
        ];
        _this.items = new Collection(items);
        _this.health = new Counter(initHealth);
        return _this;
    }
    return WallTile;
}(MapTile));
var OuterWallTile = /** @class */ (function (_super) {
    __extends(OuterWallTile, _super);
    function OuterWallTile() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.items.render(ctx);
        };
        _this.isBlocking = true;
        var items = [
            new RoundRect(0, 0, 40, 40, 3, "#000000", "transparent"),
            new RoundRect(1, 2, 18, 7, 3, "#909090", "transparent"),
            new RoundRect(21, 2, 18, 7, 3, "#909090", "transparent"),
            new RoundRect(1, 11, 8, 7, 3, "#606060", "transparent"),
            new RoundRect(11, 11, 18, 7, 3, "#606060", "transparent"),
            new RoundRect(31, 11, 8, 7, 3, "#303030", "transparent"),
            new RoundRect(1, 20, 18, 7, 3, "#303030", "transparent"),
            new RoundRect(21, 20, 18, 7, 3, "#303030", "transparent"),
            new RoundRect(1, 29, 8, 7, 3, "#101010", "transparent"),
            new RoundRect(11, 29, 18, 7, 3, "#101010", "transparent"),
            new RoundRect(31, 29, 8, 7, 3, "#101010", "transparent")
        ];
        _this.items = new Collection(items);
        return _this;
    }
    return OuterWallTile;
}(MapTile));
var FloorTile = /** @class */ (function (_super) {
    __extends(FloorTile, _super);
    function FloorTile() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.fillStyle = "#963";
            ctx.fillRect(0, 0, 40, 40);
            var stone = new Path(10, 10, "#303030", "#303060");
            var shapes = [];
            stone.addSegments(shapes);
            stone.render(ctx);
        };
        return _this;
    }
    return FloorTile;
}(MapTile));
