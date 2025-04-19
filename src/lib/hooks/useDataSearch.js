import { useState, useEffect, useCallback, useRef } from 'react';

const useDataSearch = (options = {}) => {
  const {
    data = [],
    searchFields = [],
    debounceMs = 300,
    minSearchLength = 2,
    caseSensitive = false,
    fuzzySearch = false,
    onSearchStart = null,
    onSearchComplete = null,
    onSearchError = null,
    customFilter = null,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeoutRef = useRef(null);

  // Perform search
  const performSearch = useCallback(
    (query) => {
      try {
        setIsSearching(true);
        setError(null);

        if (onSearchStart) {
          onSearchStart();
        }

        if (!query || query.length < minSearchLength) {
          setSearchResults([]);
          if (onSearchComplete) {
            onSearchComplete([]);
          }
          return;
        }

        const normalizedQuery = caseSensitive ? query : query.toLowerCase();
        let results = [];

        if (customFilter) {
          results = customFilter(data, normalizedQuery);
        } else {
          results = data.filter((item) => {
            return searchFields.some((field) => {
              const value = item[field];
              if (value === null || value === undefined) return false;

              const stringValue = String(value);
              const normalizedValue = caseSensitive
                ? stringValue
                : stringValue.toLowerCase();

              if (fuzzySearch) {
                return fuzzyMatch(normalizedValue, normalizedQuery);
              }

              return normalizedValue.includes(normalizedQuery);
            });
          });
        }

        setSearchResults(results);
        if (onSearchComplete) {
          onSearchComplete(results);
        }
      } catch (err) {
        setError(err);
        if (onSearchError) {
          onSearchError(err);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [
      data,
      searchFields,
      minSearchLength,
      caseSensitive,
      fuzzySearch,
      customFilter,
      onSearchStart,
      onSearchComplete,
      onSearchError,
    ]
  );

  // Update search query with debouncing
  const updateSearchQuery = useCallback(
    (query) => {
      setSearchQuery(query);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, debounceMs);
    },
    [debounceMs, performSearch]
  );

  // Fuzzy search implementation
  const fuzzyMatch = useCallback((str, pattern) => {
    const patternLength = pattern.length;
    const strLength = str.length;

    if (patternLength > strLength) return false;

    const matrix = Array(patternLength + 1)
      .fill(null)
      .map(() => Array(strLength + 1).fill(null));

    for (let i = 0; i <= patternLength; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= strLength; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= patternLength; i++) {
      for (let j = 1; j <= strLength; j++) {
        const cost = pattern[i - 1] === str[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[patternLength][strLength] <= 2; // Allow 2 character differences
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Get search statistics
  const getSearchStats = useCallback(() => {
    return {
      query: searchQuery,
      resultCount: searchResults.length,
      isSearching,
      error,
    };
  }, [searchQuery, searchResults.length, isSearching, error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    error,
    updateSearchQuery,
    clearSearch,
    getSearchStats,
  };
};

export default useDataSearch; 