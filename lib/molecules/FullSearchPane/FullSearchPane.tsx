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
} from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';

interface FullSearchPaneProps {
  searchPrompt: string;
}

const initialResultsState = {
  profileState: { results: [], currentPage: 1 },
  crateState: { results: [], currentPage: 1 },
  albumState: { results: [], currentPage: 1 },
  labelAndTagState: { results: [], currentPage: 1 },
  genreAndSubgenreState: { results: [], currentPage: 1 },
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
    default:
      return state;
  }
};

const FullSearchPane = ({ searchPrompt }: FullSearchPaneProps) => {
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
  const [activePane, setActivePane] = useState<
    'profiles' | 'crates' | 'albums' | 'labelsAndTags' | 'genresAndSubgenres'
  >('profiles');

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

  console.log(resultsState);
  console.log(currentLabelsAndTags);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilesData, cratesData, albumsData, labelsData, tagsData, genresData, subgenresData]);

  return (
    <>
      <div className={cx('listActions')}>
        <button onClick={() => setActivePane('profiles')}>
          <h5>{`Profiles`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('crates');
            getCrateResults();
          }}
        >
          <h5>{`Crates`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('albums');
            getAlbumResults();
          }}
        >
          <h5>{`Albums`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('labelsAndTags');
            getLabelResults();
            getTagResults();
          }}
        >
          <h5>{`Labels/Tags`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('genresAndSubgenres');
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
                currentProfiles.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.profileState.currentPage * 30 - 1}
                      getMoreItems={() =>
                        dispatch({
                          type: 'UPDATE_PROFILE_CURRENT_PAGE',
                          payload: resultsState.profileState.currentPage + 1,
                        })
                      }
                    />
                  </li>
                ))
              );
            case 'crates':
              return loadingCrates ? (
                <li>Loading Crates...</li>
              ) : (
                currentCrates.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.crateState.currentPage * 30 - 1}
                      getMoreItems={() => {
                        dispatch({
                          type: 'UPDATE_CRATE_CURRENT_PAGE',
                          payload: resultsState.crateState.currentPage + 1,
                        });
                      }}
                    />
                  </li>
                ))
              );
            case 'albums':
              return loadingAlbums ? (
                <li>Loading Albums...</li>
              ) : (
                currentAlbums.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.albumState.currentPage * 30 - 1}
                      getMoreItems={() => {
                        dispatch({
                          type: 'UPDATE_ALBUM_CURRENT_PAGE',
                          payload: resultsState.albumState.currentPage + 1,
                        });
                      }}
                    />
                  </li>
                ))
              );
            case 'labelsAndTags':
              return loadingLabels ? (
                <li>Loading Labels/Tags...</li>
              ) : (
                currentLabelsAndTags.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.labelAndTagState.currentPage * 30 - 1}
                      getMoreItems={() => {
                        dispatch({
                          type: 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE',
                          payload: resultsState.labelAndTagState.currentPage + 1,
                        });
                      }}
                    />
                  </li>
                ))
              );
            case 'genresAndSubgenres':
              return loadingGenres ? (
                <li>Loading Genres/Subgenres...</li>
              ) : (
                currentGenresAndSubgenres.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.genreAndSubgenreState.currentPage * 30 - 1}
                      getMoreItems={() => {
                        dispatch({
                          type: 'UPDATE_GENRE_AND_SUBGENRE_CURRENT_PAGE',
                          payload: resultsState.genreAndSubgenreState.currentPage + 1,
                        });
                      }}
                    />
                  </li>
                ))
              );
            default:
              return null;
          }
        })()}
      </ul>
    </>
  );
};

export { FullSearchPane };
