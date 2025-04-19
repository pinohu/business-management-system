import React from 'react';
import {
  TextField,
  Box,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Typography,
  Button,
} from '@mui/material';
import {
  AttachFile,
  Clear,
  CloudUpload,
  Image as ImageIcon,
  Delete,
} from '@mui/icons-material';

// File Upload Component
export const FileUploadInput = ({
  name,
  label,
  accept = '*/*',
  multiple = false,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  value = [],
  onChange,
  onError,
  disabled = false,
  ...props
}) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      onError?.(`Files must be smaller than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Validate number of files
    if (multiple) {
      if (value.length + files.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }
      onChange?.(files);
    } else {
      onChange?.(files[0]);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange?.(newFiles);
  };

  return (
    <Box>
      <input
        type="file"
        id={name}
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
        {...props}
      />
      <label htmlFor={name}>
        <Button
          component="span"
          variant="outlined"
          startIcon={<CloudUpload />}
          disabled={disabled}
        >
          {label}
        </Button>
      </label>
      {value.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Array.isArray(value) ? (
            value.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => handleRemoveFile(index)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))
          ) : (
            <Chip
              label={value.name}
              onDelete={() => onChange?.(null)}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

// Rich Text Editor Component
export const RichTextInput = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  ...props
}) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        multiline
        rows={4}
        {...props}
      />
      {helperText && (
        <Typography variant="caption" color="error">
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

// Date Range Picker Component
export const DateRangeInput = ({
  name,
  label,
  value = { start: null, end: null },
  onChange,
  error,
  helperText,
  disabled = false,
  ...props
}) => {
  const handleChange = (field) => (event) => {
    onChange?.({
      ...value,
      [field]: event.target.value,
    });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          type="date"
          value={value.start || ''}
          onChange={handleChange('start')}
          disabled={disabled}
          error={error}
          InputLabelProps={{ shrink: true }}
          {...props}
        />
        <TextField
          type="date"
          value={value.end || ''}
          onChange={handleChange('end')}
          disabled={disabled}
          error={error}
          InputLabelProps={{ shrink: true }}
          {...props}
        />
      </Box>
      {helperText && (
        <Typography variant="caption" color="error">
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

// Image Upload with Preview Component
export const ImageUploadInput = ({
  name,
  label,
  value,
  onChange,
  onError,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*',
  ...props
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('File must be an image');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      onError?.(`Image must be smaller than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    onChange?.(file);
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  return (
    <Box>
      <input
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
        {...props}
      />
      {value ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={typeof value === 'string' ? value : URL.createObjectURL(value)}
            alt="Preview"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
          <IconButton
            size="small"
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      ) : (
        <label htmlFor={name}>
          <Button
            component="span"
            variant="outlined"
            startIcon={<ImageIcon />}
            disabled={disabled}
          >
            {label}
          </Button>
        </label>
      )}
    </Box>
  );
};

// Currency Input Component
export const CurrencyInput = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  currency = 'USD',
  ...props
}) => {
  const handleChange = (event) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    onChange?.({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {currency === 'USD' ? '$' : currency}
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}; 