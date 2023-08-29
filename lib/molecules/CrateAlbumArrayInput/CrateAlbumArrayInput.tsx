import { ErrorMessage, FieldArray, Field } from 'formik';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from 'react';
import cx from 'classnames';
import { CrateAlbumInput } from '../CrateAlbumInput/CrateAlbumInput';
import { AlbumSearchCombobox } from '../AlbumSearchCombobox/AlbumSearchCombobox';
import { SEARCH_PRISMA_ALBUMS } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

interface CrateAlbumArrayInputProps {
  value: any[];
}

interface QueriedAlbum {
  id?: number;
  title: string;
  artist;
  string;
  imageUrl: string;
  discogsMasterId: string;
  isNew?: boolean;
}

const CrateAlbumArrayInput = ({ value }: CrateAlbumArrayInputProps) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_PRISMA_ALBUMS);
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<QueriedAlbum>(null);

  const searchResults = data?.searchPrismaAlbums;

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
                // If album has a Prisma Id, then return the Prisma object
                if (album.id) {
                  push(album);
                }
                // Otherwise, mark the object as an item that needs to be added to the db
                else {
                  push({
                    ...album,
                    isNew: true,
                  });
                }
              }}
              updateSearchPrompt={setSearchPrompt}
              updateSelectedAlbum={setSelectedAlbum}
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
