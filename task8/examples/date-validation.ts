import { Schema } from '../schema';

// Example 1: Basic Date Validation
console.log('Example 1: Basic Date Validation\n');

const dateValidator = Schema.date()
    .withMessage('Must be a valid date');

// Valid dates
const validDates = [
    new Date(),
    '2024-03-15',
    '2024-03-15T12:00:00Z',
    1710504000000 // timestamp
];

validDates.forEach(date => {
    const result = dateValidator.validate(date);
    console.log(`Validating ${date}:`);
    console.log('Result:', result);
    console.log('---');
});

// Invalid dates
const invalidDates = [
    'not a date',
    '2024-13-45', // Invalid month and day
    'invalid-date-string',
    null,
    undefined
];

invalidDates.forEach(date => {
    const result = dateValidator.validate(date);
    console.log(`Validating ${date}:`);
    console.log('Result:', result);
    console.log('---');
});

// Example 2: Date Range Validation
console.log('\nExample 2: Date Range Validation\n');

const dateRangeValidator = Schema.date()
    .minDateISO('2024-01-01')
    .maxDateISO('2024-12-31')
    .withMessage('Date must be in 2024');

// Valid dates within range
const validRangeDates = [
    '2024-01-01',
    '2024-06-15',
    '2024-12-31'
];

validRangeDates.forEach(date => {
    const result = dateRangeValidator.validate(date);
    console.log(`Validating ${date}:`);
    console.log('Result:', result);
    console.log('---');
});

// Invalid dates outside range
const invalidRangeDates = [
    '2023-12-31',
    '2025-01-01'
];

invalidRangeDates.forEach(date => {
    const result = dateRangeValidator.validate(date);
    console.log(`Validating ${date}:`);
    console.log('Result:', result);
    console.log('---');
});

// Example 3: Date in Object Schema
console.log('\nExample 3: Date in Object Schema\n');

const eventSchema = Schema.object({
    title: Schema.string().minLength(3),
    startDate: Schema.date().minDate(new Date()),
    endDate: Schema.date().minDate(new Date())
}).strict();

// Valid event
const validEvent = {
    title: 'Team Meeting',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-02')
};

const result1 = eventSchema.validate(validEvent);
console.log('Valid event:');
console.log('Input:', validEvent);
console.log('Result:', result1);

// Invalid event (end date before start date)
const invalidEvent = {
    title: 'Team Meeting',
    startDate: new Date('2024-04-02'),
    endDate: new Date('2024-04-01')
};

const result2 = eventSchema.validate(invalidEvent);
console.log('\nInvalid event:');
console.log('Input:', invalidEvent);
console.log('Result:', result2); 