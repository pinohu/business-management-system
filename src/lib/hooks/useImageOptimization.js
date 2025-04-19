import { useState, useEffect, useRef } from 'react';

const useImageOptimization = (options = {}) => {
  const {
    src,
    sizes = '100vw',
    quality = 75,
    placeholder = 'blur',
    blurDataURL = null,
    onLoad = null,
    onError = null,
    threshold = 0.1,
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    // Start observing if image ref exists
    if (imageRef.current) {
      observerRef.current.observe(imageRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  useEffect(() => {
    if (!isVisible || !src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setIsLoaded(true);
      if (onLoad) {
        onLoad(img);
      }
    };

    img.onerror = (error) => {
      setIsError(true);
      if (onError) {
        onError(error);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isVisible, onLoad, onError]);

  const getOptimizedSrc = () => {
    if (!src) return '';
    
    // If using Next.js Image component
    if (src.startsWith('/')) {
      return src;
    }

    // For external images, you might want to use an image optimization service
    // This is an example using a hypothetical service
    return `https://your-image-optimization-service.com/image?url=${encodeURIComponent(
      src
    )}&w=${sizes}&q=${quality}`;
  };

  const getPlaceholderStyle = () => {
    if (!placeholder || !blurDataURL) return {};

    return {
      backgroundImage: `url(${blurDataURL})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(20px)',
    };
  };

  return {
    imageRef,
    isLoaded,
    isError,
    isVisible,
    optimizedSrc: getOptimizedSrc(),
    placeholderStyle: getPlaceholderStyle(),
  };
};

export default useImageOptimization; 