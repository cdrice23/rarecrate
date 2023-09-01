import { ErrorMessage, FieldArray, Field } from 'formik';
import { useState, useEffect } from 'react';
import cx from 'classnames';
import { CrateAlbumInput } from '../CrateAlbumInput/CrateAlbumInput';
import { AlbumSearchCombobox } from '../AlbumSearchCombobox/AlbumSearchCombobox';
import { SEARCH_PRISMA_ALBUMS } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

interface CrateAlbumArrayInputProps {
  value: any[];
}

type QueriedAlbum = {
  id?: number;
  title: string;
  artist: string;
  imageUrl: string;
  discogsMasterId: string;
  isNew?: boolean;
};

const CrateAlbumArrayInput = ({ value }: CrateAlbumArrayInputProps) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_PRISMA_ALBUMS);
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  const [triggerDiscogsSearch, setTriggerDiscogsSearch] = useState<boolean>(false);

  const searchResults = data?.searchPrismaAlbums;

  // Check if search returns db items, otherwise trigger a discogs search
  useEffect(() => {
    if (data && data.searchPrismaAlbums.length === 0) {
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
        {({ insert, remove, push }) => (
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
                  <CrateAlbumInput data={album} key={index} id={index} removeHandler={() => remove(index)} />
                ))}
            </div>
          </>
        )}
      </FieldArray>
    </>
  );
};

export { CrateAlbumArrayInput };
