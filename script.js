let playerPasswords = {};
let playerNames = [];
let playerCards = [];
let currentPlayer = 1;
let totalPlayers = 3;  // Default to 3 players
let selectedCard = null; // Track the selected card

// Game setup
function setupGame() {
    totalPlayers = parseInt(document.getElementById("player-count").value);
    if (totalPlayers < 2 || totalPlayers > 6) {
        alert("Please choose a number between 2 and 6.");
        return;
    }

    // Hide the setup and show name and password setup
    document.getElementById("game-setup").style.display = "none";
    document.getElementById("player-name-setup").style.display = "block";

    // Generate player name inputs dynamically
    let playersContainer = document.getElementById("players-container");
    playersContainer.innerHTML = ''; // Clear any previous input fields

    for (let i = 1; i <= totalPlayers; i++) {
        playersContainer.innerHTML += `
            <div class="player-input">
                <label for="player-name-${i}">Player ${i} Name:</label>
                <input type="text" id="player-name-${i}" placeholder="Enter name" />
                <label for="player-password-${i}">Password (2 digits):</label>
                <input type="password" id="player-password-${i}" maxlength="2" placeholder="••" />
            </div>
        `;
    }
}

function saveAllPasswords() {
    let allValid = true;
    for (let i = 1; i <= totalPlayers; i++) {
        let playerName = document.getElementById(`player-name-${i}`).value;
        let playerPassword = document.getElementById(`player-password-${i}`).value;

        if (!playerName || playerPassword.length !== 2 || isNaN(playerPassword)) {
            allValid = false;
            alert(`Please provide valid name and 2-digit password for Player ${i}.`);
            break;
        }

        playerNames.push(playerName);
        playerPasswords[i] = playerPassword;
    }

    if (allValid) {
        document.getElementById("player-name-setup").style.display = "none";
        document.getElementById("game-board").style.display = "block";

        // Initialize players in the game board dynamically
        let playersBoard = document.getElementById("players-board");
        playersBoard.innerHTML = '';

        for (let i = 1; i <= totalPlayers; i++) {
            playersBoard.innerHTML += `
                <div class="player" id="player-${i}">
                    <h3>${playerNames[i - 1]}</h3>
                    <button class="view-cards-btn" onclick="promptPassword(${i})">View Cards</button>
                    <div class="player-cards" id="player${i}-cards" style="display: none;"></div>
                    <div class="player-turn" id="turn-player-${i}" style="display: none;">
                        <h4>Pass your card:</h4>
                    </div>
                </div>
            `;
        }

        // Initialize cards for each player (N cards for each player with their name)
        initializeCards();
    }
}

function initializeCards() {
    // Create an array where each player gets N cards with their own name
    let cardDeck = [];
    for (let i = 0; i < totalPlayers; i++) {
        for (let j = 0; j < totalPlayers; j++) {
            cardDeck.push(playerNames[i]);
        }
    }

    // Shuffle the deck
    shuffle(cardDeck);

    // Distribute cards to players
    for (let i = 0; i < totalPlayers; i++) {
        playerCards[i] = [];
        for (let j = 0; j < totalPlayers; j++) {
            playerCards[i].push(cardDeck.pop());
        }
    }
}

// Function to shuffle an array (cards)
function shuffle(array) {
    let currentIndex = array.length, randomIndex, temporaryValue;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Password Modal for each player
function promptPassword(playerId) {
    currentPlayer = playerId;
    document.getElementById("password-modal").style.display = "block";
    document.getElementById("password-error").innerText = "";
}

function checkPassword() {
    let passwordInput = document.getElementById("password-input-modal").value;

    if (passwordInput === playerPasswords[currentPlayer]) {
        document.getElementById("password-modal").style.display = "none";
        showPlayerCards(currentPlayer);
    } else {
        document.getElementById("password-error").innerText = "Incorrect password, please try again.";
    }
}

function showPlayerCards(playerId) {
    let cardsContainer = document.getElementById(`player${playerId}-cards`);
    cardsContainer.style.display = 'block';
    cardsContainer.innerHTML = '';

    // Add buttons for each card
    playerCards[playerId - 1].forEach((card, index) => {
        cardsContainer.innerHTML += `
            <button class="card-button" onclick="passCard(${playerId}, ${index})">${card}</button>
        `;
    });

    // Show player turn
    let turnDiv = document.getElementById(`turn-player-${playerId}`);
    turnDiv.style.display = 'block';
}

function passCard(playerId, cardIndex) {
    let selectedCard = playerCards[playerId - 1][cardIndex];

    // Ask which player the card is being passed to
    let targetPlayer = currentPlayer === totalPlayers ? 1 : currentPlayer + 1;

    // Remove the selected card from the current player's hand
    playerCards[playerId - 1].splice(cardIndex, 1);

    // Add the card to the target player's hand
    playerCards[targetPlayer - 1].push(selectedCard);

    // Update the visual display of cards
    updatePlayerCards(playerId);
    updatePlayerCards(targetPlayer);

    // Show the passed card in a popup
    alert(`Player ${playerId} passed card: ${selectedCard} to Player ${targetPlayer}`);
    
    hideCardsAfterPassing(playerId);

    // Check if any player has won after the pass
    checkWinner();

    // Move to next player after card is passed
    nextTurn();
}

// Function to update the displayed cards for a player
function updatePlayerCards(playerId) {
    let cardsContainer = document.getElementById(`player${playerId}-cards`);
    cardsContainer.innerHTML = '';

    // Add buttons for each card
    playerCards[playerId - 1].forEach((card, index) => {
        cardsContainer.innerHTML += `
            <button class="card-button" onclick="passCard(${playerId}, ${index})">${card}</button>
        `;
    });
}

// Hide cards after passing
function hideCardsAfterPassing(playerId) {
    // Hide the cards of the current player after passing
    let cardsContainer = document.getElementById(`player${playerId}-cards`);
    cardsContainer.style.display = 'none';
}

// Function to check if a player has won (any N identical cards)
function checkWinner() {
    for (let i = 0; i < totalPlayers; i++) {
        const cardCount = {};

        // Count the number of identical cards a player has
        playerCards[i].forEach(card => {
            cardCount[card] = (cardCount[card] || 0) + 1;
        });

        // If any card appears N times, the player wins
        for (const card in cardCount) {
            if (cardCount[card] === totalPlayers) {
                alert(`${playerNames[i]} wins with ${cardCount[card]} ${card} cards!`);
                resetGame();
                return;
            }
        }
    }
}

// Reset the game when a player wins
function resetGame() {
    // Reset all game data and UI
    playerCards = [];
    setupGame();
}

// Function to switch to the next player's turn
function nextTurn() {
    // Hide current player's turn
    document.getElementById(`turn-player-${currentPlayer}`).style.display = 'none';

    // Move to next player
    currentPlayer = currentPlayer === totalPlayers ? 1 : currentPlayer + 1;

    // Show next player's turn UI
    document.getElementById(`turn-player-${currentPlayer}`).style.display = 'block';
}
