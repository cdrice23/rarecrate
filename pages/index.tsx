import { PublicLayout } from '@/lib/layouts/Public';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useUser } from '@auth0/nextjs-auth0/client';

const Landing = (props: any) => {
  const { user, isLoading } = useUser();
  return (
    <PublicLayout>
      <h1>This is the Landing Page</h1>
      <LinkButton href="/api/auth/login">Login to Rare Crate</LinkButton>
      {user && <p>{`Hi, ${user.name}!`}</p>}
    </PublicLayout>
  );
};

export default Landing;
