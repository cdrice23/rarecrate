import { useMutation, useLazyQuery, gql } from '@apollo/client';
import { ADD_CRATE_TO_FAVORITES, REMOVE_CRATE_FROM_FAVORITES } from '@/db/graphql/clientOperations/crate';
import { CREATE_NOTIFICATION } from '@/db/graphql/clientOperations/notification';
import { MARK_RECOMMENDATION_SEEN, GET_RECOMMENDATIONS } from '@/db/graphql/clientOperations/recommendation';

export const useMutations = mainProfile => {
  const [createNotification] = useMutation(CREATE_NOTIFICATION);
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
  const [markRecommendationSeen] = useMutation(MARK_RECOMMENDATION_SEEN);
  const [getMoreRecommendations, { loading: loadingAdditional, data: additionalData }] =
    useLazyQuery(GET_RECOMMENDATIONS);

  return {
    createNotification,
    addCrateToFavorites,
    removeCrateFromFavorites,
    markRecommendationSeen,
    getMoreRecommendations,
    loadingAdditional,
    additionalData,
  };
};

export const handleGetMoreRecommendations = async (
  mainProfile,
  usedPages,
  currentRecommendations,
  setCurrentRecommendations,
  setLastIndex,
  setUsedPages,
  getMoreRecommendations,
) => {
  const getNewRecommendatations = await getMoreRecommendations({
    variables: {
      profileId: mainProfile,
      usedPages,
    },
  });

  const newRecommendations = getNewRecommendatations?.data.getRecommendations.recommendations;
  const resetRecommendations = getNewRecommendatations?.data.getRecommendations.resetRecommendations;
  let finalRecommendations = [...currentRecommendations];

  if (newRecommendations.length > 0) {
    let shuffledRecommendations = [...newRecommendations];
    finalRecommendations = [...finalRecommendations, ...shuffledRecommendations];
  }

  if (resetRecommendations) {
    finalRecommendations = [...newRecommendations];
  }

  setCurrentRecommendations(finalRecommendations);
  setLastIndex(finalRecommendations.length - 1);
  setUsedPages(getNewRecommendatations?.data.getRecommendations.usedPages);
};

export const handleFavoriteToggle = async (
  checkStatus,
  crate,
  mainProfile,
  removeCrateFromFavorites,
  addCrateToFavorites,
  createNotification,
) => {
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
