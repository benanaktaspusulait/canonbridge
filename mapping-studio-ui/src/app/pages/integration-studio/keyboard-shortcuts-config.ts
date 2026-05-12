/**
 * Keyboard shortcuts configuration for Integration Studio
 */

export interface StudioShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: string;
}

export const STUDIO_SHORTCUTS: StudioShortcut[] = [
  // Save
  {
    key: 's',
    ctrl: true,
    description: 'Save current mapping',
    action: 'save'
  },
  
  // Test
  {
    key: 'Enter',
    ctrl: true,
    description: 'Run test with current fixture',
    action: 'test'
  },
  
  // Navigation
  {
    key: 'ArrowRight',
    ctrl: true,
    description: 'Next step in wizard',
    action: 'nextStep'
  },
  {
    key: 'ArrowLeft',
    ctrl: true,
    description: 'Previous step in wizard',
    action: 'prevStep'
  },
  
  // Undo/Redo
  {
    key: 'z',
    ctrl: true,
    description: 'Undo last change',
    action: 'undo'
  },
  {
    key: 'y',
    ctrl: true,
    description: 'Redo last undone change',
    action: 'redo'
  },
  {
    key: 'z',
    ctrl: true,
    shift: true,
    description: 'Redo last undone change (alternative)',
    action: 'redo'
  },
  
  // Rule Management
  {
    key: 'n',
    ctrl: true,
    description: 'Add new mapping rule',
    action: 'addRule'
  },
  {
    key: 'd',
    ctrl: true,
    description: 'Duplicate selected rule',
    action: 'duplicateRule'
  },
  {
    key: 'Delete',
    description: 'Delete selected rule',
    action: 'deleteRule'
  },
  
  // View
  {
    key: 'p',
    ctrl: true,
    description: 'Toggle preview panel',
    action: 'togglePreview'
  },
  {
    key: 'e',
    ctrl: true,
    description: 'Toggle expert mode',
    action: 'toggleExpertMode'
  },
  
  // Search
  {
    key: 'f',
    ctrl: true,
    description: 'Focus search field',
    action: 'focusSearch'
  },
  
  // Help
  {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    action: 'showHelp'
  }
];

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: StudioShortcut): string {
  const parts: string[] = [];
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  
  // Format key name
  let keyName = shortcut.key;
  if (keyName === 'ArrowRight') keyName = '→';
  else if (keyName === 'ArrowLeft') keyName = '←';
  else if (keyName === 'ArrowUp') keyName = '↑';
  else if (keyName === 'ArrowDown') keyName = '↓';
  else if (keyName === 'Enter') keyName = '↵';
  else if (keyName === 'Delete') keyName = 'Del';
  else keyName = keyName.toUpperCase();
  
  parts.push(keyName);
  
  return parts.join(isMac ? '' : '+');
}

/**
 * Get shortcuts grouped by category
 */
export function getShortcutsByCategory(): Record<string, StudioShortcut[]> {
  return {
    'File Operations': STUDIO_SHORTCUTS.filter(s => 
      ['save'].includes(s.action)
    ),
    'Navigation': STUDIO_SHORTCUTS.filter(s => 
      ['nextStep', 'prevStep'].includes(s.action)
    ),
    'Editing': STUDIO_SHORTCUTS.filter(s => 
      ['undo', 'redo', 'addRule', 'duplicateRule', 'deleteRule'].includes(s.action)
    ),
    'Testing': STUDIO_SHORTCUTS.filter(s => 
      ['test'].includes(s.action)
    ),
    'View': STUDIO_SHORTCUTS.filter(s => 
      ['togglePreview', 'toggleExpertMode', 'focusSearch'].includes(s.action)
    ),
    'Help': STUDIO_SHORTCUTS.filter(s => 
      ['showHelp'].includes(s.action)
    )
  };
}
