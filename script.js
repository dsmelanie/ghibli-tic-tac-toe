const GameBoard = (() => {
  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  let cellsFilled = 0;

  function checkWinner() {
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] !== "" &&
        board[i][0] == board[i][1] &&
        board[i][1] == board[i][2]
      )
        return true;
    }

    for (let i = 0; i < 3; i++) {
      if (
        board[0][i] !== "" &&
        board[0][i] == board[1][i] &&
        board[1][i] == board[2][i]
      )
        return true;
    }

    if (
      board[0][0] !== "" &&
      board[0][0] == board[1][1] &&
      board[1][1] == board[2][2]
    )
      return true;
    else if (
      board[0][2] !== "" &&
      board[0][2] == board[1][1] &&
      board[1][1] == board[2][0]
    )
      return true;
    else return false;
  }

  function move(row, col, mark) {
    board[row][col] = mark;
    cellsFilled++;
  }

  function reset() {
    cellsFilled = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[i][j] = "";
      }
    }
  }

  function getCellsFilled() {
    return cellsFilled;
  }

  return {
    move,
    checkWinner,
    reset,
    getCellsFilled,
  };
})();

function playerFactory(name, mark) {
  function getName() {
    return name;
  }
  function getMark() {
    return mark;
  }
  return {
    getName,
    getMark,
  };
}

const GameController = (() => {
  let isGameOver = false;
  let player1, player2, activePlayer;

  function switchPlayers() {
    activePlayer = activePlayer === player1 ? player2 : player1;
    DisplayController.displayMessage(
      `${activePlayer.getName()}'s turn`,
      `./images/${activePlayer.getMark()}.png`
    );
  }

  function makeMove(i, j, cell) {
    GameBoard.move(i, j, activePlayer.getMark());
    DisplayController.setMark(cell, activePlayer.getMark());
    if (GameBoard.checkWinner()) {
      DisplayController.displayMessage(
        `${activePlayer.getName()} wins !`,
        `./images/${activePlayer.getMark()}.png`
      );
      isGameOver = true;
    } else if (GameBoard.getCellsFilled() === 9) {
      DisplayController.displayMessage(`It's a draw !`, "");
      isGameOver = true;
    } else {
      switchPlayers();
    }
  }

  function isOver() {
    return isGameOver;
  }

  function reset() {
    activePlayer = player1;
    isGameOver = false;
    DisplayController.displayMessage(
      `${activePlayer.getName()}'s turn`,
      `./images/${activePlayer.getMark()}.png`
    );
  }

  function init() {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    arr.sort(() => Math.random() - 0.5);
    DisplayController.displayMarkers(arr);
  }

  function setUpPlayers(player1Name, player1Mark, player2Name, player2Mark) {
    player1 = playerFactory(player1Name, player1Mark);
    player2 = playerFactory(player2Name, player2Mark);
    activePlayer = player1;
  }

  return {
    makeMove,
    isOver,
    reset,
    init,
    setUpPlayers,
  };
})();

const DisplayController = (() => {
  const startScreen = document.querySelector(".start-screen");
  const mainGameScreen = document.querySelector("main");
  const gameInfo = document.querySelector(".game-info");
  const gameInfoImg = document.querySelector(".game-info > img");
  const boardCells = document.querySelectorAll(".cell");
  const restartBtn = document.querySelector(".restart");
  const newGameBtn = document.querySelector(".new-game");
  const playBtn = document.querySelector("#start-game");
  const markersA = document.querySelectorAll(".marker-a");
  const markersB = document.querySelectorAll(".marker-b");
  const playerNames = document.querySelectorAll(".player-info > input");
  let markerA, markerB;

  boardCells.forEach((cell) => {
    cell.addEventListener("click", () => {
      if (GameController.isOver() || cell.innerHTML !== "") return;
      const row = +cell.dataset.row;
      const col = +cell.dataset.col;
      GameController.makeMove(row, col, cell);
    });
  });

  function reset() {
    GameBoard.reset();
    GameController.reset();
    boardCells.forEach((cell) => {
      cell.textContent = "";
    });
  }

  restartBtn.addEventListener("click", reset);

  playBtn.addEventListener("click", (event) => {
    event.preventDefault();
    for (const player of playerNames) {
      if (!player.checkValidity()) {
        player.classList.add("invalid");
        player.focus();
        return;
      }
    }
    if (!markerA || !markerB) return;
    GameController.setUpPlayers(
      playerNames[0].value,
      markerA.dataset.idx,
      playerNames[1].value,
      markerB.dataset.idx
    );
    gameInfo.innerHTML = `<img src="./images/${markerA.dataset.idx}.png" style="height: 60px; margin-right: 5px;"> ${playerNames[0].value}'s turn`;
    startScreen.classList.add("hidden");
    mainGameScreen.classList.remove("hidden");
  });

  newGameBtn.addEventListener("click", () => {
    reset();
    for (const player of playerNames) {
      player.value = "";
      player.className = "";
    }
    markerA.classList.remove("selected");
    markerB.classList.remove("selected");
    markerA = null;
    markerB = null;
    startScreen.classList.remove("hidden");
    mainGameScreen.classList.add("hidden");
    GameController.init();
  });

  markersA.forEach((marker) => {
    marker.addEventListener("click", () => {
      if (markerA) {
        markerA.classList.remove("selected");
      }
      markerA = marker;
      markerA.classList.add("selected");
    });
  });

  markersB.forEach((marker) => {
    marker.addEventListener("click", () => {
      if (markerB) {
        markerB.classList.remove("selected");
      }
      markerB = marker;
      markerB.classList.add("selected");
    });
  });

  for (const player of playerNames) {
    player.addEventListener("focus", () => {
      player.classList.add("focus");
    });

    player.addEventListener("blur", () => {
      player.classList.remove("focus");
      if (!player.checkValidity()) {
        player.classList.add("invalid");
      }
    });

    player.addEventListener("input", () => {
      if (player.checkValidity()) {
        player.classList.remove("invalid");
        player.classList.add("valid");
      } else {
        if (player.classList.contains("valid")) {
          player.classList.remove("valid");
          player.classList.add("invalid");
        }
      }
    });
  }

  function displayMessage(message, src) {
    gameInfo.textContent = message;
    gameInfo.prepend(gameInfoImg);
    gameInfoImg.src = src;
  }

  function setMark(cell, mark) {
    cell.innerHTML = `<img src="./images/${mark}.png"/>`;
  }

  function displayMarkers(arr) {
    let j = 0;
    for (; j < 8; j++) {
      const i = j % 4;
      const cur = j < 4 ? markersA : markersB;
      cur[i].firstChild.src = `./images/${arr[j]}.png`;
      cur[i].dataset.idx = `${arr[j]}`;
    }
  }

  return {
    displayMessage,
    setMark,
    displayMarkers,
  };
})();

GameController.init();
