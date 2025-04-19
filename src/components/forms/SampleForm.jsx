import React from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
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
} from './FormComponents';
import { useFormValidation } from '../../lib/hooks/useFormValidation';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits'),
  country: Yup.string().required('Country is required'),
  interests: Yup.array().min(1, 'Select at least one interest'),
  newsletter: Yup.boolean(),
  gender: Yup.string().required('Gender is required'),
  notifications: Yup.boolean(),
  age: Yup.number()
    .required('Age is required')
    .min(18, 'You must be at least 18 years old')
    .max(100, 'Invalid age'),
  skills: Yup.array().min(1, 'Select at least one skill'),
});

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  interests: [],
  newsletter: false,
  gender: '',
  notifications: true,
  age: 18,
  skills: [],
};

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
];

const interests = [
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art' },
  { value: 'travel', label: 'Travel' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const skills = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
];

const SampleForm = () => {
  const { t } = useTranslation();
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    getFieldProps,
  } = useFormValidation(validationSchema, {
    initialValues,
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
      // Handle form submission
    },
    onError: (error) => {
      console.error('Form error:', error);
      // Handle form error
    },
  });

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormSection title={t('forms.personalInfo')}>
        <FormRow>
          <TextInput
            label={t('forms.firstName')}
            {...getFieldProps('firstName')}
          />
          <TextInput
            label={t('forms.lastName')}
            {...getFieldProps('lastName')}
          />
        </FormRow>
        <FormRow>
          <TextInput
            label={t('forms.email')}
            type="email"
            {...getFieldProps('email')}
          />
          <TextInput
            label={t('forms.phone')}
            type="tel"
            {...getFieldProps('phone')}
          />
        </FormRow>
      </FormSection>

      <FormSection title={t('forms.preferences')}>
        <FormRow>
          <SelectInput
            label={t('forms.country')}
            options={countries}
            {...getFieldProps('country')}
          />
          <AutocompleteInput
            label={t('forms.interests')}
            options={interests}
            multiple
            value={values.interests}
            onChange={(_, newValue) => {
              handleChange({
                target: { name: 'interests', value: newValue },
              });
            }}
            error={touched.interests && !!errors.interests}
            helperText={touched.interests && errors.interests}
          />
        </FormRow>
        <FormRow>
          <CheckboxInput
            label={t('forms.newsletter')}
            checked={values.newsletter}
            onChange={handleChange}
            name="newsletter"
          />
          <SwitchInput
            label={t('forms.notifications')}
            checked={values.notifications}
            onChange={handleChange}
            name="notifications"
          />
        </FormRow>
      </FormSection>

      <FormSection title={t('forms.additionalInfo')}>
        <FormRow>
          <RadioGroupInput
            label={t('forms.gender')}
            options={genderOptions}
            value={values.gender}
            onChange={handleChange}
            name="gender"
            error={touched.gender && !!errors.gender}
            helperText={touched.gender && errors.gender}
          />
          <SliderInput
            label={t('forms.age')}
            value={values.age}
            onChange={(_, newValue) => {
              handleChange({
                target: { name: 'age', value: newValue },
              });
            }}
            min={18}
            max={100}
            marks
            valueLabelDisplay="auto"
            error={touched.age && !!errors.age}
            helperText={touched.age && errors.age}
          />
        </FormRow>
        <FormRow>
          <AutocompleteInput
            label={t('forms.skills')}
            options={skills}
            multiple
            value={values.skills}
            onChange={(_, newValue) => {
              handleChange({
                target: { name: 'skills', value: newValue },
              });
            }}
            error={touched.skills && !!errors.skills}
            helperText={touched.skills && errors.skills}
          />
        </FormRow>
      </FormSection>

      <FormRow>
        <SubmitButton
          label={t('forms.submit')}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <ResetButton
          label={t('forms.reset')}
          onClick={resetForm}
          disabled={isSubmitting}
        />
      </FormRow>
    </FormContainer>
  );
};

export default SampleForm; 