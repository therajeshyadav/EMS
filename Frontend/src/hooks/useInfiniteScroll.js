// hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useInfiniteScroll = (url, options = {}) => {
  const {
    limit = 20,
    initialData = [],
    dependencies = [],
    enabled = true,
    transform = (data) => data
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  
  const abortControllerRef = useRef(null);

  // Reset function
  const reset = useCallback(() => {
    setData(initialData);
    setHasMore(true);
    setCursor(null);
    setError(null);
  }, [initialData]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(cursor && { cursor })
      });

      const response = await axios.get(`${url}?${params}`, {
        signal: abortControllerRef.current.signal
      });

      const newData = transform(response.data.data || []);
      const newHasMore = response.data.hasMore ?? false;
      const nextCursor = response.data.nextCursor;

      setData(prevData => cursor ? [...prevData, ...newData] : newData);
      setHasMore(newHasMore);
      setCursor(nextCursor);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load data');
        console.error('Infinite scroll error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, cursor, limit, loading, hasMore, enabled, transform]);

  // Initial load and dependency changes
  useEffect(() => {
    reset();
  }, [reset, ...dependencies]);

  useEffect(() => {
    if (enabled && data.length === 0 && !loading) {
      loadMore();
    }
  }, [enabled, data.length, loading, loadMore]);

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
    hasMore,
    error,
    loadMore,
    reset,
    cursor
  };
};

export default useInfiniteScroll;