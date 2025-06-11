import {
  GameConfiguration,
  GameUtilities,
  UserInterfaceManager,
  UserInputHandler,
  BattleShip,
  GameBoard,
  CpuOpponentAI,
  SeaBattleGameEngine,
  SeaBattleGameController
} from './seabattle.js';

// Mock console methods to avoid cluttering test output
const consoleSpy = {
  log: (...args) => {},
  error: (...args) => {}
};

// Mock console for tests
beforeAll(() => {
  global.console = { ...console, ...consoleSpy };
});

afterAll(() => {
  global.console = console;
});

describe('GameConfiguration', () => {
  test('should have correct board size', () => {
    expect(GameConfiguration.BOARD_SIZE).toBe(10);
  });

  test('should have correct number of ships', () => {
    expect(GameConfiguration.NUMBER_OF_SHIPS).toBe(3);
  });

  test('should have correct ship length', () => {
    expect(GameConfiguration.SHIP_LENGTH).toBe(3);
  });

  test('should have all required game symbols', () => {
    const symbols = GameConfiguration.GAME_SYMBOLS;
    expect(symbols.WATER).toBe('~');
    expect(symbols.SHIP).toBe('S');
    expect(symbols.HIT).toBe('X');
    expect(symbols.MISS).toBe('O');
  });

  test('should have all required user messages', () => {
    const messages = GameConfiguration.USER_MESSAGES;
    expect(messages.WELCOME).toBe("Let's play Sea Battle!");
    expect(messages.PLAYER_HIT).toBe('PLAYER HIT!');
    expect(messages.PLAYER_MISS).toBe('PLAYER MISS.');
    expect(messages.CPU_HIT).toBe('CPU HIT at');
    expect(messages.DUPLICATE_GUESS).toBe('You already guessed that location!');
  });

  test('should generate dynamic invalid range message', () => {
    const message = GameConfiguration.USER_MESSAGES.getInvalidRangeMessage();
    expect(message).toContain('0 and 9');
  });

  test('should generate dynamic try to sink message', () => {
    const message = GameConfiguration.USER_MESSAGES.getTryToSinkMessage();
    expect(message).toContain('3 enemy ships');
  });
});

describe('GameUtilities', () => {
  describe('parseLocationString', () => {
    test('should correctly parse location string', () => {
      expect(GameUtilities.parseLocationString('34')).toEqual([3, 4]);
      expect(GameUtilities.parseLocationString('00')).toEqual([0, 0]);
      expect(GameUtilities.parseLocationString('99')).toEqual([9, 9]);
    });
  });

  describe('formatLocationString', () => {
    test('should correctly format coordinates to string', () => {
      expect(GameUtilities.formatLocationString(3, 4)).toBe('34');
      expect(GameUtilities.formatLocationString(0, 0)).toBe('00');
      expect(GameUtilities.formatLocationString(9, 9)).toBe('99');
    });
  });

  describe('areCoordinatesValid', () => {
    test('should validate coordinates within board boundaries', () => {
      expect(GameUtilities.areCoordinatesValid(0, 0)).toBe(true);
      expect(GameUtilities.areCoordinatesValid(9, 9)).toBe(true);
      expect(GameUtilities.areCoordinatesValid(5, 5)).toBe(true);
    });

    test('should reject coordinates outside board boundaries', () => {
      expect(GameUtilities.areCoordinatesValid(-1, 0)).toBe(false);
      expect(GameUtilities.areCoordinatesValid(0, -1)).toBe(false);
      expect(GameUtilities.areCoordinatesValid(10, 5)).toBe(false);
      expect(GameUtilities.areCoordinatesValid(5, 10)).toBe(false);
    });

    test('should work with custom board size', () => {
      expect(GameUtilities.areCoordinatesValid(7, 7, 8)).toBe(true);
      expect(GameUtilities.areCoordinatesValid(8, 8, 8)).toBe(false);
    });
  });

  describe('generateRandomInteger', () => {
    test('should generate numbers within range', () => {
      for (let i = 0; i < 100; i++) {
        const num = GameUtilities.generateRandomInteger(10);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThan(10);
      }
    });

    test('should handle edge case of max 1', () => {
      const num = GameUtilities.generateRandomInteger(1);
      expect(num).toBe(0);
    });
  });

  describe('generateRandomBoolean', () => {
    test('should generate boolean values', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(GameUtilities.generateRandomBoolean());
      }
      
      const trueCount = results.filter(r => r === true).length;
      const falseCount = results.filter(r => r === false).length;
      
      expect(trueCount + falseCount).toBe(100);
      expect(trueCount).toBeGreaterThan(0);
      expect(falseCount).toBeGreaterThan(0);
    });
  });

  describe('createEmptyGameGrid', () => {
    test('should create grid with correct dimensions', () => {
      const grid = GameUtilities.createEmptyGameGrid(5);
      expect(grid).toHaveLength(5);
      expect(grid[0]).toHaveLength(5);
      expect(grid[4]).toHaveLength(5);
    });

    test('should fill grid with water symbols', () => {
      const grid = GameUtilities.createEmptyGameGrid(3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(grid[i][j]).toBe('~');
        }
      }
    });
  });

  describe('getAdjacentCoordinates', () => {
    test('should return four adjacent coordinates', () => {
      const adjacent = GameUtilities.getAdjacentCoordinates(5, 5);
      expect(adjacent).toHaveLength(4);
      
      expect(adjacent).toContainEqual({ row: 4, column: 5 }); // North
      expect(adjacent).toContainEqual({ row: 6, column: 5 }); // South
      expect(adjacent).toContainEqual({ row: 5, column: 4 }); // West
      expect(adjacent).toContainEqual({ row: 5, column: 6 }); // East
    });

    test('should handle edge coordinates', () => {
      const adjacent = GameUtilities.getAdjacentCoordinates(0, 0);
      expect(adjacent).toHaveLength(4);
      
      expect(adjacent).toContainEqual({ row: -1, column: 0 });
      expect(adjacent).toContainEqual({ row: 1, column: 0 });
      expect(adjacent).toContainEqual({ row: 0, column: -1 });
      expect(adjacent).toContainEqual({ row: 0, column: 1 });
    });
  });
});

describe('BattleShip', () => {
  let ship;

  beforeEach(() => {
    ship = new BattleShip(['12', '13', '14']);
  });

  describe('constructor', () => {
    test('should initialize with correct locations', () => {
      expect(ship.shipLocations).toEqual(['12', '13', '14']);
    });

    test('should initialize hit tracker with false values', () => {
      expect(ship.hitTracker).toEqual([false, false, false]);
    });
  });

  describe('attemptHitAtLocation', () => {
    test('should register hit on valid location', () => {
      expect(ship.attemptHitAtLocation('13')).toBe(true);
      expect(ship.hitTracker[1]).toBe(true);
    });

    test('should reject hit on invalid location', () => {
      expect(ship.attemptHitAtLocation('99')).toBe(false);
      expect(ship.hitTracker).toEqual([false, false, false]);
    });

    test('should allow multiple hits on same location', () => {
      ship.attemptHitAtLocation('12');
      expect(ship.attemptHitAtLocation('12')).toBe(true);
      expect(ship.hitTracker[0]).toBe(true);
    });
  });

  describe('isCompletelyDestroyed', () => {
    test('should return false when ship is not fully hit', () => {
      ship.attemptHitAtLocation('12');
      expect(ship.isCompletelyDestroyed()).toBe(false);
    });

    test('should return true when all segments are hit', () => {
      ship.attemptHitAtLocation('12');
      ship.attemptHitAtLocation('13');
      ship.attemptHitAtLocation('14');
      expect(ship.isCompletelyDestroyed()).toBe(true);
    });

    test('should return false for fresh ship', () => {
      expect(ship.isCompletelyDestroyed()).toBe(false);
    });
  });

  describe('isLocationAlreadyHit', () => {
    test('should return true for hit location', () => {
      ship.attemptHitAtLocation('13');
      expect(ship.isLocationAlreadyHit('13')).toBe(true);
    });

    test('should return false for unhit location', () => {
      expect(ship.isLocationAlreadyHit('12')).toBe(false);
    });

    test('should return false for invalid location', () => {
      expect(ship.isLocationAlreadyHit('99')).toBe(false);
    });
  });
});

describe('GameBoard', () => {
  let board;

  beforeEach(() => {
    board = new GameBoard(5); // Use smaller board for testing
  });

  describe('constructor', () => {
    test('should initialize with correct board size', () => {
      expect(board.boardSize).toBe(5);
    });

    test('should create empty grid', () => {
      expect(board.gameGrid).toHaveLength(5);
      expect(board.gameGrid[0]).toHaveLength(5);
      expect(board.gameGrid[0][0]).toBe('~');
    });

    test('should initialize empty ships array', () => {
      expect(board.deployedShips).toEqual([]);
    });
  });

  describe('_canShipBePlacedAtLocations', () => {
    test('should allow placement on empty water', () => {
      const locations = ['00', '01', '02'];
      expect(board._canShipBePlacedAtLocations(locations)).toBe(true);
    });

    test('should reject placement outside board', () => {
      const locations = ['00', '01', '05']; // '05' is outside 5x5 board
      expect(board._canShipBePlacedAtLocations(locations)).toBe(false);
    });

    test('should reject placement on occupied cells', () => {
      board.gameGrid[0][0] = 'S';
      const locations = ['00', '01', '02'];
      expect(board._canShipBePlacedAtLocations(locations)).toBe(false);
    });
  });

  describe('processAttackAtLocation', () => {
    beforeEach(() => {
      // Manually place a ship for testing
      const ship = new BattleShip(['12', '13', '14']);
      board.deployedShips.push(ship);
      board._markShipLocationsOnGrid(['12', '13', '14']);
    });

    test('should register hit on ship location', () => {
      const result = board.processAttackAtLocation('13');
      expect(result.wasHit).toBe(true);
      expect(result.wasShipSunk).toBe(false);
      expect(board.gameGrid[1][3]).toBe('X');
    });

    test('should register miss on empty location', () => {
      const result = board.processAttackAtLocation('00');
      expect(result.wasHit).toBe(false);
      expect(result.wasShipSunk).toBe(false);
      expect(board.gameGrid[0][0]).toBe('O');
    });

    test('should detect sunk ship', () => {
      board.processAttackAtLocation('12');
      board.processAttackAtLocation('13');
      const result = board.processAttackAtLocation('14');
      expect(result.wasHit).toBe(true);
      expect(result.wasShipSunk).toBe(true);
    });
  });

  describe('getDisplayGrid', () => {
    beforeEach(() => {
      board.gameGrid[0][0] = 'S';
      board.gameGrid[1][1] = 'X';
      board.gameGrid[2][2] = 'O';
    });

    test('should show ships when not hiding', () => {
      const display = board.getDisplayGrid(false);
      expect(display[0][0]).toBe('S');
      expect(display[1][1]).toBe('X');
      expect(display[2][2]).toBe('O');
    });

    test('should hide ships when requested', () => {
      const display = board.getDisplayGrid(true);
      expect(display[0][0]).toBe('~'); // Ship hidden as water
      expect(display[1][1]).toBe('X'); // Hit still visible
      expect(display[2][2]).toBe('O'); // Miss still visible
    });
  });

  describe('countRemainingActiveShips', () => {
    test('should count undamaged ships', () => {
      const ship1 = new BattleShip(['00', '01', '02']);
      const ship2 = new BattleShip(['10', '11', '12']);
      board.deployedShips.push(ship1, ship2);
      
      expect(board.countRemainingActiveShips()).toBe(2);
    });

    test('should not count sunk ships', () => {
      const ship1 = new BattleShip(['00', '01', '02']);
      const ship2 = new BattleShip(['10', '11', '12']);
      board.deployedShips.push(ship1, ship2);
      
      // Sink first ship
      ship1.attemptHitAtLocation('00');
      ship1.attemptHitAtLocation('01');
      ship1.attemptHitAtLocation('02');
      
      expect(board.countRemainingActiveShips()).toBe(1);
    });
  });
});

describe('CpuOpponentAI', () => {
  let ai;

  beforeEach(() => {
    ai = new CpuOpponentAI(5); // Use smaller board for testing
  });

  describe('constructor', () => {
    test('should initialize in hunt mode', () => {
      expect(ai.currentStrategyMode).toBe('hunt');
    });

    test('should initialize empty target queue', () => {
      expect(ai.priorityTargetQueue).toEqual([]);
    });

    test('should initialize empty guess history', () => {
      expect(ai.previousGuesses).toEqual([]);
    });
  });

  describe('makeStrategicGuess', () => {
    test('should make random guess in hunt mode', () => {
      const guess = ai.makeStrategicGuess();
      expect(typeof guess).toBe('string');
      expect(guess).toHaveLength(2);
      expect(ai.previousGuesses).toContain(guess);
    });

    test('should target from queue in target mode', () => {
      ai.currentStrategyMode = 'target';
      ai.priorityTargetQueue.push('23');
      
      const guess = ai.makeStrategicGuess();
      expect(guess).toBe('23');
      expect(ai.priorityTargetQueue).toHaveLength(0);
    });

    test('should not repeat previous guesses', () => {
      const guesses = new Set();
      
      // Generate multiple guesses and ensure no duplicates
      for (let i = 0; i < 10; i++) {
        const guess = ai.makeStrategicGuess();
        expect(guesses.has(guess)).toBe(false);
        guesses.add(guess);
      }
    });
  });

  describe('updateStrategyBasedOnAttackResult', () => {
    test('should switch to target mode on hit', () => {
      const result = { wasHit: true, wasShipSunk: false };
      ai.updateStrategyBasedOnAttackResult('22', result);
      
      expect(ai.currentStrategyMode).toBe('target');
      expect(ai.priorityTargetQueue.length).toBeGreaterThan(0);
    });

    test('should return to hunt mode on sunk ship', () => {
      ai.currentStrategyMode = 'target';
      ai.priorityTargetQueue.push('11', '12');
      
      const result = { wasHit: true, wasShipSunk: true };
      ai.updateStrategyBasedOnAttackResult('22', result);
      
      expect(ai.currentStrategyMode).toBe('hunt');
      expect(ai.priorityTargetQueue).toEqual([]);
    });

    test('should stay in hunt mode on miss', () => {
      const result = { wasHit: false, wasShipSunk: false };
      ai.updateStrategyBasedOnAttackResult('22', result);
      
      expect(ai.currentStrategyMode).toBe('hunt');
    });

    test('should return to hunt when target queue is empty', () => {
      ai.currentStrategyMode = 'target';
      ai.priorityTargetQueue = [];
      
      const result = { wasHit: false, wasShipSunk: false };
      ai.updateStrategyBasedOnAttackResult('22', result);
      
      expect(ai.currentStrategyMode).toBe('hunt');
    });
  });

  describe('_addAdjacentLocationsToTargetQueue', () => {
    test('should add valid adjacent locations', () => {
      ai._addAdjacentLocationsToTargetQueue('22');
      
      expect(ai.priorityTargetQueue).toContain('12'); // North
      expect(ai.priorityTargetQueue).toContain('32'); // South
      expect(ai.priorityTargetQueue).toContain('21'); // West
      expect(ai.priorityTargetQueue).toContain('23'); // East
    });

    test('should not add invalid adjacent locations', () => {
      ai._addAdjacentLocationsToTargetQueue('00');
      
      // Should only contain valid coordinates within board
      ai.priorityTargetQueue.forEach(location => {
        const [row, col] = [parseInt(location[0]), parseInt(location[1])];
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(5);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(5);
      });
    });

    test('should not add already guessed locations', () => {
      ai.previousGuesses.push('12', '21');
      ai._addAdjacentLocationsToTargetQueue('22');
      
      expect(ai.priorityTargetQueue).not.toContain('12');
      expect(ai.priorityTargetQueue).not.toContain('21');
    });

    test('should not add duplicate queue entries', () => {
      ai.priorityTargetQueue.push('23');
      ai._addAdjacentLocationsToTargetQueue('22');
      
      const count23 = ai.priorityTargetQueue.filter(loc => loc === '23').length;
      expect(count23).toBe(1);
    });
  });
});

describe('SeaBattleGameEngine', () => {
  let engine;
  let originalDisplayMethods;

  beforeEach(() => {
    engine = new SeaBattleGameEngine();
    // Store original methods
    originalDisplayMethods = {
      displayBoardCreationConfirmation: UserInterfaceManager.displayBoardCreationConfirmation,
      displayShipPlacementConfirmation: UserInterfaceManager.displayShipPlacementConfirmation
    };
    // Mock display methods to avoid console output in tests
    UserInterfaceManager.displayBoardCreationConfirmation = () => {};
    UserInterfaceManager.displayShipPlacementConfirmation = () => {};
  });

  afterEach(() => {
    // Restore original methods
    UserInterfaceManager.displayBoardCreationConfirmation = originalDisplayMethods.displayBoardCreationConfirmation;
    UserInterfaceManager.displayShipPlacementConfirmation = originalDisplayMethods.displayShipPlacementConfirmation;
  });

  describe('constructor', () => {
    test('should initialize game components', () => {
      expect(engine.playerGameBoard).toBeDefined();
      expect(engine.cpuOpponentBoard).toBeDefined();
      expect(engine.cpuArtificialIntelligence).toBeDefined();
      expect(engine.playerGuessHistory).toEqual([]);
    });
  });

  describe('initializeNewGame', () => {
    test('should initialize boards with ships', () => {
      engine.initializeNewGame();
      
      expect(engine.playerGameBoard.deployedShips).toHaveLength(3);
      expect(engine.cpuOpponentBoard.deployedShips).toHaveLength(3);
    });
  });

  describe('executePlayerTurn', () => {
    beforeEach(() => {
      engine.initializeNewGame();
      // Mock display methods
      UserInterfaceManager.displayPlayerHitConfirmation = () => {};
      UserInterfaceManager.displayPlayerMissNotification = () => {};
      UserInterfaceManager.displayShipSinkingNotification = () => {};
    });

    test('should record player guess', () => {
      engine.executePlayerTurn('12');
      expect(engine.playerGuessHistory).toContain('12');
    });

    test('should process attack on CPU board', () => {
      const result = engine.executePlayerTurn('12');
      expect(result).toHaveProperty('wasHit');
      expect(result).toHaveProperty('wasShipSunk');
    });
  });

  describe('executeCpuOpponentTurn', () => {
    beforeEach(() => {
      engine.initializeNewGame();
      // Mock display methods
      UserInterfaceManager.displayCpuTurnAnnouncement = () => {};
      UserInterfaceManager.displayCpuHitNotification = () => {};
      UserInterfaceManager.displayCpuMissNotification = () => {};
      UserInterfaceManager.displayShipSinkingNotification = () => {};
    });

    test('should make CPU guess and process attack', () => {
      const result = engine.executeCpuOpponentTurn();
      expect(result).toHaveProperty('wasHit');
      expect(result).toHaveProperty('wasShipSunk');
      expect(engine.cpuArtificialIntelligence.previousGuesses.length).toBe(1);
    });
  });

  describe('evaluateGameEndConditions', () => {
    beforeEach(() => {
      engine.initializeNewGame();
    });

    test('should return continue when both players have ships', () => {
      expect(engine.evaluateGameEndConditions()).toBe('continue');
    });

    test('should return player_wins when CPU has no ships', () => {
      // Sink all CPU ships
      engine.cpuOpponentBoard.deployedShips.forEach(ship => {
        ship.shipLocations.forEach(location => {
          ship.attemptHitAtLocation(location);
        });
      });
      
      expect(engine.evaluateGameEndConditions()).toBe('player_wins');
    });

    test('should return cpu_wins when player has no ships', () => {
      // Sink all player ships
      engine.playerGameBoard.deployedShips.forEach(ship => {
        ship.shipLocations.forEach(location => {
          ship.attemptHitAtLocation(location);
        });
      });
      
      expect(engine.evaluateGameEndConditions()).toBe('cpu_wins');
    });
  });

  describe('getCurrentGameState', () => {
    test('should return current game state', () => {
      const state = engine.getCurrentGameState();
      expect(state).toHaveProperty('playerBoard');
      expect(state).toHaveProperty('cpuBoard');
      expect(state).toHaveProperty('playerGuesses');
      expect(state.playerGuesses).toBe(engine.playerGuessHistory);
    });
  });
});

describe('UserInputHandler', () => {
  let inputHandler;

  beforeEach(() => {
    inputHandler = new UserInputHandler();
    // Mock error display
    UserInterfaceManager.displayErrorMessage = () => {};
  });

  afterEach(() => {
    // No cleanup needed for simple mocks
  });

  describe('validateUserGuess', () => {
    test('should accept valid guess', () => {
      expect(inputHandler.validateUserGuess('34', [])).toBe(true);
      expect(inputHandler.validateUserGuess('00', [])).toBe(true);
      expect(inputHandler.validateUserGuess('99', [])).toBe(true);
    });

    test('should reject invalid input format', () => {
      expect(inputHandler.validateUserGuess('', [])).toBe(false);
      expect(inputHandler.validateUserGuess('1', [])).toBe(false);
      expect(inputHandler.validateUserGuess('123', [])).toBe(false);
      expect(inputHandler.validateUserGuess('ab', [])).toBe(false);
      expect(inputHandler.validateUserGuess(null, [])).toBe(false);
    });

    test('should reject coordinates outside board', () => {
      expect(inputHandler.validateUserGuess('a9', [])).toBe(false); // Invalid row character
      expect(inputHandler.validateUserGuess('9a', [])).toBe(false); // Invalid column character  
      expect(inputHandler.validateUserGuess('aa', [])).toBe(false); // Invalid characters
    });

    test('should reject duplicate guesses', () => {
      const previousGuesses = ['12', '34', '56'];
      expect(inputHandler.validateUserGuess('12', previousGuesses)).toBe(false);
      expect(inputHandler.validateUserGuess('34', previousGuesses)).toBe(false);
      expect(inputHandler.validateUserGuess('78', previousGuesses)).toBe(true);
    });

    test('should validate coordinates within board range', () => {
      // Test boundary values
      expect(inputHandler.validateUserGuess('09', [])).toBe(true);
      expect(inputHandler.validateUserGuess('90', [])).toBe(true);
      expect(inputHandler.validateUserGuess('55', [])).toBe(true);
    });
  });
});

// Integration tests
describe('Game Integration', () => {
  let controller;

  beforeEach(() => {
    controller = new SeaBattleGameController();
    // Mock all UI methods
    Object.getOwnPropertyNames(UserInterfaceManager)
      .filter(name => name.startsWith('display'))
      .forEach(methodName => {
        UserInterfaceManager[methodName] = () => {};
      });
  });

  afterEach(() => {
    // No cleanup needed for simple mocks
  });

  test('should initialize game engine and input handler', () => {
    expect(controller.gameEngine).toBeDefined();
    expect(controller.inputHandler).toBeDefined();
  });

  test('should handle game end scenarios', () => {
    const mockGameState = {
      playerBoard: new GameBoard(),
      cpuBoard: new GameBoard(),
      playerGuesses: []
    };
    
    // Mock the method to return test data
    controller.gameEngine.getCurrentGameState = () => mockGameState;
    
    // Test player wins scenario
    controller.handleGameEndScenario('player_wins');
    // Verify method was called (simplified test)
    
    // Test CPU wins scenario
    controller.handleGameEndScenario('cpu_wins');
  });

  test('should display current game state', () => {
    const mockGameState = {
      playerBoard: new GameBoard(),
      cpuBoard: new GameBoard(),
      playerGuesses: []
    };
    
    // Mock the method to return test data
    controller.gameEngine.getCurrentGameState = () => mockGameState;
    
    // Test display current state (simplified test)
    controller.displayCurrentGameState();
  });
});

// Performance and stress tests
describe('Performance Tests', () => {
  test('should handle multiple ship placements efficiently', () => {
    const board = new GameBoard();
    const startTime = Date.now();
    
    board.deployShipsRandomly(3, 3);
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    expect(board.deployedShips).toHaveLength(3);
  });

  test('should handle many CPU guesses efficiently', () => {
    const ai = new CpuOpponentAI();
    const startTime = Date.now();
    
    // Generate many guesses
    for (let i = 0; i < 50; i++) {
      ai.makeStrategicGuess();
    }
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    expect(ai.previousGuesses).toHaveLength(50);
  });
}); 