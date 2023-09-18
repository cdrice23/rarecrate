import { useState, useEffect, useReducer } from 'react';
import { useLazyQuery } from '@apollo/client';
import { FS_PROFILES, FS_CRATES, FS_ALBUMS, FS_LABELS, FS_GENRES } from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';

interface FullSearchPaneProps {
  searchPrompt: string;
}

const initialResultsState = {
  profileState: { results: [], currentPage: 1 },
  crateState: { results: [], currentPage: 1 },
  albumState: { results: [], currentPage: 1 },
  labelState: { results: [], currentPage: 1 },
  genreState: { results: [], currentPage: 1 },
};

const resultsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE_RESULTS':
      return { ...state, profileState: { ...state.profileState, results: action.payload } };
    case 'UPDATE_CRATE_RESULTS':
      return { ...state, crateState: { ...state.crateState, results: action.payload } };
    case 'UPDATE_ALBUM_RESULTS':
      return { ...state, albumState: { ...state.albumState, results: action.payload } };
    case 'UPDATE_LABEL_RESULTS':
      return { ...state, labelState: { ...state.labelState, results: action.payload } };
    case 'UPDATE_GENRE_RESULTS':
      return { ...state, genreState: { ...state.genreState, results: action.payload } };
    case 'UPDATE_PROFILE_CURRENT_PAGE':
      return { ...state, profileState: { ...state.profileState, currentPage: action.payload } };
    case 'UPDATE_CRATE_CURRENT_PAGE':
      return { ...state, crateState: { ...state.crateState, currentPage: action.payload } };
    case 'UPDATE_ALBUM_CURRENT_PAGE':
      return { ...state, albumState: { ...state.albumState, currentPage: action.payload } };
    case 'UPDATE_LABEL_CURRENT_PAGE':
      return { ...state, labelState: { ...state.labelState, currentPage: action.payload } };
    case 'UPDATE_GENRE_CURRENT_PAGE':
      return { ...state, genreState: { ...state.genreState, currentPage: action.payload } };
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
  const [getGenreResults, { data: genresData, loading: loadingGenres }] = useLazyQuery(FS_GENRES, {
    variables: { searchTerm: searchPrompt },
  });
  const [activePane, setActivePane] = useState<
    'profiles' | 'crates' | 'albums' | 'labelsAndTags' | 'genresAndSubgenres'
  >('profiles');

  const currentProfiles = resultsState.profileState.results.slice(0, resultsState.profileState.currentPage * 30);
  const currentCrates = resultsState.crateState.results.slice(0, resultsState.crateState.currentPage * 30);
  const currentAlbums = resultsState.albumState.results.slice(0, resultsState.albumState.currentPage * 30);
  const currentLabels = resultsState.labelState.results.slice(0, resultsState.labelState.currentPage * 30);
  const currentGenres = resultsState.genreState.results.slice(0, resultsState.genreState.currentPage * 30);

  console.log(resultsState);
  console.log(currentAlbums);

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
    if (labelsData?.fsLabels) {
      dispatch({ type: 'UPDATE_LABEL_RESULTS', payload: labelsData.fsLabels });
    }
    if (genresData?.fsGenres) {
      dispatch({ type: 'UPDATE_GENRE_RESULTS', payload: genresData.fsGenres });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilesData, cratesData, albumsData, labelsData, genresData]);

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
          }}
        >
          <h5>{`Labels/Tags`}</h5>
        </button>
        <button
          onClick={() => {
            setActivePane('genresAndSubgenres');
            getGenreResults();
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
                currentLabels.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.labelState.currentPage * 30 - 1}
                      getMoreItems={() => {
                        dispatch({
                          type: 'UPDATE_LABEL_CURRENT_PAGE',
                          payload: resultsState.labelState.currentPage + 1,
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
                currentGenres.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult
                      data={result}
                      index={index}
                      lastSlice={resultsState.genreState.currentPage * 30 - 1}
                      getMoreItems={() => {
                        dispatch({
                          type: 'UPDATE_GENRE_CURRENT_PAGE',
                          payload: resultsState.genreState.currentPage + 1,
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
