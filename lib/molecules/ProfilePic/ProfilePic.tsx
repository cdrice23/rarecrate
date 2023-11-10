import { useEffect, useMemo, useState } from 'react';
import useSignedUrl from '@/core/hooks/useSignedUrl';
import Image from 'next/image';

interface ProfilePicProps {
  username: string;
  size: number;
  imageVersion?: number;
}

const ProfilePic = ({ username, size, imageVersion }: ProfilePicProps) => {
  // const key = useMemo(() => [username, imageVersion], [username, imageVersion]);
  // const currentProfilePic = useSignedUrl(key);
  const currentProfilePic = useSignedUrl(username);

  console.log(username);

  return currentProfilePic ? (
    <Image src={currentProfilePic} alt={`profile image for ${username}`} height={size} width={size} />
  ) : null;
};

export { ProfilePic };
