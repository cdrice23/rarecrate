import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import { useMutation } from '@apollo/client';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';

interface FullSearchPaneProps {
  currentItems: any[];
  currentPage: number;
  getMoreItems: () => void;
  getNextPane?: (value, searchId) => void;
}

const FullSearchPane = ({ currentItems, currentPage, getMoreItems, getNextPane }: FullSearchPaneProps) => {
  const [logSelectedSearchResult] = useMutation(LOG_SELECTED_SEARCH_RESULT);
  const router = useRouter();

  return (
    <>
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
                break;
              case 'Crate':
                router.push({
                  pathname: Route.Profile + `/${result.creator.username}`,
                  query: { searchedCrateSelected: result.id },
                });
                await logSelectedSearchResult({
                  variables: { prismaModel: 'crate', selectedId: result.id },
                });
                break;
              case 'Album':
                getNextPane('Album', result.id);
                break;
              case 'Label':
                getNextPane('Label', result.id);
                break;
              case 'Tag':
                getNextPane('Tag', result.id);
                break;
              case 'Genre':
                getNextPane('Genre', result.id);
                break;
              case 'Subgenre':
                getNextPane('Subgenre', result.id);
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
