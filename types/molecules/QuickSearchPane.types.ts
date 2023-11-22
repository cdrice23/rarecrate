import { GetItemPropsOptions, GetMenuPropsOptions } from 'downshift';

export interface QuickSearchPaneProps {
  style: any;
  inputItems: any[];
  loading: boolean;
  searchPrompt: string;
  debounceTimeout: any;
  setDebounceTimeout: (value) => void;
  getMenuProps: (options?: GetMenuPropsOptions) => any;
  getItemProps: <Item>(options: GetItemPropsOptions<Item>) => any;
  highlightedIndex: number | null;
  handleShowFullSearch: () => void;
}
