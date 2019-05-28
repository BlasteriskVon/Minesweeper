$(document).ready(function() {
    var bombArray; //array of all the coordinates with bombs
    var safeArray;
    var size = 12;
    var colSize = 12/size;
    var numberOfBombs = 12;
    var gameOver;
    var bombsRemaining;
    function startGame() {
        alert("Welcome to Minesweeper! Click a block to open it! Right-click a block to flag it! Don't hit a mine!")
        $(".container").empty();
        bombArray = [];
        safeArray = [];
        gameOver = false;
        bombArray.length = 0;
        bombsRemaining = numberOfBombs;
        var overRow = $("<div>", {"class":"row over-row"});
        $(".container").append(overRow);
        var infoColumn = $("<div>",{"class":"col-md-1 info-column"});
        overRow.append(infoColumn);
        var infoButton = $("<button>",{id:"infoButton"});
        infoColumn.append(infoButton);
        var moreMinesButton = $("<button>",{id:"moreMinesButton"});
        moreMinesButton.text("Click to adjust the number of mines."); 
        infoColumn.append(moreMinesButton);
        moreMinesButton.on("click", function() {
            var totalSize = (12 * 12);
            var newAmount = prompt("Enter the amount of mines you would like. (Please enter a number greater than 0 and less than " + totalSize + ".)");
            while(parseInt(newAmount) <= 0 || parseInt(newAmount) >= totalSize){
                newAmount = prompt("Please enter a number greater than 0 and less than " + totalSize + ".");
            }
            numberOfBombs = parseInt(newAmount);
            startGame();
        })
        var gameColumn = $("<div>", {"class":"col-md-11 game-column"});
        overRow.append(gameColumn);
        for(var i = 0;i < size;i++){ //setting up the board
            var newRow = $("<div>");
            newRow.attr("class", "row new-row");
            for(var j = 0;j < size;j++){
                var newBlock = $("<div>");
                newBlock.attr("class", "new-block col-md-" + colSize);
                newBlock.attr("id", "block" + j + "-" + i);
                newRow.append(newBlock);
                var newButton = $("<button>");
                newButton.attr("id", j + "-" + i);
                newButton.addClass("new-button");
                newButton.attr("hasBomb","false");
                newButton.attr("hasFlag","false");
                newBlock.append(newButton);
            }
            $(".game-column").append(newRow);
        }
        updateRemaining();

        for(var i = 0;i < numberOfBombs;i++){
            var bombX = Math.floor(Math.random() * size);
            var bombY = Math.floor(Math.random() * size);
            var bombCoordinate = bombX + "-" + bombY;
            if(!bombArray.includes(bombCoordinate)){
                bombArray.push(bombCoordinate); //if this coordinate isn't already there, add it
                $("#" + bombCoordinate).attr("hasBomb", "true");
            } else {
                i--; //else try again to make sure we get 90 bombs
            }
        }

        for(var i = 0;i < size;i++){
            for(var j = 0;j < size;j++){
                if($("#" + j + "-" + i).attr("hasBomb") === "false"){
                    safeArray.push(getCoordinate(j, i));
                }
            }
        }



        $(".new-button").on("click", function(e) {
                if(!gameOver){
                    var x = parseInt(getX(e.target.id));
                    var y = parseInt(getY(e.target.id));
                    var bombArea = getCoordinate(x,y);
                    if(bombArray.includes(bombArea)){ //if the user hits a bomb
                        youLose();
                    } else {
                            open(x,y);
                            checkBoard();
                        }
                }
            }
        )

        $(".new-button").on("contextmenu", function(e) {
            if(!gameOver){
                var x = parseInt(getX(e.target.id));
                var y = parseInt(getY(e.target.id));
                flagMe(x,y);
                return false;
            }
        })
    }

    


    function open(x, y){
        if($("#" + x + "-" + y).attr("hasFlag") === "true"){
            return;
        }
        if(bombArray.includes(getCoordinate(x, y))){ //if the user hits a bomb
            youLose();
        } else if(x >= size || y >= size || x < 0 || y < 0 || ($("#" + x + "-" + y).is(":disabled"))){
            return;
        } else {
        $("#" + x + "-" + y).attr("disabled", "disabled");
        $("#" + x + "-" + y).css("background-color","white");
        var bombNumber = $("<div>");
        bombNumber.addClass("checked" + x + "-" + y);
        bombNumber.addClass("checkedZone");
        bombNumber.on("dblclick", function() { openSurrounding(x,y);});
        if(bombsAround(x,y) != 0){
            bombNumber.text(bombsAround(x,y));
            $("#" + x + "-" + y).append(bombNumber);
            return;
        } else {
            for(var yChange = -1;yChange < 2;yChange++){
                for(var xChange = -1;xChange < 2;xChange++){
                    if(xChange*yChange === xChange - yChange){ //if it is coordinate (x,y)
                        continue;
                    } else {
                        open(x + xChange, y + yChange);
                    }
                }
            }
        }
        }
    }

    function flagMe(x,y){
        if(gameOver){return;}
            if($("#" + x + "-" + y).attr("hasFlag") === "true"){
                $("#" + x + "-" + y).removeAttr("disabled");
                $("#" + x + "-" + y).attr("hasFlag", "false");
                var flag = document.getElementById("flag" + x + "-" + y);
                var flagButton = document.getElementById(x + "-" + y);
                flagButton.removeChild(flag);
                bombsRemaining++;
                updateRemaining();
            } else {
                if(bombsRemaining > 0){
                    $("#" + x + "-" + y).attr("hasFlag", "true");
                    $("#" + x + "-" + y).attr("disabled", "disabled");
                    var flag = $("<img>");
                    flag.attr("src", "assets/images/flag.png");
                    flag.css({"width":"100%","height":"100%"});
                    flag.attr("id", "flag" + x + "-" + y);
                    flag.on("contextmenu", function() {
                        flagMe(x,y);
                        return false;
                    })
                    $("#" + x + "-" + y).append(flag);
                    bombsRemaining--;
                    updateRemaining();
                }
            }
    }

    function youLose(){
        for(var i = 0;i < bombArray.length;i++){
            if($("#" + bombArray[i]).is(":disabled")){
                continue;
            } else {
                var mine = $("<img>");
                mine.attr("src","assets/images/mine.gif");
                mine.css({"width":"100%","height":"100%"});
                //mine.on("dblclick", startGame);
                $("#" + bombArray[i]).append(mine);
                gameOver = true;
            }
        }
        $("#infoButton").text("Try Again!");
        $("#infoButton").on("click", startGame);
        setTimeout(function() {alert("Game Over! Click the \"Try Again!\" button to try again!");}, 40)
    }

    function youWin(){
        gameOver = true;
        $("#infoButton").text("Play Again!");
        $("#infoButton").on("click", startGame);
        setTimeout(function() {
            alert("You win! Click the \"Play Again!\" button to play again!");
        }, 35)
    }

    function openSurrounding(x, y){
        var flagged = 0;
        for(var yChange = -1;yChange < 2;yChange++){
            for(var xChange = -1;xChange < 2;xChange++){
                if($("#" + (x + xChange) + "-" + (y + yChange)).attr("hasFlag") === "true"){
                    flagged++;
                }
            }
        }
        if(parseInt($(document.getElementsByClassName("checked" + getCoordinate(x,y))).text()) <= flagged){
            for(var yChange = -1;yChange < 2;yChange++){
                for(var xChange = -1;xChange < 2;xChange++){
                    if(xChange*yChange === xChange - yChange){ //if it is coordinate (x,y)
                        continue;
                    } else {
                        open(x + xChange, y + yChange);
                    }
                }
            }
        } else {
            return;
        }
        checkBoard();
    }

    function bombsAround(x, y){
        var count = 0;
        for(var yChange = -1;yChange < 2;yChange++){
            for(var xChange = -1;xChange < 2;xChange++){
                if(xChange*yChange === xChange - yChange){ //if it is coordinate (x,y)
                    continue;
                } else {
                    if($("#" + (x + xChange) + "-" + (y + yChange)).attr("hasBomb") === "true"){
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function checkBoard(){
        var zeroIfAllClicked = 0;
        for(var i = 0;i < safeArray.length;i++){
            if($("#" + safeArray[i]).css("background-color") === "rgb(255, 255, 255)"){
                continue;
            } else {
                zeroIfAllClicked++;
            }
        }
        if(zeroIfAllClicked === 0){
            youWin();
        }
    }

    function getX(coordinateString){ //x-y
        var whereIsDash = coordinateString.indexOf("-");
        var resultX = coordinateString.slice(0, whereIsDash);
        return resultX;
    }

    function getY(coordinateString){
        var whereIsDash = coordinateString.indexOf("-");
        var resultY = coordinateString.slice(whereIsDash + 1);
        return resultY;
    }

    function getCoordinate(x, y){
        var coordinateToGet = x + "-" + y;
        return coordinateToGet;
    }

    function updateRemaining(){
        if(bombsRemaining === 1){
            $("#infoButton").text(bombsRemaining + " mine remaining");
        } else {
            $("#infoButton").text(bombsRemaining + " mines remaining");
        }
    }

    $("#startBtn").on("click", function(){
        startGame();
    })

    //maybe instead of the mine reveal maybe have a jumpscare image when the user hits the mine or something
    //can do something like upload snake gifs from giphy to do this
});