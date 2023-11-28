import { gql } from '@apollo/client';

export const GET_LAST_LOGIN_PROFILE = gql`
  query GetLastLoginProfile($userId: Int!) {
    getLastLoginProfile(userId: $userId) {
      id
      username
    }
  }
`;

export const GET_NOTIFICATION_SETTINGS_BY_USER = gql`
  query GetNotificationSettingsByUser($userId: Int!) {
    getNotificationSettingsByUser(userId: $userId) {
      id
      showOwnNewFollowers
      showOwnNewFavorites
      showFollowingNewFollows
      showFollowingNewCrates
      showFollowingNewFavorites
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($input: NotificationSettingsInput!) {
    updateNotificationSettings(input: $input) {
      id
      showOwnNewFollowers
      showOwnNewFavorites
      showFollowingNewFollows
      showFollowingNewCrates
      showFollowingNewFavorites
    }
  }
`;

export const UPDATE_LAST_LOGIN_PROFILE = gql`
  mutation UpdateLastLoginProfile($userId: Int!, $profileId: Int) {
    updateLastLoginProfile(userId: $userId, profileId: $profileId) {
      id
      lastLoginProfile
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: Int!) {
    deleteUser(userId: $userId) {
      id
    }
  }
`;
