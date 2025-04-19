import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveFormState,
  loadFormState,
  clearFormState,
  updateFormHistory,
  selectFormState,
} from '../../store/slices/formSlice';

export const useFormPersistence = (formId, options = {}) => {
  const {
    autoSave = true,
    saveInterval = 5000, // 5 seconds
    saveOnSubmit = true,
    loadOnMount = true,
    clearOnUnmount = false,
    trackHistory = false,
  } = options;

  const dispatch = useDispatch();
  const savedState = useSelector((state) => selectFormState(state, formId));

  // Load saved state on mount
  useEffect(() => {
    if (loadOnMount && savedState) {
      dispatch(loadFormState({ formId }));
    }
  }, [dispatch, formId, loadOnMount, savedState]);

  // Auto-save form state
  useEffect(() => {
    let saveIntervalId;

    if (autoSave) {
      saveIntervalId = setInterval(() => {
        dispatch(saveFormState({ formId, values: savedState?.values }));
      }, saveInterval);
    }

    return () => {
      if (saveIntervalId) {
        clearInterval(saveIntervalId);
      }
      if (clearOnUnmount) {
        dispatch(clearFormState({ formId }));
      }
    };
  }, [dispatch, formId, autoSave, saveInterval, clearOnUnmount, savedState]);

  // Save form state
  const saveForm = (values) => {
    dispatch(saveFormState({ formId, values }));
    if (trackHistory) {
      dispatch(updateFormHistory({ formId, values }));
    }
  };

  // Clear form state
  const clearForm = () => {
    dispatch(clearFormState({ formId }));
  };

  return {
    savedState,
    saveForm,
    clearForm,
  };
}; 