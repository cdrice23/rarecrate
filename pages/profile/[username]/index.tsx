import { AuthedLayout } from '@/lib/layouts/Authed';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';

import authed from '../../../core/helpers/authed';

const ProfilePage = (props: any) => {
  return (
    <AuthedLayout>
      <p>{`This is ${props.username}'s Profile page`}</p>
      <LinkButton href="/api/auth/logout">Logout of Rare Crate</LinkButton>
    </AuthedLayout>
  );
};

export default ProfilePage;

export const getServerSideProps = authed(async context => {
  const { username } = context.query;
  return {
    props: {
      username,
    },
  };
});
