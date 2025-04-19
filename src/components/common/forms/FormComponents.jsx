import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Autocomplete,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// Form Container Component
export const FormContainer = ({ children, onSubmit, ...props }) => (
  <Box component="form" onSubmit={onSubmit} {...props}>
    {children}
  </Box>
);

// Form Section Component
export const FormSection = ({ title, children, ...props }) => (
  <Paper sx={{ p: 3, mb: 3 }} {...props}>
    {title && (
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

// Form Row Component
export const FormRow = ({ children, spacing = 2, ...props }) => (
  <Grid container spacing={spacing} {...props}>
    {React.Children.map(children, (child) => (
      <Grid item xs={12} sm={6}>
        {child}
      </Grid>
    ))}
  </Grid>
);

// Text Input Component
export const TextInput = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  ...props
}) => (
  <TextField
    name={name}
    label={label}
    type={type}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    error={error}
    helperText={helperText}
    disabled={disabled}
    required={required}
    fullWidth={fullWidth}
    {...props}
  />
);

// Select Input Component
export const SelectInput = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  options = [],
  disabled = false,
  required = false,
  fullWidth = true,
  ...props
}) => (
  <FormControl fullWidth={fullWidth} error={error}>
    <InputLabel>{label}</InputLabel>
    <Select
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      label={label}
      disabled={disabled}
      required={required}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
    {helperText && (
      <Typography variant="caption" color="error">
        {helperText}
      </Typography>
    )}
  </FormControl>
);

// Checkbox Input Component
export const CheckboxInput = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => (
  <FormControlLabel
    control={
      <Checkbox
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    }
    label={label}
  />
);

// Radio Group Input Component
export const RadioGroupInput = ({
  name,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  helperText,
  ...props
}) => (
  <FormControl error={error}>
    <Typography variant="subtitle2" gutterBottom>
      {label}
    </Typography>
    <RadioGroup
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...props}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio />}
          label={option.label}
        />
      ))}
    </RadioGroup>
    {helperText && (
      <Typography variant="caption" color="error">
        {helperText}
      </Typography>
    )}
  </FormControl>
);

// Switch Input Component
export const SwitchInput = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => (
  <FormControlLabel
    control={
      <Switch
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    }
    label={label}
  />
);

// Slider Input Component
export const SliderInput = ({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  marks = false,
  disabled = false,
  error,
  helperText,
  valueLabelDisplay = 'auto',
  ...props
}) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>
      {label}
    </Typography>
    <Slider
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      marks={marks}
      disabled={disabled}
      valueLabelDisplay={valueLabelDisplay}
      {...props}
    />
    {helperText && (
      <Typography variant="caption" color="error">
        {helperText}
      </Typography>
    )}
  </Box>
);

// Autocomplete Input Component
export const AutocompleteInput = ({
  name,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  helperText,
  multiple = false,
  freeSolo = false,
  ...props
}) => (
  <Autocomplete
    name={name}
    value={value}
    onChange={onChange}
    options={options}
    disabled={disabled}
    multiple={multiple}
    freeSolo={freeSolo}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        error={error}
        helperText={helperText}
      />
    )}
    {...props}
  />
);

// Submit Button Component
export const SubmitButton = ({
  label,
  loading = false,
  disabled = false,
  ...props
}) => (
  <Button
    type="submit"
    variant="contained"
    color="primary"
    disabled={disabled || loading}
    {...props}
  >
    {loading ? 'Submitting...' : label}
  </Button>
);

// Reset Button Component
export const ResetButton = ({
  label,
  onClick,
  disabled = false,
  ...props
}) => (
  <Button
    type="button"
    variant="outlined"
    color="secondary"
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {label}
  </Button>
); 