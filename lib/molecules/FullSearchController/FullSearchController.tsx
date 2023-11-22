import cx from 'classnames';
import { useEffect, useReducer } from 'react';
import { Tag, VinylRecord, SquaresFour } from '@phosphor-icons/react';
import { useLocalState } from '@/lib/context/state';
import { Pill } from '@/lib/atoms/Pill/Pill';
import { FullSearchPane } from '../FullSearchPane/FullSearchPane';
import {
  initialResultsState,
  resultsReducer,
  useLazyQueries,
  getLabelAndTagResults,
  getGenreAndSubgenreResults,
} from './FullSearchController.helpers';
import { FullSearchControllerProps } from '@/types/molecules/FullSearchController.types';

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
  const {
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
  } = useLazyQueries(searchPrompt);

  const currentProfiles = resultsState.profileState.results;
  const currentCrates = resultsState.crateState.results.filter(
    item =>
      !(
        item.__typename === 'Crate' &&
        item.creator.isPrivate &&
        !item.creator.followers.some(follower => follower.id === profileIdMain)
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
        !item.creator.followers.some(follower => follower.id === profileIdMain)
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
        !item.creator.followers.some(follower => follower.id === profileIdMain)
      ),
  );

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
            await getLabelAndTagResults(
              searchPrompt,
              resultsState,
              dispatch,
              getLabelResults,
              getTagResults,
              resultsState.labelAndTagState.currentPage,
            );
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
            await getGenreAndSubgenreResults(
              searchPrompt,
              resultsState,
              dispatch,
              getGenreResults,
              getSubgenreResults,
              resultsState.genreAndSubgenreState.currentPage,
            );
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
                      await getLabelAndTagResults(
                        searchPrompt,
                        resultsState,
                        dispatch,
                        getLabelResults,
                        getTagResults,
                        resultsState.labelAndTagState.currentPage,
                      );
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
