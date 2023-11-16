import * as yup from 'yup';
import { useMutation, useLazyQuery, gql } from '@apollo/client';
import {
  GET_PROFILE,
  UPDATE_PROFILE,
  AUTO_ACCEPT_FOLLOW_REQUESTS,
  CREATE_NEW_PROFILE,
  ACCEPT_USER_AGREEMENT,
} from '@/db/graphql/clientOperations';
import { profileFormSchema } from '@/core/helpers/validation';
import { Route } from '@/core/enums/routes';

export const initialProfileValues = {
  username: '',
  isPrivate: false,
  bio: '',
  socialLinks: [],
  acceptUserAgreement: false,
};

export const updatedSchema = (getProfile, existingProfileData) => {
  return yup.object().shape({
    ...profileFormSchema.fields,
    username: yup
      .string()
      .max(30, 'Username must not exceed 30 characters')
      .matches(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores.')
      .test('unique', 'Username must be unique. Please choose a different username.', async function (inputValue) {
        const { data } = await getProfile({ variables: { username: inputValue } });
        return (
          !data?.getProfile || data.getProfile.username !== inputValue || inputValue === existingProfileData.username
        );
      }),
  });
};

export const onSubmit = async (
  values,
  actions,
  updateProfile,
  autoAcceptFollowRequests,
  createNewProfile,
  acceptUserAgreement,
  setUsernameMain,
  setShowEditProfile,
  currentUser,
  router,
  setProfileIdMain,
) => {
  actions.setSubmitting(true);
  await new Promise(resolve => setTimeout(resolve, 1000));
  const { id, username, isPrivate, bio, socialLinks } = values;

  const socialLinksInput = socialLinks.map(link => ({
    username: link.username,
    platform: link.platform,
  }));

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
            socialLinks: socialLinksInput,
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
            socialLinks: socialLinksInput,
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

export const useMutations = () => {
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [autoAcceptFollowRequests] = useMutation(AUTO_ACCEPT_FOLLOW_REQUESTS);
  const [createNewProfile] = useMutation(CREATE_NEW_PROFILE);
  const [acceptUserAgreement] = useMutation(ACCEPT_USER_AGREEMENT);

  return {
    updateProfile,
    autoAcceptFollowRequests,
    createNewProfile,
    acceptUserAgreement,
  };
};
