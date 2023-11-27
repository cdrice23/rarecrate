import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from 'react';
import { FieldArray } from 'formik';
import { Plus } from '@phosphor-icons/react';
import { Pill } from '../Pill/Pill';
import { DropdownCombobox } from '../DropdownCombobox/DropdownCombobox';
import { PillArrayInputProps } from '@/lib/atoms/PillArrayInput/PillArrayInput.types';

const PillArrayInput = ({
  name,
  value,
  label,
  itemLabel,
  listItems,
  loading,
  searchQuery,
  type,
}: PillArrayInputProps) => {
  const [showAddPill, setShowAddPill] = useState<boolean>(false);
  const [newPill, setNewPill] = useState<string>('');

  return (
    <>
      <div className={cx(`${type}`)}>
        <label>
          <h4>{label}</h4>
        </label>
        <FieldArray name={name}>
          {({ insert, remove, push }) => (
            <div className={cx('pillArray')}>
              {value.length > 0 &&
                value.map((pill, index) => (
                  <Pill key={index} name={pill[itemLabel]} removeHandler={() => remove(index)} />
                ))}
              {showAddPill ? (
                <OutsideClickHandler onOutsideClick={() => setShowAddPill(false)}>
                  <DropdownCombobox
                    listItems={listItems}
                    loading={loading}
                    searchQuery={searchQuery}
                    itemLabel={itemLabel}
                    enterHandler={() => {
                      // If newPill is in the itemArray, push the existing item into the array
                      const existingItem = listItems.find(
                        obj => obj[itemLabel].toLowerCase() === newPill.toLowerCase(),
                      );
                      if (existingItem) {
                        push(existingItem);
                      }
                      // Otherwise, push a new item into the array
                      else {
                        push({
                          isNew: true,
                          [itemLabel]: newPill.toLowerCase(),
                        });
                      }
                      // Do cleanup
                      setShowAddPill(false);
                      setNewPill('');
                    }}
                    updateNewItem={setNewPill}
                  />
                </OutsideClickHandler>
              ) : (
                <button onClick={() => setShowAddPill(true)} className={cx('addButton')} type="button">
                  <Plus />
                </button>
              )}
            </div>
          )}
        </FieldArray>
      </div>
    </>
  );
};

export { PillArrayInput };
