import { fetchDiscogsResults } from '@/core/helpers/discogs';

export const handleDiscogsSearch = async (
  value: any,
  selectedPage: number,
  expArtistResults: number,
  expTitleResults: number,
  inputItems: any[],
  setInputItems: React.Dispatch<React.SetStateAction<any[]>>,
  setExpArtistResults: React.Dispatch<React.SetStateAction<number>>,
  setExpTitleResults: React.Dispatch<React.SetStateAction<number>>,
  setSelectedPage: React.Dispatch<React.SetStateAction<number>>,
  setLoadingDiscogs: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setLoadingDiscogs(true);
  const newResults = await fetchDiscogsResults(value, selectedPage, 15, expArtistResults, expTitleResults);
  setExpArtistResults(Number(newResults.expArtistResults));
  setExpTitleResults(Number(newResults.expTitleResults));
  setSelectedPage(selectedPage + 1);
  const updatedResults = [...inputItems, ...newResults.formattedResults];
  const uniqueUpdatedResults = updatedResults.filter(
    (v, i, a) => a.findIndex(t => t.discogsMasterId === v.discogsMasterId) === i,
  );
  setInputItems(uniqueUpdatedResults);
  setLoadingDiscogs(false);
};

export const onKeyDown = async (
  event: React.KeyboardEvent<HTMLInputElement>,
  value: any,
  inputItems: any[],
  highlightedIndex: number,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<any>>,
  enterHandler: (item: any) => void,
  updateSearchPrompt: (prompt: string) => void,
  debounceTimeout: NodeJS.Timeout,
  setDebounceTimeout: React.Dispatch<React.SetStateAction<NodeJS.Timeout>>,
  logSelectedSearchResult: (variables: any) => void,
) => {
  if (event.key === 'Enter') {
    clearTimeout(debounceTimeout);
    setDebounceTimeout(null);
    setIsOpen(false);
    setSelectedItem(inputItems[highlightedIndex]);
    enterHandler(inputItems[highlightedIndex]);
    console.log(inputItems[highlightedIndex]);
    if (inputItems[highlightedIndex].id) {
      logSelectedSearchResult({
        variables: {
          searchTerm: value,
          prismaModel: 'album',
          selectedId: inputItems[highlightedIndex].id,
        },
      });
    }
    updateSearchPrompt('');
  }
};

export const onChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setLoadingDiscogs: React.Dispatch<React.SetStateAction<boolean>>,
  selectedItem: any,
  debounceTimeout: NodeJS.Timeout,
  setDebounceTimeout: React.Dispatch<React.SetStateAction<NodeJS.Timeout>>,
  searchQuery: (variables: any) => void,
  updateSearchPrompt: (prompt: string) => void,
  setSelectedPage: React.Dispatch<React.SetStateAction<number>>,
  setExpArtistResults: React.Dispatch<React.SetStateAction<number>>,
  setExpTitleResults: React.Dispatch<React.SetStateAction<number>>,
) => {
  const inputValue = event.currentTarget.value;
  // Reset state for discogs searches
  setLoadingDiscogs(false);
  setSelectedPage(1);
  setExpArtistResults(0);
  setExpTitleResults(0);
  // Clear previous debounce timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  // When typing, run the passed search query
  if (inputValue !== selectedItem?.title) {
    setIsOpen(true);
    // Debounce to wait 300ms after user stops typing
    const newDebounceTimeout = setTimeout(() => {
      searchQuery({ variables: { searchTerm: inputValue } });
      console.log('You are done typing');
    }, 300);
    setDebounceTimeout(newDebounceTimeout);
  }

  updateSearchPrompt(inputValue);

  if (inputValue === '') {
    setIsOpen(false);
  }
};

export const onMouseDown = (
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<any>>,
  logSelectedSearchResult: (variables: any) => void,
  debounceTimeout: NodeJS.Timeout,
  setDebounceTimeout: React.Dispatch<React.SetStateAction<NodeJS.Timeout>>,
  inputItems: any[],
  index: number,
  highlightedIndex: number,
  value: any,
  enterHandler: (item: any) => void,
  updateSearchPrompt: (prompt: string) => void,
) => {
  clearTimeout(debounceTimeout);
  setDebounceTimeout(null);
  setIsOpen(false);
  setSelectedItem(inputItems[index]);
  enterHandler(inputItems[index]);
  if (inputItems[highlightedIndex].id) {
    logSelectedSearchResult({
      variables: {
        searchTerm: value,
        prismaModel: 'album',
        selectedId: inputItems[highlightedIndex].id,
      },
    });
  }
  updateSearchPrompt('');
};
