import { useLazyQuery } from '@apollo/client';
import {
  FS_PROFILES,
  FS_CRATES,
  FS_ALBUMS,
  FS_LABELS,
  FS_TAGS,
  FS_GENRES,
  FS_SUBGENRES,
  GET_CRATES_FROM_LABEL,
  GET_ALBUMS_FROM_TAG,
  GET_CRATES_FROM_ALBUM,
  GET_ALBUMS_FROM_GENRE,
  GET_ALBUMS_FROM_SUBGENRE,
} from '@/db/graphql/clientOperations/search';

export const initialResultsState = {
  profileState: { results: [], currentPage: 1 },
  crateState: { results: [], currentPage: 1 },
  albumState: { results: [], currentPage: 1 },
  labelAndTagState: { results: [], currentPage: 1 },
  genreAndSubgenreState: { results: [], currentPage: 1 },
  cratesFromLabelState: { results: [], currentPage: 1 },
  albumsFromTagState: { results: [], currentPage: 1 },
  albumsFromGenreState: { results: [], currentPage: 1 },
  albumsFromSubgenreState: { results: [], currentPage: 1 },
  cratesFromAlbumState: { results: [], currentPage: 1 },
};

export const resultsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE_RESULTS':
      return {
        ...state,
        profileState: { ...state.profileState, results: [...state.profileState.results, ...action.payload] },
      };
    case 'UPDATE_CRATE_RESULTS':
      return {
        ...state,
        crateState: { ...state.crateState, results: [...state.crateState.results, ...action.payload] },
      };
    case 'UPDATE_ALBUM_RESULTS':
      return {
        ...state,
        albumState: { ...state.albumState, results: [...state.albumState.results, ...action.payload] },
      };
    case 'UPDATE_LABEL_AND_TAG_RESULTS':
      const newResults = state.labelAndTagState.results.concat(action.payload);
      const uniqueIds = new Set();
      const uniqueResults = newResults.filter(element => {
        const isDuplicate = uniqueIds.has(element.id);
        uniqueIds.add(element.id);
        return !isDuplicate;
      });
      return {
        ...state,
        labelAndTagState: {
          ...state.labelAndTagState,
          results: uniqueResults,
        },
      };
    case 'UPDATE_GENRE_AND_SUBGENRE_RESULTS':
      return { ...state, genreAndSubgenreState: { ...state.genreAndSubgenreState, results: action.payload } };
    case 'UPDATE_CRATES_FROM_LABEL_RESULTS':
      return {
        ...state,
        cratesFromLabelState: {
          ...state.cratesFromLabelState,
          results: [...state.cratesFromLabelState.results, ...action.payload],
        },
      };
    case 'UPDATE_ALBUMS_FROM_TAG_RESULTS':
      return {
        ...state,
        albumsFromTagState: {
          ...state.albumsFromTagState,
          results: [...state.albumsFromTagState.results, ...action.payload],
        },
      };
    case 'UPDATE_ALBUMS_FROM_GENRE_RESULTS':
      return {
        ...state,
        albumsFromGenreState: {
          ...state.albumsFromGenreState,
          results: [...state.albumsFromGenreState.results, ...action.payload],
        },
      };
    case 'UPDATE_ALBUMS_FROM_SUBGENRE_RESULTS':
      return {
        ...state,
        albumsFromSubgenreState: {
          ...state.albumsFromSubgenreState,
          results: [...state.albumsFromSubgenreState.results, ...action.payload],
        },
      };
    case 'UPDATE_CRATES_FROM_ALBUM_RESULTS':
      return {
        ...state,
        cratesFromAlbumState: {
          ...state.cratesFromAlbumState,
          results: [...state.cratesFromAlbumState.results, ...action.payload],
        },
      };
    case 'UPDATE_PROFILE_CURRENT_PAGE':
      return { ...state, profileState: { ...state.profileState, currentPage: action.payload } };
    case 'UPDATE_CRATE_CURRENT_PAGE':
      return { ...state, crateState: { ...state.crateState, currentPage: action.payload } };
    case 'UPDATE_ALBUM_CURRENT_PAGE':
      return { ...state, albumState: { ...state.albumState, currentPage: action.payload } };
    case 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE':
      return { ...state, labelAndTagState: { ...state.labelAndTagState, currentPage: action.payload } };
    case 'UPDATE_GENRE_AND_SUBGENRE_CURRENT_PAGE':
      return { ...state, genreAndSubgenreState: { ...state.genreAndSubgenreState, currentPage: action.payload } };
    case 'UPDATE_CRATES_FROM_LABEL_CURRENT_PAGE':
      return { ...state, cratesFromLabelState: { ...state.cratesFromLabelState, currentPage: action.payload } };
    case 'UPDATE_ALBUMS_FROM_TAG_CURRENT_PAGE':
      return { ...state, albumsFromTagState: { ...state.albumsFromTagState, currentPage: action.payload } };
    case 'UPDATE_ALBUMS_FROM_GENRE_CURRENT_PAGE':
      return { ...state, albumsFromGenreState: { ...state.albumsFromGenreState, currentPage: action.payload } };
    case 'UPDATE_ALBUMS_FROM_SUBGENRE_CURRENT_PAGE':
      return { ...state, albumsFromSubgenreState: { ...state.albumsFromSubgenreState, currentPage: action.payload } };
    case 'UPDATE_CRATES_FROM_ALBUM_CURRENT_PAGE':
      return { ...state, cratesFromAlbumState: { ...state.cratesFromAlbumState, currentPage: action.payload } };
    case 'RESET_CRATES_FROM_LABEL_RESULTS':
      return { ...state, cratesFromLabelState: { results: [], currentPage: 1 } };
    case 'RESET_ALBUMS_FROM_TAG_RESULTS':
      return { ...state, albumsFromTagState: { results: [], currentPage: 1 } };
    case 'RESET_ALBUMS_FROM_GENRE_RESULTS':
      return { ...state, albumsFromGenreState: { results: [], currentPage: 1 } };
    case 'RESET_ALBUMS_FROM_SUBGENRE_RESULTS':
      return { ...state, albumsFromSubgenreState: { results: [], currentPage: 1 } };
    case 'RESET_CRATES_FROM_ALBUM_RESULTS':
      return { ...state, cratesFromAlbumState: { results: [], currentPage: 1 } };
    default:
      return state;
  }
};

export const useLazyQueries = (searchPrompt: string) => {
  const [getProfileResults, { data: profilesData, loading: loadingProfiles }] = useLazyQuery(FS_PROFILES);
  const [getCrateResults, { data: cratesData, loading: loadingCrates }] = useLazyQuery(FS_CRATES);
  const [getAlbumResults, { data: albumsData, loading: loadingAlbums }] = useLazyQuery(FS_ALBUMS);
  const [getLabelResults, { data: labelsData, loading: loadingLabels }] = useLazyQuery(FS_LABELS);
  const [getTagResults, { data: tagsData, loading: loadingTags }] = useLazyQuery(FS_TAGS);
  const [getGenreResults, { data: genresData, loading: loadingGenres }] = useLazyQuery(FS_GENRES, {
    variables: { searchTerm: searchPrompt },
  });
  const [getSubgenreResults, { data: subgenresData, loading: loadingSubgenres }] = useLazyQuery(FS_SUBGENRES, {
    variables: { searchTerm: searchPrompt },
  });
  const [getCratesFromLabel, { data: cratesFromLabelData, loading: loadingCratesFromLabel }] =
    useLazyQuery(GET_CRATES_FROM_LABEL);
  const [getAlbumsFromTag, { data: albumsFromTagData, loading: loadingAlbumsFromTag }] =
    useLazyQuery(GET_ALBUMS_FROM_TAG);
  const [getCratesFromAlbum, { data: cratesFromAlbumData, loading: loadingCratesFromAlbum }] =
    useLazyQuery(GET_CRATES_FROM_ALBUM);
  const [getAlbumsFromGenre, { data: albumsFromGenreData, loading: loadingAlbumsFromGenre }] =
    useLazyQuery(GET_ALBUMS_FROM_GENRE);
  const [getAlbumsFromSubgenre, { data: albumsFromSubgenreData, loading: loadingAlbumsFromSubgenre }] =
    useLazyQuery(GET_ALBUMS_FROM_SUBGENRE);

  return {
    getProfileResults,
    profilesData,
    loadingProfiles,
    getCrateResults,
    cratesData,
    loadingCrates,
    getAlbumResults,
    albumsData,
    loadingAlbums,
    getLabelResults,
    labelsData,
    loadingLabels,
    getTagResults,
    tagsData,
    loadingTags,
    getGenreResults,
    genresData,
    loadingGenres,
    getSubgenreResults,
    subgenresData,
    loadingSubgenres,
    getCratesFromLabel,
    cratesFromLabelData,
    loadingCratesFromLabel,
    getAlbumsFromTag,
    albumsFromTagData,
    loadingAlbumsFromTag,
    getCratesFromAlbum,
    cratesFromAlbumData,
    loadingCratesFromAlbum,
    getAlbumsFromGenre,
    albumsFromGenreData,
    loadingAlbumsFromGenre,
    getAlbumsFromSubgenre,
    albumsFromSubgenreData,
    loadingAlbumsFromSubgenre,
  };
};

export const getLabelAndTagResults = async (
  searchPrompt: string,
  resultsState: any,
  dispatch: any,
  getLabelResults: any,
  getTagResults: any,
  newPage: number,
) => {
  let labelPromise = new Promise<any[]>(resolve => {
    getLabelResults({
      variables: {
        searchTerm: searchPrompt,
        currentPage: newPage,
      },
      onCompleted: data => resolve(data.fsLabels),
    });
  });
  let tagPromise = new Promise<any[]>(resolve => {
    getTagResults({
      variables: {
        searchTerm: searchPrompt,
        currentPage: newPage,
      },
      onCompleted: data => resolve(data.fsTags),
    });
  });

  let [labels, tags] = await Promise.all([labelPromise, tagPromise]);
  const labelsAndTagsData = [...labels, ...tags];
  const sortedPayload = labelsAndTagsData?.sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
  dispatch({ type: 'UPDATE_LABEL_AND_TAG_RESULTS', payload: sortedPayload });
  if (labelsAndTagsData.length !== 0) {
    dispatch({
      type: 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE',
      payload: resultsState.labelAndTagState.currentPage + 1,
    });
  }
};

export const getGenreAndSubgenreResults = async (
  searchPrompt: string,
  resultsState: any,
  dispatch: any,
  getGenreResults: any,
  getSubgenreResults: any,
  newPage: number,
) => {
  let genrePromise = new Promise<any[]>(resolve => {
    getGenreResults({
      variables: {
        searchTerm: searchPrompt,
        currentPage: newPage,
      },
      onCompleted: data => resolve(data.fsGenres),
    });
  });
  let subgenrePromise = new Promise<any[]>(resolve => {
    getSubgenreResults({
      variables: {
        searchTerm: searchPrompt,
        currentPage: newPage,
      },
      onCompleted: data => resolve(data.fsSubgenres),
    });
  });

  let [genres, subgenres] = await Promise.all([genrePromise, subgenrePromise]);
  const genresAndSubgenresData = [...genres, ...subgenres];
  const sortedPayload = genresAndSubgenresData?.sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
  dispatch({ type: 'UPDATE_GENRE_AND_SUBGENRE_RESULTS', payload: sortedPayload });
  if (genresAndSubgenresData.length !== 0) {
    dispatch({
      type: 'UPDATE_GENRE_AND_SUBGENRE_CURRENT_PAGE',
      payload: resultsState.labelAndTagState.currentPage + 1,
    });
  }
};
