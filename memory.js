const gameArea = document.getElementById("game-area");
const startBtn = document.getElementById("start-btn");
const newGameBtn = document.getElementById("new-game-btn");
const resetBtn = document.getElementById("reset-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");

const statistic = {
  steps: 0,
  time: 0,
  wins: 0,
};

let originalCardValues = [];
let totalShown;
let timer;
let turnedCard1 = null;
let turnedCard2 = null;

// Hides the start menu and display the cards and the info bar
function startGame() {
  totalShown = document.querySelector('input[name="total-cards"]:checked').value;
  document.getElementById("start-window").classList.toggle("shown");
  document.querySelector(".wins").innerText = statistic.wins;
  startTimer();
  swapCards();
  showGame();
}

// Swaps the the image sources of the cards
function swapCards() {
  const cardImages = document.querySelectorAll(".card-front img");
  for (let i = totalShown - 1; i > 0; i--) {
    const randIndex = Math.floor(Math.random() * (i + 1));
    let newValue = cardImages[randIndex].getAttribute("src");
    let originalValue = cardImages[i].getAttribute("src");

    cardImages[randIndex].setAttribute("src", originalValue);
    cardImages[i].setAttribute("src", newValue);
  }
}

// Shows the cards in the game area and the info bar
function showGame() {
  const cardContainers = document.querySelectorAll(".card-container");
  for (let i = 0; i < totalShown; i++) {
    cardContainers[i].className = `card-container in-game total-${totalShown}`;
  }
  document.getElementById("info-bar").classList.toggle("hidden");
}

// Handles flips, case of pairs and win
function controlCardTurn(cardToTurn) {
  if (turnedCard1 === null) {
    turnedCard1 = cardToTurn;
    turnUpCard(cardToTurn);
  } else {
    turnedCard2 = cardToTurn;
    turnUpCard(cardToTurn);
    gameArea.style.pointerEvents = "none";
    turnOrHideCard(checkPair, handleWin);
  }
}

// Turns up a card and increase the steps by one
function turnUpCard(cardToTurn) {
  cardToTurn.classList.toggle("turned");
  statistic.steps++;
  document.getElementById("steps").innerText = statistic.steps;
}

// Waits 1 second and turns the cards back
function turnOrHideCard(checkPair, handleWin) {
  setTimeout(() => {
    if (checkPair()) {
      turnedCard1.classList.toggle("hidden");
      turnedCard2.classList.toggle("hidden");
    } else {
      turnedCard1.classList.toggle("turned");
      turnedCard2.classList.toggle("turned");
    }
    document.getElementById("game-area").style.pointerEvents = "auto";
    handleWin();
  }, 1000);
}

// Checks if the two visible card has the same picture
function checkPair() {
  const image1 = turnedCard1.children[1].firstElementChild.getAttribute("src");
  const image2 = turnedCard2.children[1].firstElementChild.getAttribute("src");
  return image1 === image2;
}

// Stops the timer and shows the winner window
function handleWin() {
  if (checkWin()) {
    stopTimer();
    showWinner();
  }
  turnedCard1 = null;
  turnedCard2 = null;
}

// Checks if the player found all the pairs
function checkWin() {
  const cards = document.querySelectorAll(".card-container.in-game .card");
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].classList.contains("hidden")) {
      return false;
    }
  }
  return true;
}

// Shows winner window with the statistic
function showWinner() {
  statistic.wins++;
  document.querySelector(".wins-final").innerText = statistic.wins;
  localStorage.setItem("wins", statistic.wins);
  updateBest();

  document.getElementById("card-total-best").innerText = totalShown;
  document.getElementById("steps-final").innerText = statistic.steps;
  document.getElementById("time-final").innerText = document.getElementById("time").innerText;
  document.getElementById("ending-window").classList.toggle("shown");
  document.getElementById("info-bar").classList.toggle("hidden");
}

//restore the card order, time and steps and shows the start menu
function resetGame() {
  const cards = document.querySelectorAll(".card-container.in-game .card");
  cards.forEach((card, index) => {
    card.children[1].firstElementChild.setAttribute("src", originalCardValues[index]);
    card.className = "card";
    card.parentElement.className = "card-container";
  });

  document.getElementById("info-bar").classList.toggle("hidden");
  document.getElementById("ending-window").classList.remove("shown");
  document.getElementById("start-window").classList.add("shown");
  statistic.time = 0;
  statistic.steps = 0;
  document.getElementById("time").innerText = "0:00";
  document.getElementById("steps").innerText = "0";
}

// Stops or restarts the timer and dis/enables click event on the game area
function changePause(btnText, filter, pointerEvents) {
  pauseBtn.innerText = btnText;
  gameArea.style.pointerEvents = pointerEvents;
  gameArea.style.filter = filter;
  const cards = document.querySelectorAll(".card-container.in-game .card");
  cards.forEach(card => {
    cards[i].children[0].style.filter = filter;
    cards[i].children[1].style.filter = filter;
  });
}

// Displays and saves wins, best times and best steps to local storage
function updateBest() {
  let bestTime = parseInt(localStorage.getItem(`${totalShown}-bestTime`));
  bestTime = isNaN(bestTime) || bestTime > statistic.time ? statistic.time : bestTime;
  localStorage.setItem(`${totalShown}-bestTime`, bestTime);
  displayTime(bestTime, "time-best");

  let bestSteps = parseInt(localStorage.getItem(`${totalShown}-bestSteps`));
  bestSteps = isNaN(bestSteps) || bestSteps > statistic.steps ? statistic.steps : bestSteps;
  localStorage.setItem(`${totalShown}-bestSteps`, bestSteps);
  document.getElementById("steps-best").innerText = bestSteps;
}

// Stores the number of wins in the local storage
function getWinsFormStorage() {
  statistic.wins = localStorage.getItem("wins");
  statistic.wins = statistic.wins === null ? 0 : statistic.wins;
}

// Delete all the saved data from the local storage
function clearLocalStorage() {
  localStorage.removeItem("wins");
  const cardTotals = [12, 20, 30, 42];
  cardTotals.forEach(total => {
    localStorage.removeItem(`${total}-bestTime`);
    localStorage.removeItem(`${total}-bestSteps`);
  });
}

// Saves the the card images to an array
function saveOriginalOrder() {
  const cardFronts = document.querySelectorAll(".card-front");
  cardFronts.forEach(cardFront => {
    originalCardValues.push(cardFront.firstElementChild.getAttribute("src"));
  });
}

// Displays the game duration in minutes and seconds
function displayTime(time, timeElement) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  document.getElementById(timeElement).innerText = `${minutes}:${seconds}`;
}

// Starts the timer
function startTimer() {
  timer = setInterval(() => {
    statistic.time++;
    displayTime(statistic.time, "time");
  }, 1000);
}

// Stops the timer
function stopTimer() {
  clearInterval(timer);
}

// Event listeners
window.addEventListener("load", () => {
  saveOriginalOrder();
  getWinsFormStorage();
});

startBtn.addEventListener("click", () => {
  startGame();
});

gameArea.addEventListener("click", e => {
  if (e.target.classList.contains("card-back")) {
    controlCardTurn(e.target.parentElement);
  }
});

newGameBtn.addEventListener("click", () => {
  resetGame();
});

restartBtn.addEventListener("click", () => {
  stopTimer();
  resetGame();
});

pauseBtn.addEventListener("click", () => {
  const pause = pauseBtn.innerText === "Pause";
  if (pause) {
    stopTimer();
    changePause("Continue", "brightness(70%)", "none");
  } else {
    startTimer();
    changePause("Pause", "none", "auto");
  }
});

resetBtn.addEventListener("click", () => {
  clearLocalStorage();
});
