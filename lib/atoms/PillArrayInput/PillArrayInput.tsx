import { ErrorMessage, FieldArray, Field } from 'formik';
import { useState } from 'react';
import { X, Plus } from '@phosphor-icons/react';
import cx from 'classnames';

interface PillArrayProps {
  name: string;
  value: string[];
  onChange?: (event) => void;
  label: string;
}

const PillArray = ({ name, value, onChange, label }: PillArrayProps) => {
  const [showAddPill, setShowAddPill] = useState<boolean>(false);
  const [newPill, setNewPill] = useState<string>('');

  // console.log(value);

  return (
    <>
      <label>
        <h4>{label}</h4>
      </label>
      <FieldArray name={name}>
        {({ insert, remove, push }) => (
          <div className={cx('pillArray')}>
            {value.length > 0 &&
              value.map((pill, index) => (
                <div key={index} className={cx('pill')}>
                  <p className={cx('pillName')}>{pill}</p>
                  <button onClick={() => remove(index)}>
                    <X />
                  </button>
                </div>
              ))}
            {showAddPill ? (
              <div>
                <Field
                  name={`${name}[${value.length}]`}
                  value={newPill}
                  onChange={event => {
                    setNewPill(event.target.value);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      push(newPill);
                      setShowAddPill(false);
                      setNewPill('');
                    }
                  }}
                />
              </div>
            ) : (
              <button onClick={() => setShowAddPill(true)} className={cx('addButton')} type="button">
                <Plus />
              </button>
            )}
          </div>
        )}
      </FieldArray>
    </>
  );
};

export { PillArray };
