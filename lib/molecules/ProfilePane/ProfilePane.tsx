import { useQuery } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_PROFILE } from '@/db/graphql/clientOperations';
import { DotsThreeVertical } from '@phosphor-icons/react';

type ProfilePaneProps = {
  username: string;
  mainProfile: number;
  handlePaneSelect: (pane: 'followers' | 'following' | 'crates' | 'favorites') => void;
};

const ProfilePane = ({ username, handlePaneSelect, mainProfile }: ProfilePaneProps) => {
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { username },
  });

  const profileData = data?.getProfile;
  console.log(profileData);
  const isMain = Boolean(mainProfile === profileData?.id);
  const isFollowing = profileData?.followers.filter(follower => follower.id === mainProfile).length > 0;

  return (
    <>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : data ? (
        <>
          <Pane>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Profile Data:`}</h3>
              <p>{`Profile ID: ${profileData.id}`}</p>
              <p>{`image: ${profileData.image}`}</p>
              <p>{`Username: ${profileData.username}`}</p>
              <p>{`Profile Type: ${profileData.isPrivate ? 'Private' : 'Public'}`}</p>
              <p>{`Bio: ${profileData.bio}`}</p>
              <ul>
                {profileData.socialLinks.map((link: any) => (
                  <li key={link.id}>{`${link.platform}: ${link.username}`}</li>
                ))}
              </ul>
              {!isMain && <button>{isFollowing ? 'Following' : 'Follow'}</button>}
              {isMain && (
                <button>
                  <p>Edit Profile</p>
                  <DotsThreeVertical />
                </button>
              )}
            </div>
          </Pane>
          <div className={cx('listActions')}>
            <button onClick={() => handlePaneSelect('followers')}>
              <h3>Followers</h3>
              <h4>{profileData.followers.length}</h4>
            </button>
            <button onClick={() => handlePaneSelect('following')}>
              <h3>Following</h3>
              <h4>{profileData.following.length}</h4>
            </button>
            <button onClick={() => handlePaneSelect('crates')}>
              <h3>Crates</h3>
              <h4>{profileData.crates.length}</h4>
            </button>
            <button onClick={() => handlePaneSelect('favorites')}>
              <h3>Favorites</h3>
              <h4>{profileData.favorites.length}</h4>
            </button>
          </div>
        </>
      ) : null}
    </>
  );
};

export { ProfilePane };
