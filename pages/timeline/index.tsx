import { AuthedLayout } from '@/lib/layouts/Authed';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useUser } from '@auth0/nextjs-auth0/client';

import authed from '../../core/helpers/authed';

const DiscoverPage = (props: any) => {
  const { user, isLoading } = useUser();
  return (
    <AuthedLayout>
      {user && <h1>{`Hi, ${user.name} - this is the Crate Digging Page!`}</h1>}
      <p>This will be the first page upon login.</p>
      <LinkButton href="/api/auth/logout">Logout of Rare Crate</LinkButton>
    </AuthedLayout>
  );
};

export default DiscoverPage;

export const getServerSideProps = authed();
