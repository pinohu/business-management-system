import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useApi } from '../../hooks/useApi';

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const api = useApi();
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const api = useApi();
      const response = await api.put('/settings', settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  general: {
    siteName: 'My App',
    siteDescription: 'A modern web application',
    siteLogo: null,
    favicon: null,
    contactEmail: 'contact@example.com',
    supportEmail: 'support@example.com',
  },
  security: {
    requireEmailVerification: true,
    allowPasswordReset: true,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: true,
    fromName: 'My App',
    fromEmail: 'noreply@example.com',
  },
  storage: {
    maxFileSize: 5, // MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    storageProvider: 'local', // local, s3, etc.
    s3Bucket: '',
    s3Region: '',
    s3AccessKey: '',
    s3SecretKey: '',
  },
  analytics: {
    enabled: true,
    googleAnalyticsId: '',
    customAnalyticsScript: '',
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocalSettings: (state, action) => {
      const { section, settings } = action.payload;
      state[section] = { ...state[section], ...settings };
      state.lastUpdated = new Date().toISOString();
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        Object.keys(action.payload).forEach((section) => {
          if (state[section]) {
            state[section] = { ...state[section], ...action.payload[section] };
          }
        });
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch settings';
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        Object.keys(action.payload).forEach((section) => {
          if (state[section]) {
            state[section] = { ...state[section], ...action.payload[section] };
          }
        });
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update settings';
      });
  },
});

export const { clearError, updateLocalSettings, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer; 