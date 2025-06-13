# Type-Safe Validation Library

A robust, type-safe validation library built with TypeScript that provides a fluent API for validating data structures.

## Features

- Type-safe validation with TypeScript
- Fluent API for building validation rules
- Support for primitive types (string, number, boolean)
- Support for complex types (arrays, objects)
- Support for date validation with range constraints
- Nested object validation
- Array validation with item type checking
- Strict mode for object validation
- Custom error messages
- Comprehensive test coverage

## Installation

1. Make sure you have Node.js and npm installed
2. Install TypeScript if you haven't already:
```bash
npm install -g typescript
```

3. Install the project dependencies:
```bash
npm install
```

## Usage

### Basic Validation

```typescript
import { Schema } from './schema';

// String validation
const nameValidator = Schema.string()
  .minLength(2)
  .maxLength(50)
  .withMessage('Name must be between 2 and 50 characters');

const nameResult = nameValidator.validate("John");
// { isValid: true, errors: [] }

// Number validation
const ageValidator = Schema.number()
  .min(0)
  .max(120)
  .integer()
  .withMessage('Age must be a valid integer between 0 and 120');

const ageResult = ageValidator.validate(25);
// { isValid: true, errors: [] }

// Boolean validation
const isActiveValidator = Schema.boolean()
  .withMessage('Must be a boolean value');

const isActiveResult = isActiveValidator.validate(true);
// { isValid: true, errors: [] }

// Date validation
const dateValidator = Schema.date()
  .minDateISO('2024-01-01')
  .maxDateISO('2024-12-31')
  .withMessage('Date must be in 2024');

const dateResult = dateValidator.validate('2024-03-15');
// { isValid: true, errors: [] }
```

### Date Validation Features

```typescript
// Basic date validation
const dateValidator = Schema.date()
  .withMessage('Must be a valid date');

// Valid dates
dateValidator.validate(new Date());           // Valid
dateValidator.validate('2024-03-15');         // Valid
dateValidator.validate('2024-03-15T12:00:00Z'); // Valid
dateValidator.validate(1710504000000);        // Valid (timestamp)

// Invalid dates
dateValidator.validate('not a date');         // Invalid
dateValidator.validate('2024-13-45');         // Invalid
dateValidator.validate(null);                 // Invalid

// Date range validation
const dateRangeValidator = Schema.date()
  .minDateISO('2024-01-01')
  .maxDateISO('2024-12-31')
  .withMessage('Date must be in 2024');

// Valid dates within range
dateRangeValidator.validate('2024-01-01');    // Valid
dateRangeValidator.validate('2024-06-15');    // Valid
dateRangeValidator.validate('2024-12-31');    // Valid

// Invalid dates outside range
dateRangeValidator.validate('2023-12-31');    // Invalid
dateRangeValidator.validate('2025-01-01');    // Invalid
```

### Array Validation

```typescript
// Create a validator for an array of strings
const tagsValidator = Schema.array(Schema.string())
  .minLength(1)                    // Minimum 1 item
  .maxLength(5)                    // Maximum 5 items
  .withMessage('Must have between 1 and 5 tags');

// Valid array
const validTags = ['javascript', 'typescript', 'node'];
const result1 = tagsValidator.validate(validTags);
// { isValid: true, errors: [] }

// Invalid array (too many items)
const tooManyTags = ['js', 'ts', 'node', 'react', 'vue', 'angular'];
const result2 = tagsValidator.validate(tooManyTags);
// { 
//   isValid: false, 
//   errors: ['Array must have at most 5 items'] 
// }

// Array of numbers
const numbersValidator = Schema.array(Schema.number().min(0).max(100))
  .minLength(2)
  .maxLength(4);

const validNumbers = [1, 2, 3];
const result3 = numbersValidator.validate(validNumbers);
// { isValid: true, errors: [] }
```

### Object Validation

```typescript
// Create a user schema
const userSchema = Schema.object({
  name: Schema.string().minLength(2).maxLength(50),
  age: Schema.number().min(0).max(120).integer(),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  tags: Schema.array(Schema.string()).maxLength(5),
  birthDate: Schema.date().maxDate(new Date()) // Date validation in object
}).strict(); // Enable strict mode to prevent extra properties

// Valid user object
const validUser = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  tags: ['developer', 'typescript'],
  birthDate: '1990-01-01'
};
const result1 = userSchema.validate(validUser);
// { isValid: true, errors: [] }

// Invalid user object
const invalidUser = {
  name: 'J', // too short
  age: 150, // too old
  email: 'invalid-email',
  tags: ['dev', 'ts', 'node', 'react', 'vue', 'angular'], // too many tags
  birthDate: '2025-01-01', // future date
  extraField: 'should not be here' // unexpected field
};
const result2 = userSchema.validate(invalidUser);
// {
//   isValid: false,
//   errors: [
//     'name: String must be at least 2 characters long',
//     'age: Number must be less than or equal to 120',
//     'email: String does not match required pattern',
//     'tags: Array must have at most 5 items',
//     'birthDate: Date must be before 2024-03-15T12:00:00.000Z',
//     'Unexpected property: extraField'
//   ]
// }
```

### Nested Object Validation

```typescript
// Create address schema
const addressSchema = Schema.object({
  street: Schema.string().minLength(5),
  city: Schema.string().minLength(2),
  country: Schema.string().minLength(2)
});

// Create user schema with nested address
const userWithAddressSchema = Schema.object({
  name: Schema.string().minLength(2),
  address: addressSchema
});

// Test nested object
const userWithAddress = {
  name: 'Jane Doe',
  address: {
    street: '123 Main St',
    city: 'New York',
    country: 'USA'
  }
};
const result = userWithAddressSchema.validate(userWithAddress);
// { isValid: true, errors: [] }
```

## Validation Result Structure

All validators return a validation result object with the following structure:

```typescript
interface ValidationResult {
  isValid: boolean;    // Whether the validation passed
  errors: string[];    // Array of error messages (empty if validation passed)
}
```

## Error Handling

```typescript
const validator = Schema.string().minLength(3);
const result = validator.validate("ab");

if (!result.isValid) {
  console.log("Validation failed:");
  result.errors.forEach(error => console.log(`- ${error}`));
}
```

## Testing

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Examples

The library includes several example files in the `examples` directory to demonstrate different validation scenarios:

### Running Examples

To run any of the example files, first make sure you have all dependencies installed:

```bash
npm install
```

Then you can run any example using `ts-node`:

```bash
# Run basic validation examples (string, number, boolean)
npx ts-node examples/basic-validation.ts

# Run complex validation examples (arrays, objects)
npx ts-node examples/complex-validation.ts

# Run date validation examples
npx ts-node examples/date-validation.ts
```
