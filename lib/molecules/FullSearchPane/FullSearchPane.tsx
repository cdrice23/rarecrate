import { useQuery, useMutation, gql } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';

type FullSearchPaneProps = {
  handlePaneSelect: (pane: 'profiles' | 'crates' | 'albums' | 'labelsAndTags' | 'genresAndSubgenres') => void;
};

const FullSearchPane = ({ handlePaneSelect }: FullSearchPaneProps) => {
  return (
    <>
      <div className={cx('listActions')}>
        <button onClick={() => handlePaneSelect('profiles')}>
          <h5>{`Profiles`}</h5>
        </button>
        <button onClick={() => handlePaneSelect('crates')}>
          <h5>{`Crates`}</h5>
        </button>
        <button onClick={() => handlePaneSelect('albums')}>
          <h5>{`Albums`}</h5>
        </button>
        <button onClick={() => handlePaneSelect('labelsAndTags')}>
          <h5>{`Labels/Tags`}</h5>
        </button>
        <button onClick={() => handlePaneSelect('genresAndSubgenres')}>
          <h5>{`Genres/Subgenres`}</h5>
        </button>
      </div>
    </>
  );
};

export { FullSearchPane };
