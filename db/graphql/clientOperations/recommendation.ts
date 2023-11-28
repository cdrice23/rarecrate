import { gql } from '@apollo/client';

export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations($profileId: Int!, $usedPages: [Int], $currentRecsInArray: Int) {
    getRecommendations(profileId: $profileId, usedPages: $usedPages, currentRecsInArray: $currentRecsInArray) {
      recommendations {
        id
        recommendationType
        seen
        profileId
        crate {
          id
          title
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
      usedPages
      resetRecommendations
    }
  }
`;

export const MARK_RECOMMENDATION_SEEN = gql`
  mutation MarkRecommendationSeen($recommendationId: Int!) {
    markRecommendationSeen(recommendationId: $recommendationId) {
      id
      profileId
      crateId
      seen
    }
  }
`;
