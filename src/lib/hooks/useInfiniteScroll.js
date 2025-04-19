import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (fetchCallback, options = {}) => {
  const {
    threshold = 100,
    initialPage = 1,
    pageSize = 10,
    resetOnDependencyChange = true,
  } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const observer = useRef(null);
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            loadMore();
          }
        },
        { threshold }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, threshold]
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const newItems = await fetchCallback(page, pageSize);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems((prev) => [...prev, ...newItems]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, loading, hasMore, fetchCallback]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadMore();
  }, [initialPage, loadMore]);

  useEffect(() => {
    if (resetOnDependencyChange) {
      reset();
    }
  }, [resetOnDependencyChange, reset]);

  const refresh = useCallback(async () => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    await loadMore();
  }, [initialPage, loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    page,
    lastItemRef,
    reset,
    refresh,
  };
};

export default useInfiniteScroll; 