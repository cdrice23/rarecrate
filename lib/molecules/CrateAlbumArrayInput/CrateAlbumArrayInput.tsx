import { ErrorMessage, FieldArray, Field } from 'formik';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from 'react';
import { Plus, X } from '@phosphor-icons/react';
import cx from 'classnames';
import { CrateAlbumInput } from '../CrateAlbumInput/CrateAlbumInput';

interface CrateAlbumArrayInputProps {
  name: string;
  value: any[];
}

const CrateAlbumArrayInput = ({ name, value }: CrateAlbumArrayInputProps) => {
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  // console.log(searchPrompt);
  // const [newPill, setNewPill] = useState<string>('');
  console.log(value);

  return (
    <>
      <label>
        <h4>{`Albums`}</h4>
      </label>
      <FieldArray name={name}>
        {({ insert, remove, push, form: { setFieldValue } }) => (
          <>
            <Field
              name={'AlbumSearch'}
              value={searchPrompt}
              placeholder="Search Albums"
              onChange={event => setSearchPrompt(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  // console.log(`You're searching for: ${searchPrompt}`);
                  push({ title: searchPrompt, artist: 'The Band' });
                }
              }}
            />
            <div className={cx('albumArray')}>
              {value.length > 0 &&
                value.map((album, index) => (
                  <CrateAlbumInput
                    data={album}
                    key={index}
                    removeHandler={() => remove(index)}
                    tagHandler={tag => {
                      let newValue = [...value];
                      newValue[index].tag = tag;
                      setFieldValue(name, newValue);
                    }}
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
