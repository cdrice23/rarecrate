import { toast } from 'react-toastify';

export const onSubmit = async (values, actions, userId, updateNotificationSettings) => {
  actions.setSubmitting(true);
  await new Promise(resolve => setTimeout(resolve, 3000));
  const {
    showOwnNewFollowers,
    showOwnNewFavorites,
    showFollowingNewFollows,
    showFollowingNewCrates,
    showFollowingNewFavorites,
  } = values;

  updateNotificationSettings({
    variables: {
      input: {
        userId,
        showOwnNewFollowers,
        showOwnNewFavorites,
        showFollowingNewFollows,
        showFollowingNewCrates,
        showFollowingNewFavorites,
      },
    },
    onCompleted: () => {
      toast.success('Notification Settings updated!');
      actions.resetForm({ values });
      actions.setSubmitting(false);
    },
  });
};
