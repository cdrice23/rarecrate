import { gql } from '@apollo/client';

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
