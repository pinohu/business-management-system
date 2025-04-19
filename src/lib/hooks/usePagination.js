import { useState, useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';

const usePagination = (options = {}) => {
  const {
    endpoint,
    pageSize = 10,
    initialPage = 1,
    onSuccess = null,
    onError = null,
    onLoadMore = null,
    params = {},
    infiniteScroll = false,
    scrollThreshold = 0.8,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef(null);
  const api = useApi();

  const fetchData = useCallback(
    async (page = currentPage, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await api.get(endpoint, {
          params: {
            ...params,
            page,
            pageSize,
          },
        });

        const { items, total } = response.data;
        setTotalItems(total);
        setHasMore(items.length === pageSize);

        if (isLoadMore) {
          setData((prevData) => [...prevData, ...items]);
        } else {
          setData(items);
        }

        if (onSuccess) {
          onSuccess(response);
        }

        if (isLoadMore && onLoadMore) {
          onLoadMore(response);
        }

        return response;
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [endpoint, pageSize, currentPage, params, api, onSuccess, onError, onLoadMore]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchData(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setHasMore(true);
    setCurrentPage(initialPage);
    setTotalItems(0);
  }, [initialPage]);

  const refresh = useCallback(async () => {
    reset();
    await fetchData(initialPage);
  }, [initialPage, fetchData, reset]);

  // Handle infinite scroll
  useEffect(() => {
    if (!infiniteScroll || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !isLoadingMore) {
          loadMore();
        }
      },
      {
        threshold: scrollThreshold,
        rootMargin: '100px',
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [infiniteScroll, hasMore, loading, isLoadingMore, loadMore, scrollThreshold]);

  // Initial data fetch
  useEffect(() => {
    fetchData(initialPage);
  }, [initialPage, fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    totalItems,
    isLoadingMore,
    containerRef,
    loadMore,
    reset,
    refresh,
  };
};

export default usePagination; 