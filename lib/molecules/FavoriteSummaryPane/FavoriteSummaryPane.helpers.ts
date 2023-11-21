import { useMutation, gql } from '@apollo/client';
import { ADD_CRATE_TO_FAVORITES, REMOVE_CRATE_FROM_FAVORITES } from '@/db/graphql/clientOperations';

export const useAddCrateToFavorites = mainProfile => {
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

  return addCrateToFavorites;
};

export const useRemoveCrateFromFavorites = mainProfile => {
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

  return removeCrateFromFavorites;
};

export const handleFavoriteToggle = async (
  checkStatus,
  crate,
  mainProfile,
  createNotification,
  addCrateToFavorites,
  removeCrateFromFavorites,
  dispatch,
) => {
  const mutationFunction = checkStatus ? removeCrateFromFavorites : addCrateToFavorites;
  await mutationFunction({
    variables: {
      input: {
        crateId: crate.id,
        profileId: mainProfile,
      },
    },
  });

  // Update reducerState in parent
  const status = checkStatus ? 'FALSE' : 'TRUE';
  const actionType = `TOGGLE_FAVORITE_${crate.id}_${status}`;
  dispatch({ type: actionType, payload: mainProfile });

  if (mutationFunction === addCrateToFavorites) {
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
