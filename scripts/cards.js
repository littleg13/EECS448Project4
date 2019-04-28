var PlayerCard = /** @class */ (function () {
    function PlayerCard(userID, playerName, health, sprite) {
        var _this = this;
        this.buildCard = function () {
            var cardDiv = document.createElement("div");
            cardDiv.classList.add("playerCard");
            cardDiv.setAttribute("id", "info" + _this.userID);
            var usernameDiv = document.createElement("div");
            usernameDiv.classList.add("username");
            usernameDiv.innerHTML = _this.playerName;
            var healthDiv = document.createElement("div");
            var curHealthDiv = document.createElement("div");
            healthDiv.classList.add("tankHealth");
            curHealthDiv.classList.add("curTankHealth");
            healthDiv.appendChild(curHealthDiv);
            curHealthDiv.style.width = _this.health + "%";
            var spriteDiv = document.createElement("div");
            spriteDiv.classList.add("tankSprite");
            cardDiv.appendChild(usernameDiv);
            cardDiv.appendChild(spriteDiv);
            cardDiv.appendChild(healthDiv);
            _this.sprite.attachToParent(spriteDiv);
            _this.rootDiv = cardDiv;
        };
        this.setParent = function (parent) {
            _this.parent = parent;
            if (_this.rootDiv != null) {
                _this.parent.appendChild(_this.rootDiv);
            }
        };
        this.updateHealth = function (newHealth) {
            console.log("Update health to: " + newHealth);
            var healthDiv = _this.rootDiv.getElementsByClassName("tankHealth")[0];
            var curHealthDiv = healthDiv.getElementsByClassName("curTankHealth")[0];
            curHealthDiv.style.width = newHealth + "%";
        };
        this.userID = userID;
        this.playerName = playerName;
        this.health = health;
        this.sprite = sprite;
        this.rootDiv = null;
        this.parent = null;
    }
    return PlayerCard;
}());
