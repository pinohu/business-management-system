import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

// Import reducers
import authReducer from './slices/authSlice';
import dataReducer from './slices/dataSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import formReducer from './slices/formSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'], // Only persist these reducers
  blacklist: ['ui'], // Don't persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  data: dataReducer,
  ui: uiReducer,
  settings: settingsReducer,
  form: formReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'form/saveFormState'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.values'],
      },
    }).concat(thunk, logger),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 