import { useMemo } from 'react';
import useSignedUrls from '@/core/hooks/useSignedUrl';
import Image from 'next/image';

interface ProfilePicProps {
  username: string;
  size: number;
}

const ProfilePic = ({ username, size }: ProfilePicProps) => {
  const keys = useMemo(() => [username], [username]);
  const currentProfilePic = useSignedUrls(keys)[0];

  return currentProfilePic ? (
    <Image src={currentProfilePic} alt={`profile image for ${username}`} height={size} width={size} />
  ) : null;
};

export { ProfilePic };
