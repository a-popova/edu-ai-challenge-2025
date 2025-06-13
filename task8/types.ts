// Base validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Base validator interface
export interface Validator<T> {
  validate(value: unknown): ValidationResult;
  withMessage(message: string): Validator<T>;
}

// Type for schema definition in object validator
export type SchemaDefinition<T> = {
  [K in keyof T]: Validator<T[K]>;
};

// Type for date input formats
export type DateInput = Date | string | number;

// Type for validation options
export interface ValidationOptions {
  strict?: boolean;
  customMessage?: string;
}

// Type for array validation options
export interface ArrayValidationOptions extends ValidationOptions {
  minLength?: number;
  maxLength?: number;
}

// Type for date validation options
export interface DateValidationOptions extends ValidationOptions {
  minDate?: Date;
  maxDate?: Date;
}

// Type for number validation options
export interface NumberValidationOptions extends ValidationOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

// Type for string validation options
export interface StringValidationOptions extends ValidationOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
} 