import cx from 'classnames';
import { FieldArray } from 'formik';
import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_PRISMA_ALBUMS_BY_NAME } from '@/db/graphql/clientOperations/search';
import { CrateAlbumInput } from '../CrateAlbumInput/CrateAlbumInput';
import { AlbumSearchCombobox } from '../AlbumSearchCombobox/AlbumSearchCombobox';
import {
  CrateAlbumArrayInputProps,
  QueriedAlbum,
} from '@/lib/molecules/CrateAlbumArrayInput/CrateAlbumArrayInput.types';

const CrateAlbumArrayInput = ({ value, isRanked }: CrateAlbumArrayInputProps) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_PRISMA_ALBUMS_BY_NAME);
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  const [triggerDiscogsSearch, setTriggerDiscogsSearch] = useState<boolean>(false);

  const searchResults = data?.searchPrismaAlbumsByName;

  // Check if search returns db items, otherwise trigger a discogs search
  useEffect(() => {
    if (data && data.searchPrismaAlbumsByName.length === 0) {
      // Query completed, but no results were returned
      setTriggerDiscogsSearch(true);
    } else {
      setTriggerDiscogsSearch(false);
    }
  }, [data]);

  return (
    <>
      <label>
        <h4>{`Albums`}</h4>
      </label>
      <FieldArray name={'crateAlbums'}>
        {({ insert, remove, push, form: { setFieldValue } }) => (
          <>
            <AlbumSearchCombobox
              value={searchPrompt}
              listItems={searchResults ?? []}
              loading={loading}
              searchQuery={searchQuery}
              enterHandler={album => {
                if (album) {
                  // If album has a Prisma Id, then return the Prisma object
                  if (album.id) {
                    push(album as QueriedAlbum);
                  }
                  // Otherwise, mark the object as an item that needs to be added to the db
                  else {
                    push({
                      ...album,
                      isNew: true,
                    } as QueriedAlbum);
                  }
                }
              }}
              updateSearchPrompt={setSearchPrompt}
              triggerDiscogsSearch={triggerDiscogsSearch}
            />
            <div className={cx('albumArray')}>
              {value.length > 0 &&
                value.map((album, index) => (
                  <CrateAlbumInput
                    data={album}
                    key={index}
                    id={index}
                    removeHandler={() => remove(index)}
                    initialRank={isRanked ? index + 1 : null}
                    setFieldValue={setFieldValue}
                    isRanked={isRanked}
                  />
                ))}
            </div>
          </>
        )}
      </FieldArray>
    </>
  );
};

export { CrateAlbumArrayInput };
