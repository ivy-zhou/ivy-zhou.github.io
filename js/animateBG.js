/*jshint esversion: 6 */

var CELL_SIZE = 64;
var DEAD = false; // false - dead, true - alive for cells
var ALIVE = true;
var ALIVE_COLOUR = "#d9d9d9"; // "#FED99B"; // "#282C34"; //75ABBC
var DEAD_COLOUR = "#EFF2EF"; // "#FED18C"; // "#2F343D"
var GRID_COLOUR = "#ddd";
var DISABLED_COLOUR = "#ABB2BF";
var STARTING_POPULATION = 0.75;

var grid = [];

var noOfRows, noOfCols;

function isInBounds(row, col) {
    return col >= 0 && col < noOfCols && row >= 0 && row < noOfRows;
}

// Cell class constructor
class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.curState = DEAD;
        this.nextState = false;
    }

    sumRow(rowPos) {
        var aliveNeighbours = 0;
        for (let colPos = this.col - 1; colPos <= this.col + 1; colPos++) {
            if (!(rowPos == this.row && colPos == this.col) &&
                isInBounds(rowPos, colPos) && grid[rowPos][colPos].curState) {
                grid[rowPos][colPos].draw(window.ctx);
                aliveNeighbours++;
            }
        }
        return aliveNeighbours;
    }

    sumCol(colPos) {
        var aliveNeighbours = 0;
        for (let rowPos = this.row - 1; rowPos <= this.row + 1; rowPos++) {
            if (!(rowPos == this.row && colPos == this.col) &&
                isInBounds(rowPos, colPos) && grid[rowPos][colPos].curState) {
                grid[rowPos][colPos].draw(window.ctx);
                aliveNeighbours++;
            }
        }
        return aliveNeighbours;
    }

    draw(ctx) {
        if (this.curState) // if I'm alive, draw me
            ctx.fillStyle = ALIVE_COLOUR; // alive colour
        else
            ctx.fillStyle = DEAD_COLOUR;
        ctx.fillRect(this.col * CELL_SIZE, this.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    setNextState(ctx) {
        // look for my neighbours
        var aliveNeighbours = 0;

        for (let rowPos = this.row - 1; rowPos <= this.row + 1; rowPos++) {
            aliveNeighbours += this.sumRow(rowPos);
        }

        // at vertical edge
        if (this.row === 0) {
            aliveNeighbours += this.sumRow(noOfRows - 1);
        } else if (this.row === noOfRows - 1) {
            aliveNeighbours += this.sumRow(0);
        }

        if (this.col === 0) {
            aliveNeighbours += this.sumCol(noOfCols - 1);
        } else if (this.col === noOfCols - 1) {
            aliveNeighbours += this.sumCol(0);
        }

        // under/over population
        if (this.curState == ALIVE && (aliveNeighbours < 2 || aliveNeighbours > 3))
            this.nextState = DEAD;
        // if we have 2-3 neighbours, we're alive still!
        if (this.curState == ALIVE && (aliveNeighbours >= 2 && aliveNeighbours <= 3))
            this.nextState = ALIVE;
        // reproduction
        if (this.curState == DEAD && aliveNeighbours == 3)
            this.nextState = ALIVE;
    }

    updateState() {
        this.curState = this.nextState;
        this.nextState = false;
    }
}

// draws gridlines, may be not used
function drawGrid(ctx, canvas) {
    ctx.strokeStyle = GRID_COLOUR;
    ctx.beginPath();
    for (var i = 0; i < noOfRows; i++) {
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke(); // draw each row line
        for (var j = 0; j < noOfCols; j++) {
            ctx.moveTo(j * CELL_SIZE, 0);
            ctx.lineTo(j * CELL_SIZE, canvas.height);
            ctx.stroke(); // draw each col line
        }
    }
}

class Conway {
    constructor() {
        this.canvas = document.getElementById("conway");
        window.ctx = this.canvas.getContext('2d');
        this.initAnimation();
        this.interval = false;
        this.addListeners();
    }

    start() {
        if (!this.interval) {
            this.interval = setInterval(this.animate, 500);
        }
    }

    initAnimation() {
        // model the canvas as a grid containing life cells
        noOfCols = window.innerWidth % CELL_SIZE === 0 ?
            Math.floor(window.innerWidth / CELL_SIZE) : Math.floor(window.innerWidth / CELL_SIZE) + 1;
        noOfRows = window.innerHeight % CELL_SIZE === 0 ?
            Math.floor(window.innerHeight / CELL_SIZE) : Math.floor(window.innerHeight / CELL_SIZE) + 1;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        grid = new Array(noOfRows);
        for (var k = 0; k < noOfRows; k++) {
            grid[k] = new Array(noOfCols);
            for (var n = 0; n < noOfCols; n++) {
                grid[k][n] = new Cell(k, n);
            }
        }

        // generate a number of random cells to be alive already
        var numAlive = Math.floor(STARTING_POPULATION * noOfCols * noOfRows);
        while (numAlive > 0) {
            var nextPos = this.randomGridPos(noOfRows, noOfCols);
            grid[nextPos[0]][nextPos[1]].curState = ALIVE;
            numAlive--;
        }

        this.draw();
    }

    addListeners() {
        var self = this;

        function resizedw() {
            clearInterval(self.interval);
            self.interval = false;
            self.initAnimation();
        }

        var doit;
        window.onresize = function () {
            clearTimeout(doit);
            doit = setTimeout(resizedw, 100);
        };

        window.addEventListener('click', function () {
            if (document.body.classList.contains('show-menu')) {
                clearInterval(self.interval);
                self.interval = false;
            } else if (!self.interval) {
                self.interval = setInterval(self.animate, 500);
            }
        });

        var resetBtn = document.getElementById('reset-button');
        resetBtn.addEventListener('click', function () {
            if (self.interval) {
                clearInterval(self.interval);
            }
            self.initAnimation();
        });

        var aliveColorInput = document.getElementById('alive');
        aliveColorInput.value = ALIVE_COLOUR;
        var deadColorInput = document.getElementById('dead');
        deadColorInput.value = DEAD_COLOUR;
        aliveColorInput.addEventListener('change', function () {
            ALIVE_COLOUR = aliveColorInput.value;
            self.draw();
        });
        deadColorInput.addEventListener('change', function () {
            DEAD_COLOUR = deadColorInput.value;
            self.draw();
        });
    }

    randomGridPos(noOfRows, noOfCols) {
        var pos = [];
        pos[0] = Math.floor(Math.random() * noOfRows); // generate random row
        pos[1] = Math.floor(Math.random() * noOfCols); // generate random col
        return pos;
    }

    draw() {
        for (var i = 0; i < noOfRows; i++) {
            for (var j = 0; j < noOfCols; j++) {
                grid[i][j].draw(window.ctx);
            }
        }
    }

    animate() {
        for (let i = 0; i < noOfRows; i++) {
            for (let j = 0; j < noOfCols; j++) {
                grid[i][j].draw(window.ctx);
                grid[i][j].setNextState(window.ctx);
            }
        }
        // now update each cell
        for (let i = 0; i < noOfRows; i++)
            for (let j = 0; j < noOfCols; j++)
                grid[i][j].updateState();
    }
}


let conwayBG = new Conway();
conwayBG.start();
