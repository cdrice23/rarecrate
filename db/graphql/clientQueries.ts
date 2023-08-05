import { gql } from '@apollo/client';

export const GET_USERNAME_BY_ID = gql`
  query GetUsernameById($userId: Int!) {
    getUsernameById(userId: $userId) {
      id
      username
    }
  }
`;

export const GET_PROFILE_BY_USERNAME = gql`
  query GetProfileByUsername($username: String!) {
    getProfileByUsername(username: $username) {
      id
      username
      isPrivate
      bio
      image
    }
  }
`;
