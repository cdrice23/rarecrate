import { Modal } from '@/lib/atoms/Modal/Modal';
import { useQuery } from '@apollo/client';
import { GET_CRATE_DETAIL_WITH_ALBUMS } from '@/db/graphql/clientOperations';
import { useState } from 'react';
import cx from 'classnames';
import { CrateAlbumData, CrateAlbum } from '../CrateAlbum/CrateAlbum';

type ProfileBadgeData = {
  id: number;
  username: string;
  image: string;
};

type LabelData = {
  id: number;
  name: string;
  isStandard: boolean;
};

type CrateDetailData = {
  id: string;
  title: string;
  description: string;
  creator: ProfileBadgeData;
  favoritedBy: ProfileBadgeData[];
  isRanked: boolean;
  labels: LabelData[];
  albums: CrateAlbumData[];
};

type CrateDetailFaceProps = {
  data: CrateDetailData;
  handleSwitch: (newFace: 'front' | 'back') => void;
};

type CrateDetailProps = {
  activeCrateId?: number;
  show?: boolean;
  onClose: () => void;
};

const CrateDetail = ({ activeCrateId, show, onClose }: CrateDetailProps) => {
  const [detailFace, setDetailFace] = useState<'front' | 'back'>('front');
  const { loading, error, data } = useQuery(GET_CRATE_DETAIL_WITH_ALBUMS, {
    variables: { id: activeCrateId },
  });
  const handleSwitch = (newFace: 'front' | 'back') => {
    setDetailFace(newFace);
  };

  const crateData = data?.getCrateDetailWithAlbums;
  const defaultModal = <div>{`I'm a modal! The current active crate id is: ${activeCrateId}`}</div>;

  // console.log(crateData?.albums);

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
            content={<CrateDetailFront data={crateData} handleSwitch={handleSwitch} />}
            title="Modal Title"
            show={show}
            onClose={onClose}
          />
        ) : (
          <Modal
            content={<CrateDetailBack data={crateData} handleSwitch={handleSwitch} />}
            title="Modal Title"
            show={show}
            onClose={onClose}
          />
        )
      ) : null}
    </>
  );
};

const CrateDetailFront = ({ data, handleSwitch }: CrateDetailFaceProps) => {
  return (
    <>
      <div>
        <h4>{data.title}</h4>
        <p>{`Labels: ${data.labels.filter(label => label.isStandard === true).length} standard, ${
          data.labels.filter(label => label.isStandard === false).length
        } non-standard`}</p>
        <p>{`Image: ${data.creator.image}`}</p>
        <p>{`Favorites: ${data.favoritedBy.length}`}</p>
      </div>
      <button onClick={() => handleSwitch('back')}>Switch to Back</button>
      <div className={cx('crateAlbumGrid')}>
        {data.albums.map(crateAlbum => (
          <CrateAlbum key={crateAlbum.id} data={crateAlbum} />
        ))}
      </div>
    </>
  );
};

const CrateDetailBack = ({ data, handleSwitch }: CrateDetailFaceProps) => {
  return (
    <>
      <div>
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
      <button onClick={() => handleSwitch('front')}>Switch to Front</button>
    </>
  );
};

export { CrateDetail };
