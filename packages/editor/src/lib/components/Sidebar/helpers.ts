import { SIDEBAR_PANEL_WIDTH } from '@lib/constants';

export function getCssVariableValue(name: string, defaultValue: number): number {
  // Read the CSS variable from the :root
  const rootStyles = getComputedStyle(document.documentElement);
  const currentWidth = rootStyles.getPropertyValue(name);
  // Strip "px" if present and parse as number
  return parseInt(currentWidth, 10) || defaultValue; // fallback if parse fails
}

export function getSidebarWidth() {
  return getCssVariableValue('--sidebar-panel-width', SIDEBAR_PANEL_WIDTH);
}

export function setSidebarWidth(width: number) {
  document.documentElement.style.setProperty('--sidebar-panel-width', `${Math.max(width, SIDEBAR_PANEL_WIDTH)}px`);
}
