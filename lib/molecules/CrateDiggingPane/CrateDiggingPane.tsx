import { Pane } from '@/lib/atoms/Pane/Pane';
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import {
  GET_RECOMMENDATIONS,
  ADD_CRATE_TO_FAVORITES,
  REMOVE_CRATE_FROM_FAVORITES,
  CREATE_NOTIFICATION,
  MARK_RECOMMENDATION_SEEN,
} from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { useState, useEffect } from 'react';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { HandHeart, Lightbulb, DotOutline } from '@phosphor-icons/react';
import { useLocalState } from '@/lib/context/state';
import { motion } from 'framer-motion';

type CrateDiggingPaneProps = {
  mainProfile: number;
  userProfiles: [{ id: number; username: string }];
};

const CrateDiggingPane = ({ mainProfile, userProfiles }: CrateDiggingPaneProps) => {
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const [activeCrate, setActiveCrate] = useState<any>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const [usedPages, setUsedPages] = useState<number[]>(null);
  const [lastIndex, setLastIndex] = useState<number>(null);
  const [seenRecommendations, setSeenRecommendations] = useState([]);
  const { usernameMain } = useLocalState();
  console.log(seenRecommendations);

  console.log('currentRecommendations', currentRecommendations);

  const [createNotification] = useMutation(CREATE_NOTIFICATION);
  const {
    error: initialError,
    loading: initialLoading,
    data: initialData,
  } = useQuery(GET_RECOMMENDATIONS, {
    variables: { profileId: mainProfile },
  });

  const [getMoreRecommendations, { loading: loadingAdditional, data: additionalData }] =
    useLazyQuery(GET_RECOMMENDATIONS);

  const [markRecommendationSeen] = useMutation(MARK_RECOMMENDATION_SEEN);

  const handleGetMoreRecommendations = async () => {
    const getNewRecommendatations = await getMoreRecommendations({
      variables: {
        profileId: mainProfile,
        usedPages,
        currentRecsInArray: currentRecommendations.length,
      },
    });

    const newRecommendations = getNewRecommendatations?.data.getRecommendations.recommendations;
    const resetRecommendations = getNewRecommendatations?.data.getRecommendations.resetRecommendations;

    let finalRecommendations = [...currentRecommendations];

    if (newRecommendations.length > 0) {
      let shuffledRecommendations = [...newRecommendations];
      // if (shuffledRecommendations) {
      //   for (let i = shuffledRecommendations.length - 1; i > 0; i--) {
      //     const j = Math.floor(Math.random() * (i + 1));
      //     [shuffledRecommendations[i], shuffledRecommendations[j]] = [
      //       shuffledRecommendations[j],
      //       shuffledRecommendations[i],
      //     ];
      //   }
      // }

      finalRecommendations = [...finalRecommendations, ...shuffledRecommendations];
    }

    if (resetRecommendations) {
      finalRecommendations = [...newRecommendations];
    }

    setCurrentRecommendations(finalRecommendations);
    setLastIndex(finalRecommendations.length - 1);
    setUsedPages(getNewRecommendatations?.data.getRecommendations.usedPages);
  };

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

  console.log(useApolloClient().cache.extract());

  const handleFavoriteToggle = async (checkStatus, crate, mainProfile) => {
    const mutationFunction = checkStatus ? removeCrateFromFavorites : addCrateToFavorites;
    const response = await mutationFunction({
      variables: {
        input: {
          crateId: crate.id,
          profileId: mainProfile,
        },
      },
    });

    if (mutationFunction === addCrateToFavorites) {
      // const creatorId = response.data.addCrateToFavorites.creator.id;
      createNotification({
        variables: {
          receiver: crate.creator.id,
          type: 'newFavorite',
          actionOwner: mainProfile,
          notificationRef: crate.id,
        },
      });
    }
  };

  useEffect(() => {
    const initialRecommendations = initialData?.getRecommendations.recommendations;

    // Randomly shuffle the initial recommendations
    if (initialRecommendations) {
      let shuffledRecommendations = [...initialRecommendations];
      // for (let i = shuffledRecommendations.length - 1; i > 0; i--) {
      //   const j = Math.floor(Math.random() * (i + 1));
      //   [shuffledRecommendations[i], shuffledRecommendations[j]] = [
      //     shuffledRecommendations[j],
      //     shuffledRecommendations[i],
      //   ];
      // }

      setCurrentRecommendations(shuffledRecommendations);
      setUsedPages(initialData?.getRecommendations.usedPages);
      setLastIndex(shuffledRecommendations.length - 1);
    }
  }, [initialData]);

  useEffect(() => {
    if (seenRecommendations.length > 0) {
      markRecommendationSeen({
        variables: {
          recommendationId: seenRecommendations[seenRecommendations.length - 1],
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenRecommendations]);

  return (
    <Pane>
      {initialError ? (
        <>
          <h1>Error</h1>
          <p>{initialError.message}</p>
        </>
      ) : initialLoading ? (
        <h1>Loading...</h1>
      ) : currentRecommendations?.length > 0 ? (
        <>
          <CrateDetail
            userProfiles={userProfiles}
            activeCrateId={activeCrate?.id}
            show={showCrateDetail}
            onClose={() => {
              setShowCrateDetail(false);
              setActiveCrate(null);
            }}
            currentProfile={usernameMain}
            favoriteIconHandler={handleFavoriteToggle}
          />
          <Pane crateDiggingPane={true}>
            {currentRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                onViewportEnter={async () => {
                  if (index === lastIndex) {
                    console.log(`You hit the last item!`);
                    handleGetMoreRecommendations();
                  }
                }}
                className={cx('recommendation', {
                  [`curatedRecommendation`]: recommendation.recommendationType === 'curated',
                  [`randomRecommendation`]: recommendation.recommendationType === 'random',
                })}
                onClick={() => {
                  setActiveCrate(recommendation.crate);
                  setShowCrateDetail(true);
                  setSeenRecommendations(prevSeenRecommendations => [...prevSeenRecommendations, recommendation.id]);
                }}
              >
                <div>
                  {/* {!recommendation.seen && <DotOutline size={24} className={cx('seenIcon')} />} */}
                  {!seenRecommendations.includes(recommendation.id) && (
                    <DotOutline size={24} className={cx('seenIcon')} />
                  )}
                  {recommendation.recommendationType === 'curated' ? <HandHeart size={24} /> : <Lightbulb size={24} />}
                  <p>{recommendation.recommendationType === 'curated' ? 'Our Pick For You' : 'Discover New Crate'}</p>
                </div>
              </motion.div>
            ))}
            {loadingAdditional && (
              <div className={cx('recommendation', 'loadingMore')}>
                <div>
                  <p>{`Loading More...`}</p>
                </div>
              </div>
            )}
          </Pane>
        </>
      ) : null}
    </Pane>
  );
};

export { CrateDiggingPane };
