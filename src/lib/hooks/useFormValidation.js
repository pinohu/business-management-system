import { useState, useCallback } from 'react';
import * as Yup from 'yup';

export const useFormValidation = (validationSchema, options = {}) => {
  const {
    initialValues = {},
    onSubmit,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    async (fieldName, value) => {
      try {
        await validationSchema.validateAt(fieldName, {
          [fieldName]: value,
        });
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
        return true;
      } catch (err) {
        setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
        return false;
      }
    },
    [validationSchema]
  );

  const validateForm = useCallback(async () => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setValues((prev) => ({ ...prev, [name]: fieldValue }));

      if (validateOnChange) {
        validateField(name, fieldValue);
      }
    },
    [validateField, validateOnChange]
  );

  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        validateField(name, values[name]);
      }
    },
    [validateField, validateOnBlur, values]
  );

  const handleSubmit = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
      }

      setIsSubmitting(true);
      try {
        const isValid = await validateForm();
        if (isValid) {
          await onSubmit?.(values);
        } else {
          onError?.(errors);
        }
      } catch (error) {
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, onError, values, errors]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && !!errors[name],
      helperText: touched[name] && errors[name],
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldProps,
    validateField,
    validateForm,
  };
}; 