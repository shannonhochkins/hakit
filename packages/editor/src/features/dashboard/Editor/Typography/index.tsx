import { TypographyProps } from '@typings/fields';
import { DeepPartial } from '@typings/utils';
import { useEffect, useMemo, useRef } from 'react';

export const googleFontsNameMap: Record<string, string> = {
  roboto: 'Roboto',
  'open-sans': 'Open+Sans',
  lato: 'Lato',
  montserrat: 'Montserrat',
  oswald: 'Oswald',
  'source-sans-3': 'Source+Sans+3',
  'slabo-27px': 'Slabo+27px',
  raleway: 'Raleway',
  'pt-sans': 'PT+Sans',
  merriweather: 'Merriweather',
  'noto-sans': 'Noto+Sans',
  'nunito-sans': 'Nunito+Sans',
  poppins: 'Poppins',
  'playfair-display': 'Playfair+Display',
  inter: 'Inter',
  mulish: 'Mulish',
  // science gothic
  'science-gothic': 'Science+Gothic',
};

// Font family mapping
export const fontFamilyMap: Record<string, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  roboto: '"Roboto", system-ui, sans-serif',
  'open-sans': '"Open Sans", system-ui, sans-serif',
  lato: '"Lato", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  oswald: '"Oswald", system-ui, sans-serif',

  // Source Sans 3 (newer family vs old "Source Sans Pro")
  'source-sans-3': '"Source Sans 3", system-ui, sans-serif',

  // Slabo is serif
  'slabo-27px': '"Slabo 27px", system-ui, serif',

  raleway: '"Raleway", system-ui, sans-serif',
  'pt-sans': '"PT Sans", system-ui, sans-serif',

  // Serif content font
  merriweather: '"Merriweather", system-ui, serif',

  // Good multilingual default
  'noto-sans': '"Noto Sans", system-ui, sans-serif',

  // More “friendly” UI fonts
  'nunito-sans': '"Nunito Sans", system-ui, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',

  // Elegant serif for headings
  'playfair-display': '"Playfair Display", system-ui, serif',

  // UI/system font darling
  inter: '"Inter", system-ui, sans-serif',
  mulish: '"Mulish", system-ui, sans-serif',
  'science-gothic': '"Science Gothic", system-ui, sans-serif',
};

/**
 * @description Renders the Google Fonts link for the selected font family
 * @param typography - The typography object
 * @param type - The type of component
 * @returns The google fonts link element
 */
export function Typography({ typography, type }: { typography?: DeepPartial<TypographyProps>; type: 'root' | 'component' }) {
  // Generate Google Fonts link for non-system fonts
  // For root: always use typography.fontFamily (defaults to 'system' if not set)
  // For component: only use typography.fontFamily if override is true, otherwise inherit from root (undefined)
  const selectedFontFamily =
    type === 'root' ? (typography?.fontFamily ?? 'system') : typography?.override ? (typography?.fontFamily ?? 'system') : undefined;

  // Memoize Google Fonts URL generation to avoid recalculating on every render
  const googleFontsUrl = useMemo(() => {
    if (!selectedFontFamily || selectedFontFamily === 'system') {
      return '';
    }
    const headingWeight = typography?.headingWeight ?? 600;
    const bodyWeight = typography?.bodyWeight ?? 400;
    // Sort weights in ascending order as required by Google Fonts API
    const sortedWeights = [headingWeight, bodyWeight].sort((a, b) => a - b);
    const uniqueWeights = [...new Set(sortedWeights)]; // Remove duplicates
    const weightsString = uniqueWeights.join(';');
    return `https://fonts.googleapis.com/css2?family=${googleFontsNameMap[selectedFontFamily]}:wght@${weightsString}&display=swap`;
  }, [selectedFontFamily, typography?.headingWeight, typography?.bodyWeight]);

  // Ref to track if we've already processed this URL (prevents Strict Mode double-render duplicates)
  const processedUrlRef = useRef<string | null>(null);

  // Inject Google Fonts link into <head> for proper loading
  useEffect(() => {
    // Early return for system fonts or invalid state
    if (typeof document === 'undefined' || !selectedFontFamily || selectedFontFamily === 'system' || !googleFontsUrl) {
      return;
    }

    const head = document.head;
    if (!head) return;

    // Normalize URL for comparison (handle & vs &amp; encoding differences)
    const normalizedUrl = googleFontsUrl.replace(/&amp;/g, '&');
    const fontFamilyName = googleFontsNameMap[selectedFontFamily];

    // Check if we've already processed this exact URL in this effect run (handles Strict Mode double-render)
    if (processedUrlRef.current === normalizedUrl) {
      return; // Already processed this URL, don't add duplicate
    }

    // Helper function to check if font already exists in DOM
    const fontExistsInDom = (): boolean => {
      const allFontLinks = Array.from(head.querySelectorAll<HTMLLinkElement>('link[href*="fonts.googleapis.com"][rel="stylesheet"]'));

      for (const existingLink of allFontLinks) {
        // Check both href property (resolved URL) and href attribute (original value)
        const hrefProperty = existingLink.href || '';
        const hrefAttribute = existingLink.getAttribute('href') || '';

        // Normalize both for comparison
        const normalizedProperty = hrefProperty.replace(/&amp;/g, '&');
        const normalizedAttribute = hrefAttribute.replace(/&amp;/g, '&');

        // Check if this is the same font (exact URL match or family name match)
        if (
          normalizedProperty === normalizedUrl ||
          normalizedAttribute === normalizedUrl ||
          normalizedProperty.includes(fontFamilyName) ||
          normalizedAttribute.includes(fontFamilyName)
        ) {
          return true; // Font already exists in DOM
        }
      }
      return false;
    };

    // Check if font already exists in DOM
    if (fontExistsInDom()) {
      // Mark as processed to prevent duplicate in Strict Mode
      processedUrlRef.current = normalizedUrl;
      return; // Font already loaded, don't add duplicate
    }

    // Double-check right before appending to handle race conditions
    // (in case another component added it between the check and append)
    if (fontExistsInDom()) {
      processedUrlRef.current = normalizedUrl;
      return; // Font was added by another component, don't add duplicate
    }

    // Mark as processed before adding
    processedUrlRef.current = normalizedUrl;

    // Create and inject the new font link into <head>
    const link = document.createElement('link');
    link.href = googleFontsUrl;
    link.rel = 'stylesheet';
    link.setAttribute('data-font-family', selectedFontFamily);
    link.setAttribute('data-hakit-font', 'true'); // Mark as added by hakit for cleanup
    head.appendChild(link);

    // Cleanup: remove only the links we added (marked with data-hakit-font)
    return () => {
      // Reset the ref when cleaning up (allows re-adding if font changes)
      processedUrlRef.current = null;

      // Find all links we added for this font family
      const linksToRemove = Array.from(
        head.querySelectorAll<HTMLLinkElement>(`link[data-hakit-font="true"][data-font-family="${selectedFontFamily}"]`)
      );

      // Remove links that match our URL (handle encoding differences)
      linksToRemove.forEach(linkToRemove => {
        const href = linkToRemove.href || linkToRemove.getAttribute('href') || '';
        const normalizedHref = href.replace(/&amp;/g, '&');
        if (normalizedHref === normalizedUrl && linkToRemove.parentNode) {
          linkToRemove.parentNode.removeChild(linkToRemove);
        }
      });
    };
  }, [selectedFontFamily, googleFontsUrl]);

  // Don't render anything - the link is injected into <head> via useEffect
  return null;
}
