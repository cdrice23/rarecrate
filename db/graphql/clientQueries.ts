import { gql } from '@apollo/client';

export const GET_USERNAME_BY_ID = gql`
  query GetUsernameById($userId: Int!) {
    getUsernameById(userId: $userId) {
      id
      username
    }
  }
`;

export const GET_MAIN_PROFILE = gql`
  query GetMainProfile($userId: Int!, $id: Int, $username: String) {
    getUsernameById(userId: $userId) {
      id
      username
    }
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

// // Detail View of Crate
// export const GET_CRATE_DETAIL = gql`
//   query GetCrateDetail($id: Int!) {
//     getCrate(id: $id) {
//       id
//       title
//       description
//       creator {
//         id
//         username
//         image
//       }
//       favoritedBy {
//         id
//         username
//         image
//       }
//       labels {
//         id
//         name
//         isStandard
//       }
//       isRanked
//       albums {
//         id
//       }
//     }
//   }
// `;

// // Details of CrateAlbums
// export const GET_CRATE_ALBUMS = gql`
//   query GetCrateAlbums($ids: [Int!]!) {
//     getCrateAlbums(ids: $ids) {
//       id
//       crate {
//         id
//       }
//       album {
//         id
//         title
//         artist
//         label
//         releaseYear
//         genres {
//           id
//           name
//         }
//         subgenres {
//           id
//           name
//         }
//         imageUrl
//         tracklist {
//           id
//           title
//           order
//         }
//       }
//       rank
//       tags {
//         id
//         name
//       }
//     }
//   }
// `;

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
