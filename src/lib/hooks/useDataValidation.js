import { useState, useCallback } from 'react';

const useDataValidation = (options = {}) => {
  const {
    data = {},
    validationRules = {},
    customValidators = {},
    onValidationChange = null,
    onError = null,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(true);

  // Validate single field
  const validateField = useCallback(
    (field, value) => {
      try {
        const rules = validationRules[field];
        if (!rules) return null;

        const fieldErrors = [];
        const fieldValue = value ?? data[field];

        // Apply validation rules
        for (const rule of rules) {
          const { type, message, params = {} } = rule;

          let isValid = true;
          switch (type) {
            case 'required':
              isValid = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
              break;

            case 'email':
              isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue);
              break;

            case 'min':
              isValid = fieldValue >= params.value;
              break;

            case 'max':
              isValid = fieldValue <= params.value;
              break;

            case 'minLength':
              isValid = String(fieldValue).length >= params.value;
              break;

            case 'maxLength':
              isValid = String(fieldValue).length <= params.value;
              break;

            case 'pattern':
              isValid = new RegExp(params.pattern).test(fieldValue);
              break;

            case 'custom':
              isValid = customValidators[params.validator]?.(fieldValue, data);
              break;

            default:
              isValid = true;
          }

          if (!isValid) {
            fieldErrors.push(message);
          }
        }

        return fieldErrors.length > 0 ? fieldErrors : null;
      } catch (err) {
        if (onError) {
          onError(err);
        }
        return ['Validation error occurred'];
      }
    },
    [data, validationRules, customValidators, onError]
  );

  // Validate multiple fields
  const validateFields = useCallback(
    (fields) => {
      const newErrors = {};
      let hasErrors = false;

      fields.forEach((field) => {
        const fieldErrors = validateField(field);
        if (fieldErrors) {
          newErrors[field] = fieldErrors;
          hasErrors = true;
        }
      });

      setErrors(newErrors);
      setIsValid(!hasErrors);

      if (onValidationChange) {
        onValidationChange({
          isValid: !hasErrors,
          errors: newErrors,
        });
      }

      return !hasErrors;
    },
    [validateField, onValidationChange]
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    return validateFields(Object.keys(validationRules));
  }, [validateFields, validationRules]);

  // Handle field change
  const handleChange = useCallback(
    (field, value) => {
      if (validateOnChange) {
        const fieldErrors = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: fieldErrors,
        }));
        setIsValid(Object.keys(errors).length === 0);
      }
    },
    [validateOnChange, validateField, errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      if (validateOnBlur) {
        const fieldErrors = validateField(field);
        setErrors((prev) => ({
          ...prev,
          [field]: fieldErrors,
        }));
        setIsValid(Object.keys(errors).length === 0);
      }
    },
    [validateOnBlur, validateField, errors]
  );

  // Get field error
  const getFieldError = useCallback(
    (field) => {
      return touched[field] ? errors[field]?.[0] : null;
    },
    [errors, touched]
  );

  // Get all field errors
  const getAllErrors = useCallback(() => {
    return Object.entries(errors).reduce((acc, [field, fieldErrors]) => {
      if (touched[field]) {
        acc[field] = fieldErrors[0];
      }
      return acc;
    }, {});
  }, [errors, touched]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsValid(true);
  }, []);

  // Check if field is valid
  const isFieldValid = useCallback(
    (field) => {
      return !errors[field] || errors[field].length === 0;
    },
    [errors]
  );

  // Check if field has been touched
  const isFieldTouched = useCallback(
    (field) => {
      return touched[field] || false;
    },
    [touched]
  );

  // Get field validation state
  const getFieldState = useCallback(
    (field) => {
      return {
        value: data[field],
        error: getFieldError(field),
        touched: isFieldTouched(field),
        isValid: isFieldValid(field),
      };
    },
    [data, getFieldError, isFieldTouched, isFieldValid]
  );

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateFields,
    validateAll,
    handleChange,
    handleBlur,
    getFieldError,
    getAllErrors,
    resetValidation,
    isFieldValid,
    isFieldTouched,
    getFieldState,
  };
};

export default useDataValidation; 