import { useState, useEffect, useReducer } from 'react';
import { useLazyQuery } from '@apollo/client';
import { FS_PROFILES, FS_CRATES, FS_ALBUMS, FS_LABELS, FS_GENRES } from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';

interface FullSearchPaneProps {
  searchPrompt: string;
}

const initialResultsState = {
  profileResults: [],
  crateResults: [],
  albumResults: [],
  labelResults: [],
  genreResults: [],
};

const resultsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE_RESULTS':
      return { ...state, profileResults: action.payload };
    case 'UPDATE_CRATE_RESULTS':
      return { ...state, crateResults: action.payload };
    case 'UPDATE_ALBUM_RESULTS':
      return { ...state, albumResults: action.payload };
    case 'UPDATE_LABEL_RESULTS':
      return { ...state, labelResults: action.payload };
    case 'UPDATE_GENRE_RESULTS':
      return { ...state, genreResults: action.payload };
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

  console.log(resultsState);

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
                resultsState.profileResults.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult data={result} />
                  </li>
                ))
              );
            case 'crates':
              return loadingCrates ? (
                <li>Loading Crates...</li>
              ) : (
                resultsState.crateResults.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult data={result} />
                  </li>
                ))
              );
            case 'albums':
              return loadingAlbums ? (
                <li>Loading Albums...</li>
              ) : (
                resultsState.albumResults.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult data={result} />
                  </li>
                ))
              );
            case 'labelsAndTags':
              return loadingLabels ? (
                <li>Loading Labels/Tags...</li>
              ) : (
                resultsState.labelResults.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult data={result} />
                  </li>
                ))
              );
            case 'genresAndSubgenres':
              return loadingGenres ? (
                <li>Loading Genres/Subgenres...</li>
              ) : (
                resultsState.genreResults.map((result, index) => (
                  <li key={index}>
                    <GlobalSearchResult data={result} />
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
