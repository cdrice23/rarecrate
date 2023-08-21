import { ErrorMessage, FieldArray, Field } from 'formik';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from 'react';
import { X, Plus } from '@phosphor-icons/react';
import cx from 'classnames';
import { Pill } from '../Pill/Pill';
import { DropdownCombobox } from '../DropdownCombobox/DropdownCombobox';

interface PillArrayProps {
  name: string;
  value: string[];
  onChange?: (event) => void;
  label: string;
}

const exampleLabels = [
  { id: 1, name: 'Neptunium' },
  { id: 2, name: 'Plutonium' },
  { id: 3, name: 'Americium' },
  { id: 4, name: 'Curium' },
  { id: 5, name: 'Berkelium' },
  { id: 6, name: 'Californium' },
  { id: 7, name: 'Einsteinium' },
  { id: 8, name: 'Fermium' },
  { id: 9, name: 'Mendelevium' },
  { id: 10, name: 'Nobelium' },
  { id: 11, name: 'Lawrencium' },
  { id: 12, name: 'Rutherfordium' },
  { id: 13, name: 'Dubnium' },
  { id: 14, name: 'Seaborgium' },
  { id: 15, name: 'Bohrium' },
  { id: 16, name: 'Hassium' },
  { id: 17, name: 'Meitnerium' },
  { id: 18, name: 'Darmstadtium' },
  { id: 19, name: 'Roentgenium' },
  { id: 20, name: 'Copernicium' },
  { id: 21, name: 'Nihonium' },
  { id: 22, name: 'Flerovium' },
  { id: 23, name: 'Moscovium' },
  { id: 24, name: 'Livermorium' },
  { id: 25, name: 'Tennessine' },
  { id: 26, name: 'Oganesson' },
];

const PillArray = ({ name, value, label }: PillArrayProps) => {
  const [showAddPill, setShowAddPill] = useState<boolean>(false);
  const [newPill, setNewPill] = useState<string>('');

  return (
    <>
      <label>
        <h4>{label}</h4>
      </label>
      <FieldArray name={name}>
        {({ insert, remove, push }) => (
          <div className={cx('pillArray')}>
            {value.length > 0 &&
              value.map((pill, index) => <Pill key={index} name={pill} removeHandler={() => remove(index)} />)}
            {showAddPill ? (
              <OutsideClickHandler onOutsideClick={() => setShowAddPill(false)}>
                <DropdownCombobox
                  listItems={exampleLabels}
                  itemLabel={'name'}
                  enterHandler={() => {
                    push(newPill);
                    setShowAddPill(false);
                    setNewPill('');
                  }}
                  updateNewPill={setNewPill}
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
    </>
  );
};

export { PillArray };
