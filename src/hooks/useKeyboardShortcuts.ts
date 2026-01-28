import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onCreateIssue?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts({ onCreateIssue, onSearch }: ShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // C - Create new issue
    if (event.key === 'c' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      onCreateIssue?.();
    }

    // / - Focus search
    if (event.key === '/' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      onSearch?.();
    }
  }, [onCreateIssue, onSearch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
