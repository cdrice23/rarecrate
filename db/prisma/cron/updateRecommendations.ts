import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const maxAttempts = 5;
const backoffInterval = 60000; // 1 minute

const retryWithBackoff = async (fn, attempts = 0) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts >= maxAttempts) {
      console.log(`Max attempts reached. Exiting.`);
      throw error;
    }

    console.log(`Attempt ${attempts + 1} failed. Retrying in ${backoffInterval / 1000}s...`);
    await new Promise(resolve => setTimeout(resolve, backoffInterval * (attempts + 1)));
    return retryWithBackoff(fn, attempts + 1);
  }
};

const initCronRun = async () => {
  console.log('Starting cron job: Updating recommendations');
  // Create current timestamp reference for CronRun
  const jobStart = new Date();

  // Get last CronRun and completedAt timestamp to compare new notifications
  const lastRun: any = await prisma.cronJob.findUnique({
    where: {
      id: 4,
    },
    include: {
      runs: {
        orderBy: {
          completedAt: 'desc',
        },
        take: 1,
      },
    },
  });

  let lastRunCompleted;

  if (lastRun.runs.length === 0) {
    // If there are no runs, set lastRunCompleted to be an hour before the jobStart time
    lastRunCompleted = new Date(jobStart.getTime() - 1 * 60 * 60 * 1000);
  } else {
    // If there are runs, set lastRunCompleted to be the completedAt time of the last run
    lastRunCompleted = lastRun.runs[0].completedAt;
  }

  console.log(`Last run completed at: ${lastRun.runs.length === 0 ? lastRunCompleted : lastRun.runs[0].completedAt}`);

  // get prisma records for Crate and Follow created at or after the timestamp
  const allNewCrates = await prisma.crate.findMany({
    where: {
      createdAt: {
        gte: lastRunCompleted,
      },
    },
    include: {
      creator: true,
      favoritedBy: true,
      labels: true,
      albums: {
        include: {
          album: true,
          tags: true,
        },
      },
    },
  });

  console.log(`New Crates added since last run: ${allNewCrates.length}`);

  // Create Recommendations based on policy
  console.log('Preparing data to create allProfileData');
  const newCrateIds = allNewCrates.map(crate => crate.id);
  const [allProfiles, allTags, allLabels, allNewCrateAlbums] = await Promise.all([
    prisma.profile.findMany({
      include: {
        followers: true,
        following: true,
        crates: {
          include: {
            albums: {
              include: {
                album: true,
                tags: true,
              },
            },
            labels: true,
          },
        },
        favorites: true,
      },
    }),
    prisma.tag.findMany(),
    prisma.label.findMany(),
    prisma.crateAlbum.findMany({
      where: {
        crateId: {
          in: newCrateIds,
        },
      },
      include: {
        album: true,
      },
    }),
  ]);

  // Generate allProfileData needed to create recommendations
  console.log('Creating allProfileData');
  let allProfileData = allProfiles.map(profile => {
    const unfavoritedCrates =
      profile.favorites && profile.favorites.length > 0
        ? allNewCrates.filter(
            crate => !profile.favorites.some(favorite => favorite.id === crate.id) && crate.creatorId !== profile.id,
          )
        : allNewCrates;

    const tagsNotUsed =
      profile.crates && profile.crates.length > 0
        ? allTags.filter(
            tag =>
              !profile.crates.some(
                crate =>
                  crate.albums &&
                  crate.albums.length > 0 &&
                  crate.albums.some(
                    crateAlbum =>
                      crateAlbum.tags &&
                      crateAlbum.tags.length > 0 &&
                      crateAlbum.tags.some(crateTag => crateTag.id === tag.id),
                  ),
              ),
          )
        : allTags;

    const labelsNotUsed =
      profile.crates && profile.crates.length > 0
        ? allLabels.filter(
            label =>
              !profile.crates.some(
                crate =>
                  crate.labels &&
                  crate.labels.length > 0 &&
                  crate.labels.some(crateLabel => crateLabel.id === label.id),
              ),
          )
        : allLabels;

    const crateAlbumsByArtistsNotUsed =
      profile.crates && profile.crates.length > 0
        ? allNewCrateAlbums.filter(
            crateAlbum =>
              !profile.crates.some(
                crate =>
                  crate.albums &&
                  crate.albums.length > 0 &&
                  crate.albums.some(
                    crateAlbumByProfile => crateAlbumByProfile.album.artist === crateAlbum.album.artist,
                  ),
              ),
          )
        : allNewCrateAlbums;

    return {
      profileId: profile.id,
      unfavoritedCrates: unfavoritedCrates,
      tagsNotUsed: tagsNotUsed,
      labelsNotUsed: labelsNotUsed,
      crateAlbumsByArtistsNotUsed: crateAlbumsByArtistsNotUsed,
    };
  });

  // Generate all recommended Crates by Profile
  console.log('Creating allNewRecommendedCratesByProfile');
  const allNewRecommendedCratesByProfile = allProfileData.map(profileData => {
    const profile = allProfiles.find(profile => profile.id === profileData.profileId);

    const randomUnfollowedProfileCrates =
      profile.following && profile.following.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId => !profile.following.some(following => following.id === crateId.creator.id),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedTagCrates =
      profileData.tagsNotUsed && profileData.tagsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(
                crateAlbum =>
                  crateAlbum.tags &&
                  crateAlbum.tags.length > 0 &&
                  crateAlbum.tags.some(tag => profileData.tagsNotUsed.map(tag => tag.id).includes(tag.id)),
              ),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedLabelCrates =
      profileData.labelsNotUsed && profileData.labelsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.labels &&
              crateId.labels.length > 0 &&
              crateId.labels.some(label => profileData.labelsNotUsed.map(label => label.id).includes(label.id)),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedArtistCrates =
      profileData.crateAlbumsByArtistsNotUsed && profileData.crateAlbumsByArtistsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(crateAlbum =>
                profileData.crateAlbumsByArtistsNotUsed.map(crateAlbum => crateAlbum.id).includes(crateAlbum.id),
              ),
          )
        : profileData.unfavoritedCrates;

    const curatedFollowedProfileCrates =
      profile.following && profile.following.length > 0
        ? profileData.unfavoritedCrates.filter(crateId =>
            profile.following.some(following => following.id === crateId.creator.id),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedTagCrates =
      profileData.tagsNotUsed && profileData.tagsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(
                crateAlbum =>
                  crateAlbum.tags &&
                  crateAlbum.tags.length > 0 &&
                  crateAlbum.tags.some(tag => !profileData.tagsNotUsed.map(tag => tag.id).includes(tag.id)),
              ),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedLabelCrates =
      profileData.labelsNotUsed && profileData.labelsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.labels &&
              crateId.labels.length > 0 &&
              crateId.labels.some(label => !profileData.labelsNotUsed.map(label => label.id).includes(label.id)),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedArtistCrates =
      profileData.crateAlbumsByArtistsNotUsed && profileData.crateAlbumsByArtistsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(
                crateAlbum =>
                  !profileData.crateAlbumsByArtistsNotUsed.map(crateAlbum => crateAlbum.id).includes(crateAlbum.id),
              ),
          )
        : profileData.unfavoritedCrates;

    return {
      profileId: profileData.profileId,
      randomUnfollowedProfileCrates: [...new Set(randomUnfollowedProfileCrates)],
      randomUnusedTagCrates: [...new Set(randomUnusedTagCrates)],
      randomUnusedLabelCrates: [...new Set(randomUnusedLabelCrates)],
      randomUnusedArtistCrates: [...new Set(randomUnusedArtistCrates)],
      curatedFollowedProfileCrates: [...new Set(curatedFollowedProfileCrates)],
      curatedUsedTagCrates: [...new Set(curatedUsedTagCrates)],
      curatedUsedLabelCrates: [...new Set(curatedUsedLabelCrates)],
      curatedUsedArtistCrates: [...new Set(curatedUsedArtistCrates)],
    };
  });

  // Generate recommendations based on recommended Crates for each Profile
  console.log('Creating prisma recommendations based on allNewRecommendedCratesByProfile');

  let progressCounter = 1;
  let createdRecommendations = 0;
  const totalProfiles = allNewRecommendedCratesByProfile.length;

  for (const profileData of allNewRecommendedCratesByProfile) {
    console.log(`Now creating recommendations for profile ${progressCounter} out of ${totalProfiles}`);
    const createRecommendation = async crateId => {
      const existingRecommendation = await prisma.recommendation.findMany({
        where: {
          profileId: profileData.profileId,
          crateId: crateId.id,
        },
      });

      if (existingRecommendation.length > 0) {
        await prisma.recommendation.create({
          data: {
            profile: {
              connect: {
                id: profileData.profileId,
              },
            },
            crate: {
              connect: {
                id: crateId.id,
              },
            },
          },
        });

        createdRecommendations++;
      }
    };

    const allCrateRecommendations = [
      ...profileData.randomUnfollowedProfileCrates,
      ...profileData.randomUnusedTagCrates,
      ...profileData.randomUnusedLabelCrates,
      ...profileData.randomUnusedArtistCrates,
      ...profileData.curatedFollowedProfileCrates,
      ...profileData.curatedUsedTagCrates,
      ...profileData.curatedUsedLabelCrates,
      ...profileData.curatedUsedArtistCrates,
    ];

    const uniqueCrateRecommendations = [...new Set(allCrateRecommendations)];

    for (const crateId of uniqueCrateRecommendations) {
      await createRecommendation(crateId);
    }

    progressCounter++;
  }

  // Log created notification length
  console.log(`Total notifications created: ${createdRecommendations}`);

  // Delete any recommendations that fall outside of policy
  // Update allProfileData to update unfavoritedCrates and crateAlbumsByArtistsNotUsed
  const allCrates = await prisma.crate.findMany({
    include: {
      creator: true,
      favoritedBy: true,
      labels: true,
      albums: {
        include: {
          album: true,
          tags: true,
        },
      },
    },
  });

  const allCrateAlbums = await prisma.crateAlbum.findMany({
    include: {
      album: true,
    },
  });

  allProfileData = allProfileData.map(profileData => {
    const profile = allProfiles.find(profile => profile.id === profileData.profileId);
    const unfavoritedCrates =
      profile.favorites && profile.favorites.length > 0
        ? allCrates.filter(
            crate => !profile.favorites.some(favorite => favorite.id === crate.id) && crate.creatorId !== profile.id,
          )
        : allCrates;

    const crateAlbumsByArtistsNotUsed =
      profile.crates && profile.crates.length > 0
        ? allCrateAlbums.filter(
            crateAlbum =>
              !profile.crates.some(
                crate =>
                  crate.albums &&
                  crate.albums.length > 0 &&
                  crate.albums.some(
                    crateAlbumByProfile => crateAlbumByProfile.album.artist === crateAlbum.album.artist,
                  ),
              ),
          )
        : allCrateAlbums;

    return {
      ...profileData,
      unfavoritedCrates: unfavoritedCrates,
      crateAlbumsByArtistsNotUsed: crateAlbumsByArtistsNotUsed,
    };
  });

  // Create a new array allRecommendedCratesByProfile
  console.log('Creating allRecommendedCratesByProfile');
  const allRecommendedCratesByProfile = allProfileData.map(profileData => {
    const profile = allProfiles.find(profile => profile.id === profileData.profileId);

    const randomUnfollowedProfileCrates =
      profile.following && profile.following.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId => !profile.following.some(following => following.id === crateId.creator.id),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedTagCrates =
      profileData.tagsNotUsed && profileData.tagsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(
                crateAlbum =>
                  crateAlbum.tags &&
                  crateAlbum.tags.length > 0 &&
                  crateAlbum.tags.some(tag => profileData.tagsNotUsed.map(tag => tag.id).includes(tag.id)),
              ),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedLabelCrates =
      profileData.labelsNotUsed && profileData.labelsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.labels &&
              crateId.labels.length > 0 &&
              crateId.labels.some(label => profileData.labelsNotUsed.map(label => label.id).includes(label.id)),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedArtistCrates =
      profileData.crateAlbumsByArtistsNotUsed && profileData.crateAlbumsByArtistsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(crateAlbum =>
                profileData.crateAlbumsByArtistsNotUsed.map(crateAlbum => crateAlbum.id).includes(crateAlbum.id),
              ),
          )
        : profileData.unfavoritedCrates;

    const curatedFollowedProfileCrates =
      profile.following && profile.following.length > 0
        ? profileData.unfavoritedCrates.filter(crateId =>
            profile.following.some(following => following.id === crateId.creator.id),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedTagCrates =
      profileData.tagsNotUsed && profileData.tagsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(
                crateAlbum =>
                  crateAlbum.tags &&
                  crateAlbum.tags.length > 0 &&
                  crateAlbum.tags.some(tag => !profileData.tagsNotUsed.map(tag => tag.id).includes(tag.id)),
              ),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedLabelCrates =
      profileData.labelsNotUsed && profileData.labelsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.labels &&
              crateId.labels.length > 0 &&
              crateId.labels.some(label => !profileData.labelsNotUsed.map(label => label.id).includes(label.id)),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedArtistCrates =
      profileData.crateAlbumsByArtistsNotUsed && profileData.crateAlbumsByArtistsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(
                crateAlbum =>
                  !profileData.crateAlbumsByArtistsNotUsed.map(crateAlbum => crateAlbum.id).includes(crateAlbum.id),
              ),
          )
        : profileData.unfavoritedCrates;

    const allRecommendedCrates = [
      ...randomUnfollowedProfileCrates,
      ...randomUnusedTagCrates,
      ...randomUnusedLabelCrates,
      ...randomUnusedArtistCrates,
      ...curatedFollowedProfileCrates,
      ...curatedUsedTagCrates,
      ...curatedUsedLabelCrates,
      ...curatedUsedArtistCrates,
    ];

    const uniqueRecommendedCrates = [...new Set(allRecommendedCrates)];

    return {
      profileId: profileData.profileId,
      recommendedCrates: [...uniqueRecommendedCrates],
    };
  });

  // Generate an array allExistingRecommendationsByProfile
  const allExistingRecommendationsByProfile = await Promise.all(
    allProfileData.map(async profileData => {
      const profile = allProfiles.find(profile => profile.id === profileData.profileId);
      const profileRecommendations = await prisma.recommendation.findMany({
        where: {
          profile: {
            id: profile.id,
          },
        },
      });

      return {
        profileId: profileData.profileId,
        profileRecommendations: [...profileRecommendations],
      };
    }),
  );

  // For each profile in allExistingRecommendationsByProfile, check if the crateIds exist in allCrateRecommendationsByProfile
  let deletedRecommendations = 0;

  for (const profile of allExistingRecommendationsByProfile) {
    const recommendedCrates = allRecommendedCratesByProfile.find(
      crateDataProfile => crateDataProfile.profileId === profile.profileId,
    ).recommendedCrates;

    for (const recommendation of profile.profileRecommendations) {
      const isRecommendedCrate =
        recommendedCrates.length > 0 && recommendedCrates.some(crate => crate.id === recommendation.crateId);

      if (!isRecommendedCrate) {
        const deletedRecommendation = await prisma.recommendation.delete({
          where: {
            id: recommendation.id,
          },
        });

        if (deletedRecommendation) {
          deletedRecommendations++;
        }
      }
    }
  }

  console.log(`Total deleted recommendations: ${deletedRecommendations}`);

  // Update cronRun
  if ((lastRun.lastProcessedItem === null || lastRun.lastProcessedItem !== '0') && createdRecommendations > 0) {
    await prisma.cronRun.create({
      data: {
        createdAt: jobStart,
        completedAt: new Date(),
        lastProcessedItem: `created recommendations: ${createdRecommendations}, deleted recommendations: ${deletedRecommendations}`,
        cronJob: {
          connect: {
            id: 4,
          },
        },
      },
    });
  }
};

retryWithBackoff(initCronRun)
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
