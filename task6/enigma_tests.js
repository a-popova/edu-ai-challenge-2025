const assert = require('assert');

// Enigma machine components (copied from enigma.js for testing)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function mod(n, m) {
  return ((n % m) + m) % m;
}

const ROTORS = [
  { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' }, // Rotor I
  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' }, // Rotor II
  { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }, // Rotor III
];
const REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

function plugboardSwap(c, pairs) {
  for (const [a, b] of pairs) {
    if (c === a) return b;
    if (c === b) return a;
  }
  return c;
}

class Rotor {
  constructor(wiring, notch, ringSetting = 0, position = 0) {
    this.wiring = wiring;
    this.notch = notch;
    this.ringSetting = ringSetting;
    this.position = position;
  }
  step() {
    this.position = mod(this.position + 1, 26);
  }
  atNotch() {
    return alphabet[this.position] === this.notch;
  }
  forward(c) {
    const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
    return this.wiring[idx];
  }
  backward(c) {
    const idx = this.wiring.indexOf(c);
    return alphabet[mod(idx - this.position + this.ringSetting, 26)];
  }
}

class Enigma {
  constructor(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
    this.rotors = rotorIDs.map(
      (id, i) =>
        new Rotor(
          ROTORS[id].wiring,
          ROTORS[id].notch,
          ringSettings[i],
          rotorPositions[i],
        ),
    );
    this.plugboardPairs = plugboardPairs;
  }
  stepRotors() {
    if (this.rotors[2].atNotch()) this.rotors[1].step();
    if (this.rotors[1].atNotch()) this.rotors[0].step();
    this.rotors[2].step();
  }
  encryptChar(c) {
    if (!alphabet.includes(c)) return c;
    this.stepRotors();
    c = plugboardSwap(c, this.plugboardPairs);
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    c = REFLECTOR[alphabet.indexOf(c)];

    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    c = plugboardSwap(c, this.plugboardPairs);
    return c;
  }
  process(text) {
    return text
      .toUpperCase()
      .split('')
      .map((c) => this.encryptChar(c))
      .join('');
  }
}

// Test runner
function runTests() {
  console.log('🔧 Enigma Machine Test Suite\n');
  
  const tests = [
    {
      name: '✅ Encryption/Decryption Reciprocity',
      test: () => {
        const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        
        const plaintext = 'HELLO';
        const encrypted = enigma1.process(plaintext);
        const decrypted = enigma2.process(encrypted);
        
        assert.strictEqual(decrypted, plaintext);
        console.log(`   Input: "${plaintext}" → Encrypted: "${encrypted}" → Decrypted: "${decrypted}"`);
      }
    },
    
    {
      name: '🔤 Case Conversion',
      test: () => {
        const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        const result = enigma.process('hello');
        
        assert.strictEqual(result, 'VNACA');
        console.log(`   "hello" → "${result}"`);
      }
    },
    
    {
      name: '🔢 Non-alphabetic Pass-through',
      test: () => {
        const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        const result = enigma.process('A1B2C!');
        
        assert(result.includes('1'), 'Numbers preserved');
        assert(result.includes('2'), 'Numbers preserved');
        assert(result.includes('!'), 'Punctuation preserved');
        console.log(`   "A1B2C!" → "${result}"`);
      }
    },
    
    {
      name: '🔌 Plugboard Functionality',
      test: () => {
        const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
        const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
        
        const plaintext = 'ABCD';
        const encrypted = enigma1.process(plaintext);
        const decrypted = enigma2.process(encrypted);
        
        assert.strictEqual(decrypted, plaintext);
        console.log(`   With plugboard A↔B, C↔D: "${plaintext}" → "${encrypted}" → "${decrypted}"`);
      }
    },
    
    {
      name: '⚙️ Rotor Stepping',
      test: () => {
        const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        
        const pos1 = enigma.rotors[2].position;
        enigma.encryptChar('A');
        const pos2 = enigma.rotors[2].position;
        enigma.encryptChar('A');
        const pos3 = enigma.rotors[2].position;
        
        assert.strictEqual(pos2, (pos1 + 1) % 26);
        assert.strictEqual(pos3, (pos1 + 2) % 26);
        console.log(`   Rotor positions: ${pos1} → ${pos2} → ${pos3}`);
      }
    },
    
    {
      name: '🔄 No Self-Encryption',
      test: () => {
        const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        
        for (let i = 0; i < 26; i++) {
          const char = String.fromCharCode(65 + i); // A-Z
          const encrypted = enigma.encryptChar(char);
          assert.notStrictEqual(encrypted, char, `${char} should not encrypt to itself`);
        }
        console.log('   ✓ No character encrypts to itself');
      }
    },
    
    {
      name: '📝 Long Message Test',
      test: () => {
        const settings = {
          rotors: [0, 1, 2],
          positions: [7, 14, 21],
          rings: [3, 6, 9],
          plugs: [['A', 'B'], ['C', 'D']]
        };
        
        const enigma1 = new Enigma(settings.rotors, settings.positions, settings.rings, settings.plugs);
        const enigma2 = new Enigma(settings.rotors, settings.positions, settings.rings, settings.plugs);
        
        const plaintext = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
        const encrypted = enigma1.process(plaintext);
        const decrypted = enigma2.process(encrypted);
        
        assert.strictEqual(decrypted, plaintext);
        console.log(`   ${plaintext.length} chars: "${plaintext.substring(0, 20)}..." processed successfully`);
      }
    },
    
    {
      name: '💍 Ring Settings Effect',
      test: () => {
        const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
        
        const plaintext = 'TEST';
        const result1 = enigma1.process(plaintext);
        const result2 = enigma2.process(plaintext);
        
        assert.notStrictEqual(result1, result2);
        console.log(`   Different ring settings: "${result1}" vs "${result2}"`);
      }
    }
  ];
  
  let passed = 0;
  
  for (const testCase of tests) {
    try {
      testCase.test();
      console.log(`${testCase.name} ✓`);
      passed++;
    } catch (error) {
      console.log(`${testCase.name} ✗`);
      console.log(`   Error: ${error.message}`);
    }
    console.log();
  }
  
  console.log(`\n🏆 Results: ${passed}/${tests.length} tests passed`);
  
  if (passed === tests.length) {
    console.log('🎉 All tests passed! The Enigma machine is working correctly.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
    return false;
  }
}

if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests }; 