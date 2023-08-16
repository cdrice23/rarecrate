import { Pane } from '@/lib/atoms/Pane/Pane';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  GET_PROFILE_CRATES_AND_FAVORITES,
  ADD_CRATE_TO_FAVORITES,
  REMOVE_CRATE_FROM_FAVORITES,
} from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { useState } from 'react';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { Heart } from '@phosphor-icons/react';
import BinaryIconButton from '@/lib/atoms/BinaryIconButton/BinaryIconButton';

type CrateSummaryPaneProps = {
  username: string;
  mainProfile: number;
  listType: 'crates' | 'favorites';
};

const CrateSummaryPane = ({ username, listType, mainProfile }: CrateSummaryPaneProps) => {
  const [activeCrate, setActiveCrate] = useState<number>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const { loading, error, data } = useQuery(GET_PROFILE_CRATES_AND_FAVORITES, {
    variables: { username: username },
  });

  const crateSummaryData = data?.getProfile;
  console.log(crateSummaryData);
  const isMain = Boolean(crateSummaryData?.id === mainProfile);

  const [addCrateToFavorites] = useMutation(ADD_CRATE_TO_FAVORITES, {
    update: (cache, { data: { addCrateToFavorites } }) => {
      cache.modify({
        id: cache.identify(addCrateToFavorites),
        fields: {
          favoritedBy(existingFavoritedBy = []) {
            return addCrateToFavorites.favoritedBy;
          },
        },
      });

      cache.modify({
        id: cache.identify({ __typename: 'Profile', id: mainProfile }),
        fields: {
          favorites(existingFavorites = []) {
            const newFragment = cache.writeFragment({
              data: addCrateToFavorites,
              fragment: gql`
                fragment NewFavorite on Crate {
                  id
                }
              `,
            });

            return [...existingFavorites, newFragment];
          },
        },
      });
    },
  });

  const [removeCrateFromFavorites] = useMutation(REMOVE_CRATE_FROM_FAVORITES, {
    update: (cache, { data: { removeCrateFromFavorites } }) => {
      cache.modify({
        id: cache.identify(removeCrateFromFavorites),
        fields: {
          favoritedBy(existingFavoritedBy = []) {
            return existingFavoritedBy.filter(profile => profile.id !== mainProfile);
          },
        },
      });

      cache.modify({
        id: cache.identify({ __typename: 'Profile', id: mainProfile }),
        fields: {
          favorites(existingFavorites = [], { readField }) {
            return existingFavorites.filter(crate => readField('id', crate) !== removeCrateFromFavorites.id);
          },
        },
      });
    },
  });

  const handleFavoriteToggle = (checkStatus, crateId, mainProfile) => {
    const mutationFunction = checkStatus ? removeCrateFromFavorites : addCrateToFavorites;
    mutationFunction({
      variables: {
        input: {
          crateId: crateId,
          profileId: mainProfile,
        },
      },
    });
  };

  return (
    <Pane>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : crateSummaryData ? (
        listType === 'crates' ? (
          <>
            <CrateDetail
              activeCrateId={activeCrate}
              show={showCrateDetail}
              onClose={() => {
                setShowCrateDetail(false);
              }}
            />
            <Pane>
              <h3>Crates:</h3>
            </Pane>
            <Pane crateSummaryPane={true}>
              {crateSummaryData.crates.map((crate, index) => (
                <div
                  key={index}
                  className={cx('crateSummary')}
                  onClick={() => {
                    setActiveCrate(crate.id);
                    setShowCrateDetail(true);
                  }}
                >
                  <p>{crate.title}</p>
                  <p>{`Image: ${crateSummaryData.image}`}</p>
                  <p>{`Favorited By: ${crate.favoritedBy.length} people`}</p>
                  <ul>
                    {crate.labels.map(label => (
                      <li key={label.id}>{label.isStandard ? 'Blue' : 'Yellow'}</li>
                    ))}
                  </ul>
                  {!isMain && (
                    <BinaryIconButton
                      icon={<Heart />}
                      checkStatus={Boolean(
                        crateSummaryData.crates[index].favoritedBy.filter(p => p.id === mainProfile).length > 0,
                      )}
                      handler={checkStatus => handleFavoriteToggle(checkStatus, crate.id, mainProfile)}
                    />
                  )}
                </div>
              ))}
            </Pane>
          </>
        ) : (
          <>
            <CrateDetail
              activeCrateId={activeCrate}
              show={showCrateDetail}
              onClose={() => {
                setShowCrateDetail(false);
              }}
            />
            <Pane>
              <h3>Favorites:</h3>
            </Pane>
            <Pane crateSummaryPane={true}>
              {crateSummaryData.favorites.map((crate, index) => (
                <div
                  key={index}
                  className={cx('crateSummary')}
                  onClick={event => {
                    // event.stopPropagation();
                    // console.log(event.currentTarget);
                    setActiveCrate(crate.id);
                    setShowCrateDetail(true);
                  }}
                >
                  <p>{crate.title}</p>
                  <p>{`Image: ${crateSummaryData.image}`}</p>
                  <p>{`Favorited By: ${crate.favoritedBy.length} people`}</p>
                  <ul>
                    {crate.labels.map(label => (
                      <li key={label.id}>{label.isStandard ? 'Blue' : 'Yellow'}</li>
                    ))}
                  </ul>
                  <BinaryIconButton
                    icon={<Heart />}
                    checkStatus={Boolean(
                      crateSummaryData?.favorites[index].favoritedBy.filter(p => p.id === Number(mainProfile)).length >
                        0,
                    )}
                    handler={checkStatus => handleFavoriteToggle(checkStatus, crate.id, mainProfile)}
                  />
                </div>
              ))}
            </Pane>
          </>
        )
      ) : null}
    </Pane>
  );
};

export { CrateSummaryPane };
