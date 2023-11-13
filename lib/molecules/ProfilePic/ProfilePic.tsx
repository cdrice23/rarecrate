import { useEffect, useMemo, useState } from 'react';
import useSignedUrl from '@/core/hooks/useSignedUrl';
import Image from 'next/image';
import { User as UserIcon } from '@phosphor-icons/react';

interface ProfilePicProps {
  username: string;
  size: number;
  imageVersion?: number;
}

const ProfilePic = ({ username, size, imageVersion }: ProfilePicProps) => {
  // const key = useMemo(() => [username, imageVersion], [username, imageVersion]);
  // const currentProfilePic = useSignedUrl(key);
  const currentProfilePic = useSignedUrl(username);

  return currentProfilePic ? (
    <Image src={currentProfilePic} alt={`profile image for ${username}`} height={size} width={size} />
  ) : (
    <UserIcon size={16} />
  );
};

export { ProfilePic };
