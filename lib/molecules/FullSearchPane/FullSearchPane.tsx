import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import { useMutation } from '@apollo/client';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { useLocalState } from '@/lib/context/state';

interface FullSearchPaneProps {
  currentItems: any[];
  currentPage: number;
  searchPath: { topTier?: { type: string; name: string }; midTier?: { type: string; name: string } };
  setSearchPath: (value) => void;
  getMoreItems: () => void;
  getNextPane?: (value, searchId) => void;
}

const FullSearchPane = ({
  currentItems,
  currentPage,
  searchPath,
  getMoreItems,
  getNextPane,
  setSearchPath,
}: FullSearchPaneProps) => {
  const { currentActivePane } = useLocalState();
  const [logSelectedSearchResult] = useMutation(LOG_SELECTED_SEARCH_RESULT);
  const router = useRouter();

  return (
    <>
      {currentItems.length === 0 && <li>{`No results!`}</li>}
      {currentItems.map((result, index) => (
        <li
          key={index}
          onClick={async () => {
            switch (result.__typename) {
              case 'Profile':
                router.push(Route.Profile + `/${result.username}`);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'profile', selectedId: result.id },
                });
                setSearchPath({});
                break;
              case 'Crate':
                router.push({
                  pathname: Route.Profile + `/${result.creator.username}`,
                  query: { searchedCrateSelected: result.id },
                });
                await logSelectedSearchResult({
                  variables: { prismaModel: 'crate', selectedId: result.id },
                });
                setSearchPath({});
                break;
              case 'Album':
                getNextPane('Album', result.id);
                switch (currentActivePane) {
                  case 'albums':
                    setSearchPath({ topTier: { name: result.title, type: result.__typename.toLowerCase() } });
                    break;
                  case 'albumsFromGenre':
                  case 'albumsFromSubgenre':
                  case 'albumsFromTag':
                    setSearchPath({
                      ...searchPath,
                      midTier: { name: result.title, type: result.__typename.toLowerCase() },
                    });
                    break;
                  default:
                    break;
                }
                break;
              case 'Label':
                getNextPane('Label', result.id);
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase() } });
                break;
              case 'Tag':
                getNextPane('Tag', result.id);
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase() } });
                break;
              case 'Genre':
                getNextPane('Genre', result.id);
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase() } });
                break;
              case 'Subgenre':
                getNextPane('Subgenre', result.id);
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase() } });
                break;
              default:
                break;
            }
          }}
        >
          <GlobalSearchResult
            data={result}
            index={index}
            lastSlice={currentPage * 30 - 1}
            getMoreItems={() => getMoreItems()}
          />
        </li>
      ))}
    </>
  );
};

export { FullSearchPane };
