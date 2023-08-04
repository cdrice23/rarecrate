import { gql } from '@apollo/client';

export const GET_USERNAME_BY_ID = gql`
  query GetUsernameById($userId: Int!) {
    getUsernameById(userId: $userId) {
      id
      username
    }
  }
`;
