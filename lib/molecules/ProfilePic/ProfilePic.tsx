import Image from 'next/image';
import { User as UserIcon } from '@phosphor-icons/react';
import useSignedUrl from '@/core/hooks/useSignedUrl';

interface ProfilePicProps {
  username: string;
  size: number;
  imageVersion?: number;
}

const ProfilePic = ({ username, size, imageVersion }: ProfilePicProps) => {
  const currentProfilePic = useSignedUrl(username);

  return currentProfilePic ? (
    <Image src={currentProfilePic} alt={`profile image for ${username}`} height={size} width={size} />
  ) : (
    <UserIcon size={16} />
  );
};

export { ProfilePic };
