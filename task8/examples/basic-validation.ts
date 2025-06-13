import { Schema } from '../schema';

// String validation examples
const stringValidator = Schema.string()
  .minLength(3)
  .maxLength(10)
  .pattern(/^[A-Za-z]+$/);

// Valid string examples
console.log('\nValid string examples:');
const validStrings = [
  'Hello',
  'World',
  'TypeScript'
];

validStrings.forEach(str => {
  const result = stringValidator.validate(str);
  console.log(`Input: "${str}"`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Errors: ${result.errors.length ? result.errors : 'None'}\n`);
});

// Invalid string examples
console.log('\nInvalid string examples:');
const invalidStrings = [
  'Hi',           // Too short
  'VeryLongString', // Too long
  'Hello123',     // Contains numbers
  '',            // Empty string
  null,          // Null value
  123            // Number instead of string
];

invalidStrings.forEach(str => {
  const result = stringValidator.validate(str);
  console.log(`Input: ${str}`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Errors: ${result.errors.join(', ')}\n`);
});

// Number validation examples
const numberValidator = Schema.number()
  .min(0)
  .max(100)
  .integer();

// Valid number examples
console.log('\nValid number examples:');
const validNumbers = [
  0,
  42,
  100
];

validNumbers.forEach(num => {
  const result = numberValidator.validate(num);
  console.log(`Input: ${num}`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Errors: ${result.errors.length ? result.errors : 'None'}\n`);
});

// Invalid number examples
console.log('\nInvalid number examples:');
const invalidNumbers = [
  -1,            // Below minimum
  101,           // Above maximum
  42.5,          // Not an integer
  '42',          // String instead of number
  null,          // Null value
  undefined      // Undefined value
];

invalidNumbers.forEach(num => {
  const result = numberValidator.validate(num);
  console.log(`Input: ${num}`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Errors: ${result.errors.join(', ')}\n`);
});

// Boolean validation examples
const booleanValidator = Schema.boolean();

// Valid boolean examples
console.log('\nValid boolean examples:');
const validBooleans = [
  true,
  false
];

validBooleans.forEach(bool => {
  const result = booleanValidator.validate(bool);
  console.log(`Input: ${bool}`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Errors: ${result.errors.length ? result.errors : 'None'}\n`);
});

// Invalid boolean examples
console.log('\nInvalid boolean examples:');
const invalidBooleans = [
  'true',        // String instead of boolean
  'false',       // String instead of boolean
  1,             // Number instead of boolean
  0,             // Number instead of boolean
  null,          // Null value
  undefined      // Undefined value
];

invalidBooleans.forEach(bool => {
  const result = booleanValidator.validate(bool);
  console.log(`Input: ${bool}`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Errors: ${result.errors.join(', ')}\n`);
}); 