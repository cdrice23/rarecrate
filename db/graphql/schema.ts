export const typeDefs = `
  type User {
    id: ID!
    email: String
    emailVerified: Boolean
    role: String
    createdAt: String
    updatedAt: String
    profiles: [Profile]
  }

  type Profile {
    id: ID!
    user: User
    userId: Int
    username: String
    isPrivate: Boolean
    bio: String
    image: String
    followers: [Follow]
    following: [Follow]
    crates: [Crate]
    favorites: [Crate]
    socialLinks: [SocialLink]
    followRequestsSent: [FollowRequest]
    followRequestsReceived: [FollowRequest]
    createdAt: String
    updatedAt: String
  }

  type Crate {
    id: ID!
    title: String
    description: String
    creator: Profile
    creatorId: Int
    favoritedBy: [Profile]
    labels: [Label]
    createdAt: String
    updatedAt: String
    isRanked: Boolean
    albums: [CrateAlbum]
  }

  type Follow {
    id: ID!
    follower: Profile
    followerId: Int
    following: Profile
    followingId: Int
  }

  type SocialLink {
    id: ID!
    platform: String
    username: String
    profile: Profile
    profileId: Int
  }

  type FollowRequest {
    id: ID!
    sender: Profile
    senderId: Int
    receiver: Profile
    receiverId: Int
    requestStatus: String
    sentAt: String
  }

  type Album {
    id: ID!
    discogsMasterId: Int
    title: String
    artist: String
    label: String
    releaseYear: Int
    genres: [Genre]
    subgenres: [Subgenre]
    imageUrl: String
    crates: [CrateAlbum]
    tracklist: [TracklistItem]
  }

  type Genre {
    id: ID!
    name: String
    albums: [Album]
    subgenres: [Subgenre]
  }

  type Subgenre {
    id: ID!
    name: String
    albums: [Album]
    parentGenre: Genre
    parentGenreId: Int
  }

  type TracklistItem {
    id: ID!
    title: String
    order: Int
    album: Album
    albumId: Int
  }

  type CrateAlbum {
    id: ID!
    crate: Crate
    crateId: Int
    album: Album
    albumId: Int
    rank: Int
    tags: [Tag]
  }

  type Label {
    id: ID!
    name: String
    isStandard: Boolean
    crates: [Crate]
  }

  type Tag {
    id: ID!
    name: String
    crateAlbum: [CrateAlbum]
  }

  type CronJob {
    id: ID!
    scriptName: String
    path: String
    runs: [CronRun]
  }

  type CronRun {
    id: ID!
    createdAt: String
    completedAt: String
    lastProcessedLabel: String
    cronJob: CronJob
    cronJobId: Int
  }
`;
