import { Pane } from '@/lib/atoms/Pane/Pane';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  ADD_CRATE_TO_FAVORITES,
  REMOVE_CRATE_FROM_FAVORITES,
  CREATE_NOTIFICATION,
} from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { useState, useEffect } from 'react';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { Heart } from '@phosphor-icons/react';
import BinaryIconButton from '@/lib/atoms/BinaryIconButton/BinaryIconButton';
import { motion } from 'framer-motion';

type FavoriteSummaryPaneProps = {
  currentItems: any[];
  username: string;
  mainProfile: number;
  userProfiles: [{ id: number; username: string }];
  getMoreItems: () => void;
};

const FavoriteSummaryPane = ({
  currentItems,
  username,
  mainProfile,
  userProfiles,
  getMoreItems,
}: FavoriteSummaryPaneProps) => {
  const [activeCrate, setActiveCrate] = useState<number>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  const router = useRouter();

  useEffect(() => {
    const { selectedCrate } = router.query;
    if (selectedCrate) {
      setActiveCrate(Number(selectedCrate));
      setShowCrateDetail(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.selectedCrate]);

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

  const handleFavoriteToggle = async (checkStatus, crate, mainProfile) => {
    const mutationFunction = checkStatus ? removeCrateFromFavorites : addCrateToFavorites;
    await mutationFunction({
      variables: {
        input: {
          crateId: crate.id,
          profileId: mainProfile,
        },
      },
    });

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

  console.log(userProfiles);

  return (
    <>
      <CrateDetail
        userProfiles={userProfiles}
        activeCrateId={activeCrate}
        show={showCrateDetail}
        onClose={() => {
          setShowCrateDetail(false);
        }}
        currentProfile={username}
      />
      <Pane crateSummaryPane={true}>
        {currentItems.map((crate, index) => (
          <motion.div
            key={index}
            className={cx('crateSummary')}
            onViewportEnter={() => {
              if (index === currentItems.length - 1) {
                console.log('you hit the last item!');
                getMoreItems();
              }
            }}
            onClick={() => {
              setActiveCrate(crate.id);
              setShowCrateDetail(true);
            }}
          >
            <p>{crate.title}</p>
            <p>{`Image: ${crate.creator.image}`}</p>
            <p>{`Favorited By: ${crate.favoritedBy.length} people`}</p>
            <ul>
              {crate.labels.map(label => (
                <li key={label.id}>{label.isStandard ? 'Blue' : 'Yellow'}</li>
              ))}
            </ul>
            {crate.creator.id !== mainProfile && !userProfiles.some(profile => profile.id === crate.creator.id) && (
              <BinaryIconButton
                icon={<Heart />}
                checkStatus={Boolean(currentItems[index].favoritedBy.filter(p => p.id === mainProfile).length > 0)}
                handler={checkStatus => {
                  handleFavoriteToggle(checkStatus, crate, mainProfile);
                }}
              />
            )}
          </motion.div>
        ))}
      </Pane>
    </>
  );
};

export { FavoriteSummaryPane };
