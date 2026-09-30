/**
 * Lets the `/` keyboard shortcut focus the search field without threading a ref
 * through the topbar and the shell. A module-level holder rather than context
 * because focus is not render state — nothing needs to re-render when it moves.
 */
let searchInput: HTMLInputElement | null = null;

export function registerSearchInput(element: HTMLInputElement | null) {
  searchInput = element;
  return () => {
    if (searchInput === element) {
      searchInput = null;
    }
  };
}

export function focusSearchInput(): boolean {
  if (!searchInput) {
    return false;
  }
  searchInput.focus();
  searchInput.select();
  return true;
}
