import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS_BY_PROFILE = gql`
  query GetNotificationsByProfile($profileId: Int!, $userId: Int!, $currentPage: Int!) {
    getNotificationsByProfile(profileId: $profileId, userId: $userId, currentPage: $currentPage) {
      id
      type
      actionOwner {
        id
        username
        image
      }
      connectedCrate {
        id
        title
        description
        creator {
          id
          username
          image
        }
        labels {
          id
          name
          isStandard
        }
      }
      connectedFollow {
        id
        follower {
          id
          username
          image
        }
        following {
          id
          image
          username
          bio
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
      createdAt
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($receiver: Int!, $type: String!, $actionOwner: Int!, $notificationRef: Int!) {
    createNotification(receiver: $receiver, type: $type, actionOwner: $actionOwner, notificationRef: $notificationRef) {
      id
      receiver
      type
      actionOwner {
        id
      }
      connectedCrate {
        id
      }
      connectedFollow {
        id
      }
    }
  }
`;
