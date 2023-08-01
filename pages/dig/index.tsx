import { AuthedLayout } from '@/lib/layouts/Authed';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useUser } from '@auth0/nextjs-auth0/client';

import authed from '../../core/helpers/authed';

const CrateDiggingPage = (props: any) => {
  const { user, isLoading } = useUser();
  return (
    <AuthedLayout>
      <p>This is the Crate Digging page</p>
      <LinkButton href="/api/auth/logout">Logout of Rare Crate</LinkButton>
    </AuthedLayout>
  );
};

export default CrateDiggingPage;

export const getServerSideProps = authed();
