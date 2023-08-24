import { ErrorMessage, FieldArray, Field } from 'formik';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from 'react';
import { Plus, X } from '@phosphor-icons/react';
import cx from 'classnames';
import { CrateAlbumInput } from '../CrateAlbumInput/CrateAlbumInput';

interface CrateAlbumArrayInputProps {
  value: any[];
}

const CrateAlbumArrayInput = ({ value }: CrateAlbumArrayInputProps) => {
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  // console.log(value);

  return (
    <>
      <label>
        <h4>{`Albums`}</h4>
      </label>
      <FieldArray name={'crateAlbums'}>
        {({ insert, remove, push, form: { setFieldValue } }) => (
          <>
            <Field
              name={'AlbumSearch'}
              value={searchPrompt}
              placeholder="Search Albums"
              onChange={event => setSearchPrompt(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  push({ title: searchPrompt, artist: 'The Band', tags: [] });
                  setSearchPrompt('');
                }
              }}
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
