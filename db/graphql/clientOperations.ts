import { gql } from '@apollo/client';

export const GET_USERNAME_BY_ID = gql`
  query GetUsernameById($userId: Int!) {
    getUsernameById(userId: $userId) {
      id
      username
    }
  }
`;

export const GET_PROFILE = gql`
  query GetProfile($id: Int, $username: String) {
    getProfile(id: $id, username: $username) {
      id
      username
      isPrivate
      bio
      image
      socialLinks {
        id
        username
        platform
      }
      followers {
        id
      }
      following {
        id
      }
      crates {
        id
      }
      favorites {
        id
      }
    }
  }
`;

// Summary view of Crate/Favorites from Profile Page
export const GET_PROFILE_CRATES_AND_FAVORITES = gql`
  query GetCratesAndFavorites($id: Int, $username: String) {
    getProfile(id: $id, username: $username) {
      id
      image
      crates {
        id
        title
        creator {
          id
          username
        }
        labels {
          id
          isStandard
        }
        favoritedBy {
          id
        }
      }
      favorites {
        id
        title
        labels {
          id
          isStandard
        }
        creator {
          id
          image
          username
        }
        favoritedBy {
          id
        }
      }
    }
  }
`;

export const GET_PROFILE_CRATES = gql`
  query GetProfileCrates($username: String!, $currentPage: Int!) {
    getProfileCrates(username: $username, currentPage: $currentPage) {
      id
      title
      creator {
        id
        username
      }
      labels {
        id
        isStandard
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const GET_PROFILE_FAVORITES = gql`
  query GetProfileFavorites($username: String!, $currentPage: Int!) {
    getProfileFavorites(username: $username, currentPage: $currentPage) {
      id
      title
      labels {
        id
        isStandard
      }
      creator {
        id
        image
        username
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const GET_CRATE_DETAIL_WITH_ALBUMS = gql`
  query GetCrateDetailWithAlbums($id: Int!) {
    getCrateDetailWithAlbums(id: $id) {
      id
      title
      description
      creator {
        id
        username
        image
      }
      favoritedBy {
        id
        username
        image
      }
      labels {
        id
        name
        isStandard
      }
      isRanked
      albums {
        id
        album {
          id
          discogsMasterId
          title
          artist
          discogsMasterId
          label
          releaseYear
          genres {
            id
            name
          }
          subgenres {
            id
            name
          }
          imageUrl
          tracklist {
            id
            title
            order
          }
        }
        rank
        tags {
          id
          name
        }
      }
    }
  }
`;

// Getting Follow Requests on Timeline
export const GET_PENDING_FOLLOW_REQUESTS = gql`
  query GetPendingFollowRequests($id: Int!) {
    getPendingFollowRequests(id: $id) {
      id
      sender {
        id
        image
        username
      }
      receiver {
        id
        image
        username
      }
    }
  }
`;

// Mutations for Following/Sending Follow Request/etc.
export const CREATE_NEW_FOLLOW_OR_REQUEST = gql`
  mutation CreateNewFollowOrRequest($input: FollowOrRequestInput!) {
    createNewFollowOrRequest(input: $input) {
      follow {
        id
        follower {
          id
        }
        following {
          id
        }
      }
      followRequest {
        id
        sender {
          id
        }
        receiver {
          id
        }
      }
    }
  }
`;

export const UNFOLLOW_PROFILE = gql`
  mutation UnfollowProfile($input: FollowOrRequestInput!) {
    unfollowProfile(input: $input) {
      id
      followerId
      follower {
        id
      }
      followingId
      following {
        id
      }
    }
  }
`;

export const REJECT_FOLLOW_REQUEST = gql`
  mutation RejectFollowRequest($input: FollowOrRequestInput!) {
    rejectFollowRequest(input: $input) {
      id
      sender {
        id
      }
      senderId
      receiver {
        id
      }
      receiverId
      sentAt
    }
  }
`;

export const ACCEPT_FOLLOW_REQUEST = gql`
  mutation AcceptFollowRequest($input: FollowOrRequestInput!) {
    acceptFollowRequest(input: $input) {
      followRequest {
        id
        sender {
          id
        }
        senderId
        receiver {
          id
          username
          image
        }
        receiverId
        sentAt
      }
      follow {
        id
        follower {
          id
          username
          image
        }
        following {
          id
        }
      }
    }
  }
`;

//Mutations for Favoriting/Unfavoriting a Crate
export const ADD_CRATE_TO_FAVORITES = gql`
  mutation AddCrateToFavorites($input: CrateProfileInput!) {
    addCrateToFavorites(input: $input) {
      id
      title
      creator {
        id
      }
      labels {
        id
        isStandard
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const REMOVE_CRATE_FROM_FAVORITES = gql`
  mutation RemoveCrateFromFavorites($input: CrateProfileInput!) {
    removeCrateFromFavorites(input: $input) {
      id
      title
      labels {
        id
        isStandard
      }
      favoritedBy {
        id
      }
    }
  }
`;

// Add Crate Operations
export const SEARCH_LABELS_BY_NAME = gql`
  query searchLabelsByName($searchTerm: String!) {
    searchLabelsByName(searchTerm: $searchTerm) {
      id
      name
      isStandard
    }
  }
`;

export const SEARCH_LABELS_BY_ID = gql`
  query searchLabelsById($labelId: Int!) {
    searchLabelsById(labelId: $labelId) {
      id
      name
      isStandard
    }
  }
`;

export const GET_TOP_LABELS = gql`
  query GetTopLabels($quantity: Int, $includeStandard: Boolean) {
    getTopLabels(quantity: $quantity, includeStandard: $includeStandard) {
      id
      name
      isStandard
    }
  }
`;

export const SEARCH_TAGS_BY_NAME = gql`
  query SearchTagsByName($searchTerm: String!) {
    searchTagsByName(searchTerm: $searchTerm) {
      id
      name
    }
  }
`;

export const SEARCH_TAGS_BY_ID = gql`
  query searchTagsById($tagId: Int!) {
    searchTagsById(tagId: $tagId) {
      id
      name
    }
  }
`;

export const GET_TOP_TAGS = gql`
  query GetTopTags($quantity: Int, $includeStandard: Boolean) {
    getTopTags(quantity: $quantity, includeStandard: $includeStandard) {
      id
      name
    }
  }
`;

export const SEARCH_PRISMA_ALBUMS_BY_NAME = gql`
  query SearchPrismaAlbumsByName($searchTerm: String!) {
    searchPrismaAlbumsByName(searchTerm: $searchTerm) {
      id
      title
      artist
      discogsMasterId
      imageUrl
    }
  }
`;

export const SEARCH_PRISMA_ALBUMS_BY_ID = gql`
  query SearchPrismaAlbumsById($albumId: Int!) {
    searchPrismaAlbumsById(albumId: $albumId) {
      id
      title
      artist
      discogsMasterId
      imageUrl
    }
  }
`;

export const ADD_NEW_TAG = gql`
  mutation AddNewTag($name: String!) {
    addNewTag(name: $name) {
      id
      name
    }
  }
`;

export const ADD_NEW_LABEL = gql`
  mutation AddNewLabel($name: String!) {
    addNewLabel(name: $name) {
      id
      name
      isStandard
    }
  }
`;

export const ADD_NEW_ALBUM = gql`
  mutation AddNewAlbum($discogsMasterId: Int!) {
    addNewAlbum(discogsMasterId: $discogsMasterId) {
      id
      discogsMasterId
      title
      artist
      label
      releaseYear
      genres {
        id
        name
      }
      subgenres {
        id
        name
      }
      imageUrl
      tracklist {
        id
        title
        order
      }
    }
  }
`;

export const ADD_NEW_CRATE = gql`
  mutation AddNewCrate($input: CrateInput!) {
    addNewCrate(input: $input) {
      id
      creatorId
      title
      labels {
        id
        isStandard
      }
      favoritedBy {
        id
      }
    }
  }
`;

export const UPDATE_CRATE = gql`
  mutation UpdateCrate($input: CrateInput!) {
    updateCrate(input: $input) {
      id
      title
      description
      creator {
        id
        username
        image
      }
      favoritedBy {
        id
        username
        image
      }
      labels {
        id
        name
        isStandard
      }
      isRanked
      albums {
        id
        album {
          id
          title
          artist
          discogsMasterId
          label
          releaseYear
          genres {
            id
            name
          }
          subgenres {
            id
            name
          }
          imageUrl
          tracklist {
            id
            title
            order
          }
        }
        rank
        tags {
          id
          name
        }
      }
    }
  }
`;

// Global Search queries + mutations
export const QS_PROFILES = gql`
  query QsProfiles($searchTerm: String!) {
    qsProfiles(searchTerm: $searchTerm) {
      id
      username
      image
      searchAndSelectCount
    }
  }
`;

export const QS_CRATES = gql`
  query QsCrates($searchTerm: String!) {
    qsCrates(searchTerm: $searchTerm) {
      id
      title
      searchAndSelectCount
      creator {
        username
      }
    }
  }
`;

export const QS_ALBUMS = gql`
  query QsAlbums($searchTerm: String!) {
    qsAlbums(searchTerm: $searchTerm) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const QS_LABELS = gql`
  query QsLabels($searchTerm: String!) {
    qsLabels(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
      isStandard
    }
  }
`;

export const QS_TAGS = gql`
  query QsTags($searchTerm: String!) {
    qsTags(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const QS_GENRES = gql`
  query QsGenres($searchTerm: String!) {
    qsGenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const QS_SUBGENRES = gql`
  query QsSubgenres($searchTerm: String!) {
    qsSubgenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const FS_PROFILES = gql`
  query FsProfiles($searchTerm: String!, $currentPage: Int!) {
    fsProfiles(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      username
      image
      searchAndSelectCount
    }
  }
`;

export const FS_CRATES = gql`
  query FsCrates($searchTerm: String!, $currentPage: Int!) {
    fsCrates(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const FS_ALBUMS = gql`
  query FsAlbums($searchTerm: String!, $currentPage: Int!) {
    fsAlbums(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const FS_LABELS = gql`
  query FsLabels($searchTerm: String!, $currentPage: Int!) {
    fsLabels(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      name
      searchAndSelectCount
      isStandard
    }
  }
`;

export const FS_TAGS = gql`
  query FsTags($searchTerm: String!, $currentPage: Int!) {
    fsTags(searchTerm: $searchTerm, currentPage: $currentPage) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const FS_GENRES = gql`
  query FsGenres($searchTerm: String!) {
    fsGenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const FS_SUBGENRES = gql`
  query FsSubgenres($searchTerm: String!) {
    fsSubgenres(searchTerm: $searchTerm) {
      id
      name
      searchAndSelectCount
    }
  }
`;

export const RUN_QUICK_SEARCH = gql`
  query RunQuickSearch($searchTerm: String!) {
    qsProfiles(searchTerm: $searchTerm) {
      id
      username
      image
      searchAndSelectCount
    }
    qsCrates(searchTerm: $searchTerm) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const LOG_SELECTED_SEARCH_RESULT = gql`
  mutation LogSelectedSearchResult($searchTerm: String, $prismaModel: String!, $selectedId: Int!) {
    logSelectedSearchResult(searchTerm: $searchTerm, prismaModel: $prismaModel, selectedId: $selectedId) {
      id
      searchTerm
      resultType
      searchResult
      selectedId
    }
  }
`;

export const GET_CRATES_FROM_LABEL = gql`
  query GetCratesFromLabel($labelId: Int!, $currentPage: Int!) {
    getCratesFromLabel(labelId: $labelId, currentPage: $currentPage) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const GET_CRATES_FROM_ALBUM = gql`
  query GetCratesFromAlbum($albumId: Int!, $currentPage: Int!) {
    getCratesFromAlbum(albumId: $albumId, currentPage: $currentPage) {
      id
      title
      searchAndSelectCount
      creator {
        username
        isPrivate
        followers {
          id
        }
      }
    }
  }
`;

export const GET_ALBUMS_FROM_TAG = gql`
  query GetAlbumsFromTag($tagId: Int!, $currentPage: Int!) {
    getAlbumsFromTag(tagId: $tagId, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const GET_ALBUMS_FROM_GENRE = gql`
  query GetAlbumsFromGenre($genreId: Int!, $currentPage: Int!) {
    getAlbumsFromGenre(genreId: $genreId, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

export const GET_ALBUMS_FROM_SUBGENRE = gql`
  query GetAlbumsFromSubgenre($subgenreId: Int!, $currentPage: Int!) {
    getAlbumsFromSubgenre(subgenreId: $subgenreId, currentPage: $currentPage) {
      id
      title
      artist
      imageUrl
      searchAndSelectCount
    }
  }
`;

// Mutations for Profile Form
export const CREATE_NEW_PROFILE = gql`
  mutation CreateNewProfile($input: ProfileInput!) {
    createNewProfile(input: $input) {
      id
      username
      isPrivate
      bio
      image
      socialLinks {
        id
        username
        platform
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      isPrivate
      bio
      image
      socialLinks {
        id
        username
        platform
      }
      followers {
        id
      }
      following {
        id
      }
      crates {
        id
      }
      favorites {
        id
      }
    }
  }
`;

export const UPDATE_LAST_LOGIN_PROFILE = gql`
  mutation UpdateLastLoginProfile($userId: Int!, $profileId: Int!) {
    updateLastLoginProfile(userId: $userId, profileId: $profileId) {
      id
      lastLoginProfile
    }
  }
`;

export const GET_LAST_LOGIN_PROFILE = gql`
  query GetLastLoginProfile($userId: Int!) {
    getLastLoginProfile(userId: $userId) {
      id
      username
    }
  }
`;

export const AUTO_ACCEPT_FOLLOW_REQUESTS = gql`
  mutation AutoAcceptFollowRequests($receiverId: Int!) {
    autoAcceptFollowRequests(receiverId: $receiverId) {
      followRequest {
        id
        sender {
          id
        }
        senderId
        receiver {
          id
          username
          image
        }
        receiverId
        sentAt
      }
      follow {
        id
        follower {
          id
          username
          image
        }
        following {
          id
        }
      }
    }
  }
`;

export const ACCEPT_USER_AGREEMENT = gql`
  mutation AcceptUserAgreement($userId: Int!) {
    acceptUserAgreement(userId: $userId) {
      id
      acceptedUserAgreement
    }
  }
`;

export const GET_NOTIFICATION_SETTINGS_BY_USER = gql`
  query GetNotificationSettingsByUser($userId: Int!) {
    getNotificationSettingsByUser(userId: $userId) {
      id
      showOwnNewFollowers
      showOwnNewFavorites
      showFollowingNewFollows
      showFollowingNewCrates
      showFollowingNewFavorites
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($input: NotificationSettingsInput!) {
    updateNotificationSettings(input: $input) {
      id
      showOwnNewFollowers
      showOwnNewFavorites
      showFollowingNewFollows
      showFollowingNewCrates
      showFollowingNewFavorites
    }
  }
`;

export const DELETE_PROFILE = gql`
  mutation DeletedProfile($profileId: Int!) {
    deleteProfile(profileId: $profileId) {
      id
      followers {
        id
      }
      following {
        id
      }
      crates {
        id
        labels {
          id
        }
        albums {
          id
          tags {
            id
          }
        }
      }
      favorites {
        id
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: Int!) {
    deleteUser(userId: $userId) {
      id
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($receiver: Int!, $type: String!, $actionOwner: Int!, $notificationRef: Int!) {
    createNotification(receiver: $receiver, type: $type, actionOwner: $actionOwner, notificationRef: $notificationRef) {
      id
      receiver
      type
      actionOwner {
        id
      }
      connectedCrate {
        id
      }
      connectedFollow {
        id
      }
    }
  }
`;

export const GET_NOTIFICATIONS_BY_PROFILE = gql`
  query GetNotificationsByProfile($profileId: Int!, $userId: Int!, $currentPage: Int!) {
    getNotificationsByProfile(profileId: $profileId, userId: $userId, currentPage: $currentPage) {
      id
      type
      actionOwner {
        id
        username
        image
      }
      connectedCrate {
        id
        title
        description
        creator {
          id
          username
          image
        }
        labels {
          id
          name
          isStandard
        }
      }
      connectedFollow {
        id
        follower {
          id
          username
          image
        }
        following {
          id
          image
          username
          bio
          followers {
            id
          }
          following {
            id
          }
          crates {
            id
          }
          favorites {
            id
          }
        }
      }
      createdAt
    }
  }
`;

export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations($profileId: Int!, $usedPages: [Int], $currentRecsInArray: Int) {
    getRecommendations(profileId: $profileId, usedPages: $usedPages, currentRecsInArray: $currentRecsInArray) {
      recommendations {
        id
        recommendationType
        seen
        profileId
        crate {
          id
          title
          creator {
            id
            image
            username
          }
          favoritedBy {
            id
          }
        }
      }
      usedPages
      resetRecommendations
    }
  }
`;

export const MARK_RECOMMENDATION_SEEN = gql`
  mutation MarkRecommendationSeen($recommendationId: Int!) {
    markRecommendationSeen(recommendationId: $recommendationId) {
      id
      profileId
      crateId
      seen
    }
  }
`;

export const GET_PROFILE_FOLLOWERS = gql`
  query GetProfileFollowers($username: String!, $currentPage: Int!) {
    getProfileFollowers(username: $username, currentPage: $currentPage) {
      id
      follower {
        id
        image
        username
      }
    }
  }
`;

export const GET_PROFILE_FOLLOWING = gql`
  query GetProfileFollowing($username: String!, $currentPage: Int!) {
    getProfileFollowing(username: $username, currentPage: $currentPage) {
      id
      following {
        id
        image
        username
      }
    }
  }
`;
