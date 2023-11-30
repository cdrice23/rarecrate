import { Route } from '@/core/enums/routes';

export const handleOnMouseDown = async (item, debounceTimeout, setDebounceTimeout, router, logSelectedSearchResult) => {
  clearTimeout(debounceTimeout);
  setDebounceTimeout(null);
  // Handle routes
  if (item.__typename === 'Profile') {
    router.push(Route.Profile + `/${item.username}`);
    await logSelectedSearchResult({
      variables: { prismaModel: 'profile', selectedId: item.id },
    });
  }

  if (item.__typename === 'Crate') {
    router.push({
      pathname: Route.Profile + `/${item.creator.username}`,
      query: { searchedCrateSelected: item.id },
    });
    await logSelectedSearchResult({
      variables: { prismaModel: 'crate', selectedId: item.id },
    });
  }
};
