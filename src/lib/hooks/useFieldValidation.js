import { useState, useEffect, useCallback } from 'react';

const useFieldValidation = (options = {}) => {
  const {
    value,
    rules = [],
    validateOnChange = true,
    validateOnBlur = true,
    onValidationChange = null,
    initialError = null,
  } = options;

  const [error, setError] = useState(initialError);
  const [isValid, setIsValid] = useState(!initialError);
  const [isDirty, setIsDirty] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const validateField = useCallback(
    (valueToValidate = value) => {
      let fieldError = null;

      // Run through all validation rules
      for (const rule of rules) {
        const validationResult = rule(valueToValidate);
        
        if (typeof validationResult === 'string') {
          fieldError = validationResult;
          break;
        } else if (validationResult === false) {
          fieldError = 'Invalid value';
          break;
        }
      }

      setError(fieldError);
      setIsValid(!fieldError);

      if (onValidationChange) {
        onValidationChange({
          isValid: !fieldError,
          error: fieldError,
          isDirty,
          isTouched,
        });
      }

      return !fieldError;
    },
    [value, rules, isDirty, isTouched, onValidationChange]
  );

  // Handle value changes
  useEffect(() => {
    if (validateOnChange && isDirty) {
      validateField();
    }
  }, [value, validateOnChange, isDirty, validateField]);

  // Handle blur event
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    if (validateOnBlur) {
      validateField();
    }
  }, [validateOnBlur, validateField]);

  // Handle focus event
  const handleFocus = useCallback(() => {
    setIsDirty(true);
  }, []);

  // Reset field state
  const reset = useCallback(() => {
    setError(initialError);
    setIsValid(!initialError);
    setIsDirty(false);
    setIsTouched(false);
  }, [initialError]);

  return {
    error,
    isValid,
    isDirty,
    isTouched,
    validate: validateField,
    handleBlur,
    handleFocus,
    reset,
  };
};

export default useFieldValidation; 