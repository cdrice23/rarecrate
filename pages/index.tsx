import { PublicLayout } from '@/lib/layouts/Public';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useLocalState } from '@/lib/context/state';
import { useEffect } from 'react';

const Landing = (props: any) => {
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain } = useLocalState();

  useEffect(() => {
    setUserId(null);
    setEmail('');
    setProfileIdMain(null);
    setUsernameMain('');
  });

  return (
    <PublicLayout>
      <h1>This is the Landing Page</h1>
      <LinkButton href="/api/auth/login">Login to Rare Crate</LinkButton>
    </PublicLayout>
  );
};

export default Landing;
