import { useState, useEffect, useReducer } from 'react';
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
} from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { FullSearchPane } from '../FullSearchPane/FullSearchPane';
import { PaneType } from '@/lib/context/state';

interface FullSearchControllerProps {
  searchPrompt: string;
  activePane: PaneType;
  prevActivePane: PaneType;
  setActivePane: (val: PaneType) => void;
  setPrevActivePane: (val: PaneType) => void;
}

const initialResultsState = {
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

const resultsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE_RESULTS':
      return { ...state, profileState: { ...state.profileState, results: action.payload } };
    case 'UPDATE_CRATE_RESULTS':
      return { ...state, crateState: { ...state.crateState, results: action.payload } };
    case 'UPDATE_ALBUM_RESULTS':
      return { ...state, albumState: { ...state.albumState, results: action.payload } };
    case 'UPDATE_LABEL_AND_TAG_RESULTS':
      return { ...state, labelAndTagState: { ...state.labelAndTagState, results: action.payload } };
    case 'UPDATE_GENRE_AND_SUBGENRE_RESULTS':
      return { ...state, genreAndSubgenreState: { ...state.genreAndSubgenreState, results: action.payload } };
    case 'UPDATE_CRATES_FROM_LABEL_RESULTS':
      return { ...state, cratesFromLabelState: { ...state.cratesFromLabelState, results: action.payload } };
    case 'UPDATE_ALBUMS_FROM_TAG_RESULTS':
      return { ...state, albumsFromTagState: { ...state.albumsFromTagState, results: action.payload } };
    case 'UPDATE_ALBUMS_FROM_GENRE_RESULTS':
      return { ...state, albumsFromGenreState: { ...state.albumsFromGenreState, results: action.payload } };
    case 'UPDATE_ALBUMS_FROM_SUBGENRE_RESULTS':
      return { ...state, albumsFromSubgenreState: { ...state.albumsFromSubgenreState, results: action.payload } };
    case 'UPDATE_CRATES_FROM_ALBUM_RESULTS':
      return { ...state, cratesFromAlbumState: { ...state.cratesFromAlbumState, results: action.payload } };
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
    default:
      return state;
  }
};

const FullSearchController = ({
  searchPrompt,
  activePane,
  setActivePane,
  setPrevActivePane,
}: FullSearchControllerProps) => {
  const [resultsState, dispatch] = useReducer(resultsReducer, initialResultsState);
  const [getProfileResults, { data: profilesData, loading: loadingProfiles }] = useLazyQuery(FS_PROFILES, {
    variables: { searchTerm: searchPrompt },
  });
  const [getCrateResults, { data: cratesData, loading: loadingCrates }] = useLazyQuery(FS_CRATES, {
    variables: { searchTerm: searchPrompt },
  });
  const [getAlbumResults, { data: albumsData, loading: loadingAlbums }] = useLazyQuery(FS_ALBUMS, {
    variables: { searchTerm: searchPrompt },
  });
  const [getLabelResults, { data: labelsData, loading: loadingLabels }] = useLazyQuery(FS_LABELS, {
    variables: { searchTerm: searchPrompt },
  });
  const [getTagResults, { data: tagsData, loading: loadingTags }] = useLazyQuery(FS_TAGS, {
    variables: { searchTerm: searchPrompt },
  });
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

  const currentProfiles = resultsState.profileState.results.slice(0, resultsState.profileState.currentPage * 30);
  const currentCrates = resultsState.crateState.results.slice(0, resultsState.crateState.currentPage * 30);
  const currentAlbums = resultsState.albumState.results.slice(0, resultsState.albumState.currentPage * 30);
  const currentLabelsAndTags =
    resultsState.labelAndTagState.results
      .slice(0, resultsState.labelAndTagState.currentPage * 30)
      .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
  const currentGenresAndSubgenres =
    resultsState.genreAndSubgenreState.results
      .slice(0, resultsState.genreAndSubgenreState.currentPage * 30)
      .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
  const currentCratesFromLabel =
    resultsState.cratesFromLabelState.results.slice(0, resultsState.cratesFromLabelState.currentPage * 30) || [];
  const currentAlbumsFromTag =
    resultsState.albumsFromTagState.results.slice(0, resultsState.albumsFromTagState.currentPage * 30) || [];
  const currentAlbumsFromGenre =
    resultsState.albumsFromGenreState.results.slice(0, resultsState.albumsFromGenreState.currentPage * 30) || [];
  const currentAlbumsFromSubgenre =
    resultsState.albumsFromSubgenreState.results.slice(0, resultsState.albumsFromSubgenreState.currentPage * 30) || [];
  const currentCratesFromAlbum =
    resultsState.cratesFromAlbumState.results.slice(0, resultsState.cratesFromAlbumState.currentPage * 30) || [];

  console.log(resultsState);
  console.log(cratesFromLabelData);

  useEffect(() => {
    getProfileResults();

    if (profilesData?.fsProfiles) {
      dispatch({ type: 'UPDATE_PROFILE_RESULTS', payload: profilesData.fsProfiles });
    }
    if (cratesData?.fsCrates) {
      dispatch({ type: 'UPDATE_CRATE_RESULTS', payload: cratesData.fsCrates });
    }
    if (albumsData?.fsAlbums) {
      dispatch({ type: 'UPDATE_ALBUM_RESULTS', payload: albumsData.fsAlbums });
    }
    if (labelsData?.fsLabels || tagsData?.fsTags) {
      let labels = labelsData?.fsLabels || [];
      let tags = tagsData?.fsTags || [];

      const labelsAndTagsData = [...labels, ...tags];
      dispatch({ type: 'UPDATE_LABEL_AND_TAG_RESULTS', payload: labelsAndTagsData });
    }
    if (genresData?.fsGenres || subgenresData?.fsSubgenres) {
      let genres = genresData?.fsGenres || [];
      let subgenres = subgenresData?.fsSubgenres || [];

      const genresAndSubgenresData = [...genres, ...subgenres];
      dispatch({ type: 'UPDATE_GENRE_AND_SUBGENRE_RESULTS', payload: genresAndSubgenresData });
    }
    if (cratesFromLabelData?.getCratesFromLabel) {
      dispatch({ type: 'UPDATE_CRATES_FROM_LABEL_RESULTS', payload: cratesFromLabelData.getCratesFromLabel });
    }
    if (albumsFromTagData?.getAlbumsFromTag) {
      dispatch({ type: 'UPDATE_ALBUMS_FROM_TAG_RESULTS', payload: albumsFromTagData.getAlbumsFromTag });
    }
    if (albumsFromGenreData?.getAlbumsFromGenre) {
      dispatch({ type: 'UPDATE_ALBUMS_FROM_GENRE_RESULTS', payload: albumsFromGenreData.getAlbumsFromGenre });
    }
    if (albumsFromSubgenreData?.getAlbumsFromSubgenre) {
      dispatch({ type: 'UPDATE_ALBUMS_FROM_SUBGENRE_RESULTS', payload: albumsFromSubgenreData.getAlbumsFromSubgenre });
    }
    if (cratesFromAlbumData?.getCratesFromAlbum) {
      dispatch({ type: 'UPDATE_CRATES_FROM_ALBUM_RESULTS', payload: cratesFromAlbumData.getCratesFromAlbum });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profilesData,
    cratesData,
    albumsData,
    labelsData,
    tagsData,
    genresData,
    subgenresData,
    cratesFromLabelData,
    albumsFromTagData,
    albumsFromGenreData,
    albumsFromSubgenreData,
    cratesFromAlbumData,
  ]);

  return (
    <>
      <div className={cx('listActions')}>
        <button
          onClick={() => {
            setActivePane('profiles');
            setPrevActivePane(null);
          }}
        >
          <h5>{`Profiles`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('crates');
            setPrevActivePane(null);
            getCrateResults();
          }}
        >
          <h5>{`Crates`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('albums');
            setPrevActivePane(null);
            getAlbumResults();
          }}
        >
          <h5>{`Albums`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('labelsAndTags');
            setPrevActivePane(null);
            getLabelResults();
            getTagResults();
          }}
        >
          <h5>{`Labels/Tags`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('genresAndSubgenres');
            setPrevActivePane(null);
            getGenreResults();
            getSubgenreResults();
          }}
        >
          <h5>{`Genres/Subgenres`}</h5>
        </button>
      </div>
      <ul className={cx('searchMenu')}>
        {(() => {
          switch (activePane) {
            case 'profiles':
              return loadingProfiles ? (
                <li>Loading Profiles...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentProfiles}
                  currentPage={resultsState.profileState.currentPage}
                  getMoreItems={() => {
                    dispatch({
                      type: 'UPDATE_PROFILE_CURRENT_PAGE',
                      payload: resultsState.profileState.currentPage + 1,
                    });
                  }}
                />
              );
            case 'crates':
              return loadingCrates ? (
                <li>Loading Crates...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentCrates}
                  currentPage={resultsState.crateState.currentPage}
                  getMoreItems={() => {
                    dispatch({
                      type: 'UPDATE_CRATE_CURRENT_PAGE',
                      payload: resultsState.crateState.currentPage + 1,
                    });
                  }}
                />
              );
            case 'albums':
              return loadingAlbums ? (
                <li>Loading Albums...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentAlbums}
                  currentPage={resultsState.albumState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_ALBUM_CURRENT_PAGE',
                      payload: resultsState.albumState.currentPage + 1,
                    })
                  }
                  getNextPane={(type, searchId) => {
                    if (type === 'Album') {
                      setActivePane('cratesFromAlbum');
                      setPrevActivePane('albums');
                      getCratesFromAlbum({ variables: { albumId: searchId } });
                    } else {
                      return;
                    }
                  }}
                />
              );
            case 'labelsAndTags':
              return loadingLabels ? (
                <li>Loading Labels/Tags...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentLabelsAndTags}
                  currentPage={resultsState.labelAndTagState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE',
                      payload: resultsState.labelAndTagState.currentPage + 1,
                    })
                  }
                  getNextPane={(type, searchId) => {
                    if (type === 'Label') {
                      setActivePane('cratesFromLabel');
                      setPrevActivePane('labelsAndTags');
                      getCratesFromLabel({ variables: { labelId: searchId } });
                    } else {
                      setActivePane('albumsFromTag');
                      setPrevActivePane('labelsAndTags');
                      getAlbumsFromTag({ variables: { tagId: searchId } });
                    }
                  }}
                />
              );
            case 'genresAndSubgenres':
              return loadingGenres ? (
                <li>Loading Genres/Subgenres...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentGenresAndSubgenres}
                  currentPage={resultsState.genreAndSubgenreState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_GENRE_AND_SUBGENRE_CURRENT_PAGE',
                      payload: resultsState.genreAndSubgenreState.currentPage + 1,
                    })
                  }
                  getNextPane={(type, searchId) => {
                    if (type === 'Genre') {
                      setActivePane('albumsFromGenre');
                      setPrevActivePane('genresAndSubgenres');
                      getAlbumsFromGenre({ variables: { genreId: searchId } });
                    } else {
                      setActivePane('albumsFromSubgenre');
                      setPrevActivePane('genresAndSubgenres');
                      getAlbumsFromSubgenre({ variables: { subgenreId: searchId } });
                    }
                  }}
                />
              );
            case 'cratesFromLabel':
              return loadingCratesFromLabel ? (
                <li>Loading Crates from Label...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentCratesFromLabel}
                  currentPage={resultsState.cratesFromLabelState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_CRATES_FROM_LABEL_CURRENT_PAGE',
                      payload: resultsState.cratesFromLabelState.currentPage + 1,
                    })
                  }
                />
              );
            case 'albumsFromTag':
              return loadingAlbumsFromTag ? (
                <li>Loading Albums from Tag...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentAlbumsFromTag}
                  currentPage={resultsState.albumsFromTagState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_ALBUMS_FROM_TAG_CURRENT_PAGE',
                      payload: resultsState.albumsFromTagState.currentPage + 1,
                    })
                  }
                  getNextPane={(type, searchId) => {
                    if (type === 'Album') {
                      setActivePane('cratesFromAlbum');
                      setPrevActivePane('albumsFromTag');
                      getCratesFromAlbum({ variables: { albumId: searchId } });
                    } else {
                      return;
                    }
                  }}
                />
              );
            case 'albumsFromGenre':
              return loadingAlbumsFromGenre ? (
                <li>Loading Albums from Genre...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentAlbumsFromGenre}
                  currentPage={resultsState.albumsFromGenreState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_ALBUMS_FROM_GENRE_CURRENT_PAGE',
                      payload: resultsState.albumsFromGenreState.currentPage + 1,
                    })
                  }
                  getNextPane={(type, searchId) => {
                    if (type === 'Album') {
                      setActivePane('cratesFromAlbum');
                      setPrevActivePane('albumsFromGenre');
                      getCratesFromAlbum({ variables: { albumId: searchId } });
                    } else {
                      return;
                    }
                  }}
                />
              );
            case 'albumsFromSubgenre':
              return loadingAlbumsFromSubgenre ? (
                <li>Loading Albums from Subgenre...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentAlbumsFromSubgenre}
                  currentPage={resultsState.albumsFromSubgenreState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_ALBUMS_FROM_SUBGENRE_CURRENT_PAGE',
                      payload: resultsState.albumsFromSubgenreState.currentPage + 1,
                    })
                  }
                  getNextPane={(type, searchId) => {
                    if (type === 'Album') {
                      setActivePane('cratesFromAlbum');
                      setPrevActivePane('albumsFromSubgenre');
                      getCratesFromAlbum({ variables: { albumId: searchId } });
                    } else {
                      return;
                    }
                  }}
                />
              );
            case 'cratesFromAlbum':
              return loadingCratesFromAlbum ? (
                <li>Loading Crates from Album...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentCratesFromAlbum}
                  currentPage={resultsState.cratesFromAlbumState.currentPage}
                  getMoreItems={() =>
                    dispatch({
                      type: 'UPDATE_CRATES_FROM_ALBUM_CURRENT_PAGE',
                      payload: resultsState.cratesFromAlbumState.currentPage + 1,
                    })
                  }
                />
              );
            default:
              return null;
          }
        })()}
      </ul>
    </>
  );
};

export { FullSearchController };
