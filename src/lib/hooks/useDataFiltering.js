import { useState, useCallback, useMemo } from 'react';

const useDataFiltering = (options = {}) => {
  const {
    data = [],
    initialFilters = {},
    initialSort = null,
    filterConfig = {},
    onFilterChange = null,
    onSortChange = null,
  } = options;

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState('');

  // Apply filters to data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Apply search query if exists
      if (searchQuery) {
        const searchableFields = filterConfig.searchableFields || [];
        const matchesSearch = searchableFields.some((field) => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
        if (!matchesSearch) return false;
      }

      // Apply filters
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // Skip empty filters

        const filterConfig = filterConfig[key];
        if (!filterConfig) return true; // Skip unknown filters

        const { type, field } = filterConfig;

        switch (type) {
          case 'exact':
            return item[field] === value;
          case 'contains':
            return item[field].toLowerCase().includes(value.toLowerCase());
          case 'range':
            const { min, max } = value;
            const itemValue = item[field];
            return (!min || itemValue >= min) && (!max || itemValue <= max);
          case 'multiple':
            return value.includes(item[field]);
          case 'custom':
            return filterConfig.validate(item, value);
          default:
            return true;
        }
      });
    });
  }, [data, filters, searchQuery, filterConfig]);

  // Apply sorting to filtered data
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const { field, direction } = sort;
      const aValue = a[field];
      const bValue = b[field];

      if (aValue === bValue) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Update filter value
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
      return newFilters;
    });
  }, [onFilterChange]);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, ...newFilters };
      if (onFilterChange) {
        onFilterChange(updatedFilters);
      }
      return updatedFilters;
    });
  }, [onFilterChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  }, [onFilterChange]);

  // Update sort configuration
  const updateSort = useCallback((field, direction = 'asc') => {
    const newSort = { field, direction };
    setSort(newSort);
    if (onSortChange) {
      onSortChange(newSort);
    }
  }, [onSortChange]);

  // Clear sort
  const clearSort = useCallback(() => {
    setSort(null);
    if (onSortChange) {
      onSortChange(null);
    }
  }, [onSortChange]);

  // Update search query
  const updateSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return {
    data: sortedData,
    filters,
    sort,
    searchQuery,
    updateFilter,
    updateFilters,
    clearFilters,
    updateSort,
    clearSort,
    updateSearch,
  };
};

export default useDataFiltering; 