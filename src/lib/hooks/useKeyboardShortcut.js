import { useEffect, useCallback } from 'react';

const useKeyboardShortcut = (key, callback, options = {}) => {
  const {
    modifierKey = null,
    preventDefault = true,
    stopPropagation = false,
    enabled = true,
  } = options;

  const handleKeyPress = useCallback(
    (event) => {
      if (!enabled) return;

      const isModifierPressed = modifierKey
        ? event[modifierKey]
        : true;

      if (event.key.toLowerCase() === key.toLowerCase() && isModifierPressed) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback(event);
      }
    },
    [key, callback, modifierKey, preventDefault, stopPropagation, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

export default useKeyboardShortcut; 