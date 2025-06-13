import { Schema } from '../schema';

// Example 1: Array Validation
console.log('Example 1: Array Validation\n');

// Create a validator for an array of strings with length constraints
const tagsValidator = Schema.array(Schema.string())
    .minLength(1)
    .maxLength(5)
    .withMessage('Must have between 1 and 5 tags');

// Test valid array
const validTags = ['javascript', 'typescript', 'node'];
const result1 = tagsValidator.validate(validTags);
console.log('Valid tags array:');
console.log('Input:', validTags);
console.log('Result:', result1);

// Test invalid array (too many items)
const tooManyTags = ['js', 'ts', 'node', 'react', 'vue', 'angular'];
const result2 = tagsValidator.validate(tooManyTags);
console.log('\nToo many tags:');
console.log('Input:', tooManyTags);
console.log('Result:', result2);

// Example 2: Object Validation
console.log('\nExample 2: Object Validation\n');

// Create a user schema
const userSchema = Schema.object({
    name: Schema.string().minLength(2).maxLength(50),
    age: Schema.number().min(0).max(120).integer(),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    tags: Schema.array(Schema.string()).maxLength(5)
}).strict();

// Test valid user object
const validUser = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    tags: ['developer', 'typescript']
};
const result3 = userSchema.validate(validUser);
console.log('Valid user object:');
console.log('Input:', validUser);
console.log('Result:', result3);

// Test invalid user object
const invalidUser = {
    name: 'J', // too short
    age: 150, // too old
    email: 'invalid-email',
    tags: ['dev', 'ts', 'node', 'react', 'vue', 'angular'], // too many tags
    extraField: 'should not be here' // unexpected field
};
const result4 = userSchema.validate(invalidUser);
console.log('\nInvalid user object:');
console.log('Input:', invalidUser);
console.log('Result:', result4);

// Example 3: Nested Object Validation
console.log('\nExample 3: Nested Object Validation\n');

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
const result5 = userWithAddressSchema.validate(userWithAddress);
console.log('User with address:');
console.log('Input:', userWithAddress);
console.log('Result:', result5); 