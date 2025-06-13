import {
  ValidationResult,
  SchemaDefinition,
  DateInput,
  ValidationOptions,
  ArrayValidationOptions,
  DateValidationOptions,
  NumberValidationOptions,
  StringValidationOptions
} from './types';

// Base validator class that implements common functionality
export abstract class BaseValidator<T> {
  protected options: ValidationOptions = {};

  // Sets a custom error message for this validator
  withMessage(message: string): BaseValidator<T> {
    this.options.customMessage = message;
    return this;
  }

  // Helper method to create error message
  protected createError(message: string): string {
    return this.options.customMessage || message;
  }

  abstract validate(value: unknown): ValidationResult;
}

// String validator implementation
export class StringValidator extends BaseValidator<string> {
  protected options: StringValidationOptions = {};

  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'string') {
      errors.push(this.createError('Value must be a string'));
      return { isValid: false, errors };
    }

    if (this.options.minLength !== undefined && value.length < this.options.minLength) {
      errors.push(this.createError(`String must be at least ${this.options.minLength} characters long`));
    }

    if (this.options.maxLength !== undefined && value.length > this.options.maxLength) {
      errors.push(this.createError(`String must be at most ${this.options.maxLength} characters long`));
    }

    if (this.options.pattern && !this.options.pattern.test(value)) {
      errors.push(this.createError('String does not match required pattern'));
    }

    return { isValid: errors.length === 0, errors };
  }

  minLength(length: number): StringValidator {
    this.options.minLength = length;
    return this;
  }

  maxLength(length: number): StringValidator {
    this.options.maxLength = length;
    return this;
  }

  pattern(regex: RegExp): StringValidator {
    this.options.pattern = regex;
    return this;
  }
}

// Number validator implementation
export class NumberValidator extends BaseValidator<number> {
  protected options: NumberValidationOptions = {};

  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(this.createError('Value must be a number'));
      return { isValid: false, errors };
    }

    if (this.options.min !== undefined && value < this.options.min) {
      errors.push(this.createError(`Number must be greater than or equal to ${this.options.min}`));
    }

    if (this.options.max !== undefined && value > this.options.max) {
      errors.push(this.createError(`Number must be less than or equal to ${this.options.max}`));
    }

    if (this.options.integer && !Number.isInteger(value)) {
      errors.push(this.createError('Number must be an integer'));
    }

    return { isValid: errors.length === 0, errors };
  }

  min(value: number): NumberValidator {
    this.options.min = value;
    return this;
  }

  max(value: number): NumberValidator {
    this.options.max = value;
    return this;
  }

  integer(): NumberValidator {
    this.options.integer = true;
    return this;
  }
}

// Boolean validator implementation
export class BooleanValidator extends BaseValidator<boolean> {
  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'boolean') {
      errors.push(this.createError('Value must be a boolean'));
      return { isValid: false, errors };
    }

    return { isValid: true, errors };
  }
}

// Date validator implementation
export class DateValidator extends BaseValidator<Date> {
  protected options: DateValidationOptions = {};

  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    // Handle null and undefined
    if (value === null || value === undefined) {
      errors.push(this.createError('Value must be a valid date'));
      return { isValid: false, errors };
    }

    // Try to create a Date object from the input
    let date: Date;
    try {
      date = new Date(value as DateInput);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        errors.push(this.createError('Value must be a valid date'));
        return { isValid: false, errors };
      }
    } catch {
      errors.push(this.createError('Value must be a valid date'));
      return { isValid: false, errors };
    }

    // Check minimum date constraint
    if (this.options.minDate && date < this.options.minDate) {
      errors.push(this.createError(`Date must be after ${this.options.minDate.toISOString()}`));
    }

    // Check maximum date constraint
    if (this.options.maxDate && date > this.options.maxDate) {
      errors.push(this.createError(`Date must be before ${this.options.maxDate.toISOString()}`));
    }

    return { isValid: errors.length === 0, errors };
  }

  minDate(date: Date): DateValidator {
    this.options.minDate = date;
    return this;
  }

  maxDate(date: Date): DateValidator {
    this.options.maxDate = date;
    return this;
  }

  minDateISO(isoString: string): DateValidator {
    this.options.minDate = new Date(isoString);
    return this;
  }

  maxDateISO(isoString: string): DateValidator {
    this.options.maxDate = new Date(isoString);
    return this;
  }
}

// Array validator implementation
export class ArrayValidator<T> extends BaseValidator<T[]> {
  protected options: ArrayValidationOptions = {};
  private _itemValidator: BaseValidator<T>;

  constructor(itemValidator: BaseValidator<T>) {
    super();
    this._itemValidator = itemValidator;
  }

  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(value)) {
      errors.push(this.createError('Value must be an array'));
      return { isValid: false, errors };
    }

    if (this.options.minLength !== undefined && value.length < this.options.minLength) {
      errors.push(this.createError(`Array must have at least ${this.options.minLength} items`));
    }

    if (this.options.maxLength !== undefined && value.length > this.options.maxLength) {
      errors.push(this.createError(`Array must have at most ${this.options.maxLength} items`));
    }

    value.forEach((item, index) => {
      const itemResult = this._itemValidator.validate(item);
      if (!itemResult.isValid) {
        itemResult.errors.forEach(error => {
          errors.push(`Item at index ${index}: ${error}`);
        });
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  minLength(length: number): ArrayValidator<T> {
    this.options.minLength = length;
    return this;
  }

  maxLength(length: number): ArrayValidator<T> {
    this.options.maxLength = length;
    return this;
  }
}

// Object validator implementation
export class ObjectValidator<T extends Record<string, any>> extends BaseValidator<T> {
  private _schema: SchemaDefinition<T>;
  protected options: ValidationOptions = {};

  constructor(schema: SchemaDefinition<T>) {
    super();
    this._schema = schema;
  }

  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'object' || value === null) {
      errors.push(this.createError('Value must be an object'));
      return { isValid: false, errors };
    }

    for (const [key, validator] of Object.entries(this._schema)) {
      const propertyValue = (value as any)[key];
      const result = validator.validate(propertyValue);
      
      if (!result.isValid) {
        result.errors.forEach(error => {
          errors.push(`${key}: ${error}`);
        });
      }
    }

    if (this.options.strict) {
      const schemaKeys = Object.keys(this._schema);
      const valueKeys = Object.keys(value as object);
      
      for (const key of valueKeys) {
        if (!schemaKeys.includes(key)) {
          errors.push(`Unexpected property: ${key}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  strict(): ObjectValidator<T> {
    this.options.strict = true;
    return this;
  }
}

// Schema builder class that provides factory methods for creating validators
export class Schema {
  static string(): StringValidator {
    return new StringValidator();
  }

  static number(): NumberValidator {
    return new NumberValidator();
  }

  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  static date(): DateValidator {
    return new DateValidator();
  }

  static array<T>(itemValidator: BaseValidator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }

  static object<T extends Record<string, any>>(schema: SchemaDefinition<T>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
} 