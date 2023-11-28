import { gql } from '@apollo/client';

export const SEARCH_LABELS_BY_NAME = gql`
  query searchLabelsByName($searchTerm: String!) {
    searchLabelsByName(searchTerm: $searchTerm) {
      id
      name
      isStandard
    }
  }
`;

export const SEARCH_LABELS_BY_ID = gql`
  query searchLabelsById($labelId: Int!) {
    searchLabelsById(labelId: $labelId) {
      id
      name
      isStandard
    }
  }
`;

export const GET_TOP_LABELS = gql`
  query GetTopLabels($quantity: Int, $includeStandard: Boolean) {
    getTopLabels(quantity: $quantity, includeStandard: $includeStandard) {
      id
      name
      isStandard
    }
  }
`;

export const SEARCH_TAGS_BY_NAME = gql`
  query SearchTagsByName($searchTerm: String!) {
    searchTagsByName(searchTerm: $searchTerm) {
      id
      name
    }
  }
`;

export const SEARCH_TAGS_BY_ID = gql`
  query searchTagsById($tagId: Int!) {
    searchTagsById(tagId: $tagId) {
      id
      name
    }
  }
`;

export const GET_TOP_TAGS = gql`
  query GetTopTags($quantity: Int, $includeStandard: Boolean) {
    getTopTags(quantity: $quantity, includeStandard: $includeStandard) {
      id
      name
    }
  }
`;

export const SEARCH_PRISMA_ALBUMS_BY_NAME = gql`
  query SearchPrismaAlbumsByName($searchTerm: String!) {
    searchPrismaAlbumsByName(searchTerm: $searchTerm) {
      id
      title
      artist
      discogsMasterId
      imageUrl
    }
  }
`;

export const SEARCH_PRISMA_ALBUMS_BY_ID = gql`
  query SearchPrismaAlbumsById($albumId: Int!) {
    searchPrismaAlbumsById(albumId: $albumId) {
      id
      title
      artist
      discogsMasterId
      imageUrl
    }
  }
`;

export const QS_PROFILES = gql`
  query QsProfiles($searchTerm: String!) {
    qsProfiles(searchTerm: $searchTerm) {
      id
      username
      image
      searchAndSelectCount
    }
  }
`;

export const QS_CRATES = gql`
  query QsCrates($searchTerm: String!) {
    qsCrates(searchTerm: $searchTerm) {
      id
      title
      searchAndSelectCount
      creator {
        username
      }
    }
  }
`;

export const QS_ALBUMS = gql`
  query QsAlbums($searchTerm: String!) {
    qsAlbums(searchTerm: $searchTerm) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const QS_LABELS = gql`
  query QsLabels($searchTerm: String!) {
    qsLabels(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
      isStandard
    }
  }
`;

export const QS_TAGS = gql`
  query QsTags($searchTerm: String!) {
    qsTags(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const QS_GENRES = gql`
  query QsGenres($searchTerm: String!) {
    qsGenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const QS_SUBGENRES = gql`
  query QsSubgenres($searchTerm: String!) {
    qsSubgenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const FS_PROFILES = gql`
  query FsProfiles($searchTerm: String!, $currentPage: Int!) {
    fsProfiles(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      username
      image
      searchAndSelectCount
    }
  }
`;

export const FS_CRATES = gql`
  query FsCrates($searchTerm: String!, $currentPage: Int!) {
    fsCrates(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const FS_ALBUMS = gql`
  query FsAlbums($searchTerm: String!, $currentPage: Int!) {
    fsAlbums(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const FS_LABELS = gql`
  query FsLabels($searchTerm: String!, $currentPage: Int!) {
    fsLabels(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      name
      searchAndSelectCount
      isStandard
    }
  }
`;

export const FS_TAGS = gql`
  query FsTags($searchTerm: String!, $currentPage: Int!) {
    fsTags(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const FS_GENRES = gql`
  query FsGenres($searchTerm: String!) {
    fsGenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const FS_SUBGENRES = gql`
  query FsSubgenres($searchTerm: String!) {
    fsSubgenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const RUN_QUICK_SEARCH = gql`
  query RunQuickSearch($searchTerm: String!) {
    qsProfiles(searchTerm: $searchTerm) {
      id
      username
      image
      searchAndSelectCount
    }
    qsCrates(searchTerm: $searchTerm) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const GET_CRATES_FROM_LABEL = gql`
  query GetCratesFromLabel($labelId: Int!, $currentPage: Int!) {
    getCratesFromLabel(labelId: $labelId, currentPage: $currentPage) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const GET_CRATES_FROM_ALBUM = gql`
  query GetCratesFromAlbum($albumId: Int!, $currentPage: Int!) {
    getCratesFromAlbum(albumId: $albumId, currentPage: $currentPage) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const GET_ALBUMS_FROM_TAG = gql`
  query GetAlbumsFromTag($tagId: Int!, $currentPage: Int!) {
    getAlbumsFromTag(tagId: $tagId, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const GET_ALBUMS_FROM_GENRE = gql`
  query GetAlbumsFromGenre($genreId: Int!, $currentPage: Int!) {
    getAlbumsFromGenre(genreId: $genreId, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const GET_ALBUMS_FROM_SUBGENRE = gql`
  query GetAlbumsFromSubgenre($subgenreId: Int!, $currentPage: Int!) {
    getAlbumsFromSubgenre(subgenreId: $subgenreId, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const LOG_SELECTED_SEARCH_RESULT = gql`
  mutation LogSelectedSearchResult($searchTerm: String, $prismaModel: String!, $selectedId: Int!) {
    logSelectedSearchResult(searchTerm: $searchTerm, prismaModel: $prismaModel, selectedId: $selectedId) {
      id
      searchTerm
      resultType
      searchResult
      selectedId
    }
  }
`;
