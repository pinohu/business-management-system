import { useState, useEffect, useCallback, useRef } from 'react';

const useAnimation = (options = {}) => {
  const {
    duration = 300,
    easing = 'ease-in-out',
    delay = 0,
    onComplete = null,
    onStart = null,
  } = options;

  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const animate = useCallback(
    (startValue, endValue, onUpdate) => {
      if (isAnimating) return;

      setIsAnimating(true);
      startTimeRef.current = Date.now();

      const animateFrame = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTimeRef.current - delay;
        const newProgress = Math.min(elapsed / duration, 1);

        // Apply easing function
        let easedProgress = newProgress;
        switch (easing) {
          case 'ease-in':
            easedProgress = newProgress * newProgress;
            break;
          case 'ease-out':
            easedProgress = 1 - (1 - newProgress) * (1 - newProgress);
            break;
          case 'ease-in-out':
            easedProgress =
              newProgress < 0.5
                ? 2 * newProgress * newProgress
                : 1 - Math.pow(-2 * newProgress + 2, 2) / 2;
            break;
          default:
            // Linear easing
            break;
        }

        const currentValue =
          startValue + (endValue - startValue) * easedProgress;

        setProgress(easedProgress);
        onUpdate(currentValue);

        if (newProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateFrame);
        } else {
          setIsAnimating(false);
          if (onComplete) {
            onComplete();
          }
        }
      };

      if (onStart) {
        onStart();
      }

      if (delay > 0) {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(animateFrame);
        }, delay);
      } else {
        animationFrameRef.current = requestAnimationFrame(animateFrame);
      }
    },
    [duration, easing, delay, isAnimating, onComplete, onStart]
  );

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    animate,
    stopAnimation,
    isAnimating,
    progress,
  };
};

export default useAnimation; 