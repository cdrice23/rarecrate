import { ChangeEvent, KeyboardEvent } from 'react';
import { Route } from '@/core/enums/routes';

type SearchPath = {
  topTier?: { type: string; name: string; id: number };
  midTier?: { type: string; name: string; id: number };
};

export interface GlobalSearchProps {
  showSearchResults: boolean;
  setShowSearchResults: (value: boolean) => void;
}

export const handleOnClick = (
  currentActivePane: string,
  prevActivePane: string,
  setShowFullSearchPane: (show: boolean) => void,
  setSearchPath: (path: SearchPath) => void,
  setPrevActivePane: (pane: string) => void,
  searchPath: SearchPath,
  setCurrentActivePane: (pane: string) => void,
) => {
  switch (currentActivePane) {
    case 'profiles':
    case 'crates':
    case 'albums':
    case 'labelsAndTags':
    case 'genresAndSubgenres':
      setShowFullSearchPane(false);
      setSearchPath({});
      break;
    case 'cratesFromLabel':
    case 'albumsFromTag':
      setCurrentActivePane('labelsAndTags');
      setSearchPath({});
      break;
    case 'albumsFromGenre':
    case 'albumsFromSubgenre':
      setCurrentActivePane('genresAndSubgenres');
      setSearchPath({});
      break;
    case 'cratesFromAlbum':
      setCurrentActivePane(prevActivePane);
      switch (prevActivePane) {
        case 'albumsFromTag':
          setPrevActivePane('labelsAndTags');
          setSearchPath({ ...searchPath, midTier: null });
          break;
        case 'albumsFromGenre':
        case 'albumsFromSubgenre':
          setPrevActivePane('genresAndSubgenres');
          setSearchPath({ ...searchPath, midTier: null });
          break;
        case 'albums':
          setPrevActivePane('albums');
          setSearchPath({});
        default:
          break;
      }
    default:
      break;
  }
};

export const handleOnChange = (
  event: ChangeEvent<HTMLInputElement>,
  setShowFullSearchPane: (show: boolean) => void,
  setSearchPrompt: (prompt: string) => void,
  setInputItems: (items: any[]) => void,
  setQuickSearchResults: (results: any[]) => void,
  searchQuery: any,
  debounceTimeout: NodeJS.Timeout,
  setDebounceTimeout: (timeout: NodeJS.Timeout) => void,
  setShowSearchResults: (value: boolean) => void,
) => {
  setShowFullSearchPane(false);
  const inputValue = event.currentTarget.value;

  console.log(inputValue);

  if (inputValue === '') {
    console.log('blank!');
    setShowSearchResults(false);
    clearTimeout(debounceTimeout);
    setDebounceTimeout(null);
    setSearchPrompt(inputValue);
    setInputItems([]);
    setQuickSearchResults([]);
  }
  // Clear previous debounce timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  // When typing, run the passed search query
  if (inputValue !== '') {
    // Debounce to wait 300ms after user stops typing
    const newDebounceTimeout = setTimeout(() => {
      searchQuery({ variables: { searchTerm: inputValue } });
    }, 300);
    setDebounceTimeout(newDebounceTimeout);
  }

  setSearchPrompt(inputValue);
};

export const handleOnKeyDown = async (
  event: KeyboardEvent<HTMLInputElement>,
  showFullSearchPane: boolean,
  setShowFullSearchPane: (show: boolean) => void,
  setCurrentActivePane: (pane: string) => void,
  logSelectedSearchResult: any,
  router: any,
  inputItems: any[],
  highlightedIndex: number,
  debounceTimeout: NodeJS.Timeout,
  setDebounceTimeout: (timeout: NodeJS.Timeout) => void,
) => {
  if (event.key === 'Enter' && !showFullSearchPane) {
    clearTimeout(debounceTimeout);
    setDebounceTimeout(null);

    // Handle routes
    if (inputItems[highlightedIndex].__typename === 'Profile') {
      router.push(Route.Profile + `/${inputItems[highlightedIndex].username}`);
      await logSelectedSearchResult({
        variables: { prismaModel: 'profile', selectedId: inputItems[highlightedIndex].id },
      });
    }

    if (inputItems[highlightedIndex].__typename === 'Crate') {
      router.push({
        pathname: Route.Profile + `/${inputItems[highlightedIndex].creator.username}`,
        query: { searchedCrateSelected: inputItems[highlightedIndex].id },
      });
      await logSelectedSearchResult({
        variables: { prismaModel: 'crate', selectedId: inputItems[highlightedIndex].id },
      });
    }

    if (inputItems[highlightedIndex].isShowMoreButton) {
      setCurrentActivePane('profiles');
      setShowFullSearchPane(true);
    }
  }
};
