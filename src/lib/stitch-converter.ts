/**
 * Utility functions để convert code từ Stitch AI sang format dự án
 */

/**
 * Convert CSS classes từ Stitch sang Tailwind
 */
export function convertStitchCSSToTailwind(css: string): string {
  // Map common CSS properties to Tailwind
  const cssToTailwind: Record<string, string> = {
    'background: #3b82f6': 'bg-blue-600',
    'background: #1e40af': 'bg-blue-700',
    'color: white': 'text-white',
    'color: #000': 'text-black',
    'padding: 0.5rem 1rem': 'px-4 py-2',
    'padding: 1rem': 'p-4',
    'border-radius: 0.375rem': 'rounded-md',
    'border-radius: 0.5rem': 'rounded-lg',
    'font-weight: 600': 'font-semibold',
    'font-weight: 700': 'font-bold',
    'display: flex': 'flex',
    'justify-content: center': 'justify-center',
    'align-items: center': 'items-center',
    'gap: 1rem': 'gap-4',
  };

  let converted = css;
  Object.entries(cssToTailwind).forEach(([cssProp, tailwindClass]) => {
    converted = converted.replace(cssProp, tailwindClass);
  });

  return converted;
}

/**
 * Map Stitch component names sang shadcn/ui components
 */
export function mapStitchComponentToShadcn(componentName: string): string | null {
  const componentMap: Record<string, string> = {
    'Button': '@/components/ui/button',
    'Card': '@/components/ui/card',
    'Input': '@/components/ui/input',
    'Select': '@/components/ui/select',
    'Label': '@/components/ui/label',
    'Textarea': '@/components/ui/textarea',
    'Dialog': '@/components/ui/dialog',
    'DropdownMenu': '@/components/ui/dropdown-menu',
    'Tabs': '@/components/ui/tabs',
    'Avatar': '@/components/ui/avatar',
    'Badge': '@/components/ui/badge',
  };

  return componentMap[componentName] || null;
}

/**
 * Convert inline styles sang Tailwind classes
 */
export function convertInlineStylesToTailwind(styles: string): string {
  const styleMap: Record<string, string> = {
    'backgroundColor': 'bg-',
    'color': 'text-',
    'padding': 'p-',
    'margin': 'm-',
    'width': 'w-',
    'height': 'h-',
    'display': '',
    'flexDirection': 'flex-',
    'justifyContent': 'justify-',
    'alignItems': 'items-',
  };

  // TODO: Implement full conversion logic
  return styles;
}

/**
 * Extract và convert component từ Stitch code
 */
export function extractAndConvertComponent(stitchCode: string): {
  component: string;
  imports: string[];
  styles: string;
} {
  // Extract component structure
  const componentMatch = stitchCode.match(/<(\w+)[^>]*>/);
  const componentName = componentMatch ? componentMatch[1] : 'Component';

  // Extract imports
  const imports: string[] = [];
  const importMatches = stitchCode.matchAll(/import\s+.*?from\s+['"](.*?)['"]/g);
  for (const match of importMatches) {
    imports.push(match[1]);
  }

  // Extract styles
  const styleMatch = stitchCode.match(/<style>(.*?)<\/style>/s);
  const styles = styleMatch ? styleMatch[1] : '';

  return {
    component: componentName,
    imports,
    styles,
  };
}

/**
 * Generate TypeScript types cho component
 */
export function generateComponentTypes(props: Record<string, any>): string {
  const typeEntries = Object.entries(props).map(([key, value]) => {
    const type = typeof value === 'string' ? 'string' : 
                 typeof value === 'number' ? 'number' : 
                 typeof value === 'boolean' ? 'boolean' : 'any';
    return `  ${key}: ${type};`;
  });

  return `interface ComponentProps {\n${typeEntries.join('\n')}\n}`;
}

