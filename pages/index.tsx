import { useEffect } from 'react';
import { useLocalState } from '@/lib/context/state';
import { PublicLayout } from '@/lib/layouts/Public';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';

const Landing = (props: any) => {
  return (
    <PublicLayout>
      <h1>This is the Landing Page</h1>
      <LinkButton href="/api/auth/login">Login to Rare Crate</LinkButton>
    </PublicLayout>
  );
};

export default Landing;
