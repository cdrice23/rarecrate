import { PillArray } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_LABELS } from '@/db/graphql/clientOperations';

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

const LabelSearchInput = ({ value }) => {
  return (
    <>
      <PillArray name="labels" value={value} label="Labels" itemLabel={'name'} listItems={exampleLabels} />
    </>
  );
};

export { LabelSearchInput };
