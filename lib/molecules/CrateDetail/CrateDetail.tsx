import cx from 'classnames';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { DotsThreeVertical, Heart } from '@phosphor-icons/react';
import { useLocalState } from '@/lib/context/state';
import { GET_CRATE_DETAIL_WITH_ALBUMS, CREATE_NOTIFICATION } from '@/db/graphql/clientOperations';
import BinaryIconButton from '@/lib/atoms/BinaryIconButton/BinaryIconButton';
import { Modal } from '@/lib/atoms/Modal/Modal';
import { CrateAlbum } from '../CrateAlbum/CrateAlbum';
import { CrateForm } from '../CrateForm/CrateForm';
import { useAddCrateToFavorites, useRemoveCrateFromFavorites, handleFavoriteToggle } from './CrateDetail.helpers';
import { CrateDetailFaceProps, CrateDetailProps } from '@/types/molecules/CrateDetail.types';

const CrateDetail = ({ userProfiles, activeCrateId, show, onClose }: CrateDetailProps) => {
  const [detailFace, setDetailFace] = useState<'front' | 'back'>('front');
  const [showEditCrate, setShowEditCrate] = useState<boolean>(false);
  const { loading, error, data } = useQuery(GET_CRATE_DETAIL_WITH_ALBUMS, {
    variables: { id: activeCrateId },
  });
  const { profileIdMain } = useLocalState();

  const handleSwitch = (newFace: 'front' | 'back') => {
    setDetailFace(newFace);
  };

  const crateData = data?.getCrateDetailWithAlbums;

  return (
    <>
      {activeCrateId && error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : crateData ? (
        detailFace === 'front' ? (
          <Modal
            content={
              <CrateDetailFront
                data={crateData}
                profileId={profileIdMain}
                userProfiles={userProfiles}
                handleSwitch={handleSwitch}
              />
            }
            title={`${crateData.title} - Front`}
            show={show}
            onClose={onClose}
          />
        ) : (
          <Modal
            content={
              showEditCrate ? (
                <CrateForm
                  creatorId={profileIdMain}
                  crateFormData={crateData}
                  onCloseModal={() => setShowEditCrate(false)}
                />
              ) : (
                <CrateDetailBack
                  data={crateData}
                  handleSwitch={handleSwitch}
                  handleEdit={() => setShowEditCrate(true)}
                  editable={profileIdMain === crateData.creator.id}
                />
              )
            }
            title={showEditCrate ? 'Edit Crate' : `${crateData.title} - Back`}
            show={show}
            onClose={() => {
              setShowEditCrate(false);
              onClose();
              setDetailFace('front');
            }}
          />
        )
      ) : null}
    </>
  );
};

const CrateDetailFront = ({ data, profileId, userProfiles, handleSwitch }: CrateDetailFaceProps) => {
  const rankedAlbums = [...data.albums].sort((a, b) => a.rank - b.rank);
  const [createNotification] = useMutation(CREATE_NOTIFICATION);
  const addCrateToFavorites = useAddCrateToFavorites(profileId);
  const removeCrateFromFavorites = useRemoveCrateFromFavorites(profileId);

  const favoriteIconHandler = async () => {
    const checkStatus = Boolean(data.favoritedBy.filter(p => p.id === profileId).length > 0);
    await handleFavoriteToggle(
      checkStatus,
      data,
      profileId,
      createNotification,
      addCrateToFavorites,
      removeCrateFromFavorites,
    );
  };

  return (
    <>
      <div className={cx('crateDetailInfo')}>
        <h4>{data.title}</h4>
        <p>{`Labels: ${data.labels.filter(label => label.isStandard === true).length} standard, ${
          data.labels.filter(label => label.isStandard === false).length
        } non-standard`}</p>
        <p>{`Image: ${data.creator.image}`}</p>
        <p>{`Favorites: ${data.favoritedBy.length}`}</p>
      </div>
      <div className={cx('crateDetailButtons')}>
        <button onClick={() => handleSwitch('back')}>Switch to Back</button>
        {data.creator.id !== profileId && !userProfiles.some(profile => profile.id === data.creator.id) && (
          <BinaryIconButton
            icon={<Heart />}
            checkStatus={Boolean(data.favoritedBy.filter(p => p.id === profileId).length > 0)}
            handler={favoriteIconHandler}
          />
        )}
      </div>
      <div className={cx('crateAlbumGrid')}>
        {rankedAlbums.map(crateAlbum => (
          <CrateAlbum key={crateAlbum.id} data={crateAlbum} />
        ))}
      </div>
    </>
  );
};

const CrateDetailBack = ({ data, handleSwitch, handleEdit, editable }: CrateDetailFaceProps) => {
  return (
    <>
      <div className={cx('crateDetailInfo')}>
        <h4>{data.title}</h4>
        <p>{`Image: ${data.creator.image}`}</p>
        <p>{`Creator: ${data.creator.username}`}</p>
        <p>{data.description}</p>
        <p>{`Favorites: ${data.favoritedBy.length}`}</p>
        <ul>
          {data.labels.map(label => (
            <li key={label.id}>{`${label.isStandard ? 'Standard' : 'Non-Standard'}: ${label.name}`}</li>
          ))}
        </ul>
      </div>
      <div className={cx('crateDetailBackButtons')}>
        <button onClick={() => handleSwitch('front')}>Switch to Front</button>
        {editable && (
          <button className={cx('editButton')} onClick={handleEdit}>
            {`Edit Crate`}
            <DotsThreeVertical />
          </button>
        )}
      </div>
    </>
  );
};

export { CrateDetail };
