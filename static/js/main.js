const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const DEFAULT_VALUES = {
    '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
    '7': 0, '8': 0, '9': 0,
    '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
}

class Deck {
    constructor(numDecks = 1, existingCards = null) {
        this.numDecks = numDecks;
        if (existingCards) {
            this.cards = existingCards;
        } else {
            this.cards = [];
            this.build();
            this.shuffle();
        }
    }

    build() {
        for (let i = 0; i < this.numDecks; i++) {
            for (let suit of SUITS) {
                for (let rank of RANKS) {
                    this.cards.push(new Card(suit, rank));
                }
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.length > 0 ? this.cards.pop() : null;
    }

    remainingCards() {
        return this.cards.length;
    }
}

class GameState {
    constructor() {
        // Load settings
        const storedSettings = JSON.parse(localStorage.getItem('cardCounterSettings') || '{}');
        this.numDecks = storedSettings.numDecks || 1;
        this.customValues = storedSettings.customValues || { ...DEFAULT_VALUES };

        // Load state or initialize
        const storedStateStr = localStorage.getItem('cardCounterState');
        if (storedStateStr) {
            const storedState = JSON.parse(storedStateStr);
            this.deck = new Deck(storedState.numDecks, storedState.cards);
            this.runningCount = storedState.runningCount;
        } else {
            this.deck = new Deck(this.numDecks);
            this.runningCount = 0;
            this.saveState();
        }
    }

    drawCard() {
        const card = this.deck.draw();
        if (card) {
            this.runningCount += (this.customValues[card.rank] || 0);
            this.saveState();
        }
        return card;
    }

    reshuffle() {
        this.deck = new Deck(this.numDecks);
        this.runningCount = 0;
        this.saveState();
    }

    saveState() {
        const stateToSave = {
            numDecks: this.numDecks,
            cards: this.deck.cards,
            runningCount: this.runningCount
        };
        localStorage.setItem('cardCounterState', JSON.stringify(stateToSave));
    }

    getState() {
        return {
            remaining_cards: this.deck.remainingCards(),
            running_count: this.runningCount
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const deckEl = document.getElementById('deck');
    const revealedArea = document.getElementById('revealed-area');
    const remainingCardsEl = document.getElementById('remaining-cards');
    const hiddenCountEl = document.getElementById('hidden-count');
    const toggleCountBtn = document.getElementById('toggle-count-btn');
    const reshuffleBtn = document.getElementById('reshuffle-btn');

    // State Variables
    let cardZIndex = 1;
    let cardHistory = [];
    const MAX_VISIBLE_CARDS = 3;

    // Initialize Game Logic locally
    const game = new GameState();
    updateUIState(game.getState());

    // Event Listeners
    deckEl.addEventListener('click', () => {
        const card = game.drawCard();
        if (card) {
            animateNewCard(card);
            updateUIState(game.getState());
        } else {
            alert("Deck is empty. Please reshuffle.");
        }
    });

    toggleCountBtn.addEventListener('click', () => {
        hiddenCountEl.classList.toggle('show');
        if (hiddenCountEl.classList.contains('show')) {
            toggleCountBtn.textContent = 'Hide True Count';
        } else {
            toggleCountBtn.textContent = 'Show True Count';
        }
    });

    reshuffleBtn.addEventListener('click', () => {
        game.reshuffle();
        updateUIState(game.getState());
        clearRevealedCards();
    });

    // Core Functions
    function updateUIState(state) {
        remainingCardsEl.textContent = state.remaining_cards;
        hiddenCountEl.textContent = state.running_count > 0 ? `+${state.running_count}` : state.running_count;

        // Add visual empty state for deck
        if (state.remaining_cards === 0) {
            deckEl.style.opacity = '0.3';
            deckEl.style.pointerEvents = 'none';
        } else {
            deckEl.style.opacity = '1';
            deckEl.style.pointerEvents = 'auto';
        }
    }

    function animateNewCard(cardObj) {
        // 1. Create card DOM element
        const cardEl = document.createElement('div');

        // Determine suit symbol and color
        let suitSymbol = '';
        let colorClass = 'black';
        switch (cardObj.suit) {
            case 'Hearts': suitSymbol = '♥'; colorClass = 'red'; break;
            case 'Diamonds': suitSymbol = '♦'; colorClass = 'red'; break;
            case 'Spades': suitSymbol = '♠'; colorClass = 'black'; break;
            case 'Clubs': suitSymbol = '♣'; colorClass = 'black'; break;
        }

        cardEl.className = `playing-card ${colorClass}`;

        // Subtle random rotation for a messy pile effect
        const randomRot = (Math.random() * 10 - 5).toFixed(1) + 'deg';
        cardEl.style.setProperty('--rot', randomRot);
        cardEl.style.setProperty('--z', cardZIndex++);

        cardEl.innerHTML = `
            <div class="card-center">
                <div class="card-rank">${cardObj.rank}</div>
                <div class="card-suit">${suitSymbol}</div>
            </div>
        `;

        revealedArea.appendChild(cardEl);
        cardHistory.push(cardEl);

        // 2. Trigger animation by adding the enter class shortly after append
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                cardEl.classList.add('card-enter');
            });
        });

        // 3. Clean up older cards to prevent DOM bloat and messy UI
        if (cardHistory.length > MAX_VISIBLE_CARDS) {
            const oldCard = cardHistory.shift();
            // animate out
            oldCard.classList.remove('card-enter');
            oldCard.classList.add('card-exit');

            // remove after transition
            setTimeout(() => {
                if (oldCard.parentNode) {
                    oldCard.parentNode.removeChild(oldCard);
                }
            }, 400); // matches transition time
        }
    }

    function clearRevealedCards() {
        // Animate all out
        cardHistory.forEach(card => {
            card.classList.remove('card-enter');
            card.classList.add('card-exit');
        });

        setTimeout(() => {
            revealedArea.innerHTML = '';
            cardHistory = [];
            cardZIndex = 1;
        }, 400);
    }
});
