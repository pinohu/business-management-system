import { useState, useCallback } from 'react';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (typeof rule === 'function') {
        const error = rule(value);
        if (error) return error;
      } else if (rule.required && !value) {
        return 'This field is required';
      } else if (rule.minLength && value.length < rule.minLength) {
        return `Must be at least ${rule.minLength} characters`;
      } else if (rule.maxLength && value.length > rule.maxLength) {
        return `Must be at most ${rule.maxLength} characters`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || 'Invalid format';
      } else if (rule.validate && !rule.validate(value)) {
        return rule.message || 'Invalid value';
      }
    }
    return '';
  }, [validationRules]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(values).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, values[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, [values, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    try {
      if (validateForm()) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const getFieldProps = useCallback((name) => {
    return {
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && !!errors[name],
      helperText: touched[name] && errors[name],
    };
  }, [values, touched, errors, handleChange, handleBlur]);

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
    validateForm,
  };
};

export default useForm; 