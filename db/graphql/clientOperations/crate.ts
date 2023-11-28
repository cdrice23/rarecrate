import { gql } from '@apollo/client';

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
          id
          discogsMasterId
          title
          artist
          discogsMasterId
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

export const ADD_CRATE_TO_FAVORITES = gql`
  mutation AddCrateToFavorites($input: CrateProfileInput!) {
    addCrateToFavorites(input: $input) {
      id
      title
      creator {
        id
      }
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

export const ADD_NEW_TAG = gql`
  mutation AddNewTag($name: String!) {
    addNewTag(name: $name) {
      id
      name
    }
  }
`;

export const ADD_NEW_LABEL = gql`
  mutation AddNewLabel($name: String!) {
    addNewLabel(name: $name) {
      id
      name
      isStandard
    }
  }
`;

export const ADD_NEW_ALBUM = gql`
  mutation AddNewAlbum($discogsMasterId: Int!) {
    addNewAlbum(discogsMasterId: $discogsMasterId) {
      id
      discogsMasterId
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
  }
`;

export const ADD_NEW_CRATE = gql`
  mutation AddNewCrate($input: CrateInput!) {
    addNewCrate(input: $input) {
      id
      creator {
        id
        username
      }
      creatorId
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

export const UPDATE_CRATE = gql`
  mutation UpdateCrate($input: CrateInput!) {
    updateCrate(input: $input) {
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
          id
          title
          artist
          discogsMasterId
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
