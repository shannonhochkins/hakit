import { PageConfig, PageWidget } from '@client/store';
import { DEFAULT_COLUMNS } from '@client/store/config';

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

export function findWidgetByUid(uid: string, pages: PageConfig[]): PageWidget | undefined {
  for (const page of pages) {
    const widget = findWidgetInPage(uid, page);
    if (widget) {
      return widget;
    }
  }
  return undefined;
}

export function findWidgetInPage(uid: string, page: PageConfig): PageWidget | undefined {
  for (const widget of page.widgets) {
    if (widget.uid === uid) {
      return widget;
    }
    const nestedWidget = findWidgetInWidget(uid, widget);
    if (nestedWidget) {
      return nestedWidget;
    }
  }
  return undefined;
}

function updateWidgetInArray(uid: string, widgets: PageWidget[], newWidget: PageWidget): PageWidget[] {
  return widgets.map(widget => {
      if (widget.uid === uid) {
          return newWidget;  // Replace the widget with the newWidget
      }
      // If the widget has nested widgets, search within them
      if (widget.widgets) {
          return {
              ...widget,
              widgets: updateWidgetInArray(uid, widget.widgets, newWidget),
          };
      }
      return widget;  // Return the widget unchanged
  });
}

export function findWidgetInPageAndUpdate(uid: string, page: PageConfig, newWidget: PageWidget): PageConfig {
  // find the widget by the uid provided, recursively
  // search through the page widgets and replace the widget with the new widget
  // Create a new array of widgets with the specified widget updated
  const updatedWidgets = updateWidgetInArray(uid, page.widgets, newWidget);
  // Create a new PageConfig object with the updated widgets array
  const updatedPage = {
      ...page,
      widgets: updatedWidgets,
  };
  return updatedPage;
}

export function removeWidgetFromPage(uid: string, page: PageConfig): PageConfig {
  // Create a copy of the original page to avoid mutating it directly
  const updatedPage = { ...page };
  // Call filterWidgetsByUid to filter the widgets at the page level
  updatedPage.widgets = filterWidgetsByUid(uid, updatedPage.widgets);
  return updatedPage;
}

function filterWidgetsByUid(uid: string, widgets?: PageWidget[]): PageWidget[] {
  return (widgets ?? []).flatMap((widget) => {
    if (widget.uid === uid) return [];
    const filteredChildWidgets = filterWidgetsByUid(uid, widget.widgets);
    return {
      ...widget,
      widgets: filteredChildWidgets,
    };
  });
}

export function findWidgetInWidget(uid: string, parentWidget: PageWidget): PageWidget | undefined {
  for (const widget of parentWidget.widgets ?? []) {
    if (widget.uid === uid) {
      return widget;
    }
    const nestedWidget = findWidgetInWidget(uid, widget);
    if (nestedWidget) {
      return nestedWidget;
    }
  }
  return undefined;
}
