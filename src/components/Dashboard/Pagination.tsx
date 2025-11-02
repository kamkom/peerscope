import type { PaginationDto } from "@/types";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";

type PaginationProps = {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

// Hook to create pagination ranges, can be extracted to a separate file if needed elsewhere
const usePaginationRange = ({
  totalItems,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  totalItems: number;
  pageSize: number;
  siblingCount: number;
  currentPage: number;
}) => {
  const totalPageCount = Math.ceil(totalItems / pageSize);

  // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
  const totalPageNumbers = siblingCount + 5;

  /*
    Case 1:
    If the number of pages is less than the page numbers we want to show in our
    paginationComponent, we return the range [1..totalPageCount]
  */
  if (totalPageNumbers >= totalPageCount) {
    return Array.from({ length: totalPageCount }, (_, i) => i + 1);
  }

  /*
  	Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
  */
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

  /*
    We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
  */
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPageCount;

  /*
  	Case 2: No left dots to show, but rights dots to be shown
  */
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

    return [...leftRange, "...", totalPageCount];
  }

  /*
  	Case 3: No right dots to show, but left dots to be shown
  */
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPageCount - rightItemCount + i + 1);
    return [firstPageIndex, "...", ...rightRange];
  }

  /*
  	Case 4: Both left and right dots to be shown
  */
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return []; // Should not happen
};

export function Pagination({ pagination, onPageChange, siblingCount = 1 }: PaginationProps) {
  const { page, totalItems, pageSize, totalPages } = pagination;

  const paginationRange = usePaginationRange({
    currentPage: page,
    totalItems,
    pageSize,
    siblingCount,
  });

  if (page === 0 || (paginationRange && paginationRange.length < 2)) {
    return null;
  }

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <ShadcnPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={handlePrevious} className={page === 1 ? "pointer-events-none opacity-50" : ""} />
        </PaginationItem>
        {paginationRange?.map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink isActive={pageNumber === page} onClick={() => onPageChange(pageNumber as number)}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}
