// hooks/usePagination.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const usePagination = (url, options = {}) => {
  const {
    limit = 10,
    initialPage = 1,
    dependencies = [],
    enabled = true,
    transform = (data) => data,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000   // 1 minute
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Generate cache key
  const getCacheKey = useCallback((page, queryParams = {}) => {
    return `${url}_${page}_${JSON.stringify(queryParams)}`;
  }, [url]);

  // Check if data is stale
  const isStale = useCallback((timestamp) => {
    return Date.now() - timestamp > staleTime;
  }, [staleTime]);

  // Fetch data function
  const fetchData = useCallback(async (page, queryParams = {}, forceRefresh = false) => {
    if (!enabled) return;

    const cacheKey = getCacheKey(page, queryParams);
    const cachedData = cacheRef.current.get(cacheKey);

    // Return cached data if not stale and not forcing refresh
    if (cachedData && !isStale(cachedData.timestamp) && !forceRefresh) {
      setData(transform(cachedData.data));
      setPagination(cachedData.pagination);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...queryParams
      });

      const response = await axios.get(`${url}?${params}`, {
        signal: abortControllerRef.current.signal
      });

      const responseData = response.data.data || [];
      const responsePagination = response.data.pagination || {};

      // Cache the response
      cacheRef.current.set(cacheKey, {
        data: responseData,
        pagination: responsePagination,
        timestamp: Date.now()
      });

      // Clean old cache entries
      if (cacheRef.current.size > 50) {
        const entries = Array.from(cacheRef.current.entries());
        const oldEntries = entries.filter(([_, value]) => 
          Date.now() - value.timestamp > cacheTime
        );
        oldEntries.forEach(([key]) => cacheRef.current.delete(key));
      }

      setData(transform(responseData));
      setPagination(responsePagination);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load data');
        console.error('Pagination error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, limit, enabled, transform, getCacheKey, isStale, cacheTime]);

  // Navigation functions
  const goToPage = useCallback((page, queryParams = {}) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData(page, queryParams);
    }
  }, [fetchData, pagination.totalPages]);

  const nextPage = useCallback((queryParams = {}) => {
    if (pagination.hasNext) {
      goToPage(pagination.currentPage + 1, queryParams);
    }
  }, [goToPage, pagination.hasNext, pagination.currentPage]);

  const prevPage = useCallback((queryParams = {}) => {
    if (pagination.hasPrev) {
      goToPage(pagination.currentPage - 1, queryParams);
    }
  }, [goToPage, pagination.hasPrev, pagination.currentPage]);

  const refresh = useCallback((queryParams = {}) => {
    fetchData(pagination.currentPage, queryParams, true);
  }, [fetchData, pagination.currentPage]);

  // Reset function
  const reset = useCallback(() => {
    setData([]);
    setPagination({
      currentPage: initialPage,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false
    });
    setError(null);
    cacheRef.current.clear();
  }, [initialPage]);

  // Initial load and dependency changes
  useEffect(() => {
    reset();
    fetchData(initialPage);
  }, [reset, fetchData, initialPage, ...dependencies]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    reset
  };
};

export default usePagination;