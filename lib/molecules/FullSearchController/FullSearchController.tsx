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
import { useLocalState } from '@/lib/context/state';

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

const FullSearchController = ({
  searchPrompt,
  activePane,
  prevActivePane,
  searchPath,
  setSearchPath,
  setActivePane,
  setPrevActivePane,
}: FullSearchControllerProps) => {
  const { profileIdMain } = useLocalState();
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
  const currentCrates = resultsState.crateState.results.filter(
    item =>
      !(
        item.__typename === 'Crate' &&
        item.creator.isPrivate &&
        item.creator.followers.some(follower => follower.id !== profileIdMain)
      ),
  );
  const currentAlbums = resultsState.albumState.results;
  const currentLabelsAndTags = resultsState.labelAndTagState.results || [];
  const currentGenresAndSubgenres =
    resultsState.genreAndSubgenreState.results.slice(0, resultsState.genreAndSubgenreState.currentPage * 30) || [];
  const currentCratesFromLabel = resultsState.cratesFromLabelState.results.filter(
    item =>
      !(
        item.__typename === 'Crate' &&
        item.creator.isPrivate &&
        item.creator.followers.some(follower => follower.id !== profileIdMain)
      ),
  );
  const currentAlbumsFromTag = resultsState.albumsFromTagState.results;
  const currentAlbumsFromGenre = resultsState.albumsFromGenreState.results;
  const currentAlbumsFromSubgenre = resultsState.albumsFromSubgenreState.results;
  const currentCratesFromAlbum = resultsState.cratesFromAlbumState.results.filter(
    item =>
      !(
        item.__typename === 'Crate' &&
        item.creator.isPrivate &&
        item.creator.followers.some(follower => follower.id !== profileIdMain)
      ),
  );

  console.log(resultsState);

  const getLabelAndTagResults = async newPage => {
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

  const getGenreAndSubgenreResults = async newPage => {
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

  useEffect(() => {
    if (resultsState.profileState.results.length === 0) {
      getProfileResults({
        variables: {
          searchTerm: searchPrompt,
          currentPage: resultsState.profileState.currentPage,
        },
      });
    }

    if (profilesData?.fsProfiles && activePane === 'profiles') {
      let sortedPayload =
        [...profilesData?.fsProfiles].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
      dispatch({ type: 'UPDATE_PROFILE_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_PROFILE_CURRENT_PAGE',
        payload: resultsState.profileState.currentPage + 1,
      });
    }
    if (cratesData?.fsCrates && activePane === 'crates') {
      let sortedPayload =
        [...cratesData?.fsCrates].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
      dispatch({ type: 'UPDATE_CRATE_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_CRATE_CURRENT_PAGE',
        payload: resultsState.crateState.currentPage + 1,
      });
    }
    if (albumsData?.fsAlbums && activePane === 'albums') {
      let sortedPayload =
        [...albumsData?.fsAlbums].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
      dispatch({ type: 'UPDATE_ALBUM_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_ALBUM_CURRENT_PAGE',
        payload: resultsState.albumState.currentPage + 1,
      });
    }
    // update below
    if (cratesFromLabelData?.getCratesFromLabel && activePane === 'cratesFromLabel') {
      let sortedPayload =
        [...cratesFromLabelData?.getCratesFromLabel].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) ||
        [];
      dispatch({ type: 'UPDATE_CRATES_FROM_LABEL_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_CRATES_FROM_LABEL_CURRENT_PAGE',
        payload: resultsState.cratesFromLabelState.currentPage + 1,
      });
    }
    if (albumsFromTagData?.getAlbumsFromTag && activePane === 'albumsFromTag') {
      let sortedPayload =
        [...albumsFromTagData?.getAlbumsFromTag].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) || [];
      dispatch({ type: 'UPDATE_ALBUMS_FROM_TAG_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_ALBUMS_FROM_TAG_CURRENT_PAGE',
        payload: resultsState.albumsFromTagState.currentPage + 1,
      });
    }
    if (albumsFromGenreData?.getAlbumsFromGenre && activePane === 'albumsFromGenre') {
      let sortedPayload =
        [...albumsFromGenreData?.getAlbumsFromGenre].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) ||
        [];
      dispatch({ type: 'UPDATE_ALBUMS_FROM_GENRE_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_ALBUMS_FROM_GENRE_CURRENT_PAGE',
        payload: resultsState.albumsFromGenreState.currentPage + 1,
      });
    }
    if (albumsFromSubgenreData?.getAlbumsFromSubgenre && activePane === 'albumsFromSubgenre') {
      let sortedPayload =
        [...albumsFromSubgenreData?.getAlbumsFromSubgenre].sort(
          (a, b) => b.searchAndSelectCount - a.searchAndSelectCount,
        ) || [];
      dispatch({ type: 'UPDATE_ALBUMS_FROM_SUBGENRE_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_ALBUMS_FROM_SUBGENRE_CURRENT_PAGE',
        payload: resultsState.albumsFromSubgenreState.currentPage + 1,
      });
    }
    if (cratesFromAlbumData?.getCratesFromAlbum && activePane === 'cratesFromAlbum') {
      let sortedPayload =
        [...cratesFromAlbumData?.getCratesFromAlbum].sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount) ||
        [];
      dispatch({ type: 'UPDATE_CRATES_FROM_ALBUM_RESULTS', payload: sortedPayload });
      dispatch({
        type: 'UPDATE_CRATES_FROM_ALBUM_CURRENT_PAGE',
        payload: resultsState.cratesFromAlbumState.currentPage + 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activePane,
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
          onClick={async () => {
            setActivePane('labelsAndTags');
            setPrevActivePane(null);
            await getLabelAndTagResults(resultsState.labelAndTagState.currentPage);
            setSearchPath({});
          }}
        >
          <h5>{`Labels/Tags`}</h5>
        </button>
        <button
          className={cx({ active: activePane === 'genresAndSubgenres' })}
          onClick={async () => {
            setActivePane('genresAndSubgenres');
            setPrevActivePane(null);
            await getGenreAndSubgenreResults(resultsState.genreAndSubgenreState.currentPage);
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
                          currentPage: resultsState.profileState.currentPage,
                        },
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
                        variables: { searchTerm: searchPrompt, currentPage: resultsState.crateState.currentPage },
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
                        variables: { searchTerm: searchPrompt, currentPage: resultsState.albumState.currentPage },
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albums');
                        dispatch({ type: 'RESET_CRATES_FROM_ALBUM_RESULTS' });
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
                    getMoreItems={async () => {
                      await getLabelAndTagResults(resultsState.labelAndTagState.currentPage);
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Label') {
                        setActivePane('cratesFromLabel');
                        setPrevActivePane('labelsAndTags');
                        dispatch({ type: 'RESET_CRATES_FROM_LABEL_RESULTS' });
                        getCratesFromLabel({
                          variables: { labelId: searchId, currentPage: resultsState.cratesFromLabelState.currentPage },
                        });
                      } else {
                        setActivePane('albumsFromTag');
                        setPrevActivePane('labelsAndTags');
                        dispatch({ type: 'RESET_ALBUMS_FROM_TAG_RESULTS' });
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
                  getNextPane={(type, searchId) => {
                    if (type === 'Genre') {
                      setActivePane('albumsFromGenre');
                      setPrevActivePane('genresAndSubgenres');
                      dispatch({ type: 'RESET_ALBUMS_FROM_GENRE_RESULTS' });
                      getAlbumsFromGenre({
                        variables: { genreId: searchId, currentPage: resultsState.albumsFromGenreState.currentPage },
                      });
                    } else {
                      setActivePane('albumsFromSubgenre');
                      setPrevActivePane('genresAndSubgenres');
                      dispatch({ type: 'RESET_ALBUMS_FROM_SUBGENRE_RESULTS' });
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
                          currentPage: resultsState.cratesFromLabelState.currentPage,
                        },
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
                          currentPage: resultsState.albumsFromTagState.currentPage,
                        },
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albumsFromTag');
                        dispatch({ type: 'RESET_CRATES_FROM_ALBUM_RESULTS' });
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
                          currentPage: resultsState.albumsFromGenreState.currentPage,
                        },
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albumsFromGenre');
                        dispatch({ type: 'RESET_CRATES_FROM_ALBUM_RESULTS' });
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
                          currentPage: resultsState.albumsFromSubgenreState.currentPage,
                        },
                      });
                    }}
                    getNextPane={(type, searchId) => {
                      if (type === 'Album') {
                        setActivePane('cratesFromAlbum');
                        setPrevActivePane('albumsFromSubgenre');
                        dispatch({ type: 'RESET_CRATES_FROM_ALBUM_RESULTS' });
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
                          albumId: !prevActivePane ? searchPath.topTier.id : searchPath.midTier.id,
                          currentPage: resultsState.cratesFromAlbumState.currentPage,
                        },
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
