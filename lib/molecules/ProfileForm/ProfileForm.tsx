import { Formik, Field, Form, ErrorMessage } from 'formik';
import cx from 'classnames';
import { SocialLinksArrayInput } from '../SocialLinksArrayInput/SocialLinksArrayInput';
import { profileFormSchema } from '@/core/helpers/validation';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE, AUTO_ACCEPT_FOLLOW_REQUESTS } from '@/db/graphql/clientOperations';
import * as yup from 'yup';
import { useLocalState } from '@/lib/context/state';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';
import { gql } from '@apollo/client';

const initialProfileValues = {
  image: '',
  username: '',
  isPrivate: false,
  bio: '',
  socialLinks: {},
};

const ProfileForm = ({ existingProfileData, setShowEditProfile }) => {
  const { setUsernameMain } = useLocalState();
  const [getProfile] = useLazyQuery(GET_PROFILE);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [autoAcceptFollowRequests] = useMutation(AUTO_ACCEPT_FOLLOW_REQUESTS);

  const router = useRouter();

  const updatedSchema = yup.object().shape({
    ...profileFormSchema.fields,
    username: yup
      .string()
      .max(30, 'Username must not exceed 30 characters')
      .matches(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores.')
      .test('unique', 'Username must be unique. Please choose a different username.', async function (inputValue) {
        const isUnique = await (async (inputValue, getProfile) => {
          const { data } = await getProfile({ variables: { username: inputValue } });
          return (
            !data?.getProfile || data.getProfile.username !== inputValue || inputValue === existingProfileData.username
          );
        })(inputValue, getProfile);
        return isUnique;
      }),
  });

  const onSubmit = async (values, actions) => {
    actions.setSubmitting(true);
    try {
      await updateProfile({
        variables: {
          input: {
            id: values.id,
            username: values.username,
            isPrivate: values.isPrivate,
            bio: values.bio,
            image: values.image,
            socialLinks: values.socialLinks.map(link => ({ username: link.username, platform: link.platform })),
          },
        },
        update: (cache, { data }) => {
          const cacheData = cache.extract();
          const cachedSocialLinks = [];

          // Iterate over the cache data and push all SocialLink objects into cachedSocialLinks array
          for (const key in cacheData) {
            if (cacheData[key].__typename === 'SocialLink') {
              cachedSocialLinks.push(cacheData[key]);
            }
          }

          // Check if each id of cachedSocialLinks exists in data.updateProfile.socialLinks
          cachedSocialLinks.forEach(link => {
            const exists = data.updateProfile.socialLinks.some(updatedLink => updatedLink.id === link.id);

            // If the id doesn't exist, evict the item from the cache
            if (!exists) {
              cache.evict({ id: cache.identify(link) });
            }

            cache.gc();
          });
        },
      });

      // If profile changed to public, auto-accept all pending follow requests
      if (!values.isPrivate) {
        await autoAcceptFollowRequests({
          variables: { receiverId: values.id },
          update: (cache, { data }) => {
            const cacheData = cache.extract();
            const cachedFollowRequests = [];

            // Iterate over the cache data and push all FollowRequest objects into cachedFollowRequests array
            for (const key in cacheData) {
              if (cacheData[key].__typename === 'FollowRequest') {
                cachedFollowRequests.push(cacheData[key]);
              }
            }

            const flattenedFollowRequests = data.autoAcceptFollowRequests.map(obj => obj.followRequest).flat(1);

            // Check if each id of cachedFollowRequests exists in data.autoAcceptFollowRequests.followRequests
            cachedFollowRequests.forEach(fr => {
              const exists = flattenedFollowRequests.some(updatedRequest => updatedRequest.id === fr.id);

              // If the id doesn't exist, evict the item from the cache
              if (exists) {
                cache.evict({ id: cache.identify(fr) });
              }
            });

            cache.gc();

            // Update the cache for the new Follower/Following relationships
            const flattenedFollows = data.autoAcceptFollowRequests.map(obj => obj.follow).flat(1);
            flattenedFollows.forEach(follow => {
              const newFollowerRef = cache.writeFragment({
                data: follow.follower,
                fragment: gql`
                  fragment NewFollower on Profile {
                    id
                  }
                `,
              });

              const newFollowingRef = cache.writeFragment({
                data: follow.following,
                fragment: gql`
                  fragment NewFollowing on Profile {
                    id
                  }
                `,
              });

              cache.modify({
                id: cache.identify({
                  __typename: 'Profile',
                  id: follow.follower.id,
                }),
                fields: {
                  following(existingFollowing = []) {
                    return [...existingFollowing, newFollowingRef];
                  },
                },
              });

              cache.modify({
                id: cache.identify({
                  __typename: 'Profile',
                  id: follow.following.id,
                }),
                fields: {
                  followers(existingFollowers = []) {
                    return [...existingFollowers, newFollowerRef];
                  },
                },
              });
            });
          },
        });
      }

      // await updateProfile({ variables: { input: values } });
      setUsernameMain(values.username);
      actions.setSubmitting(false);
      actions.resetForm({ values });
      setShowEditProfile(false);
      console.log(values);
      router.push(Route.Profile + `/${values.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={existingProfileData ? existingProfileData : initialProfileValues}
      validationSchema={updatedSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => {
        return (
          <Form className={cx('pane')}>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Edit Profile:`}</h3>
              {/* <div className={cx('formInputItem')}>
              <label htmlFor="image">Image URL</label>
              <Field name="image" type="text" />
            </div> */}
              <div className={cx('formInputItem')}>
                <label htmlFor="username">Username</label>
                <Field name="username" type="text" />
                <ErrorMessage name="username" component="div" />
              </div>
              <div className={cx('formInputItem')}>
                <label htmlFor="isPrivate">Private account?</label>
                <Field name="isPrivate" type="checkbox" />
                {!values.isPrivate && (
                  <p>
                    <em>{`Note: any pending follow requests will be accepted when you switch your profile to public.`}</em>
                  </p>
                )}
              </div>
              <div className={cx('formInputItem')}>
                <label htmlFor="bio">Bio</label>
                <Field name="bio" as="textarea" className={cx('formInputLongText')} />
                <ErrorMessage name="bio" component="div" />
              </div>
              <SocialLinksArrayInput socialLinks={values.socialLinks} setFieldValue={setFieldValue} />
              <ErrorMessage name="socialLinks" component="div" />
              <button
                type="submit"
                disabled={isSubmitting || !values.socialLinks.every(link => link.platform && link.username)}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowEditProfile(false);
                }}
              >
                Cancel
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export { ProfileForm };
