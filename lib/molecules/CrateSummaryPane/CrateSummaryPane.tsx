import { Pane } from '@/lib/atoms/Pane/Pane';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  GET_PROFILE_CRATES_AND_FAVORITES,
  ADD_CRATE_TO_FAVORITES,
  REMOVE_CRATE_FROM_FAVORITES,
  CREATE_NOTIFICATION,
} from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { useState, useEffect } from 'react';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { Heart } from '@phosphor-icons/react';
import BinaryIconButton from '@/lib/atoms/BinaryIconButton/BinaryIconButton';

type CrateSummaryPaneProps = {
  username: string;
  mainProfile: number;
  userProfiles: [{ id: number; username: string }];
  listType: 'crates' | 'favorites';
};

const CrateSummaryPane = ({ username, listType, mainProfile, userProfiles }: CrateSummaryPaneProps) => {
  const [activeCrate, setActiveCrate] = useState<number>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  const router = useRouter();

  const { loading, error, data } = useQuery(GET_PROFILE_CRATES_AND_FAVORITES, {
    variables: { username: username },
    skip: Boolean(!activeCrate && router.query.selectedCrate),
  });

  useEffect(() => {
    const { selectedCrate } = router.query;
    if (selectedCrate) {
      setActiveCrate(Number(selectedCrate));
      setShowCrateDetail(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.selectedCrate]);

  const crateSummaryData = data?.getProfile;
  const isMain = Boolean(crateSummaryData?.id === mainProfile);
  const isUserProfile = userProfiles.some(profile => profile.id === crateSummaryData?.id);

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

  const handleFavoriteToggle = async (checkStatus, crateId, mainProfile) => {
    const mutationFunction = checkStatus ? removeCrateFromFavorites : addCrateToFavorites;
    const response = await mutationFunction({
      variables: {
        input: {
          crateId: crateId,
          profileId: mainProfile,
        },
      },
    });

    if (mutationFunction === addCrateToFavorites) {
      const creatorId = response.data.addCrateToFavorites.creator.id;
      createNotification({
        variables: {
          receiver: creatorId,
          type: 'newFavorite',
          actionOwner: mainProfile,
          notificationRef: crateId,
        },
      });
    }
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
              currentProfile={username}
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
                  {!isMain && !isUserProfile && (
                    <BinaryIconButton
                      icon={<Heart />}
                      checkStatus={Boolean(
                        crateSummaryData.crates[index].favoritedBy.filter(p => p.id === mainProfile).length > 0,
                      )}
                      handler={checkStatus => {
                        handleFavoriteToggle(checkStatus, crate.id, mainProfile);
                      }}
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
              currentProfile={username}
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
                  {!userProfiles.some(userProfile => crate.creator.id === userProfile.id) && (
                    <BinaryIconButton
                      icon={<Heart />}
                      checkStatus={Boolean(
                        crateSummaryData?.favorites[index].favoritedBy.filter(p => p.id === Number(mainProfile))
                          .length > 0,
                      )}
                      handler={checkStatus => handleFavoriteToggle(checkStatus, crate.id, mainProfile)}
                    />
                  )}
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
