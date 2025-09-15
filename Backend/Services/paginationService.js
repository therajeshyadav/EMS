// Services/paginationService.js
const mongoose = require('mongoose');

class PaginationService {
  // Offset-based pagination (traditional)
  static offsetPagination(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    
    return {
      skip: (pageNum - 1) * limitNum,
      limit: limitNum,
      page: pageNum
    };
  }

  // Cursor-based pagination (for better performance on large datasets)
  static cursorPagination(cursor = null, limit = 10, sortField = '_id', sortOrder = -1) {
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    
    const query = {};
    if (cursor) {
      const operator = sortOrder === 1 ? '$gt' : '$lt';
      query[sortField] = { [operator]: cursor };
    }

    return {
      query,
      limit: limitNum,
      sort: { [sortField]: sortOrder }
    };
  }

  // Enhanced pagination with metadata
  static buildPaginationResponse(data, total, page, limit, hasMore = null) {
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);
    
    return {
      data,
      pagination: {
        currentPage,
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: hasMore !== null ? hasMore : currentPage < totalPages,
        hasPrev: currentPage > 1,
        nextCursor: data.length > 0 ? data[data.length - 1]._id : null,
        prevCursor: data.length > 0 ? data[0]._id : null
      }
    };
  }

  // Infinite scroll pagination
  static async infiniteScrollPagination(Model, filters = {}, options = {}) {
    const {
      cursor = null,
      limit = 20,
      sortField = '_id',
      sortOrder = -1,
      populate = [],
      select = null
    } = options;

    const { query, limit: limitNum, sort } = this.cursorPagination(cursor, limit, sortField, sortOrder);
    
    // Merge cursor query with filters
    const finalQuery = { ...filters, ...query };

    let queryBuilder = Model.find(finalQuery, select)
      .sort(sort)
      .limit(limitNum + 1) // Get one extra to check if there are more
      .lean();

    // Apply population
    if (populate.length > 0) {
      populate.forEach(pop => {
        queryBuilder = queryBuilder.populate(pop);
      });
    }

    const results = await queryBuilder;
    const hasMore = results.length > limitNum;
    
    if (hasMore) {
      results.pop(); // Remove the extra item
    }

    return {
      data: results,
      hasMore,
      nextCursor: results.length > 0 ? results[results.length - 1][sortField] : null,
      count: results.length
    };
  }

  // Search with pagination
  static async searchWithPagination(Model, searchQuery, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortField = 'createdAt',
      sortOrder = -1,
      populate = [],
      select = null,
      filters = {}
    } = options;

    const { skip, limit: limitNum } = this.offsetPagination(page, limit);

    // Build search query
    const query = { ...filters };
    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }

    const [data, total] = await Promise.all([
      Model.find(query, select)
        .populate(populate)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Model.countDocuments(query)
    ]);

    return this.buildPaginationResponse(data, total, page, limitNum);
  }

  // Aggregation with pagination
  static async aggregateWithPagination(Model, pipeline, page = 1, limit = 10) {
    const { skip, limit: limitNum } = this.offsetPagination(page, limit);

    const paginatedPipeline = [
      ...pipeline,
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          count: [
            { $count: 'total' }
          ]
        }
      }
    ];

    const [result] = await Model.aggregate(paginatedPipeline);
    const data = result.data || [];
    const total = result.count[0]?.total || 0;

    return this.buildPaginationResponse(data, total, page, limitNum);
  }

  // Virtual scroll pagination (for frontend virtualization)
  static virtualScrollPagination(startIndex, endIndex, totalItems) {
    const itemsToFetch = endIndex - startIndex + 1;
    const page = Math.floor(startIndex / itemsToFetch) + 1;
    
    return {
      page,
      limit: itemsToFetch,
      startIndex,
      endIndex,
      totalItems
    };
  }
}

module.exports = PaginationService;