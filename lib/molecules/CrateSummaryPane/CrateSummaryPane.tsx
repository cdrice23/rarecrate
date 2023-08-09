import { Pane } from '@/lib/atoms/Pane/Pane';
import { useQuery } from '@apollo/client';
import { GET_PROFILE_CRATES_AND_FAVORITES } from '@/db/graphql/clientQueries';
import cx from 'classnames';
import { useState } from 'react';
import { CrateDetail } from '../CrateDetail/CrateDetail';

type CrateSummaryPaneProps = {
  username: string;
  listType: 'crates' | 'favorites';
};

const CrateSummaryPane = ({ username, listType }: CrateSummaryPaneProps) => {
  const [activeCrate, setActiveCrate] = useState<number>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const { loading, error, data } = useQuery(GET_PROFILE_CRATES_AND_FAVORITES, {
    variables: { username: username },
  });

  const crateSummaryData = data?.getProfile;

  return (
    <Pane>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : crateSummaryData ? (
        listType === 'crates' ? (
          <>
            <CrateDetail
              activeCrateId={activeCrate}
              show={showCrateDetail}
              onClose={() => {
                setShowCrateDetail(false);
              }}
            />
            <Pane>
              <h3>Crates:</h3>
            </Pane>
            <Pane crateSummaryPane={true}>
              {crateSummaryData.crates.map((crate, index) => (
                <button
                  key={index}
                  className={cx('crateSummary')}
                  onClick={() => {
                    setActiveCrate(crate.id);
                    setShowCrateDetail(true);
                  }}
                >
                  <p>{crate.title}</p>
                  <p>{`Image: ${crateSummaryData.image}`}</p>
                  <p>{`Favorited By: ${crate.favoritedBy.length} people`}</p>
                  <ul>
                    {crate.labels.map(label => (
                      <li key={label.id}>{label.isStandard ? 'Blue' : 'Yellow'}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </Pane>
          </>
        ) : (
          <>
            <CrateDetail
              activeCrateId={activeCrate}
              show={showCrateDetail}
              onClose={() => {
                setShowCrateDetail(false);
              }}
            />
            <Pane>
              <h3>Favorites:</h3>
            </Pane>
            <Pane crateSummaryPane={true}>
              {crateSummaryData.favorites.map((crate, index) => (
                <button
                  key={index}
                  className={cx('crateSummary')}
                  onClick={() => {
                    setActiveCrate(crate.id);
                    setShowCrateDetail(true);
                  }}
                >
                  <p>{crate.title}</p>
                  <p>{`Image: ${crateSummaryData.image}`}</p>
                  <p>{`Favorited By: ${crate.favoritedBy.length} people`}</p>
                  <ul>
                    {crate.labels.map(label => (
                      <li key={label.id}>{label.isStandard ? 'Blue' : 'Yellow'}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </Pane>
          </>
        )
      ) : null}
    </Pane>
  );
};

export { CrateSummaryPane };
