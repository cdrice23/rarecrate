import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import { useMutation } from '@apollo/client';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { useLocalState } from '@/lib/context/state';

interface FullSearchPaneProps {
  currentItems: any[];
  currentPage: number;
  searchPath: {
    topTier?: { type: string; name: string; id: number };
    midTier?: { type: string; name: string; id: number };
  };
  setSearchPath: (value) => void;
  getMoreItems?: () => void;
  getNextPane?: (value, searchId) => void;
}

const FullSearchPane = ({
  currentItems,
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
                setSearchPath({});
                router.push(Route.Profile + `/${result.username}`);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'profile', selectedId: result.id },
                });
                break;
              case 'Crate':
                setSearchPath({});
                router.push({
                  pathname: Route.Profile + `/${result.creator.username}`,
                  query: { selectedCrate: result.id },
                });
                await logSelectedSearchResult({
                  variables: { prismaModel: 'crate', selectedId: result.id },
                });
                break;
              case 'Album':
                getNextPane('Album', result.id);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'album', selectedId: result.id },
                });
                switch (currentActivePane) {
                  case 'albums':
                    setSearchPath({
                      topTier: { name: result.title, type: result.__typename.toLowerCase(), id: result.id },
                    });
                    break;
                  case 'albumsFromGenre':
                  case 'albumsFromSubgenre':
                  case 'albumsFromTag':
                    setSearchPath({
                      ...searchPath,
                      midTier: { name: result.title, type: result.__typename.toLowerCase(), id: result.id },
                    });
                    break;
                  default:
                    break;
                }
                break;
              case 'Label':
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase(), id: result.id } });
                getNextPane('Label', result.id);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'label', selectedId: result.id },
                });
                break;
              case 'Tag':
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase(), id: result.id } });
                getNextPane('Tag', result.id);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'tag', selectedId: result.id },
                });
                break;
              case 'Genre':
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase(), id: result.id } });
                getNextPane('Genre', result.id);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'genre', selectedId: result.id },
                });
                break;
              case 'Subgenre':
                setSearchPath({ topTier: { name: result.name, type: result.__typename.toLowerCase(), id: result.id } });
                getNextPane('Subgenre', result.id);
                await logSelectedSearchResult({
                  variables: { prismaModel: 'subgenre', selectedId: result.id },
                });
                break;
              default:
                break;
            }
          }}
        >
          <GlobalSearchResult
            data={result}
            index={index}
            // lastSlice={currentPage * 30 - 1}
            lastSlice={currentItems.length - 1}
            getMoreItems={getMoreItems}
          />
        </li>
      ))}
    </>
  );
};

export { FullSearchPane };
