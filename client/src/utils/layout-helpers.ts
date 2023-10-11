import { PageConfig } from '@client/store';
import { DEFAULT_COLUMNS } from '@root/client/src/store/config';

export function getMinimumPageWidth(page: PageConfig, pages: PageConfig[]): number {
  // Find the index of the current page in the pages array
  const pageIndex = pages.findIndex(p => p.id === page.id);
  // Determine the minimum width of the current page
  let minPageWidth;
  if (pageIndex === 0) {
    // If the index is 0, the minimum width is half the max width
    minPageWidth = page.maxWidth / 2;
  } else {
    // Otherwise, it should be the max width of the previous page
    minPageWidth = pages[pageIndex - 1].maxWidth;
  }
  return minPageWidth;
}

// even though this uses width, the columns and row size are the same, ie 4 columns = 4 rows in terms if size
export function convertPixelToColumn(valueInPixels: number, page: PageConfig, pages: PageConfig[]): number {
  const minPageWidth = getMinimumPageWidth(page, pages);
  // Width of a single column based on the minimum width of the current page
  const columnWidth = (minPageWidth - ((page.containerPadding[1] ?? 0) * 2)) / DEFAULT_COLUMNS;
  // Determine the number of columns based on valueInPixels
  const columns = valueInPixels / columnWidth;
  // Round to the nearest whole number to get the number of columns
  const roundedColumns = Math.round(columns);
  // Clamp the column count between 1 and DEFAULT_COLUMNS
  return Math.max(1, Math.min(roundedColumns, DEFAULT_COLUMNS));
}
