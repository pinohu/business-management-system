import * as Yup from 'yup';

// Custom validation messages
export const messages = {
  required: '{{field}} is required',
  email: 'Invalid email address',
  minLength: '{{field}} must be at least {{min}} characters',
  maxLength: '{{field}} must not exceed {{max}} characters',
  min: '{{field}} must be at least {{min}}',
  max: '{{field}} must not exceed {{max}}',
  numeric: '{{field}} must be a number',
  integer: '{{field}} must be an integer',
  positive: '{{field}} must be positive',
  negative: '{{field}} must be negative',
  url: 'Invalid URL',
  phone: 'Invalid phone number',
  date: 'Invalid date',
  dateBefore: '{{field}} must be before {{date}}',
  dateAfter: '{{field}} must be after {{date}}',
  dateBetween: '{{field}} must be between {{start}} and {{end}}',
  fileSize: 'File size must not exceed {{size}}MB',
  fileType: 'Invalid file type. Allowed types: {{types}}',
  minArray: 'Select at least {{min}} items',
  maxArray: 'Select no more than {{max}} items',
  unique: '{{field}} must be unique',
  match: '{{field}} must match {{match}}',
  password: {
    minLength: 'Password must be at least {{min}} characters',
    requireNumber: 'Password must contain at least one number',
    requireUppercase: 'Password must contain at least one uppercase letter',
    requireLowercase: 'Password must contain at least one lowercase letter',
    requireSpecial: 'Password must contain at least one special character',
  },
};

// Custom validators
export const validators = {
  // Phone number validator (supports international formats)
  phone: Yup.string().matches(
    /^\+?[1-9]\d{1,14}$/,
    messages.phone
  ),

  // URL validator with custom protocols
  url: (allowedProtocols = ['http', 'https']) =>
    Yup.string().matches(
      new RegExp(`^(${allowedProtocols.join('|')})://[^\\s/$.?#].[^\\s]*$`),
      messages.url
    ),

  // Date range validator
  dateRange: (startField, endField) =>
    Yup.object().shape({
      start: Yup.date()
        .required(messages.required)
        .typeError(messages.date),
      end: Yup.date()
        .required(messages.required)
        .typeError(messages.date)
        .min(
          Yup.ref(startField),
          messages.dateAfter.replace('{{date}}', 'start date')
        ),
    }),

  // File validator
  file: (options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      maxFiles = 1,
    } = options;

    return Yup.mixed()
      .test('fileSize', messages.fileSize.replace('{{size}}', maxSize / (1024 * 1024)), (value) => {
        if (!value) return true;
        const files = Array.isArray(value) ? value : [value];
        return files.every((file) => file.size <= maxSize);
      })
      .test('fileType', messages.fileType.replace('{{types}}', allowedTypes.join(', ')), (value) => {
        if (!value) return true;
        const files = Array.isArray(value) ? value : [value];
        return files.every((file) => allowedTypes.includes(file.type));
      })
      .test('maxFiles', messages.maxArray.replace('{{max}}', maxFiles), (value) => {
        if (!value) return true;
        return Array.isArray(value) ? value.length <= maxFiles : true;
      });
  },

  // Password validator with complexity requirements
  password: (options = {}) => {
    const {
      minLength = 8,
      requireNumber = true,
      requireUppercase = true,
      requireLowercase = true,
      requireSpecial = true,
    } = options;

    let schema = Yup.string()
      .min(minLength, messages.password.minLength.replace('{{min}}', minLength));

    if (requireNumber) {
      schema = schema.matches(/[0-9]/, messages.password.requireNumber);
    }
    if (requireUppercase) {
      schema = schema.matches(/[A-Z]/, messages.password.requireUppercase);
    }
    if (requireLowercase) {
      schema = schema.matches(/[a-z]/, messages.password.requireLowercase);
    }
    if (requireSpecial) {
      schema = schema.matches(/[!@#$%^&*(),.?":{}|<>]/, messages.password.requireSpecial);
    }

    return schema;
  },

  // Array validator with unique values
  uniqueArray: (field) =>
    Yup.array()
      .of(Yup.string())
      .unique('Duplicate values are not allowed')
      .min(1, messages.minArray.replace('{{min}}', 1)),

  // Object validator with required fields
  requiredObject: (fields) =>
    Yup.object().shape(
      fields.reduce((acc, field) => {
        acc[field] = Yup.string().required(messages.required.replace('{{field}}', field));
        return acc;
      }, {})
    ),

  // Conditional validation
  conditional: (condition, schema) =>
    Yup.mixed().when('$condition', {
      is: condition,
      then: schema,
      otherwise: Yup.mixed().nullable(),
    }),
};

// Validation utilities
export const validationUtils = {
  // Format validation message with variables
  formatMessage: (message, variables = {}) => {
    let formattedMessage = message;
    Object.entries(variables).forEach(([key, value]) => {
      formattedMessage = formattedMessage.replace(`{{${key}}}`, value);
    });
    return formattedMessage;
  },

  // Create a validation schema from a configuration object
  createSchema: (config) => {
    const schema = {};
    Object.entries(config).forEach(([field, rules]) => {
      let fieldSchema = Yup.mixed();
      
      rules.forEach((rule) => {
        const { type, params = {} } = rule;
        
        switch (type) {
          case 'required':
            fieldSchema = fieldSchema.required(
              validationUtils.formatMessage(messages.required, { field })
            );
            break;
          case 'email':
            fieldSchema = fieldSchema.email(
              validationUtils.formatMessage(messages.email)
            );
            break;
          case 'minLength':
            fieldSchema = fieldSchema.min(
              params.length,
              validationUtils.formatMessage(messages.minLength, {
                field,
                min: params.length,
              })
            );
            break;
          case 'maxLength':
            fieldSchema = fieldSchema.max(
              params.length,
              validationUtils.formatMessage(messages.maxLength, {
                field,
                max: params.length,
              })
            );
            break;
          case 'min':
            fieldSchema = fieldSchema.min(
              params.value,
              validationUtils.formatMessage(messages.min, {
                field,
                min: params.value,
              })
            );
            break;
          case 'max':
            fieldSchema = fieldSchema.max(
              params.value,
              validationUtils.formatMessage(messages.max, {
                field,
                max: params.value,
              })
            );
            break;
          case 'numeric':
            fieldSchema = fieldSchema.numeric(
              validationUtils.formatMessage(messages.numeric, { field })
            );
            break;
          case 'integer':
            fieldSchema = fieldSchema.integer(
              validationUtils.formatMessage(messages.integer, { field })
            );
            break;
          case 'positive':
            fieldSchema = fieldSchema.positive(
              validationUtils.formatMessage(messages.positive, { field })
            );
            break;
          case 'negative':
            fieldSchema = fieldSchema.negative(
              validationUtils.formatMessage(messages.negative, { field })
            );
            break;
          case 'url':
            fieldSchema = fieldSchema.url(
              validationUtils.formatMessage(messages.url)
            );
            break;
          case 'phone':
            fieldSchema = fieldSchema.matches(
              /^\+?[1-9]\d{1,14}$/,
              validationUtils.formatMessage(messages.phone)
            );
            break;
          case 'date':
            fieldSchema = fieldSchema.date(
              validationUtils.formatMessage(messages.date)
            );
            break;
          case 'dateBefore':
            fieldSchema = fieldSchema.max(
              params.date,
              validationUtils.formatMessage(messages.dateBefore, {
                field,
                date: params.date,
              })
            );
            break;
          case 'dateAfter':
            fieldSchema = fieldSchema.min(
              params.date,
              validationUtils.formatMessage(messages.dateAfter, {
                field,
                date: params.date,
              })
            );
            break;
          case 'dateBetween':
            fieldSchema = fieldSchema
              .min(
                params.start,
                validationUtils.formatMessage(messages.dateBetween, {
                  field,
                  start: params.start,
                  end: params.end,
                })
              )
              .max(
                params.end,
                validationUtils.formatMessage(messages.dateBetween, {
                  field,
                  start: params.start,
                  end: params.end,
                })
              );
            break;
          case 'file':
            fieldSchema = validators.file(params);
            break;
          case 'password':
            fieldSchema = validators.password(params);
            break;
          case 'uniqueArray':
            fieldSchema = validators.uniqueArray(field);
            break;
          case 'requiredObject':
            fieldSchema = validators.requiredObject(params.fields);
            break;
          case 'conditional':
            fieldSchema = validators.conditional(params.condition, params.schema);
            break;
        }
      });
      
      schema[field] = fieldSchema;
    });
    
    return Yup.object().shape(schema);
  },
}; 