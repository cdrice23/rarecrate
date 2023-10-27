export function formatArtistName(artist: string): string {
  let regex = /\s\(\d+\)$/;
  let result = artist.replace(regex, '');
  return result;
}
