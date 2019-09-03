class View {
	
	getCell (row, col) {
		return this.boardEl.querySelector(`div.cell[data-row="${row}"][data-col="${col}"]`);
	}
	
	constructor(stepCallback, restartCallback) {
		this.boardEl = document.querySelector ('#board');	
		this.bindEvents();
		this.stepCallback = stepCallback;
		this.restartCallback = restartCallback;
	}
	
	bindEvents() {
        this.boardEl.addEventListener ('click', this.handleBoardclick.bind(this));
		document.querySelector("button").addEventListener('click', this.handleRestart.bind(this));
    }
	
	restart() {
		let cells = Array.from(this.boardEl.querySelectorAll (".cell"));
		cells.forEach (cell => {
			cell.textContent = "";
			cell.style.backgroundColor = "white";
		});
		document.querySelector("#result").textContent = "";
		this.boardBlocked = false;
	}
	
	handleBoardclick(e) {
        if (!e.target.classList.contains("cell") || this.boardBlocked) return;
        let row = Number(e.target.getAttribute("data-row"));
        let col = Number(e.target.getAttribute("data-col"));		
		this.stepCallback && this.stepCallback(row, col);
    }
	
	handleRestart(e){
		this.restartCallback && this.restartCallback();
	}
	
	updateCell(row, col, value) {
        let cell = this.getCell(row, col);
        cell.textContent = value;
    }
	
	updateWinner(gameResult) {
		gameResult.cells.forEach (({row, col}) => {
			let cell = this.getCell(row, col);
			cell.style.backgroundColor = 'lightgreen';
		})
		document.querySelector("#result").textContent = `${gameResult.winner} is the Winner!`;
	}
	
	updateGameOver() {
		document.querySelector("#result").textContent = `No winner this time..`;
	}
	
	blockBoard() {
		this.boardBlocked = true;
	}
}

class App {

    constructor(){
		this.view = new View(this.doStep.bind(this), this.restart.bind(this));
        this.restart();
    }

    restart () {
        this.state = [Array(3),Array(3),Array(3)];
		this.currentPlayer = 'x';
		this.view.restart();
    }
	
	doStep(row, col) {
		if (this.state[row][col]) {
            return console.warn (`User clicked on a non-empty cell - [${row}][${col}]`);
        }
		this.state[row][col] = this.currentPlayer;
		let gameResult = calcGameResult(this.state) || {};
		this.view.updateCell (row, col, this.currentPlayer);
		if (!gameResult.gameOver) {
			this.switchPlayer();
		}
		else {
			this.view.blockBoard();
			if (gameResult.winner)
				this.view.updateWinner (gameResult);
			else 
				this.view.updateGameOver();
		}
		
	}
	
	switchPlayer () {
		if (this.currentPlayer === 'x')
			this.currentPlayer = 'o';
		else
			this.currentPlayer = 'x';
	}
}

function calcGameResult (state) {
	let results = {rows: ["","",""], cols: ["","",""], cross1: "", cross2: ""};
	let emptyCells = 9;
	for (let row = 0; row <= 2; row++){
		for (let col = 0; col <= 2; col++) {
			results.rows[row] += state[row][col] || '';
			results.cols[col] += state[row][col] || '';
			
			if (row === col)
				results.cross1 += state[row][col] || '';
			if (row + col === 2)
				results.cross2 += state[row][col] || '';
			
			emptyCells -= state[row][col] ? 1 : 0;
		};
	};
	
	for (let row in results.rows){
		if (results.rows[row] === "xxx" || results.rows[row] === "ooo")
			return {gameOver: true, winner: results.rows[row][0], cells: [0,1,2].map(i => ({row, col: i}))}
	}
	
	for (let col in results.cols) {
		if (results.cols[col] === "xxx" || results.cols[col] === "ooo")
			return {gameOver: true, winner: results.cols[col][0], cells: [0,1,2].map(i => ({row:i, col}))}
	}

	if (results.cross1 === "xxx" || results.cross1 === "ooo") 
		return {gameOver: true, winner: results.cross1[0], cells: [0,1,2].map(i => ({row:i, col: i}))}
	
	if (results.cross2 === "xxx" || results.cross2 === "ooo")
		return {gameOver: true, winner: results.cross2[0], cells: [0,1,2].map(i => ({row:i, col: 2 - i}))}
	
	if (emptyCells == 0) 
		return {gameOver: true}
}

window.app = new App();