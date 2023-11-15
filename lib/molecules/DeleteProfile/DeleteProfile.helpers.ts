import { gql, useMutation } from '@apollo/client';
import { useLocalState } from '@/lib/context/state';
import { DELETE_PROFILE } from '@/db/graphql/clientOperations';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';

export const useDeleteSelectedProfile = (profileToDelete: number) => {
  return useMutation(DELETE_PROFILE, {
    variables: { profileId: profileToDelete },
    update(cache) {
      const deletedProfileData = cache.readFragment({
        id: `Profile:${profileToDelete}`,
        fragment: gql`
          fragment DeletedProfile on Profile {
            id
            crates {
              id
            }
          }
        `,
      }) as { id: string; crates: { id: string }[] };

      // Evict the Profile object from the cache
      cache.evict({ id: `Profile:${profileToDelete}` });

      // Evict the Crates objects from the cache
      deletedProfileData.crates.forEach(crate => {
        cache.evict({ id: `Crate:${crate.id}` });
      });

      // Run garbage collection to clean up any unreachable objects
      cache.gc();
    },
  });
};

export const handleDelete = async (
  profileToDelete: number,
  usernameToDelete: string,
  profileIdMain: number,
  usernameMain: string,
  setProfileIdMain: (value: number | null) => void,
  setUsernameMain: (value: string) => void,
  onClose: () => void,
  setIsDeleting: (value: boolean) => void,
  userProfiles: Array<{ id: number; username: string } | { isAddProfile: boolean }>,
  handleUpdateProfileList: (deletedProfile: number) => void,
  deleteSelectedProfile: () => void,
  router: ReturnType<typeof useRouter>,
) => {
  if (profileToDelete === profileIdMain) {
    console.log(`You are deleting the mainProfile, ${usernameToDelete}`);

    if (userProfiles.length > 2) {
      // Delete profile and switch to next account in userProfiles list
      setIsDeleting(true);
      onClose();
      if ('username' in userProfiles[1]) {
        setUsernameMain(userProfiles[1].username);
        setProfileIdMain(userProfiles[1].id);
        router.push(Route.Profile + `/${userProfiles[1].username}`);
      }
      try {
        await deleteSelectedProfile();
      } catch (error) {
        console.error('Error deleting profile:', error);
      } finally {
        handleUpdateProfileList(profileToDelete);
        setIsDeleting(false);
      }
    } else {
      // Delete profile and push to createNewProfile page
      setIsDeleting(true);
      onClose();
      setUsernameMain('');
      setProfileIdMain(null);
      router.push(Route.NewProfile);

      try {
        await deleteSelectedProfile();
      } catch (error) {
        console.error('Error deleting profile:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  } else {
    // Delete profile, don't push to new page
    console.log(`You are deleting a profile (${usernameToDelete}) that isn't the main one (${profileIdMain})`);
    setIsDeleting(true);
    onClose();
    router.push(Route.Profile + `/${usernameMain}`);
    try {
      await deleteSelectedProfile();
    } catch (error) {
      console.error('Error deleting profile:', error);
    } finally {
      handleUpdateProfileList(profileToDelete);
      setIsDeleting(false);
    }
  }
};
