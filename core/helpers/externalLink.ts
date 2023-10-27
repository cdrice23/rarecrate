export function getSpotifyAlbumUrlFromSearch(artist: string, albumTitle: string) {
  const encodedSearchTerm = encodeURIComponent(`${artist} ${albumTitle}`);

  const spotifyUrl = `https://open.spotify.com/search/${encodedSearchTerm}`;

  return spotifyUrl;
}

export function getAppleMusicUrlFromSearch(artist: string, albumTitle: string) {
  const encodedSearchTerm = encodeURIComponent(`${artist} ${albumTitle}`);

  let countryCode = 'us'; // Default to 'us' if the user's country code cannot be determined

  if (typeof window !== 'undefined') {
    // Get the user's language
    const language = window.navigator.language;

    // Extract the country code from the language
    const countryCodeMatch = language.match(/^([a-z]{2})-([A-Z]{2})$/);
    if (countryCodeMatch) {
      countryCode = countryCodeMatch[2].toLowerCase();
    }
  }

  const appleMusicUrl = `https://music.apple.com/${countryCode}/search?term=${encodedSearchTerm}`;

  return appleMusicUrl;
}

export function getDiscogsMasterUrl(discogsMaster) {
  const discogsUrl = `https://www.discogs.com/master/${discogsMaster}`;

  return discogsUrl;
}
