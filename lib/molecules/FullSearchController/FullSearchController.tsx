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
import { Pill } from '@/lib/atoms/Pill/Pill';
import { Tag, VinylRecord, SquaresFour } from '@phosphor-icons/react';

interface FullSearchControllerProps {
  searchPrompt: string;
  activePane: PaneType;
  prevActivePane: PaneType;
  searchPath: {
    topTier?: { type: string; name: string; id: number };
    midTier?: { type: string; name: string; id: number };
  };
  setSearchPath: (value) => void;
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
    default:
      return state;
  }
};

const FullSearchController = ({
  searchPrompt,
  activePane,
  prevActivePane,
  searchPath,
  setSearchPath,
  setActivePane,
  setPrevActivePane,
}: FullSearchControllerProps) => {
  const [resultsState, dispatch] = useReducer(resultsReducer, initialResultsState);
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

  const currentProfiles = resultsState.profileState.results;
  const currentCrates = resultsState.crateState.results;
  const currentAlbums = resultsState.albumState.results;
  const currentLabelsAndTags =
    resultsState.labelAndTagState.results.sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
  const currentGenresAndSubgenres =
    resultsState.genreAndSubgenreState.results
      .slice(0, resultsState.genreAndSubgenreState.currentPage * 30)
      .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
  const currentCratesFromLabel = resultsState.cratesFromLabelState.results;
  const currentAlbumsFromTag = resultsState.albumsFromTagState.results;
  const currentAlbumsFromGenre = resultsState.albumsFromGenreState.results;
  const currentAlbumsFromSubgenre = resultsState.albumsFromSubgenreState.results;
  const currentCratesFromAlbum = resultsState.cratesFromAlbumState.results;

  console.log(resultsState);
  // console.log(cratesFromLabelData);
  console.log(searchPath);

  useEffect(() => {
    if (resultsState.profileState.results.length === 0) {
      getProfileResults({
        variables: {
          searchTerm: searchPrompt,
          currentPage: resultsState.profileState.currentPage,
        },
      });
    }

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
          className={cx({ active: activePane === 'profiles' })}
          onClick={() => {
            setActivePane('profiles');
            setPrevActivePane(null);
            setSearchPath({});
            dispatch({
              type: 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE',
              payload: 1,
            });
          }}
        >
          <h5>{`Profiles`}</h5>
        </button>
        <button
          className={cx({ active: activePane === 'crates' })}
          onClick={() => {
            setActivePane('crates');
            setPrevActivePane(null);
            getCrateResults({
              variables: { searchTerm: searchPrompt, currentPage: resultsState.crateState.currentPage },
            });
            setSearchPath({});
            dispatch({
              type: 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE',
              payload: 1,
            });
          }}
        >
          <h5>{`Crates`}</h5>
        </button>
        <button
          className={cx({ active: activePane === 'albums' })}
          onClick={() => {
            setActivePane('albums');
            setPrevActivePane(null);
            getAlbumResults({
              variables: { searchTerm: searchPrompt, currentPage: resultsState.albumState.currentPage },
            });
            setSearchPath({});
          }}
        >
          <h5>{`Albums`}</h5>
        </button>
        <button
          className={cx({
            active:
              activePane === 'labelsAndTags' ||
              activePane === 'cratesFromLabel' ||
              activePane === 'albumsFromTag' ||
              (activePane === 'cratesFromAlbum' && prevActivePane === 'albumsFromTag'),
          })}
          onClick={() => {
            setActivePane('labelsAndTags');
            setPrevActivePane(null);
            getLabelResults({
              variables: { searchTerm: searchPrompt, currentPage: resultsState.labelAndTagState.currentPage },
            });
            getTagResults({
              variables: { searchTerm: searchPrompt, currentPage: resultsState.labelAndTagState.currentPage },
            });
            setSearchPath({});
          }}
        >
          <h5>{`Labels/Tags`}</h5>
        </button>
        <button
          className={cx({ active: activePane === 'genresAndSubgenres' })}
          onClick={() => {
            setActivePane('genresAndSubgenres');
            setPrevActivePane(null);
            getGenreResults();
            getSubgenreResults();
            setSearchPath({});
          }}
        >
          <h5>{`Genres/Subgenres`}</h5>
        </button>
      </div>
      <div className={cx('pathBar')}>
        {searchPath.topTier && (
          <Pill
            name={searchPath.topTier.name}
            icon={(() => {
              switch (searchPath.topTier.type) {
                case 'label':
                case 'tag':
                  return <Tag />;
                case 'genre':
                case 'subgenre':
                  return <SquaresFour />;
                default:
                  return null;
              }
            })()}
            removeHandler={() => {
              switch (searchPath.topTier.type) {
                case 'label':
                case 'tag':
                  setActivePane('labelsAndTags');
                  setSearchPath({});
                  break;
                case 'genre':
                case 'subgenre':
                  setActivePane('genresAndSubgenres');
                  setSearchPath({});
                  break;
                case 'album':
                  setActivePane('albums');
                  setSearchPath({});
                default:
                  return null;
              }
            }}
          />
        )}
        {searchPath.midTier && (
          <Pill
            name={searchPath.midTier.name}
            icon={<VinylRecord />}
            removeHandler={() => {
              setActivePane(prevActivePane);
              setSearchPath({ ...searchPath, midTier: null });
            }}
          />
        )}
      </div>
      <ul className={cx('searchMenu')}>
        {(() => {
          switch (activePane) {
            case 'profiles':
              return loadingProfiles && resultsState.profileState.currentPage === 1 ? (
                <li>Loading Profiles...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentProfiles}
                    currentPage={resultsState.profileState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getProfileResults({
                        variables: {
                          searchTerm: searchPrompt,
                          currentPage: resultsState.profileState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_PROFILE_CURRENT_PAGE',
                        payload: resultsState.profileState.currentPage + 1,
                      });
                    }}
                  />
                  {loadingProfiles && resultsState.profileState.currentPage > 1 && <li>Loading more Profiles...</li>}
                </>
              );
            case 'crates':
              return loadingCrates && resultsState.crateState.currentPage === 1 ? (
                <li>Loading Crates...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentCrates}
                    currentPage={resultsState.crateState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getCrateResults({
                        variables: { searchTerm: searchPrompt, currentPage: resultsState.crateState.currentPage + 1 },
                      });
                      dispatch({
                        type: 'UPDATE_CRATE_CURRENT_PAGE',
                        payload: resultsState.crateState.currentPage + 1,
                      });
                    }}
                  />
                  {loadingCrates && resultsState.crateState.currentPage > 1 && <li>Loading more Crates...</li>}
                </>
              );
            case 'albums':
              return loadingAlbums && resultsState.albumState.currentPage === 1 ? (
                <li>Loading Albums...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentAlbums}
                    currentPage={resultsState.albumState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getAlbumResults({
                        variables: { searchTerm: searchPrompt, currentPage: resultsState.albumState.currentPage + 1 },
                      });
                      dispatch({
                        type: 'UPDATE_ALBUM_CURRENT_PAGE',
                        payload: resultsState.albumState.currentPage + 1,
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albums');
                        getCratesFromAlbum({
                          variables: { albumId: searchId, currentPage: resultsState.cratesFromAlbumState.currentPage },
                        });
                      } else {
                        return;
                      }
                    }}
                  />
                  {loadingAlbums && resultsState.albumState.currentPage > 1 && <li>Loading more Albums...</li>}
                </>
              );
            case 'labelsAndTags':
              return (loadingLabels || loadingTags) && resultsState.labelAndTagState.currentPage === 1 ? (
                <li>Loading Labels/Tags...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentLabelsAndTags}
                    currentPage={resultsState.labelAndTagState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getLabelResults({
                        variables: {
                          searchTerm: searchPrompt,
                          currentPage: resultsState.labelAndTagState.currentPage + 1,
                        },
                      });
                      getTagResults({
                        variables: {
                          searchTerm: searchPrompt,
                          currentPage: resultsState.labelAndTagState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_LABEL_AND_TAG_CURRENT_PAGE',
                        payload: resultsState.labelAndTagState.currentPage + 1,
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Label') {
                        setActivePane('cratesFromLabel');
                        setPrevActivePane('labelsAndTags');
                        getCratesFromLabel({
                          variables: { labelId: searchId, currentPage: resultsState.cratesFromLabelState.currentPage },
                        });
                      } else {
                        setActivePane('albumsFromTag');
                        setPrevActivePane('labelsAndTags');
                        getAlbumsFromTag({
                          variables: { tagId: searchId, currentPage: resultsState.albumsFromTagState.currentPage },
                        });
                      }
                    }}
                  />
                  {(loadingLabels || loadingTags) && resultsState.labelAndTagState.currentPage > 1 && (
                    <li>Loading more Labels/Tags...</li>
                  )}
                </>
              );
            case 'genresAndSubgenres':
              return loadingGenres || loadingSubgenres ? (
                <li>Loading Genres/Subgenres...</li>
              ) : (
                <FullSearchPane
                  currentItems={currentGenresAndSubgenres}
                  currentPage={resultsState.genreAndSubgenreState.currentPage}
                  searchPath={searchPath}
                  setSearchPath={setSearchPath}
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
                      getAlbumsFromGenre({
                        variables: { genreId: searchId, currentPage: resultsState.albumsFromGenreState.currentPage },
                      });
                    } else {
                      setActivePane('albumsFromSubgenre');
                      setPrevActivePane('genresAndSubgenres');
                      getAlbumsFromSubgenre({
                        variables: {
                          subgenreId: searchId,
                          currentPage: resultsState.albumsFromSubgenreState.currentPage,
                        },
                      });
                    }
                  }}
                />
              );
            case 'cratesFromLabel':
              return loadingCratesFromLabel && resultsState.cratesFromLabelState.currenPage === 1 ? (
                <li>Loading Crates from Label...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentCratesFromLabel}
                    currentPage={resultsState.cratesFromLabelState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getCratesFromLabel({
                        variables: {
                          labelId: searchPath.topTier.id,
                          currentPage: resultsState.cratesFromLabelState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_CRATES_FROM_LABEL_CURRENT_PAGE',
                        payload: resultsState.cratesFromLabelState.currentPage + 1,
                      });
                    }}
                  />
                  {loadingCratesFromLabel && resultsState.cratesFromLabelState.currentPage > 1 && (
                    <li>Loading more Crates...</li>
                  )}
                </>
              );
            case 'albumsFromTag':
              return loadingAlbumsFromTag && resultsState.albumsFromTagState.currentPage === 1 ? (
                <li>Loading Albums from Tag...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentAlbumsFromTag}
                    currentPage={resultsState.albumsFromTagState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getAlbumsFromTag({
                        variables: {
                          tagId: searchPath.topTier.id,
                          currentPage: resultsState.albumsFromTagState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_ALBUMS_FROM_TAG_CURRENT_PAGE',
                        payload: resultsState.albumsFromTagState.currentPage + 1,
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albumsFromTag');
                        getCratesFromAlbum({
                          variables: { albumId: searchId, currentPage: resultsState.cratesFromAlbumState.currentPage },
                        });
                      } else {
                        return;
                      }
                    }}
                  />
                  {loadingAlbumsFromTag && resultsState.albumsFromTagState.currentPage > 1 && (
                    <li>Loading more Albums...</li>
                  )}
                </>
              );
            case 'albumsFromGenre':
              return loadingAlbumsFromGenre && resultsState.albumsFromGenreState.currentPage === 1 ? (
                <li>Loading Albums from Genre...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentAlbumsFromGenre}
                    currentPage={resultsState.albumsFromGenreState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getAlbumsFromGenre({
                        variables: {
                          genreId: searchPath.topTier.id,
                          currentPage: resultsState.albumsFromGenreState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_ALBUMS_FROM_GENRE_CURRENT_PAGE',
                        payload: resultsState.albumsFromGenreState.currentPage + 1,
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albumsFromGenre');
                        getCratesFromAlbum({
                          variables: { albumId: searchId, currentPage: resultsState.cratesFromAlbumState.currentPage },
                        });
                      } else {
                        return;
                      }
                    }}
                  />
                  {loadingAlbumsFromGenre && resultsState.albumsFromGenreState.currentPage > 1 && (
                    <li>Loading more Albums...</li>
                  )}
                </>
              );
            case 'albumsFromSubgenre':
              return loadingAlbumsFromSubgenre && resultsState.albumsFromSubgenreState.currentPage === 1 ? (
                <li>Loading Albums from Subgenre...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentAlbumsFromSubgenre}
                    currentPage={resultsState.albumsFromSubgenreState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getAlbumsFromSubgenre({
                        variables: {
                          subgenreId: searchPath.topTier.id,
                          currentPage: resultsState.albumsFromSubgenreState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_ALBUMS_FROM_SUBGENRE_CURRENT_PAGE',
                        payload: resultsState.albumsFromSubgenreState.currentPage + 1,
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albumsFromSubgenre');
                        getCratesFromAlbum({
                          variables: { albumId: searchId, currentPage: resultsState.cratesFromAlbumState.currentPage },
                        });
                      } else {
                        return;
                      }
                    }}
                  />
                  {loadingAlbumsFromSubgenre && resultsState.albumsFromSubgenreState.currentPage > 1 && (
                    <li>Loading more Albums...</li>
                  )}
                </>
              );
            case 'cratesFromAlbum':
              return loadingCratesFromAlbum && resultsState.cratesFromAlbumState.currentPage === 1 ? (
                <li>Loading Crates from Album...</li>
              ) : (
                <>
                  <FullSearchPane
                    currentItems={currentCratesFromAlbum}
                    currentPage={resultsState.cratesFromAlbumState.currentPage}
                    searchPath={searchPath}
                    setSearchPath={setSearchPath}
                    getMoreItems={() => {
                      getCratesFromAlbum({
                        variables: {
                          albumId: searchPath.midTier.id,
                          currentPage: resultsState.cratesFromAlbumState.currentPage + 1,
                        },
                      });
                      dispatch({
                        type: 'UPDATE_CRATES_FROM_ALBUM_CURRENT_PAGE',
                        payload: resultsState.cratesFromAlbumState.currentPage + 1,
                      });
                    }}
                  />
                  {loadingCratesFromAlbum && resultsState.cratesFromAlbumState.currentPage > 1 && (
                    <li>Loading more Crates...</li>
                  )}
                </>
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
