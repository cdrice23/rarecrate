import { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import cx from 'classnames';
import { SocialLinksArrayInput } from '../SocialLinksArrayInput/SocialLinksArrayInput';
import { profileFormSchema } from '@/core/helpers/validation';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  GET_PROFILE,
  UPDATE_PROFILE,
  AUTO_ACCEPT_FOLLOW_REQUESTS,
  CREATE_NEW_PROFILE,
  ACCEPT_USER_AGREEMENT,
} from '@/db/graphql/clientOperations';
import * as yup from 'yup';
import { useLocalState } from '@/lib/context/state';
import { useRouter } from 'next/router';
import { PublicRoute, Route } from '@/core/enums/routes';
import { gql } from '@apollo/client';
import { Modal } from '@/lib/atoms/Modal/Modal';
import { UserAgreement } from '../UserAgreement/UserAgreement';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import { User as UserIcon, Camera } from '@phosphor-icons/react';
import { EditProfilePic } from '../EditProfilePic/EditProfilePic';

interface ProfileFormProps {
  existingProfileData?: any;
  userId?: number;
  setShowEditProfile?: (value: boolean) => void;
  defaultPic?: string;
}

const ProfileForm = ({ existingProfileData, userId, defaultPic, setShowEditProfile }: ProfileFormProps) => {
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showEditPic, setShowEditPic] = useState<boolean>(false);
  const { setUsernameMain, setProfileIdMain } = useLocalState();
  const [getProfile] = useLazyQuery(GET_PROFILE);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [autoAcceptFollowRequests] = useMutation(AUTO_ACCEPT_FOLLOW_REQUESTS);
  const [createNewProfile] = useMutation(CREATE_NEW_PROFILE);
  const [acceptUserAgreement] = useMutation(ACCEPT_USER_AGREEMENT);

  const currentUser = userId;

  const router = useRouter();

  const initialProfileValues = {
    username: '',
    isPrivate: false,
    bio: '',
    socialLinks: [],
    acceptUserAgreement: false,
  };

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { id, username, isPrivate, bio, image, socialLinks } = values;

    // console.log(userId);

    if (id) {
      // Update existing Profile
      try {
        await updateProfile({
          variables: {
            input: {
              id,
              username,
              isPrivate,
              bio,
              socialLinks,
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
        if (!isPrivate) {
          await autoAcceptFollowRequests({
            variables: { receiverId: id },
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
        actions.resetForm({ values });
        setShowEditProfile(false);
        console.log(values);
      } catch (error) {
        console.error('Error updating profile:', error);
        actions.setSubmitting(false);
      }
    } else {
      // Create new Profile
      try {
        const newProfile = await createNewProfile({
          variables: {
            input: {
              userId: currentUser,
              username,
              isPrivate,
              bio,
              socialLinks,
            },
          },
        });

        await acceptUserAgreement({
          variables: { userId: currentUser },
        });

        setUsernameMain(newProfile?.data.username);
        setProfileIdMain(newProfile?.data.id);
      } catch (error) {
        console.error('Error creating profile:', error);
        actions.setSubmitting(false);
      }
    }

    const redirectToProfile = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Go to the new/updated Profile
      router.push(Route.Profile + `/${values.username}`);
      actions.setSubmitting(false);
    };

    // Call the new function
    redirectToProfile();
  };

  return (
    <Formik
      initialValues={existingProfileData ? existingProfileData : initialProfileValues}
      validationSchema={updatedSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, isSubmitting, initialValues }) => {
        console.log(values);
        return (
          <Form className={cx('pane')}>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Edit Profile:`}</h3>
              <div className={cx('formInputHead')}>
                <div className={cx('imageContainer')}>
                  <div className={cx('image')}>
                    {values.image && values.username ? (
                      <ProfilePic username={values.username} size={75} />
                    ) : (
                      <UserIcon size={32} />
                    )}
                  </div>
                  <button
                    className={cx('editPic')}
                    type="button"
                    onClick={() => {
                      setShowEditPic(true);
                    }}
                  >
                    <span>{`Edit `}</span>
                    <Camera />
                  </button>
                </div>

                <div className={cx('formInputHeadItems')}>
                  <div className={cx('formInputItem')}>
                    <label htmlFor="username">Username</label>
                    <Field name="username" type="text" />
                    <ErrorMessage name="username" component="div" />
                  </div>
                  <div className={cx('formInputItem')}>
                    <label htmlFor="isPrivate">Private account?</label>
                    <Field name="isPrivate" type="checkbox" />
                    {!values.isPrivate && initialValues.isPrivate && existingProfileData && (
                      <p>
                        <em>{`Note: any pending follow requests will be accepted when you switch your profile to public.`}</em>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Modal
                content={<EditProfilePic profileData={{ username: values.username, id: values.id }} />}
                title={`Edit Profile Pic`}
                show={showEditPic}
                onClose={() => {
                  setShowEditPic(false);
                }}
              />
              <div className={cx('formInputItem')}>
                <label htmlFor="bio">Bio</label>
                <Field name="bio" as="textarea" className={cx('formInputLongText')} />
                <ErrorMessage name="bio" component="div" />
              </div>
              <SocialLinksArrayInput socialLinks={values.socialLinks} setFieldValue={setFieldValue} />
              <ErrorMessage name="socialLinks" component="div" />
              {!existingProfileData && (
                <div className={cx('formInputItem')}>
                  <div>
                    <Field name="acceptUserAgreement" type="checkbox" />
                    <label htmlFor="acceptUserAgreement">{`I accept the terms of the user agreement.`}</label>
                  </div>
                  <ErrorMessage name="acceptUserAgreement" component="div" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowTerms(true);
                    }}
                  >{`Show Terms & Conditions`}</button>
                  <Modal
                    content={<UserAgreement />}
                    title={`Terms & Conditions`}
                    show={showTerms}
                    onClose={() => {
                      setShowTerms(false);
                    }}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !values.socialLinks.every(link => link.platform && link.username)}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  if (existingProfileData) {
                    setShowEditProfile(false);
                  } else {
                    router.push(PublicRoute.Logout);
                  }
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
