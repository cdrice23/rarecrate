import cx from 'classnames';
import { useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HandHeart, Lightbulb, DotOutline } from '@phosphor-icons/react';
import { useLocalState } from '@/lib/context/state';
import { GET_RECOMMENDATIONS } from '@/db/graphql/clientOperations/recommendation';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { CrateDiggingPaneProps } from '@/lib/molecules/CrateDiggingPane/CrateDiggingPane.types';
import { CrateDetail } from '../CrateDetail/CrateDetail';
import { useMutations, handleGetMoreRecommendations, handleFavoriteToggle } from './CrateDiggingPane.helpers';

const CrateDiggingPane = ({ mainProfile, userProfiles }: CrateDiggingPaneProps) => {
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const [activeCrate, setActiveCrate] = useState<any>(null);
  const [showCrateDetail, setShowCrateDetail] = useState<boolean>(false);
  const [usedPages, setUsedPages] = useState<number[]>(null);
  const [lastIndex, setLastIndex] = useState<number>(null);
  const [seenRecommendations, setSeenRecommendations] = useState([]);
  const { usernameMain } = useLocalState();

  const {
    error: initialError,
    loading: initialLoading,
    data: initialData,
  } = useQuery(GET_RECOMMENDATIONS, {
    variables: { profileId: mainProfile },
  });

  const { markRecommendationSeen, getMoreRecommendations, loadingAdditional } = useMutations(mainProfile);

  console.log('loading additional', loadingAdditional);
  useEffect(() => {
    const initialRecommendations = initialData?.getRecommendations.recommendations;

    // Randomly shuffle the initial recommendations
    if (initialRecommendations) {
      let shuffledRecommendations = [...initialRecommendations];

      setCurrentRecommendations(shuffledRecommendations);
      setUsedPages(initialData?.getRecommendations.usedPages);
      setLastIndex(shuffledRecommendations.length - 1);
    }
  }, [initialData]);

  useEffect(() => {
    if (seenRecommendations.length > 0) {
      markRecommendationSeen({
        variables: {
          recommendationId: seenRecommendations[seenRecommendations.length - 1],
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenRecommendations]);

  return (
    <Pane>
      {initialError ? (
        <>
          <h1>Error</h1>
          <p>{initialError.message}</p>
        </>
      ) : initialLoading ? (
        <h1>Loading...</h1>
      ) : currentRecommendations?.length > 0 ? (
        <>
          <CrateDetail
            userProfiles={userProfiles}
            activeCrateId={activeCrate?.id}
            show={showCrateDetail}
            onClose={() => {
              setShowCrateDetail(false);
              setActiveCrate(null);
            }}
            currentProfile={usernameMain}
          />
          <Pane crateDiggingPane={true}>
            {currentRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                onViewportEnter={async () => {
                  if (index === lastIndex) {
                    console.log(`You hit the last item!`);
                    handleGetMoreRecommendations(
                      mainProfile,
                      usedPages,
                      currentRecommendations,
                      setCurrentRecommendations,
                      setLastIndex,
                      setUsedPages,
                      getMoreRecommendations,
                    );
                  }
                }}
                className={cx('recommendation', {
                  [`curatedRecommendation`]: recommendation.recommendationType === 'curated',
                  [`randomRecommendation`]: recommendation.recommendationType === 'random',
                })}
                onClick={() => {
                  setActiveCrate(recommendation.crate);
                  setShowCrateDetail(true);
                  setSeenRecommendations(prevSeenRecommendations => [...prevSeenRecommendations, recommendation.id]);
                }}
              >
                <div>
                  {!seenRecommendations.includes(recommendation.id) && (
                    <DotOutline size={24} className={cx('seenIcon')} />
                  )}
                  {recommendation.recommendationType === 'curated' ? <HandHeart size={24} /> : <Lightbulb size={24} />}
                  <p>{recommendation.recommendationType === 'curated' ? 'Our Pick For You' : 'Discover New Crate'}</p>
                </div>
              </motion.div>
            ))}
            {loadingAdditional && (
              <div className={cx('recommendation', 'loadingMore')}>
                <div>
                  <p>{`Loading More...`}</p>
                </div>
              </div>
            )}
          </Pane>
        </>
      ) : null}
    </Pane>
  );
};

export { CrateDiggingPane };
