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

// Summary view of Followers/Following from Profile Page
export const GET_PROFILE_FOLLOWERINGS = gql`
  query GetProfileFollowerings($id: Int, $username: String) {
    getProfile(id: $id, username: $username) {
      id
      followers {
        id
        image
        username
      }
      following {
        id
        image
        username
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

export const GET_CRATE_DETAIL_WITH_ALBUMS = gql`
  query GetCrateDetailWithAlbums($id: Int!) {
    getCrateDetailWithAlbums(id: $id) {
      id
      title
      description
      creator {
        id
        username
        image
      }
      favoritedBy {
        id
        username
        image
      }
      labels {
        id
        name
        isStandard
      }
      isRanked
      albums {
        id
        album {
          title
          artist
          label
          releaseYear
          genres {
            id
            name
          }
          subgenres {
            id
            name
          }
          imageUrl
          tracklist {
            id
            title
            order
          }
        }
        rank
        tags {
          id
          name
        }
      }
    }
  }
`;

// Getting Follow Requests on Timeline
export const GET_PENDING_FOLLOW_REQUESTS = gql`
  query GetPendingFollowRequests($id: Int!) {
    getPendingFollowRequests(id: $id) {
      id
      sender {
        id
        image
        username
      }
      receiver {
        id
        image
        username
      }
    }
  }
`;

// Mutations for Following/Sending Follow Request/etc.
export const CREATE_NEW_FOLLOW_OR_REQUEST = gql`
  mutation CreateNewFollowOrRequest($input: FollowOrRequestInput!) {
    createNewFollowOrRequest(input: $input) {
      follow {
        id
        follower {
          id
        }
        following {
          id
        }
      }
      followRequest {
        id
        sender {
          id
        }
        receiver {
          id
        }
      }
    }
  }
`;

export const UNFOLLOW_PROFILE = gql`
  mutation UnfollowProfile($input: FollowOrRequestInput!) {
    unfollowProfile(input: $input) {
      id
      followerId
      follower {
        id
      }
      followingId
      following {
        id
      }
    }
  }
`;

export const REJECT_FOLLOW_REQUEST = gql`
  mutation RejectFollowRequest($input: FollowOrRequestInput!) {
    rejectFollowRequest(input: $input) {
      id
      sender {
        id
      }
      senderId
      receiver {
        id
      }
      receiverId
      sentAt
    }
  }
`;

export const ACCEPT_FOLLOW_REQUEST = gql`
  mutation AcceptFollowRequest($input: FollowOrRequestInput!) {
    acceptFollowRequest(input: $input) {
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

//Mutations for Favoriting/Unfavoriting a Crate
export const ADD_CRATE_TO_FAVORITES = gql`
  mutation AddCrateToFavorites($input: CrateProfileInput!) {
    addCrateToFavorites(input: $input) {
      id
      title
      labels {
        id
        isStandard
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const REMOVE_CRATE_FROM_FAVORITES = gql`
  mutation RemoveCrateFromFavorites($input: CrateProfileInput!) {
    removeCrateFromFavorites(input: $input) {
      id
      title
      labels {
        id
        isStandard
      }
      favoritedBy {
        id
      }
    }
  }
`;

// Add Crate Operations
export const SEARCH_LABELS = gql`
  query SearchLabels($searchTerm: String!) {
    searchLabels(searchTerm: $searchTerm) {
      id
      name
      isStandard
    }
  }
`;