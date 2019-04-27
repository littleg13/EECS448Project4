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
    function Map() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.save();
            for (var i = 0; i < _this.tiles.length; i++) {
                var row = _this.tiles[i];
                ctx.save();
                for (var j = 0; j < row.length; j++) {
                    var tile = row[j];
                    tile.render(ctx);
                    ctx.translate(40, 0);
                }
                ctx.restore();
                ctx.translate(0, 40);
            }
            ctx.restore();
        };
        _this.update = function (tiles) {
            _this.tiles = tiles.map(function (row) {
                return row.map(function (val) {
                    if (val === 0)
                        return new FloorTile();
                    else
                        return new WallTile();
                });
            });
        };
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
            new RoundRect(0, 0, 40, 40, 3, "#000000", "rgba(0,0,0,0)"),
            new RoundRect(1, 2, 18, 7, 3, "#c0c0c0", "rgba(0,0,0,0)"),
            new RoundRect(21, 2, 18, 7, 3, "#c0c0c0", "rgba(0,0,0,0)"),
            new RoundRect(1, 11, 8, 7, 3, "#a0a0a0", "rgba(0,0,0,0)"),
            new RoundRect(11, 11, 18, 7, 3, "#a0a0a0", "rgba(0,0,0,0)"),
            new RoundRect(31, 11, 8, 7, 3, "#a0a0a0", "rgba(0,0,0,0)"),
            new RoundRect(1, 20, 18, 7, 3, "#909090", "rgba(0,0,0,0)"),
            new RoundRect(21, 20, 18, 7, 3, "#909090", "rgba(0,0,0,0)"),
            new RoundRect(1, 29, 8, 7, 3, "#606060", "rgba(0,0,0,0)"),
            new RoundRect(11, 29, 18, 7, 3, "#606060", "rgba(0,0,0,0)"),
            new RoundRect(31, 29, 8, 7, 3, "#606060", "rgba(0,0,0,0)")
        ];
        _this.items = new Collection(items);
        _this.health = new Counter(initHealth);
        return _this;
    }
    return WallTile;
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
