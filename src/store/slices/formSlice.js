import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  forms: {},
  activeForm: null,
  formHistory: {},
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Save form state
    saveFormState: (state, action) => {
      const { formId, values } = action.payload;
      state.forms[formId] = {
        values,
        timestamp: Date.now(),
      };
    },

    // Load form state
    loadFormState: (state, action) => {
      const { formId } = action.payload;
      return {
        ...state,
        activeForm: formId,
      };
    },

    // Clear form state
    clearFormState: (state, action) => {
      const { formId } = action.payload;
      delete state.forms[formId];
      if (state.activeForm === formId) {
        state.activeForm = null;
      }
    },

    // Update form history
    updateFormHistory: (state, action) => {
      const { formId, values } = action.payload;
      if (!state.formHistory[formId]) {
        state.formHistory[formId] = [];
      }
      state.formHistory[formId].push({
        values,
        timestamp: Date.now(),
      });
    },

    // Clear form history
    clearFormHistory: (state, action) => {
      const { formId } = action.payload;
      delete state.formHistory[formId];
    },

    // Reset all form states
    resetAllForms: (state) => {
      state.forms = {};
      state.activeForm = null;
      state.formHistory = {};
    },
  },
});

export const {
  saveFormState,
  loadFormState,
  clearFormState,
  updateFormHistory,
  clearFormHistory,
  resetAllForms,
} = formSlice.actions;

// Selectors
export const selectFormState = (state, formId) => state.form.forms[formId];
export const selectActiveForm = (state) => state.form.activeForm;
export const selectFormHistory = (state, formId) => state.form.formHistory[formId];

export default formSlice.reducer; 