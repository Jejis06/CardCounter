# Blackjack Card Counting Trainer 🃏

A lightning-fast, zero-latency static web application for practicing and mastering Blackjack card counting.

**[Play the game live here!](https://jejis06.github.io/CardCounter/)**

## Features
- **Zero Latency:** Runs entirely client-side using Javascript, meaning instant card drawing without any network lag.
- **Customizable Point Values:** Tweak the core counting value of any specific rank (2 to Ace) natively in the settings menu.
- **Multiple Decks:** Support for practicing with an infinite shoe, scaled from 1 deck to 8 decks.
- **Persistent State:** If you accidentally refresh the page, your customized settings, leftover deck, and counted cards are fully preserved using `localStorage`. 
- **Casino Aesthetic:** Toggle seamlessly between a Light Mode and Dark Mode pastel felt aesthetic.
- **Mobile Responsive:** Perfect for practicing on the go, with cards that smoothly scale down perfectly to fit phone screens without overflowing text.

## Usage
Simply click the deck of cards in the center to deal out the next card. The app will maintain a running "True Count" based on your settings, which stays hidden until you decide to check your math via the "Show True Count" button. Once the deck is empty or you want to start fresh, simply hit "Reshuffle".

## Development
Because this project does not rely on a backend like Node or Flask, hosting and testing it locally is incredibly simple. 
Simply serve the files from the root directory using any local server, such as python:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.
