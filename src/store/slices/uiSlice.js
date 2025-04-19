import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
  },
  layout: {
    sidebarOpen: true,
    sidebarWidth: 240,
    headerHeight: 64,
  },
  notifications: [],
  modals: {},
  loading: {
    global: false,
    components: {},
  },
  errors: {
    global: null,
    components: {},
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setThemeMode: (state, action) => {
      state.theme.mode = action.payload;
    },
    setPrimaryColor: (state, action) => {
      state.theme.primaryColor = action.payload;
    },
    setSecondaryColor: (state, action) => {
      state.theme.secondaryColor = action.payload;
    },

    // Layout actions
    toggleSidebar: (state) => {
      state.layout.sidebarOpen = !state.layout.sidebarOpen;
    },
    setSidebarWidth: (state, action) => {
      state.layout.sidebarWidth = action.payload;
    },
    setHeaderHeight: (state, action) => {
      state.layout.headerHeight = action.payload;
    },

    // Notification actions
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modal actions
    openModal: (state, action) => {
      const { id, props } = action.payload;
      state.modals[id] = {
        open: true,
        props,
      };
    },
    closeModal: (state, action) => {
      const { id } = action.payload;
      if (state.modals[id]) {
        state.modals[id].open = false;
      }
    },
    clearModals: (state) => {
      state.modals = {};
    },

    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { componentId, loading } = action.payload;
      state.loading.components[componentId] = loading;
    },
    clearComponentLoading: (state, action) => {
      delete state.loading.components[action.payload];
    },

    // Error actions
    setGlobalError: (state, action) => {
      state.errors.global = action.payload;
    },
    setComponentError: (state, action) => {
      const { componentId, error } = action.payload;
      state.errors.components[componentId] = error;
    },
    clearComponentError: (state, action) => {
      delete state.errors.components[action.payload];
    },
    clearAllErrors: (state) => {
      state.errors.global = null;
      state.errors.components = {};
    },

    // Preferences actions
    setLanguage: (state, action) => {
      state.preferences.language = action.payload;
    },
    setTimezone: (state, action) => {
      state.preferences.timezone = action.payload;
    },
    setDateFormat: (state, action) => {
      state.preferences.dateFormat = action.payload;
    },
    setTimeFormat: (state, action) => {
      state.preferences.timeFormat = action.payload;
    },

    // Reset UI state
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  toggleSidebar,
  setSidebarWidth,
  setHeaderHeight,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  clearModals,
  setGlobalLoading,
  setComponentLoading,
  clearComponentLoading,
  setGlobalError,
  setComponentError,
  clearComponentError,
  clearAllErrors,
  setLanguage,
  setTimezone,
  setDateFormat,
  setTimeFormat,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer; 