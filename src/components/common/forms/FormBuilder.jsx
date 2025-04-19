import React from 'react';
import { Box, Typography } from '@mui/material';
import { useFormValidation } from '../../../lib/hooks/useFormValidation';
import { useFormPersistence } from '../../../lib/hooks/useFormPersistence';
import { validationUtils } from '../../../lib/validation/validators';
import {
  FormContainer,
  FormSection,
  FormRow,
  TextInput,
  SelectInput,
  CheckboxInput,
  RadioGroupInput,
  SwitchInput,
  SliderInput,
  AutocompleteInput,
  SubmitButton,
  ResetButton,
  FileUploadInput,
  RichTextInput,
  DateRangeInput,
  ImageUploadInput,
  CurrencyInput,
} from './FormComponents';

const componentMap = {
  text: TextInput,
  select: SelectInput,
  checkbox: CheckboxInput,
  radio: RadioGroupInput,
  switch: SwitchInput,
  slider: SliderInput,
  autocomplete: AutocompleteInput,
  file: FileUploadInput,
  richText: RichTextInput,
  dateRange: DateRangeInput,
  image: ImageUploadInput,
  currency: CurrencyInput,
};

const FormBuilder = ({
  config,
  onSubmit,
  onError,
  initialValues = {},
  submitLabel = 'Submit',
  resetLabel = 'Reset',
  showReset = true,
  formId,
  persistenceOptions = {},
  ...props
}) => {
  // Get initial values from config
  const defaultValues = config.reduce((acc, field) => {
    acc[field.name] = field.defaultValue || '';
    return acc;
  }, {});

  // Create validation schema from config
  const validationSchema = validationUtils.createSchema(
    config.reduce((acc, field) => {
      acc[field.name] = field.validation || [];
      return acc;
    }, {})
  );

  // Initialize form persistence
  const { savedState, saveForm, clearForm } = useFormPersistence(formId, {
    autoSave: true,
    saveInterval: 5000,
    saveOnSubmit: true,
    loadOnMount: true,
    clearOnUnmount: false,
    trackHistory: false,
    ...persistenceOptions,
  });

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    resetForm,
    getFieldProps,
  } = useFormValidation(validationSchema, {
    initialValues: { ...defaultValues, ...savedState?.values, ...initialValues },
    onSubmit: async (values) => {
      if (onSubmit) {
        await onSubmit(values);
      }
      if (persistenceOptions.saveOnSubmit) {
        saveForm(values);
      }
    },
    onError,
  });

  // Group fields by section
  const sections = config.reduce((acc, field) => {
    const section = field.section || 'default';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {});

  const renderField = (field) => {
    const Component = componentMap[field.type];
    if (!Component) {
      console.warn(`Unknown field type: ${field.type}`);
      return null;
    }

    const commonProps = {
      name: field.name,
      label: field.label,
      disabled: field.disabled,
      ...getFieldProps(field.name),
    };

    switch (field.type) {
      case 'select':
        return <Component {...commonProps} options={field.options} />;
      case 'radio':
        return <Component {...commonProps} options={field.options} />;
      case 'slider':
        return (
          <Component
            {...commonProps}
            min={field.min}
            max={field.max}
            marks={field.marks}
            valueLabelDisplay={field.valueLabelDisplay}
          />
        );
      case 'autocomplete':
        return (
          <Component
            {...commonProps}
            options={field.options}
            multiple={field.multiple}
            freeSolo={field.freeSolo}
          />
        );
      case 'file':
        return (
          <Component
            {...commonProps}
            accept={field.accept}
            multiple={field.multiple}
            maxFiles={field.maxFiles}
            maxSize={field.maxSize}
            onError={onError}
          />
        );
      case 'image':
        return (
          <Component
            {...commonProps}
            maxSize={field.maxSize}
            onError={onError}
          />
        );
      case 'dateRange':
        return (
          <Component
            {...commonProps}
            value={values[field.name] || { start: null, end: null }}
            onChange={(value) => {
              handleChange({
                target: { name: field.name, value },
              });
            }}
          />
        );
      case 'richText':
        return (
          <Component
            {...commonProps}
            multiline
            rows={field.rows || 4}
          />
        );
      case 'currency':
        return (
          <Component
            {...commonProps}
            currency={field.currency}
          />
        );
      default:
        return <Component {...commonProps} />;
    }
  };

  const renderSection = (sectionFields, sectionName) => {
    if (!sectionFields.length) return null;

    return (
      <FormSection
        key={sectionName}
        title={sectionName !== 'default' ? sectionName : undefined}
      >
        {sectionFields.map((field) => (
          <FormRow key={field.name}>
            {renderField(field)}
          </FormRow>
        ))}
      </FormSection>
    );
  };

  const handleReset = () => {
    resetForm();
    clearForm();
  };

  return (
    <FormContainer onSubmit={handleFormSubmit} {...props}>
      {Object.entries(sections).map(([sectionName, sectionFields]) =>
        renderSection(sectionFields, sectionName)
      )}
      <FormRow>
        <SubmitButton
          label={submitLabel}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        {showReset && (
          <ResetButton
            label={resetLabel}
            onClick={handleReset}
            disabled={isSubmitting}
          />
        )}
      </FormRow>
    </FormContainer>
  );
};

export default FormBuilder; 