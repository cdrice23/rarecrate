import { AuthedLayout } from '@/lib/layouts/Authed';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';

import authed from '../../core/helpers/authed';

const SearchPage = (props: any) => {
  return (
    <AuthedLayout>
      <p>This is the search page</p>
      <LinkButton href="/api/auth/logout">Logout of Rare Crate</LinkButton>
    </AuthedLayout>
  );
};

export default SearchPage;

export const getServerSideProps = authed();
