export const formatPagination = (data: any) => {
  if (!data || !data.total) return null;
  
  return {
    totalItems: data.total,
    itemCount: data.count || data.limit,
    itemsPerPage: data.limit,
    totalPages: Math.ceil(data.total / data.limit),
    currentPage: data.page || 1,
  };
};
