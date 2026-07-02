// Construct TMDb image URL
export const imgUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const backdropUrl = (path) => imgUrl(path, 'original');
export const posterUrl = (path) => imgUrl(path, 'w342');
export const thumbUrl = (path) => imgUrl(path, 'w185');
export const profileUrl = (path) => imgUrl(path, 'w185');
