import { useState, useCallback, useRef, useEffect } from 'react';

const useDragAndDrop = (options = {}) => {
  const {
    onDragStart = null,
    onDragEnd = null,
    onDrop = null,
    onDragOver = null,
    onDragLeave = null,
    threshold = 5,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const elementRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (event) => {
      const { clientX, clientY } = event.type.includes('touch')
        ? event.touches[0]
        : event;

      startPosRef.current = { x: clientX, y: clientY };
      lastPosRef.current = { x: clientX, y: clientY };

      if (onDragStart) {
        onDragStart(event);
      }
    },
    [onDragStart]
  );

  const handleDrag = useCallback(
    (event) => {
      event.preventDefault();

      const { clientX, clientY } = event.type.includes('touch')
        ? event.touches[0]
        : event;

      const deltaX = Math.abs(clientX - startPosRef.current.x);
      const deltaY = Math.abs(clientY - startPosRef.current.y);

      if (!isDragging && (deltaX > threshold || deltaY > threshold)) {
        setIsDragging(true);
        setDragData(event.dataTransfer?.getData('text/plain'));
      }

      lastPosRef.current = { x: clientX, y: clientY };

      if (onDragOver) {
        onDragOver(event);
      }
    },
    [isDragging, threshold, onDragOver]
  );

  const handleDragEnd = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      setDragData(null);

      if (onDragEnd) {
        onDragEnd(event);
      }
    },
    [onDragEnd]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      setDragData(null);
      setDropTarget(null);

      if (onDrop) {
        onDrop(event);
      }
    },
    [onDrop]
  );

  const handleDragLeave = useCallback(
    (event) => {
      event.preventDefault();
      setDropTarget(null);

      if (onDragLeave) {
        onDragLeave(event);
      }
    },
    [onDragLeave]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Mouse events
    element.addEventListener('mousedown', handleDragStart);
    element.addEventListener('mousemove', handleDrag);
    element.addEventListener('mouseup', handleDragEnd);
    element.addEventListener('mouseleave', handleDragEnd);

    // Touch events
    element.addEventListener('touchstart', handleDragStart);
    element.addEventListener('touchmove', handleDrag);
    element.addEventListener('touchend', handleDragEnd);
    element.addEventListener('touchcancel', handleDragEnd);

    // Drop events
    element.addEventListener('dragover', handleDrag);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragleave', handleDragLeave);

    return () => {
      // Mouse events
      element.removeEventListener('mousedown', handleDragStart);
      element.removeEventListener('mousemove', handleDrag);
      element.removeEventListener('mouseup', handleDragEnd);
      element.removeEventListener('mouseleave', handleDragEnd);

      // Touch events
      element.removeEventListener('touchstart', handleDragStart);
      element.removeEventListener('touchmove', handleDrag);
      element.removeEventListener('touchend', handleDragEnd);
      element.removeEventListener('touchcancel', handleDragEnd);

      // Drop events
      element.removeEventListener('dragover', handleDrag);
      element.removeEventListener('drop', handleDrop);
      element.removeEventListener('dragleave', handleDragLeave);
    };
  }, [
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleDrop,
    handleDragLeave,
  ]);

  return {
    elementRef,
    isDragging,
    dragData,
    dropTarget,
    setDropTarget,
  };
};

export default useDragAndDrop; 