Parse.initialize("XctRj8yjGvXLptN5MH6BdlBl2eE4bKVSDnYM8yVu", 
    "GzPkrCSUdURM3HTmtdtMjhKWJtiRvxWyMllWRifx");

var COLS = 10, ROWS = 15;
var board = [];
var lose = false;
var interval;
var current; // current moving shape
var currentX, currentY; // position of current shape
var next; // next shape
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];
var colors = [
    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

// creates a new 4x4 shape in global variable 'next'
// sets global variable 'current' to be the previously held 'next' shape
// 4x4 so as to cover the size when the shape is rotated
function newShape() {
    var id = Math.floor( Math.random() * shapes.length );
    var shape = shapes[ id ]; // maintain id for color filling

    // set current block to previous next block 
    current = next;

    next = [];
    for ( var y = 0; y < 4; ++y ) {
        next[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                next[ y ][ x ] = id + 1;
            }
            else {
                next[ y ][ x ] = 0;
            }
        }
    }

    // set next block image
    var url = 'url("resources/img/shapes/' + id + '.png")';
    $('#next').css('background-image', url);

    // position where the shape will evolve
    currentX = 5;
    currentY = 0;
}

// clears the board
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

// keep the element moving down, creating new shapes and clearing lines
function tick() {
    if ( valid( 0, 1, 0 ) ) {
        ++currentY;
        var cur_score = $('#score_value').text();
        $('#lines').text(cur_score);
    }
    // if the element settled
    else {
        freeze();
        clearLines();
        if (lose) {
            $('#popup').show();
            //endGame();
            //newGame();
            return false;
        }
        newShape();
    }
}

// stop shape at its position and fix it to board
function freeze() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
            }
        }
    }
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
    }

    return newCurrent;
}

// check if any lines are filled and clear them
function clearLines() {
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        if ( rowFilled ) {
            document.getElementById( 'clearsound' ).play();
            var cur_score_elm = document.getElementById('score_value');
            var cur_score = parseInt(cur_score_elm.innerHTML);
            var new_score = cur_score + 1;
            cur_score_elm.innerHTML = new_score;
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }
}

function keyPress( key ) {
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) ) {
                --currentX;
            }
            break;
        case 'right':
            if ( valid( 1 ) ) {
                ++currentX;
            }
            break;
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
            }
            break;
        case 'rotate':
            var rotated = rotate( current );
            if ( valid( 0, 0, rotated ) ) {
                current = rotated;
            }
            break;
    }
}

// checks if the resulting position of current shape will be feasible
function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  //|| board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1){
                        //lose = true; // lose if the current shape at the top row when checked
                        //console.log('you lose');
                    }
                    return false;
                }
            }
            if(newCurrent[y][x]){
                if(board[y+offsetY][x+offsetX]){
                    if(offsetY == 1){
                        lose = true; 
                    }  
                    return false;    
                }
            }
            
        }
    }
    return true;
}

function newGame() {
    clearInterval(interval);
    init();
    showUser();
    newShape();
    newShape();
    lose = false;

    //Hide popup and reset score
    $('#popup').hide();
    $('#score_value').text('0');

    //Set Interval Speed
    string = document.URL;
    var speed = getSpeed( string );
    interval = setInterval( tick, speed );
}

function showUser(){
    var user = Parse.User.current();
    if (!user) {
        $('#guest-mode').css('display', 'block'); 
        $('#footer').css('display', 'block'); 
    }
}

function getSpeed( string ){
    if (string.indexOf("leap") > -1) {
        speed = 1500;
    } else if (string.indexOf("gamepad") > -1) {
        speed = 500;
    } else if (string.indexOf("keyboard") > -1) {
        speed = 500;
    } else if (string.indexOf("touch") > -1) {
        speed = 1000;
    } else if (string.indexOf("kinect") > -1) {
        speed = 1000;
    }
    return speed;
}

function quitGame(){
    endGame();
    window.location.href = 'home.html';
}

function restartGame(){
    endGame();
    newGame();
}

function endGame() {
    var cur_score_elm = document.getElementById('score_value');
    var cur_score = parseInt(cur_score_elm.innerHTML);
    //$('#lines').text(cur_score);

    updateHighScore(cur_score);
    //return updateHighScore(cur_score);    
}

newGame();
