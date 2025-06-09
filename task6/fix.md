## Bug Fix Applied
The critical bug was in the `encryptChar()` method - the plugboard transformation was missing at the end of the encryption process. 

In an Enigma machine, the signal path is:
1. **Plugboard** (first swap)
2. Rotors (forward direction) 
3. Reflector
4. Rotors (backward direction)
5. **Plugboard** (second swap) ← **This is missing!**

Let me fix this:
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

    return c;
  }

->

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

  
**Fixed:** Added second plugboard swap after the signal returns from the rotors, ensuring proper reciprocal operation.