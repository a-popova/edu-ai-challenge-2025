import readline from 'node:readline';

// ==================== CONFIGURATION MODULE ====================
/**
 * Centralized configuration for the Sea Battle game.
 * Contains all game constants, symbols, and messages.
 */
class GameConfiguration {
  // Game dimensions and rules
  static BOARD_SIZE = 10;
  static NUMBER_OF_SHIPS = 3;
  static SHIP_LENGTH = 3;
  
  // Visual symbols used on the game board
  static GAME_SYMBOLS = {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  };
  
  // All user-facing messages centralized for easy localization
  static USER_MESSAGES = {
    // Welcome and setup messages
    WELCOME: "Let's play Sea Battle!",
    BOARDS_CREATED: 'Boards created.',
    SHIPS_PLACED: 'ships placed randomly.',
    
    // Player action feedback
    PLAYER_HIT: 'PLAYER HIT!',
    PLAYER_MISS: 'PLAYER MISS.',
    SHIP_SUNK_BY_PLAYER: 'You sunk an enemy battleship!',
    
    // CPU action feedback  
    CPU_HIT: 'CPU HIT at',
    CPU_MISS: 'CPU MISS at',
    SHIP_SUNK_BY_CPU: 'CPU sunk your battleship!',
    CPU_TURN_ANNOUNCEMENT: "\n--- CPU's Turn ---",
    
    // Game end messages
    PLAYER_VICTORY: '\n*** CONGRATULATIONS! You sunk all enemy battleships! ***',
    CPU_VICTORY: '\n*** GAME OVER! The CPU sunk all your battleships! ***',
    
    // Input validation messages
    INVALID_INPUT_FORMAT: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
    DUPLICATE_GUESS: 'You already guessed that location!',
    GUESS_PROMPT: 'Enter your guess (e.g., 00): ',
    
    // Dynamic message generators
    getInvalidRangeMessage: () => 
      `Oops, please enter valid row and column numbers between 0 and ${GameConfiguration.BOARD_SIZE - 1}.`,
    getTryToSinkMessage: () => 
      `Try to sink the ${GameConfiguration.NUMBER_OF_SHIPS} enemy ships.`
  };
}

// ==================== UTILITIES MODULE ====================
/**
 * Utility functions for common game operations.
 * Provides reusable helper methods for coordinate handling, validation, and random generation.
 */
class GameUtilities {
  /**
   * Parses a location string into row and column integers.
   * @param {string} locationString - Location in format "rc" (e.g., "34")
   * @returns {number[]} Array containing [row, column]
   */
  static parseLocationString(locationString) {
    return [parseInt(locationString[0], 10), parseInt(locationString[1], 10)];
  }

  /**
   * Formats row and column into a location string.
   * @param {number} rowIndex - Row number
   * @param {number} columnIndex - Column number  
   * @returns {string} Location string in format "rc"
   */
  static formatLocationString(rowIndex, columnIndex) {
    return `${rowIndex}${columnIndex}`;
  }

  /**
   * Validates if coordinates are within board boundaries.
   * @param {number} rowIndex - Row to validate
   * @param {number} columnIndex - Column to validate
   * @param {number} boardSize - Size of the game board
   * @returns {boolean} True if coordinates are valid
   */
  static areCoordinatesValid(rowIndex, columnIndex, boardSize = GameConfiguration.BOARD_SIZE) {
    return rowIndex >= 0 && rowIndex < boardSize && 
           columnIndex >= 0 && columnIndex < boardSize;
  }

  /**
   * Generates a random integer between 0 and max (exclusive).
   * @param {number} maxValue - Maximum value (exclusive)
   * @returns {number} Random integer
   */
  static generateRandomInteger(maxValue) {
    return Math.floor(Math.random() * maxValue);
  }

  /**
   * Generates a random boolean value.
   * @returns {boolean} Random true/false
   */
  static generateRandomBoolean() {
    return Math.random() < 0.5;
  }

  /**
   * Creates an empty game grid filled with water symbols.
   * @param {number} gridSize - Size of the grid
   * @returns {string[][]} 2D array representing empty board
   */
  static createEmptyGameGrid(gridSize) {
    return Array(gridSize)
      .fill()
      .map(() => Array(gridSize).fill(GameConfiguration.GAME_SYMBOLS.WATER));
  }

  /**
   * Gets all adjacent coordinates for a given position.
   * @param {number} centerRow - Center row position
   * @param {number} centerColumn - Center column position
   * @returns {Object[]} Array of adjacent coordinate objects
   */
  static getAdjacentCoordinates(centerRow, centerColumn) {
    return [
      { row: centerRow - 1, column: centerColumn }, // North
      { row: centerRow + 1, column: centerColumn }, // South
      { row: centerRow, column: centerColumn - 1 }, // West
      { row: centerRow, column: centerColumn + 1 }  // East
    ];
  }
}

// ==================== DISPLAY MODULE ====================
/**
 * Handles all user interface and display operations.
 * Completely separated from game logic for easy UI replacement.
 */
class UserInterfaceManager {
  /**
   * Displays the welcome message and game instructions.
   */
  static displayWelcomeMessage() {
    console.log(`\n${GameConfiguration.USER_MESSAGES.WELCOME}`);
    console.log(GameConfiguration.USER_MESSAGES.getTryToSinkMessage());
  }

  /**
   * Displays confirmation that game boards have been created.
   */
  static displayBoardCreationConfirmation() {
    console.log(GameConfiguration.USER_MESSAGES.BOARDS_CREATED);
  }

  /**
   * Displays confirmation of ship placement.
   * @param {number} shipCount - Number of ships placed
   */
  static displayShipPlacementConfirmation(shipCount) {
    console.log(`${shipCount} ${GameConfiguration.USER_MESSAGES.SHIPS_PLACED}`);
  }

  /**
   * Displays both game boards side by side.
   * @param {GameBoard} playerGameBoard - Player's board
   * @param {GameBoard} opponentGameBoard - CPU opponent's board
   */
  static displayGameBoards(playerGameBoard, opponentGameBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    const columnHeader = '  ' + Array.from(
      { length: GameConfiguration.BOARD_SIZE }, 
      (_, index) => index
    ).join(' ');
    
    console.log(`${columnHeader}     ${columnHeader}`);

    const opponentDisplayGrid = opponentGameBoard.getDisplayGrid(true);
    const playerDisplayGrid = playerGameBoard.getDisplayGrid(false);

    for (let rowIndex = 0; rowIndex < GameConfiguration.BOARD_SIZE; rowIndex++) {
      const opponentRowDisplay = `${rowIndex} ${opponentDisplayGrid[rowIndex].join(' ')}`;
      const playerRowDisplay = `${rowIndex} ${playerDisplayGrid[rowIndex].join(' ')}`;
      console.log(`${opponentRowDisplay}    ${playerRowDisplay}`);
    }
    console.log('\n');
  }

  /**
   * Displays player hit confirmation.
   */
  static displayPlayerHitConfirmation() {
    console.log(GameConfiguration.USER_MESSAGES.PLAYER_HIT);
  }

  /**
   * Displays player miss notification.
   */
  static displayPlayerMissNotification() {
    console.log(GameConfiguration.USER_MESSAGES.PLAYER_MISS);
  }

  /**
   * Displays CPU turn announcement.
   */
  static displayCpuTurnAnnouncement() {
    console.log(GameConfiguration.USER_MESSAGES.CPU_TURN_ANNOUNCEMENT);
  }

  /**
   * Displays CPU hit notification.
   * @param {string} targetLocation - Location that was hit
   */
  static displayCpuHitNotification(targetLocation) {
    console.log(`${GameConfiguration.USER_MESSAGES.CPU_HIT} ${targetLocation}!`);
  }

  /**
   * Displays CPU miss notification.
   * @param {string} targetLocation - Location that was missed
   */
  static displayCpuMissNotification(targetLocation) {
    console.log(`${GameConfiguration.USER_MESSAGES.CPU_MISS} ${targetLocation}.`);
  }

  /**
   * Displays CPU targeting announcement.
   * @param {string} targetLocation - Location being targeted
   */
  static displayCpuTargetingAnnouncement(targetLocation) {
    console.log(`CPU targets: ${targetLocation}`);
  }

  /**
   * Displays ship sinking notification.
   * @param {boolean} isPlayerVictory - True if player sunk the ship
   */
  static displayShipSinkingNotification(isPlayerVictory) {
    const message = isPlayerVictory 
      ? GameConfiguration.USER_MESSAGES.SHIP_SUNK_BY_PLAYER 
      : GameConfiguration.USER_MESSAGES.SHIP_SUNK_BY_CPU;
    console.log(message);
  }

  /**
   * Displays game end message with final board state.
   * @param {boolean} didPlayerWin - True if player won
   * @param {GameBoard} playerGameBoard - Player's board
   * @param {GameBoard} opponentGameBoard - CPU's board
   */
  static displayGameEndMessage(didPlayerWin, playerGameBoard, opponentGameBoard) {
    const victoryMessage = didPlayerWin 
      ? GameConfiguration.USER_MESSAGES.PLAYER_VICTORY 
      : GameConfiguration.USER_MESSAGES.CPU_VICTORY;
    
    console.log(victoryMessage);
    UserInterfaceManager.displayGameBoards(playerGameBoard, opponentGameBoard);
  }

  /**
   * Displays error messages to the user.
   * @param {string} errorMessage - Error message to display
   */
  static displayErrorMessage(errorMessage) {
    console.log(errorMessage);
  }
}

// ==================== INPUT HANDLER MODULE ====================
/**
 * Manages all user input operations and validation.
 * Handles async input processing and provides validation methods.
 */
class UserInputHandler {
  constructor() {
    this.readlineInterface = null;
  }

  /**
   * Initializes the readline interface for user input.
   */
  initializeInputInterface() {
    this.readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Prompts user with a question and returns their response.
   * @param {string} questionPrompt - Question to ask the user
   * @returns {Promise<string>} User's response
   */
  async promptUserWithQuestion(questionPrompt) {
    return new Promise((resolve) => {
      this.readlineInterface.question(questionPrompt, (userResponse) => {
        resolve(userResponse);
      });
    });
  }

  /**
   * Validates a user's guess input.
   * @param {string} userGuess - The guess to validate
   * @param {string[]} previousGuesses - Array of previous guesses
   * @returns {boolean} True if guess is valid
   */
  validateUserGuess(userGuess, previousGuesses) {
    // Check input format
    if (!userGuess || userGuess.length !== 2) {
      UserInterfaceManager.displayErrorMessage(
        GameConfiguration.USER_MESSAGES.INVALID_INPUT_FORMAT
      );
      return false;
    }

    // Parse and validate coordinates
    const rowIndex = parseInt(userGuess[0], 10);
    const columnIndex = parseInt(userGuess[1], 10);

    if (isNaN(rowIndex) || isNaN(columnIndex) || 
        !GameUtilities.areCoordinatesValid(rowIndex, columnIndex)) {
      UserInterfaceManager.displayErrorMessage(
        GameConfiguration.USER_MESSAGES.getInvalidRangeMessage()
      );
      return false;
    }

    // Check for duplicate guesses
    if (previousGuesses.includes(userGuess)) {
      UserInterfaceManager.displayErrorMessage(
        GameConfiguration.USER_MESSAGES.DUPLICATE_GUESS
      );
      return false;
    }

    return true;
  }

  /**
   * Closes the readline interface and cleans up resources.
   */
  closeInputInterface() {
    if (this.readlineInterface) {
      this.readlineInterface.close();
    }
  }
}

// ==================== SHIP MODEL ====================
/**
 * Represents a ship in the Sea Battle game.
 * Manages ship locations, hit tracking, and sinking status.
 */
class BattleShip {
  /**
   * Creates a new battleship.
   * @param {string[]} shipLocations - Array of location strings
   */
  constructor(shipLocations) {
    this.shipLocations = shipLocations;
    this.hitTracker = new Array(shipLocations.length).fill(false);
  }

  /**
   * Attempts to hit the ship at a specific location.
   * @param {string} targetLocation - Location to attempt hit
   * @returns {boolean} True if hit was successful
   */
  attemptHitAtLocation(targetLocation) {
    const locationIndex = this.shipLocations.indexOf(targetLocation);
    if (locationIndex >= 0) {
      this.hitTracker[locationIndex] = true;
      return true;
    }
    return false;
  }

  /**
   * Checks if the ship is completely sunk.
   * @returns {boolean} True if all parts of ship are hit
   */
  isCompletelyDestroyed() {
    return this.hitTracker.every(isHit => isHit);
  }

  /**
   * Checks if a specific location on the ship has been hit.
   * @param {string} queryLocation - Location to check
   * @returns {boolean} True if location has been hit
   */
  isLocationAlreadyHit(queryLocation) {
    const locationIndex = this.shipLocations.indexOf(queryLocation);
    return locationIndex >= 0 && this.hitTracker[locationIndex];
  }
}

// ==================== BOARD MODEL ====================
/**
 * Represents the game board and manages ship placement and attacks.
 * Handles grid state, ship management, and attack processing.
 */
class GameBoard {
  /**
   * Creates a new game board.
   * @param {number} boardSize - Size of the square board
   */
  constructor(boardSize = GameConfiguration.BOARD_SIZE) {
    this.boardSize = boardSize;
    this.gameGrid = GameUtilities.createEmptyGameGrid(boardSize);
    this.deployedShips = [];
  }

  /**
   * Places ships randomly on the board.
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} lengthOfShips - Length of each ship
   */
  deployShipsRandomly(numberOfShips, lengthOfShips) {
    let successfullyPlacedShips = 0;
    
    while (successfullyPlacedShips < numberOfShips) {
      const candidateShip = this._generateRandomShipPlacement(lengthOfShips);
      
      if (candidateShip && this._canShipBePlacedAtLocations(candidateShip.shipLocations)) {
        this.deployedShips.push(candidateShip);
        this._markShipLocationsOnGrid(candidateShip.shipLocations);
        successfullyPlacedShips++;
      }
    }
    
    UserInterfaceManager.displayShipPlacementConfirmation(numberOfShips);
  }

  /**
   * Generates a random ship placement.
   * @param {number} shipLength - Length of ship to generate
   * @returns {BattleShip|null} Generated ship or null if invalid
   * @private
   */
  _generateRandomShipPlacement(shipLength) {
    const isHorizontalOrientation = GameUtilities.generateRandomBoolean();
    let startingRow, startingColumn;

    // Calculate valid starting positions based on orientation
    if (isHorizontalOrientation) {
      startingRow = GameUtilities.generateRandomInteger(this.boardSize);
      startingColumn = GameUtilities.generateRandomInteger(this.boardSize - shipLength + 1);
    } else {
      startingRow = GameUtilities.generateRandomInteger(this.boardSize - shipLength + 1);
      startingColumn = GameUtilities.generateRandomInteger(this.boardSize);
    }

    // Generate ship locations
    const shipLocationStrings = [];
    for (let segmentIndex = 0; segmentIndex < shipLength; segmentIndex++) {
      const segmentRow = isHorizontalOrientation ? startingRow : startingRow + segmentIndex;
      const segmentColumn = isHorizontalOrientation ? startingColumn + segmentIndex : startingColumn;
      shipLocationStrings.push(GameUtilities.formatLocationString(segmentRow, segmentColumn));
    }

    return new BattleShip(shipLocationStrings);
  }

  /**
   * Checks if a ship can be placed at the specified locations.
   * @param {string[]} proposedLocations - Locations to check
   * @returns {boolean} True if ship can be placed
   * @private
   */
  _canShipBePlacedAtLocations(proposedLocations) {
    return proposedLocations.every(locationString => {
      const [rowIndex, columnIndex] = GameUtilities.parseLocationString(locationString);
      return GameUtilities.areCoordinatesValid(rowIndex, columnIndex, this.boardSize) && 
             this.gameGrid[rowIndex][columnIndex] === GameConfiguration.GAME_SYMBOLS.WATER;
    });
  }

  /**
   * Marks ship locations on the game grid.
   * @param {string[]} shipLocations - Locations to mark
   * @param {string} markingSymbol - Symbol to use for marking
   * @private
   */
  _markShipLocationsOnGrid(shipLocations, markingSymbol = GameConfiguration.GAME_SYMBOLS.SHIP) {
    shipLocations.forEach(locationString => {
      const [rowIndex, columnIndex] = GameUtilities.parseLocationString(locationString);
      this.gameGrid[rowIndex][columnIndex] = markingSymbol;
    });
  }

  /**
   * Processes an attack on the board.
   * @param {string} attackLocation - Location being attacked
   * @returns {Object} Attack result with hit/sunk information
   */
  processAttackAtLocation(attackLocation) {
    const [targetRow, targetColumn] = GameUtilities.parseLocationString(attackLocation);
    
    // Check each ship for hits
    for (const ship of this.deployedShips) {
      if (ship.attemptHitAtLocation(attackLocation)) {
        this.gameGrid[targetRow][targetColumn] = GameConfiguration.GAME_SYMBOLS.HIT;
        return {
          wasHit: true,
          wasShipSunk: ship.isCompletelyDestroyed(),
          hitShip: ship
        };
      }
    }
    
    // No ship hit - mark as miss
    this.gameGrid[targetRow][targetColumn] = GameConfiguration.GAME_SYMBOLS.MISS;
    return { wasHit: false, wasShipSunk: false };
  }

  /**
   * Gets the display version of the grid.
   * @param {boolean} shouldHideShips - Whether to hide ship symbols
   * @returns {string[][]} Grid for display
   */
  getDisplayGrid(shouldHideShips = false) {
    if (!shouldHideShips) return this.gameGrid;
    
    return this.gameGrid.map(gridRow => 
      gridRow.map(cellSymbol => 
        cellSymbol === GameConfiguration.GAME_SYMBOLS.SHIP 
          ? GameConfiguration.GAME_SYMBOLS.WATER 
          : cellSymbol
      )
    );
  }

  /**
   * Counts remaining active ships.
   * @returns {number} Number of ships not yet sunk
   */
  countRemainingActiveShips() {
    return this.deployedShips.filter(ship => !ship.isCompletelyDestroyed()).length;
  }
}

// ==================== CPU AI MODULE ====================
/**
 * Artificial Intelligence for CPU opponent.
 * Implements hunt/target strategy for intelligent gameplay.
 */
class CpuOpponentAI {
  /**
   * Creates a new CPU AI instance.
   * @param {number} gameBoardSize - Size of the game board
   */
  constructor(gameBoardSize = GameConfiguration.BOARD_SIZE) {
    this.gameBoardSize = gameBoardSize;
    this.previousGuesses = [];
    this.currentStrategyMode = 'hunt';
    this.priorityTargetQueue = [];
  }

  /**
   * Makes the next strategic guess.
   * @returns {string} Location string for next guess
   */
  makeStrategicGuess() {
    let selectedGuess;
    
    if (this.currentStrategyMode === 'target' && this.priorityTargetQueue.length > 0) {
      selectedGuess = this.priorityTargetQueue.shift();
      UserInterfaceManager.displayCpuTargetingAnnouncement(selectedGuess);
    } else {
      this.currentStrategyMode = 'hunt';
      selectedGuess = this._generateRandomHuntingGuess();
    }

    this.previousGuesses.push(selectedGuess);
    return selectedGuess;
  }

  /**
   * Generates a random guess for hunting mode.
   * @returns {string} Random location string
   * @private
   */
  _generateRandomHuntingGuess() {
    let candidateGuess;
    do {
      const randomRow = GameUtilities.generateRandomInteger(this.gameBoardSize);
      const randomColumn = GameUtilities.generateRandomInteger(this.gameBoardSize);
      candidateGuess = GameUtilities.formatLocationString(randomRow, randomColumn);
    } while (this.previousGuesses.includes(candidateGuess));
    
    return candidateGuess;
  }

  /**
   * Processes the result of an attack and updates strategy.
   * @param {string} attackLocation - Location that was attacked
   * @param {Object} attackResult - Result of the attack
   */
  updateStrategyBasedOnAttackResult(attackLocation, attackResult) {
    if (attackResult.wasHit) {
      if (attackResult.wasShipSunk) {
        // Ship destroyed - return to hunting mode
        this.currentStrategyMode = 'hunt';
        this.priorityTargetQueue = [];
      } else {
        // Ship hit but not sunk - switch to targeting mode
        this.currentStrategyMode = 'target';
        this._addAdjacentLocationsToTargetQueue(attackLocation);
      }
    } else if (this.currentStrategyMode === 'target' && this.priorityTargetQueue.length === 0) {
      // No more targets - return to hunting
      this.currentStrategyMode = 'hunt';
    }
  }

  /**
   * Adds adjacent locations to the target queue for follow-up attacks.
   * @param {string} centerLocation - Location to find adjacents for
   * @private
   */
  _addAdjacentLocationsToTargetQueue(centerLocation) {
    const [centerRow, centerColumn] = GameUtilities.parseLocationString(centerLocation);
    const adjacentCoordinates = GameUtilities.getAdjacentCoordinates(centerRow, centerColumn);

    adjacentCoordinates.forEach(({ row, column }) => {
      if (GameUtilities.areCoordinatesValid(row, column, this.gameBoardSize)) {
        const adjacentLocationString = GameUtilities.formatLocationString(row, column);
        
        if (!this.previousGuesses.includes(adjacentLocationString) && 
            !this.priorityTargetQueue.includes(adjacentLocationString)) {
          this.priorityTargetQueue.push(adjacentLocationString);
        }
      }
    });
  }
}

// ==================== GAME ENGINE (LOGIC) ====================
/**
 * Core game logic engine.
 * Manages game state, player/CPU turns, and win conditions.
 */
class SeaBattleGameEngine {
  constructor() {
    this.playerGameBoard = new GameBoard();
    this.cpuOpponentBoard = new GameBoard();
    this.cpuArtificialIntelligence = new CpuOpponentAI();
    this.playerGuessHistory = [];
  }

  /**
   * Initializes a new game with ship placement.
   */
  initializeNewGame() {
    UserInterfaceManager.displayBoardCreationConfirmation();
    
    this.playerGameBoard.deployShipsRandomly(
      GameConfiguration.NUMBER_OF_SHIPS, 
      GameConfiguration.SHIP_LENGTH
    );
    
    this.cpuOpponentBoard.deployShipsRandomly(
      GameConfiguration.NUMBER_OF_SHIPS, 
      GameConfiguration.SHIP_LENGTH
    );
  }

  /**
   * Processes a player's turn and attack.
   * @param {string} playerGuess - Location of player's attack
   * @returns {Object} Result of the attack
   */
  executePlayerTurn(playerGuess) {
    this.playerGuessHistory.push(playerGuess);
    const attackResult = this.cpuOpponentBoard.processAttackAtLocation(playerGuess);

    if (attackResult.wasHit) {
      UserInterfaceManager.displayPlayerHitConfirmation();
      if (attackResult.wasShipSunk) {
        UserInterfaceManager.displayShipSinkingNotification(true);
      }
    } else {
      UserInterfaceManager.displayPlayerMissNotification();
    }

    return attackResult;
  }

  /**
   * Processes the CPU opponent's turn.
   * @returns {Object} Result of CPU's attack
   */
  executeCpuOpponentTurn() {
    UserInterfaceManager.displayCpuTurnAnnouncement();
    
    const cpuGuess = this.cpuArtificialIntelligence.makeStrategicGuess();
    const attackResult = this.playerGameBoard.processAttackAtLocation(cpuGuess);

    if (attackResult.wasHit) {
      UserInterfaceManager.displayCpuHitNotification(cpuGuess);
      if (attackResult.wasShipSunk) {
        UserInterfaceManager.displayShipSinkingNotification(false);
      }
    } else {
      UserInterfaceManager.displayCpuMissNotification(cpuGuess);
    }

    this.cpuArtificialIntelligence.updateStrategyBasedOnAttackResult(cpuGuess, attackResult);
    return attackResult;
  }

  /**
   * Checks if the game has ended and determines winner.
   * @returns {string} Game status: 'player_wins', 'cpu_wins', or 'continue'
   */
  evaluateGameEndConditions() {
    const playerShipsRemaining = this.playerGameBoard.countRemainingActiveShips();
    const cpuShipsRemaining = this.cpuOpponentBoard.countRemainingActiveShips();

    if (cpuShipsRemaining === 0) {
      return 'player_wins';
    }

    if (playerShipsRemaining === 0) {
      return 'cpu_wins';
    }

    return 'continue';
  }

  /**
   * Gets the current state of the game.
   * @returns {Object} Current game state
   */
  getCurrentGameState() {
    return {
      playerBoard: this.playerGameBoard,
      cpuBoard: this.cpuOpponentBoard,
      playerGuesses: this.playerGuessHistory
    };
  }
}

// ==================== GAME CONTROLLER (MVC Controller) ====================
/**
 * Main game controller following MVC pattern.
 * Orchestrates all game components and manages application flow.
 */
class SeaBattleGameController {
  constructor() {
    this.gameEngine = new SeaBattleGameEngine();
    this.inputHandler = new UserInputHandler();
  }

  /**
   * Starts the game application.
   */
  async startGameApplication() {
    try {
      await this.initializeGameComponents();
      await this.executeMainGameLoop();
    } catch (gameError) {
      console.error('Game error occurred:', gameError);
    } finally {
      this.performCleanupOperations();
    }
  }

  /**
   * Initializes all game components and displays welcome.
   */
  async initializeGameComponents() {
    this.inputHandler.initializeInputInterface();
    UserInterfaceManager.displayWelcomeMessage();
    this.gameEngine.initializeNewGame();
  }

  /**
   * Main game loop that continues until game ends.
   */
  async executeMainGameLoop() {
    while (true) {
      const currentGameStatus = this.gameEngine.evaluateGameEndConditions();
      
      if (currentGameStatus !== 'continue') {
        this.handleGameEndScenario(currentGameStatus);
        return;
      }

      this.displayCurrentGameState();
      
      // Execute player turn
      await this.handlePlayerTurnSequence();
      
      // Check if player won after their turn
      if (this.gameEngine.evaluateGameEndConditions() !== 'continue') {
        this.handleGameEndScenario(this.gameEngine.evaluateGameEndConditions());
        return;
      }

      // Execute CPU turn
      this.gameEngine.executeCpuOpponentTurn();
    }
  }

  /**
   * Displays the current state of both game boards.
   */
  displayCurrentGameState() {
    const gameState = this.gameEngine.getCurrentGameState();
    UserInterfaceManager.displayGameBoards(gameState.playerBoard, gameState.cpuBoard);
  }

  /**
   * Handles the player's turn sequence with input validation.
   */
  async handlePlayerTurnSequence() {
    let isValidGuessReceived = false;
    
    while (!isValidGuessReceived) {
      const playerInput = await this.inputHandler.promptUserWithQuestion(
        GameConfiguration.USER_MESSAGES.GUESS_PROMPT
      );
      
      const currentGameState = this.gameEngine.getCurrentGameState();
      
      if (this.inputHandler.validateUserGuess(playerInput, currentGameState.playerGuesses)) {
        this.gameEngine.executePlayerTurn(playerInput);
        isValidGuessReceived = true;
      }
    }
  }

  /**
   * Handles game end scenarios and displays final results.
   * @param {string} gameEndStatus - How the game ended
   */
  handleGameEndScenario(gameEndStatus) {
    const finalGameState = this.gameEngine.getCurrentGameState();
    const didPlayerWin = gameEndStatus === 'player_wins';
    
    UserInterfaceManager.displayGameEndMessage(
      didPlayerWin, 
      finalGameState.playerBoard, 
      finalGameState.cpuBoard
    );
  }

  /**
   * Performs cleanup operations when game ends.
   */
  performCleanupOperations() {
    this.inputHandler.closeInputInterface();
  }
}

// ==================== EXPORTS FOR TESTING ====================
export {
  GameConfiguration,
  GameUtilities,
  UserInterfaceManager,
  UserInputHandler,
  BattleShip,
  GameBoard,
  CpuOpponentAI,
  SeaBattleGameEngine,
  SeaBattleGameController
};

// ==================== MAIN EXECUTION ====================
/**
 * Application entry point.
 * Creates and starts the main game controller.
 */
// Run the game if this is the main module
const isMainModule = process.argv[1] && process.argv[1].includes('seabattle.js');
if (isMainModule) {
  const seaBattleGame = new SeaBattleGameController();
  seaBattleGame.startGameApplication().catch(console.error);
}
