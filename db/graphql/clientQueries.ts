import { gql } from '@apollo/client';

export const GET_PROFILE_BY_ID = gql`
  query GetProfileById($userId: Int!) {
    getProfileById(userId: $userId) {
      id
      username
    }
  }
`;

// testing endpoint
export const HELLO_WORLD = gql`
  query HelloWorld {
    helloWorld
  }
`;
