import { useEffect, useCallback } from 'react';
import { generateExtendedColors } from '../utils/utils';
import { fontSizes } from '../styleConfig';

const DEFAULT_LIGHT_BRAND = '#1e847c';
const DEFAULT_LIGHT_FOREGROUND = '#141414';
const DEFAULT_DARK_FOREGROUND = '#fafafa';
const DEFAULT_MUTED_FOREGROUND = '#717182';
const DEFAULT_LIGHT_BACKGROUND = '#ffffff';
const DEFAULT_DARK_BACKGROUND = '#171717';
const DEFAULT_LIGHT_MUTED = '#ececf0';
const DEFAULT_DARK_MUTED = '#2b2b2b';
const DEFAULT_LIGHT_ACCENT = '#e9ebef';
const DEFAULT_DARK_ACCENT = '#232323';
const DEFAULT_LIGHT_INPUT_BACKGROUND = '#f3f3f5';
const DEFAULT_DARK_INPUT_BACKGROUND = '#1f1f1f';
const DEFAULT_LIGHT_BORDER = 'rgba(0, 0, 0, 0.1)';
const DEFAULT_DARK_BORDER = 'rgb(69, 69, 69)';

function getCometChatRoot() {
  return document.getElementById('cometchat-theme-root') as HTMLElement | null;
}

function getActiveAppTheme(systemTheme: string): 'light' | 'dark' {
  const appTheme = document.documentElement.getAttribute('data-theme');

  if (appTheme === 'light' || appTheme === 'dark') {
    return appTheme;
  }

  return systemTheme === 'dark' ? 'dark' : 'light';
}

function getAppToken(variableName: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();

  return value || fallback;
}

function normalizeHex(color: string) {
  const trimmedColor = color.trim();

  if (/^#[0-9a-f]{6}$/i.test(trimmedColor)) {
    return trimmedColor;
  }

  if (/^#[0-9a-f]{3}$/i.test(trimmedColor)) {
    const red = trimmedColor[1];
    const green = trimmedColor[2];
    const blue = trimmedColor[3];
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }

  return null;
}

function parseRgbValues(color: string) {
  const match = color.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return null;
  }

  const [red, green, blue] = match[1]
    .split(',')
    .slice(0, 3)
    .map((value) => Number.parseFloat(value.trim()));

  if ([red, green, blue].some((value) => Number.isNaN(value))) {
    return null;
  }

  return [red, green, blue] as const;
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('')}`;
}

function resolveCssColor(color: string, fallback: string) {
  const directHex = normalizeHex(color);

  if (directHex) {
    return directHex;
  }

  const mountPoint = document.body ?? document.documentElement;
  const sample = document.createElement('span');

  sample.style.color = fallback;
  sample.style.color = color;
  sample.style.display = 'none';

  mountPoint.appendChild(sample);
  const resolvedColor = getComputedStyle(sample).color || fallback;
  sample.remove();

  return resolvedColor;
}

function resolveColorToHex(color: string, fallback: string) {
  const directHex = normalizeHex(color);

  if (directHex) {
    return directHex;
  }

  const resolvedColor = resolveCssColor(color, fallback);
  const rgbValues = parseRgbValues(resolvedColor);

  if (!rgbValues) {
    return fallback;
  }

  return rgbToHex(...rgbValues);
}

function useThemeStyles(
  styleFeatures: any,
  systemTheme: string,
  _setStyleFeatures: Function,
  loggedInUser: CometChat.User | null
) {
  /** Converts hex to rgba */

  /**
   * Converts a hex color code to an RGBA format with a given opacity.
   *
   * @param {string} hex - The hex color code.
   * @param {number} alpha - The opacity value (0 to 1).
   * @returns {string} The RGBA color string.
   */
  const hexToRGBA = useCallback((hex: string, alpha: number) => {
    const normalizedHex = normalizeHex(hex) ?? DEFAULT_LIGHT_BRAND;
    const r = parseInt(normalizedHex.substring(1, 3), 16);
    const g = parseInt(normalizedHex.substring(3, 5), 16);
    const b = parseInt(normalizedHex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  /**
   * Updates theme-related styles dynamically based on user settings.
   * It modifies CSS variables for text colors and primary colors.
   */
  useEffect(() => {
    const handleColorPickerChange = () => {
      const checkForRootElement = () => {
        if (!styleFeatures) {
          return;
        }

        const root = getCometChatRoot();
        if (!root) {
          return;
        }

        const currentTheme = getActiveAppTheme(systemTheme);
        root.dataset.theme = currentTheme;

        const brandColor = resolveColorToHex(
          getAppToken('--primary', styleFeatures.color.brandColor || DEFAULT_LIGHT_BRAND),
          DEFAULT_LIGHT_BRAND
        );
        const primaryText = resolveCssColor(
          getAppToken(
            '--foreground',
            currentTheme === 'dark' ? DEFAULT_DARK_FOREGROUND : DEFAULT_LIGHT_FOREGROUND
          ),
          currentTheme === 'dark' ? DEFAULT_DARK_FOREGROUND : DEFAULT_LIGHT_FOREGROUND
        );
        const secondaryText = resolveCssColor(
          getAppToken('--muted-foreground', DEFAULT_MUTED_FOREGROUND),
          DEFAULT_MUTED_FOREGROUND
        );
        const tertiaryText = hexToRGBA(resolveColorToHex(secondaryText, DEFAULT_MUTED_FOREGROUND), 0.78);
        const disabledText = hexToRGBA(resolveColorToHex(secondaryText, DEFAULT_MUTED_FOREGROUND), 0.52);
        const iconPrimary = primaryText;
        const iconSecondary = secondaryText;
        const iconTertiary = tertiaryText;
        const background01 = resolveCssColor(
          getAppToken(
            '--card',
            currentTheme === 'dark' ? DEFAULT_DARK_BACKGROUND : DEFAULT_LIGHT_BACKGROUND
          ),
          currentTheme === 'dark' ? DEFAULT_DARK_BACKGROUND : DEFAULT_LIGHT_BACKGROUND
        );
        const background02 = resolveCssColor(
          getAppToken(
            '--input-background',
            currentTheme === 'dark' ? DEFAULT_DARK_INPUT_BACKGROUND : DEFAULT_LIGHT_INPUT_BACKGROUND
          ),
          currentTheme === 'dark' ? DEFAULT_DARK_INPUT_BACKGROUND : DEFAULT_LIGHT_INPUT_BACKGROUND
        );
        const background03 = resolveCssColor(
          getAppToken('--muted', currentTheme === 'dark' ? DEFAULT_DARK_MUTED : DEFAULT_LIGHT_MUTED),
          currentTheme === 'dark' ? DEFAULT_DARK_MUTED : DEFAULT_LIGHT_MUTED
        );
        const background04 = resolveCssColor(
          getAppToken('--accent', currentTheme === 'dark' ? DEFAULT_DARK_ACCENT : DEFAULT_LIGHT_ACCENT),
          currentTheme === 'dark' ? DEFAULT_DARK_ACCENT : DEFAULT_LIGHT_ACCENT
        );
        const borderDefault = resolveCssColor(
          getAppToken('--border', currentTheme === 'dark' ? DEFAULT_DARK_BORDER : DEFAULT_LIGHT_BORDER),
          currentTheme === 'dark' ? DEFAULT_DARK_BORDER : DEFAULT_LIGHT_BORDER
        );
        const borderLight = hexToRGBA(
          resolveColorToHex(borderDefault, currentTheme === 'dark' ? '#454545' : '#d8d8d8'),
          currentTheme === 'dark' ? 0.75 : 0.68
        );
        const borderDark = hexToRGBA(
          resolveColorToHex(borderDefault, currentTheme === 'dark' ? '#6a6a6a' : '#b7b7b7'),
          currentTheme === 'dark' ? 0.92 : 0.92
        );
        const themedProperties = {
          '--cometchat-primary-color': brandColor,
          '--cometchat-border-color-highlight': brandColor,
          '--cometchat-text-color-highlight': brandColor,
          '--cometchat-icon-color-highlight': brandColor,
          '--cometchat-primary-button-background': brandColor,
          '--cometchat-text-color-primary': primaryText,
          '--cometchat-text-color-secondary': secondaryText,
          '--cometchat-text-color-tertiary': tertiaryText,
          '--cometchat-text-color-disabled': disabledText,
          '--cometchat-icon-color-primary': iconPrimary,
          '--cometchat-icon-color-secondary': iconSecondary,
          '--cometchat-icon-color-tertiary': iconTertiary,
          '--cometchat-background-color-01': background01,
          '--cometchat-background-color-02': background02,
          '--cometchat-background-color-03': background03,
          '--cometchat-background-color-04': background04,
          '--cometchat-border-color-default': borderDefault,
          '--cometchat-border-color-light': borderLight,
          '--cometchat-border-color-dark': borderDark,
        };

        Object.entries(themedProperties).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
        generateExtendedColors();
      };

      // Use setTimeout to ensure DOM is ready
      const timeoutId = window.setTimeout(checkForRootElement, 100);

      return () => window.clearTimeout(timeoutId);
    };
    const handleFontChange = () => {
      document.documentElement.style.setProperty('--cometchat-font-family', styleFeatures.typography.font);
    };

    const handleFontSizeChange = () => {
      const selectedFontSize = fontSizes[styleFeatures.typography.size as keyof typeof fontSizes] || {};
      Object.entries(selectedFontSize)?.forEach(([key, val]) => {
        document.documentElement.style.setProperty(key, val);
      });
    };

    if (styleFeatures) {
      const clearColorDelay = handleColorPickerChange();
      handleFontChange();
      handleFontSizeChange();

      return () => clearColorDelay?.();
    }
  }, [_setStyleFeatures, styleFeatures, systemTheme, loggedInUser]);

  // Run color change effect after a short delay to ensure elements are rendered
  useEffect(() => {
    if (!styleFeatures) {
      return;
    }

    // Apply a semi-transparent color overlay to a canvas element
    const recolorCanvasContent = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const brandColor = resolveColorToHex(
          getAppToken('--primary', styleFeatures.color.brandColor || DEFAULT_LIGHT_BRAND),
          DEFAULT_LIGHT_BRAND
        );

        // Set blend mode to 'source-atop' so the fill color applies **only** to existing (non-transparent) pixels
        ctx.globalCompositeOperation = 'source-atop';
        // Search within child elements and Shadow DOM recursively
        ctx.fillStyle = hexToRGBA(brandColor, 0.3);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reset blend mode to default ('source-over') so future drawings behave normally
        ctx.globalCompositeOperation = 'source-over';
      }
    };
    // Recursive function to find and recolor canvases inside Shadow DOM and nested elements
    const findAndRecolorCanvases = (element: Element | ShadowRoot) => {
      if (element instanceof Element && element.matches('canvas')) {
        recolorCanvasContent(element as HTMLCanvasElement);
      }

      // Search within child elements and Shadow DOM recursively
      element.childNodes.forEach((child) => {
        if (child instanceof Element) {
          findAndRecolorCanvases(child);
          if (child.shadowRoot) {
            findAndRecolorCanvases(child.shadowRoot);
          }
        }
      });
    };
    // Apply color change to all canvases inside elements with the target class
    const applyColorChange = () => {
      document.querySelectorAll('.cometchat-audio-bubble-incoming').forEach((parentDiv) => {
        findAndRecolorCanvases(parentDiv);
      });
    };
    const timeoutId = window.setTimeout(applyColorChange, 100);

    return () => window.clearTimeout(timeoutId);
  }, [hexToRGBA, styleFeatures, systemTheme]);

  /** Prevent Enter key default in search input */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement?.classList.contains('cometchat-search-bar__input')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

export default useThemeStyles;
