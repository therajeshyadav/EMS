// components/VirtualizedTable.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

const VirtualizedTable = ({
  data = [],
  columns = [],
  rowHeight = 50,
  containerHeight = 400,
  onLoadMore,
  hasMore = false,
  loading = false,
  keyField = 'id'
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const visibleCount = Math.ceil(containerHeight / rowHeight);
    const endIndex = Math.min(startIndex + visibleCount + 5, data.length); // 5 buffer items
    
    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, rowHeight, containerHeight, data.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [data, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);

    // Load more when near bottom
    if (hasMore && !loading && onLoadMore) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        onLoadMore();
      }
    }
  }, [hasMore, loading, onLoadMore]);

  // Total height for scrollbar
  const totalHeight = data.length * rowHeight;

  return (
    <div className="virtualized-table">
      {/* Header */}
      <div className="table-header bg-gray-50 border-b">
        <div className="flex">
          {columns.map((column, index) => (
            <div
              key={index}
              className={`px-4 py-3 font-medium text-gray-700 ${column.className || ''}`}
              style={{ width: column.width || 'auto', minWidth: column.minWidth || '100px' }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <div
        ref={setContainerRef}
        className="table-body overflow-auto border"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Virtual spacer for items above visible area */}
        <div style={{ height: visibleRange.startIndex * rowHeight }} />

        {/* Visible rows */}
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.startIndex + index;
          return (
            <div
              key={item[keyField] || actualIndex}
              className="table-row flex border-b hover:bg-gray-50"
              style={{ height: rowHeight }}
            >
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={`px-4 py-3 flex items-center ${column.className || ''}`}
                  style={{ width: column.width || 'auto', minWidth: column.minWidth || '100px' }}
                >
                  {column.render ? column.render(item, actualIndex) : item[column.key]}
                </div>
              ))}
            </div>
          );
        })}

        {/* Virtual spacer for items below visible area */}
        <div style={{ height: (data.length - visibleRange.endIndex) * rowHeight }} />

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="table-footer bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t">
        Showing {visibleRange.startIndex + 1}-{Math.min(visibleRange.endIndex, data.length)} of {data.length} items
      </div>
    </div>
  );
};

export default VirtualizedTable;