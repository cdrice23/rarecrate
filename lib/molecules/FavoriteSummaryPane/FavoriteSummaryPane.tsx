import cx from 'classnames';
import { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Heart, User as UserIcon } from '@phosphor-icons/react';
import BinaryIconButton from '@/lib/atoms/BinaryIconButton/BinaryIconButton';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { Pill } from '@/lib/atoms/Pill/Pill';
import {
  ADD_CRATE_TO_FAVORITES,
  REMOVE_CRATE_FROM_FAVORITES,
  CREATE_NOTIFICATION,
} from '@/db/graphql/clientOperations';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { ProfilePic } from '../ProfilePic/ProfilePic';

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
            <h2>{crate.title}</h2>
            <div className={'crateSummaryIcons'}>
              {crate.creator.image ? (
                <ProfilePic username={crate.creator.username} size={36} />
              ) : (
                <div className={cx('profilePicIcon')}>
                  <UserIcon size={16} />
                </div>
              )}
              <div className={cx('favoriteItems')}>
                {crate.creator.id !== mainProfile && !userProfiles.some(profile => profile.id === crate.creator.id) ? (
                  <BinaryIconButton
                    icon={<Heart />}
                    checkStatus={Boolean(currentItems[index].favoritedBy.filter(p => p.id === mainProfile).length > 0)}
                    handler={checkStatus => {
                      handleFavoriteToggle(checkStatus, crate, mainProfile);
                    }}
                  />
                ) : (
                  <Heart weight="fill" />
                )}
                <h3>{crate.favoritedBy.length}</h3>
              </div>
            </div>
            <div className={cx('crateLabels')}>
              {crate.labels.map((label, index) => (
                <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
              ))}
            </div>
          </motion.div>
        ))}
      </Pane>
    </>
  );
};

export { FavoriteSummaryPane };
