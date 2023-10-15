import { PrismaClient } from '@prisma/client';

export async function seedRecommendations(prisma: PrismaClient): Promise<void> {
  // Fetch all data required for generating allProfileData
  console.log('Preparing data to create allProfileData');
  const [allProfiles, allCrates, allTags, allLabels, allCrateAlbums] = await Promise.all([
    prisma.profile.findMany({
      include: {
        followers: true,
        following: true,
        crates: true,
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
                  crateAlbum.tags.some(tag => profileData.tagsNotUsed.includes(tag.id)),
              ),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedLabelCrates =
      profileData.labelsNotUsed && profileData.labelsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.labels &&
              crateId.labels.length > 0 &&
              crateId.labels.some(label => profileData.labelsNotUsed.includes(label.id)),
          )
        : profileData.unfavoritedCrates;

    const randomUnusedArtistCrates =
      profileData.crateAlbumsByArtistsNotUsed && profileData.crateAlbumsByArtistsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(crateAlbum => profileData.crateAlbumsByArtistsNotUsed.includes(crateAlbum.id)),
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
                  crateAlbum.tags.some(tag => !profileData.tagsNotUsed.includes(tag.id)),
              ),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedLabelCrates =
      profileData.labelsNotUsed && profileData.labelsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.labels &&
              crateId.labels.length > 0 &&
              crateId.labels.some(label => !profileData.labelsNotUsed.includes(label.id)),
          )
        : profileData.unfavoritedCrates;

    const curatedUsedArtistCrates =
      profileData.crateAlbumsByArtistsNotUsed && profileData.crateAlbumsByArtistsNotUsed.length > 0
        ? profileData.unfavoritedCrates.filter(
            crateId =>
              crateId.albums &&
              crateId.albums.length > 0 &&
              crateId.albums.some(crateAlbum => !profileData.crateAlbumsByArtistsNotUsed.includes(crateAlbum.id)),
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
  console.log('Creating prisma recommendations based on allRecommendedCratesByProfile');

  let progressCounter = 1;
  const totalProfiles = allRecommendedCratesByProfile.length;

  for (const profileData of allRecommendedCratesByProfile) {
    console.log(`Now creating recommendations for profile ${progressCounter} out of ${totalProfiles}`);
    const createRecommendation = async crateId => {
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
}
