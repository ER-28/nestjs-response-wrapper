export const formatPagination = (data: any) => {
  if (!data || typeof data !== 'object') return null;
  
  const total = data.total ?? data.totalItems ?? data.count;
  const limit = data.limit ?? data.pageSize ?? data.itemsPerPage;
  const page = data.page ?? data.currentPage ?? 1;

  if (total === undefined || limit === undefined) return null;

  return {
    totalItems: Number(total),
    itemCount: Number(data.count || limit),
    itemsPerPage: Number(limit),
    totalPages: Math.ceil(Number(total) / Number(limit)),
    currentPage: Number(page),
  };
};

export const isBinaryResponse = (response: any): boolean => {
  const contentType = response.getHeader('content-type');
  if (!contentType) return false;

  const binaryTypes = [
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'image/',
    'video/',
    'audio/',
  ];

  return binaryTypes.some((type) => contentType.includes(type));
};
