export interface DropdownComboboxProps {
  enterHandler: () => void;
  updateNewItem: (inputValue: string) => void;
  listItems: any[];
  itemLabel: string;
  searchQuery: (value: any) => void;
  loading: boolean;
}
