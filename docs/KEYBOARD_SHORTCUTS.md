# Keyboard Shortcuts

This document outlines the keyboard shortcuts available in the HA KIT editor application.

## Navigation Shortcuts

### Editor Navigation
- **Ctrl + Shift + E** - Navigate back to the editor page from the published dashboard
- **Ctrl + Shift + D** - Navigate from the editor to the published dashboard

## File Operations

### Save
- **Ctrl + S** - Save the current dashboard configuration

## Implementation

These shortcuts are implemented using the `useKeyboardShortcut` hook, which provides a consistent way to handle keyboard events throughout the application while respecting user input contexts (e.g., not triggering when typing in input fields).
