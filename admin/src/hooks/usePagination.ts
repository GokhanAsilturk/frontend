import { useState, useMemo } from 'react';
import { PAGINATION_CONFIG } from '../utils';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export const usePagination = (initialPageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  const totalPages = useMemo(() => {
    return Math.ceil(paginationState.total / paginationState.pageSize);
  }, [paginationState.total, paginationState.pageSize]);

  const hasNextPage = useMemo(() => {
    return paginationState.page < totalPages;
  }, [paginationState.page, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return paginationState.page > 1;
  }, [paginationState.page]);

  const startIndex = useMemo(() => {
    return (paginationState.page - 1) * paginationState.pageSize + 1;
  }, [paginationState.page, paginationState.pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(paginationState.page * paginationState.pageSize, paginationState.total);
  }, [paginationState.page, paginationState.pageSize, paginationState.total]);

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationState(prev => ({ ...prev, page }));
    }
  };

  const setPageSize = (pageSize: number) => {
    setPaginationState(prev => ({
      ...prev,
      pageSize,
      page: 1, // Sayfa boyutu değiştiğinde ilk sayfaya dön
    }));
  };

  const setTotal = (total: number) => {
    setPaginationState(prev => ({ ...prev, total }));
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setPage(paginationState.page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setPage(paginationState.page - 1);
    }
  };

  const goToFirstPage = () => {
    setPage(1);
  };

  const goToLastPage = () => {
    setPage(totalPages);
  };

  const reset = () => {
    setPaginationState({
      page: 1,
      pageSize: initialPageSize,
      total: 0,
    });
  };

  return {
    ...paginationState,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    setTotal,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    reset,
  };
};
