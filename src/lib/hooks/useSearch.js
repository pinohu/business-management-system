import { useState, useCallback, useMemo } from 'react';

const useSearch = (items = [], searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState(null);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term.toLowerCase());
  }, []);

  const handleFilter = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleSort = useCallback((field, direction = 'asc') => {
    setSortConfig({ field, direction });
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Apply search term
      if (searchTerm) {
        const matchesSearch = searchFields.some((field) => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm);
        });
        if (!matchesSearch) return false;
      }

      // Apply filters
      return Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        const itemValue = item[field];
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        return itemValue === value;
      });
    });
  }, [items, searchTerm, searchFields, filters]);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === bValue) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortConfig]);

  const searchInfo = useMemo(() => {
    return {
      totalItems: items.length,
      filteredCount: filteredItems.length,
      searchTerm,
      filters,
      sortConfig,
    };
  }, [items.length, filteredItems.length, searchTerm, filters, sortConfig]);

  return {
    items: sortedItems,
    searchInfo,
    handleSearch,
    handleFilter,
    clearFilters,
    handleSort,
  };
};

export default useSearch; 