import { gql } from '@apollo/client';

export const GET_USERNAME_BY_ID = gql`
  query GetUsernameById($userId: Int!) {
    getUsernameById(userId: $userId) {
      id
      username
    }
  }
`;

export const GET_PROFILE = gql`
  query GetProfile($id: Int, $username: String) {
    getProfile(id: $id, username: $username) {
      id
      username
      isPrivate
      bio
      image
      socialLinks {
        id
        username
        platform
      }
      followers {
        id
      }
      following {
        id
      }
      crates {
        id
      }
      favorites {
        id
      }
    }
  }
`;

// Summary view of Crate/Favorites from Profile Page
export const GET_PROFILE_CRATES_AND_FAVORITES = gql`
  query GetCratesAndFavorites($id: Int, $username: String) {
    getProfile(id: $id, username: $username) {
      id
      image
      crates {
        id
        title
        creator {
          id
          username
        }
        labels {
          id
          isStandard
        }
        favoritedBy {
          id
        }
      }
      favorites {
        id
        title
        labels {
          id
          isStandard
        }
        creator {
          id
          image
          username
        }
        favoritedBy {
          id
        }
      }
    }
  }
`;

export const GET_PROFILE_CRATES = gql`
  query GetProfileCrates($username: String!, $currentPage: Int!) {
    getProfileCrates(username: $username, currentPage: $currentPage) {
      id
      title
      creator {
        id
        username
        image
      }
      labels {
        id
        isStandard
        name
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const GET_PROFILE_FAVORITES = gql`
  query GetProfileFavorites($username: String!, $currentPage: Int!) {
    getProfileFavorites(username: $username, currentPage: $currentPage) {
      id
      title
      labels {
        id
        isStandard
        name
      }
      creator {
        id
        image
        username
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const GET_PROFILE_FOLLOWERS = gql`
  query GetProfileFollowers($username: String!, $currentPage: Int!) {
    getProfileFollowers(username: $username, currentPage: $currentPage) {
      id
      follower {
        id
        image
        username
      }
    }
  }
`;

export const GET_PROFILE_FOLLOWING = gql`
  query GetProfileFollowing($username: String!, $currentPage: Int!) {
    getProfileFollowing(username: $username, currentPage: $currentPage) {
      id
      following {
        id
        image
        username
      }
    }
  }
`;

export const GET_PROFILE_IMAGE = gql`
  query GetProfile($id: Int, $username: String) {
    getProfile(id: $id, username: $username) {
      id
      image
    }
  }
`;

export const CREATE_NEW_PROFILE = gql`
  mutation CreateNewProfile($input: ProfileInput!) {
    createNewProfile(input: $input) {
      id
      username
      isPrivate
      bio
      image
      socialLinks {
        id
        username
        platform
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      isPrivate
      bio
      image
      socialLinks {
        id
        username
        platform
      }
      followers {
        id
      }
      following {
        id
      }
      crates {
        id
      }
      favorites {
        id
      }
    }
  }
`;

export const AUTO_ACCEPT_FOLLOW_REQUESTS = gql`
  mutation AutoAcceptFollowRequests($receiverId: Int!) {
    autoAcceptFollowRequests(receiverId: $receiverId) {
      followRequest {
        id
        sender {
          id
        }
        senderId
        receiver {
          id
          username
          image
        }
        receiverId
        sentAt
      }
      follow {
        id
        follower {
          id
          username
          image
        }
        following {
          id
        }
      }
    }
  }
`;

export const ACCEPT_USER_AGREEMENT = gql`
  mutation AcceptUserAgreement($userId: Int!) {
    acceptUserAgreement(userId: $userId) {
      id
      acceptedUserAgreement
    }
  }
`;

export const DELETE_PROFILE = gql`
  mutation DeletedProfile($profileId: Int!) {
    deleteProfile(profileId: $profileId) {
      id
      followers {
        id
      }
      following {
        id
      }
      crates {
        id
        labels {
          id
        }
        albums {
          id
          tags {
            id
          }
        }
      }
      favorites {
        id
      }
    }
  }
`;

export const UPDATE_PROFILE_PIC_URL = gql`
  mutation UpdateProfilePicUrl($profileId: Int!, $url: String) {
    updateProfilePicUrl(profileId: $profileId, url: $url) {
      id
      image
    }
  }
`;
