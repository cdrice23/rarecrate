import { PrismaClient } from '@prisma/client';

export async function updateRecommendationTypes(prisma: PrismaClient): Promise<void> {
  // Fetch all data required for generating allProfileData
  console.log('Preparing data to create allProfileData');
  const [allProfiles, allCrates, allTags, allLabels, allCrateAlbums] = await Promise.all([
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
    prisma.crate.findMany({
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
    }),
    prisma.tag.findMany(),
    prisma.label.findMany(),
    prisma.crateAlbum.findMany({
      include: {
        album: true,
      },
    }),
  ]);

  // Generate allProfileData needed to create recommendations
  console.log('Creating allProfileData');
  const allProfileData = allProfiles.map(profile => {
    const unfavoritedCrates =
      profile.favorites && profile.favorites.length > 0
        ? allCrates.filter(
            crate => !profile.favorites.some(favorite => favorite.id === crate.id) && crate.creatorId !== profile.id,
          )
        : allCrates;

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
      profileId: profile.id,
      unfavoritedCrates: unfavoritedCrates,
      tagsNotUsed: tagsNotUsed,
      labelsNotUsed: labelsNotUsed,
      crateAlbumsByArtistsNotUsed: crateAlbumsByArtistsNotUsed,
    };
  });

  // Generate all recommended Crates by Profile
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
  console.log('Updating prisma recommendations based on allRecommendedCratesByProfile');

  let progressCounter = 1;
  const totalProfiles = allRecommendedCratesByProfile.length;

  for (const profileData of allRecommendedCratesByProfile) {
    console.log(`Now updating recommendations for profile ${progressCounter} out of ${totalProfiles}`);
    const countOccurrences = (arr, val) => arr.reduce((a, v) => (v.id === val.id ? a + 1 : a), 0);
    const determineRecommendationType = (crateId, profileData) => {
      const randomCount =
        countOccurrences(profileData.randomUnfollowedProfileCrates, crateId) +
        countOccurrences(profileData.randomUnusedTagCrates, crateId) +
        countOccurrences(profileData.randomUnusedLabelCrates, crateId) +
        countOccurrences(profileData.randomUnusedArtistCrates, crateId);

      const curatedCount =
        countOccurrences(profileData.curatedFollowedProfileCrates, crateId) +
        countOccurrences(profileData.curatedUsedTagCrates, crateId) +
        countOccurrences(profileData.curatedUsedLabelCrates, crateId) +
        countOccurrences(profileData.curatedUsedArtistCrates, crateId);

      const recommendationType = curatedCount > 1 ? 'curated' : 'random';
      return recommendationType;
    };

    const updateRecommendationWithType = async (crateId, recommendationType) => {
      await prisma.recommendation.updateMany({
        where: {
          profile: {
            id: profileData.profileId,
          },
          crate: {
            id: crateId.id,
          },
        },
        data: {
          recommendationType: recommendationType,
        },
      });
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
      const recommendationType = determineRecommendationType(crateId, profileData);
      await updateRecommendationWithType(crateId, recommendationType);
    }

    progressCounter++;
  }
}
