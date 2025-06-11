Sea Battle CLI Game
This is a simple command-line interface (CLI) implementation of the classic Sea Battle (Battleship) game, written in JavaScript.

Gameplay
You play against a CPU opponent. Both players place their ships on a 10x10 grid. Players take turns guessing coordinates to hit the opponent's ships. The first player to sink all of the opponent's ships wins.

~ represents water (unknown).
S represents your ships on your board.
X represents a hit (on either board).
O represents a miss (on either board).

### **🎮 How to Run the Game**
Ensure you have Node.js installed. You can download it from https://nodejs.org/.

```bash
# Navigate to the game directory
cd task7

# Run the game
node seabattle.js

# Or use npm script
npm start
```

### ** How to test**

```bash
npm test

# Test with coverage
npm test:coverage
```