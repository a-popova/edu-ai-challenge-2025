import { Schema } from '../schema';

describe('String Validator', () => {
  const validator = Schema.string();

  test('validates string type', () => {
    expect(validator.validate('test').isValid).toBe(true);
    expect(validator.validate(123).isValid).toBe(false);
    expect(validator.validate(null).isValid).toBe(false);
  });

  test('validates min length', () => {
    const minLengthValidator = Schema.string().minLength(3);
    expect(minLengthValidator.validate('test').isValid).toBe(true);
    expect(minLengthValidator.validate('ab').isValid).toBe(false);
  });

  test('validates max length', () => {
    const maxLengthValidator = Schema.string().maxLength(3);
    expect(maxLengthValidator.validate('abc').isValid).toBe(true);
    expect(maxLengthValidator.validate('abcd').isValid).toBe(false);
  });

  test('validates pattern', () => {
    const patternValidator = Schema.string().pattern(/^[A-Z]+$/);
    expect(patternValidator.validate('ABC').isValid).toBe(true);
    expect(patternValidator.validate('abc').isValid).toBe(false);
  });

  test('custom error message', () => {
    const customValidator = Schema.string().withMessage('Custom error');
    expect(customValidator.validate(123).errors[0]).toBe('Custom error');
  });
});

describe('Number Validator', () => {
  const validator = Schema.number();

  test('validates number type', () => {
    expect(validator.validate(123).isValid).toBe(true);
    expect(validator.validate('123').isValid).toBe(false);
    expect(validator.validate(null).isValid).toBe(false);
  });

  test('validates min value', () => {
    const minValidator = Schema.number().min(5);
    expect(minValidator.validate(6).isValid).toBe(true);
    expect(minValidator.validate(4).isValid).toBe(false);
  });

  test('validates max value', () => {
    const maxValidator = Schema.number().max(5);
    expect(maxValidator.validate(4).isValid).toBe(true);
    expect(maxValidator.validate(6).isValid).toBe(false);
  });

  test('validates integer', () => {
    const integerValidator = Schema.number().integer();
    expect(integerValidator.validate(5).isValid).toBe(true);
    expect(integerValidator.validate(5.5).isValid).toBe(false);
  });
});

describe('Boolean Validator', () => {
  const validator = Schema.boolean();

  test('validates boolean type', () => {
    expect(validator.validate(true).isValid).toBe(true);
    expect(validator.validate(false).isValid).toBe(true);
    expect(validator.validate('true').isValid).toBe(false);
    expect(validator.validate(null).isValid).toBe(false);
  });
});

describe('Date Validator', () => {
  const validator = Schema.date();

  test('validates date type', () => {
    expect(validator.validate(new Date()).isValid).toBe(true);
    expect(validator.validate('2024-01-01').isValid).toBe(true);
    expect(validator.validate('invalid').isValid).toBe(false);
    expect(validator.validate(null).isValid).toBe(false);
  });

  test('validates min date', () => {
    const minDate = new Date('2024-01-01');
    const minDateValidator = Schema.date().minDate(minDate);
    expect(minDateValidator.validate(new Date('2024-02-01')).isValid).toBe(true);
    expect(minDateValidator.validate(new Date('2023-12-31')).isValid).toBe(false);
  });

  test('validates max date', () => {
    const maxDate = new Date('2024-12-31');
    const maxDateValidator = Schema.date().maxDate(maxDate);
    expect(maxDateValidator.validate(new Date('2024-12-30')).isValid).toBe(true);
    expect(maxDateValidator.validate(new Date('2025-01-01')).isValid).toBe(false);
  });

  test('validates date range', () => {
    const rangeValidator = Schema.date()
      .minDate(new Date('2024-01-01'))
      .maxDate(new Date('2024-12-31'));
    expect(rangeValidator.validate(new Date('2024-06-15')).isValid).toBe(true);
    expect(rangeValidator.validate(new Date('2023-12-31')).isValid).toBe(false);
    expect(rangeValidator.validate(new Date('2025-01-01')).isValid).toBe(false);
  });
});

describe('Array Validator', () => {
  test('validates array type', () => {
    const validator = Schema.array(Schema.string());
    expect(validator.validate(['a', 'b']).isValid).toBe(true);
    expect(validator.validate('not an array').isValid).toBe(false);
    expect(validator.validate(null).isValid).toBe(false);
  });

  test('validates array length', () => {
    const validator = Schema.array(Schema.string())
      .minLength(2)
      .maxLength(4);
    expect(validator.validate(['a', 'b']).isValid).toBe(true);
    expect(validator.validate(['a']).isValid).toBe(false);
    expect(validator.validate(['a', 'b', 'c', 'd', 'e']).isValid).toBe(false);
  });

  test('validates array items', () => {
    const validator = Schema.array(Schema.number());
    expect(validator.validate([1, 2, 3]).isValid).toBe(true);
    expect(validator.validate([1, '2', 3]).isValid).toBe(false);
  });

  test('nested array validation', () => {
    const validator = Schema.array(Schema.array(Schema.number()));
    expect(validator.validate([[1, 2], [3, 4]]).isValid).toBe(true);
    expect(validator.validate([[1, '2'], [3, 4]]).isValid).toBe(false);
  });
});

describe('Object Validator', () => {
  test('validates object type', () => {
    const validator = Schema.object({
      name: Schema.string(),
      age: Schema.number()
    });
    expect(validator.validate({ name: 'John', age: 30 }).isValid).toBe(true);
    expect(validator.validate('not an object').isValid).toBe(false);
    expect(validator.validate(null).isValid).toBe(false);
  });

  test('validates required properties', () => {
    const validator = Schema.object({
      name: Schema.string(),
      age: Schema.number()
    });
    expect(validator.validate({ name: 'John' }).isValid).toBe(false);
    expect(validator.validate({ age: 30 }).isValid).toBe(false);
  });

  test('validates property types', () => {
    const validator = Schema.object({
      name: Schema.string(),
      age: Schema.number()
    });
    expect(validator.validate({ name: 'John', age: '30' }).isValid).toBe(false);
    expect(validator.validate({ name: 123, age: 30 }).isValid).toBe(false);
  });

  test('strict mode', () => {
    const validator = Schema.object({
      name: Schema.string()
    }).strict();
    expect(validator.validate({ name: 'John', extra: 'field' }).isValid).toBe(false);
  });

  test('nested object validation', () => {
    const validator = Schema.object({
      user: Schema.object({
        name: Schema.string(),
        age: Schema.number()
      })
    });
    expect(validator.validate({
      user: { name: 'John', age: 30 }
    }).isValid).toBe(true);
    expect(validator.validate({
      user: { name: 'John', age: '30' }
    }).isValid).toBe(false);
  });
}); 