// Avatar utility using DiceBear API for animated avatars

export const getAvatarUrl = (
  seed: string,
  gender: 'male' | 'female' = 'male',
  style: 'avataaars' | 'bottts' | 'personas' = 'avataaars'
): string => {
  // DiceBear API v7 - Free, no API key required
  // Using avataaars style for human-like avatars
  const baseUrl = 'https://api.dicebear.com/7.x';
  
  // Encode the seed to make it URL-safe
  const encodedSeed = encodeURIComponent(seed);
  
  // Return SVG avatar URL
  return `${baseUrl}/${style}/svg?seed=${encodedSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

export const getAvatarUrlByName = (
  firstName: string,
  lastName: string,
  gender: 'male' | 'female' = 'male'
): string => {
  const seed = `${firstName}-${lastName}`;
  return getAvatarUrl(seed, gender);
};

export const getAvatarUrlById = (
  id: number,
  gender: 'male' | 'female' = 'male'
): string => {
  const seed = `user-${id}`;
  return getAvatarUrl(seed, gender);
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};
