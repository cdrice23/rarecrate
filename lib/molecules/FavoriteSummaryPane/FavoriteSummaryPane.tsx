import cx from 'classnames';
import { useState, useEffect, Dispatch } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Heart, User as UserIcon } from '@phosphor-icons/react';
import BinaryIconButton from '@/lib/atoms/BinaryIconButton/BinaryIconButton';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { Pill } from '@/lib/atoms/Pill/Pill';
import { FavoriteSummaryPaneProps } from '@/lib/molecules/FavoriteSummaryPane/FavoriteSummaryPane.types';
import { CREATE_NOTIFICATION } from '@/db/graphql/clientOperations/notification';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import {
  useAddCrateToFavorites,
  useRemoveCrateFromFavorites,
  handleFavoriteToggle,
} from './FavoriteSummaryPane.helpers';

const FavoriteSummaryPane = ({
  currentItems,
  username,
  mainProfile,
  userProfiles,
  getMoreItems,
  dispatch,
}: FavoriteSummaryPaneProps) => {
  const [activeCrate, setActiveCrate] = useState<number>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  const addCrateToFavorites = useAddCrateToFavorites(mainProfile);
  const removeCrateFromFavorites = useRemoveCrateFromFavorites(mainProfile);

  const router = useRouter();

  useEffect(() => {
    const { selectedCrate } = router.query;
    if (selectedCrate) {
      setActiveCrate(Number(selectedCrate));
      setShowCrateDetail(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.selectedCrate]);

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
        {currentItems.length > 0 &&
          currentItems.map((crate, index) => (
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
                  {crate.creator.id !== mainProfile &&
                  !userProfiles.some(profile => profile.id === crate.creator.id) ? (
                    <BinaryIconButton
                      icon={<Heart />}
                      checkStatus={Boolean(
                        currentItems[index].favoritedBy.filter(p => p.id === mainProfile).length > 0,
                      )}
                      handler={checkStatus => {
                        handleFavoriteToggle(
                          checkStatus,
                          crate,
                          mainProfile,
                          createNotification,
                          addCrateToFavorites,
                          removeCrateFromFavorites,
                          dispatch,
                        );
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
