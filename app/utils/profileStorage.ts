export interface SearchResult {
  name: string;
  title: string;
  handle: string;
  avatarUrl: string;
  searchCount: number;
  status?: string;
}

const DEFAULT_PROFILES: SearchResult[] = [
  {
    name: "MONAD",
    title: "Currently Testnet",
    handle: "monad_xyz",
    avatarUrl: "/monad_logo.ico",
    searchCount: 0,
    status: "Online"
  }
];

export function saveProfile(updatedProfile: SearchResult) {
  if (typeof window === 'undefined') return;

  try {
    const profiles = getProfiles();
    const existingIndex = profiles.findIndex(p => p.handle === updatedProfile.handle);

    if (existingIndex !== -1) {
      // Update existing profile while preserving search count
      profiles[existingIndex] = {
        ...profiles[existingIndex],
        ...updatedProfile,
        searchCount: profiles[existingIndex].searchCount || updatedProfile.searchCount || 0
      };
    } else {
      // Add new profile
      profiles.push({
        ...updatedProfile,
        searchCount: updatedProfile.searchCount || 0
      });
    }

    localStorage.setItem('profiles', JSON.stringify(profiles));

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  } catch (error) {
    console.warn('Failed to save profile:', error);
  }
}

export function getProfiles(): SearchResult[] {
  if (typeof window === 'undefined') return DEFAULT_PROFILES;

  try {
    const saved = localStorage.getItem('profiles');
    if (saved) {
      const profiles = JSON.parse(saved);
      return profiles.length > 0 ? profiles : DEFAULT_PROFILES;
    }

    // Initialize with default profiles
    localStorage.setItem('profiles', JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  } catch (error) {
    console.warn('Failed to load profiles:', error);
    return DEFAULT_PROFILES;
  }
}

export function incrementSearchCount(handle: string) {
  if (typeof window === 'undefined') return;

  try {
    const profiles = getProfiles();
    const profileIndex = profiles.findIndex(p => p.handle === handle);

    if (profileIndex !== -1) {
      profiles[profileIndex].searchCount++;
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }
  } catch (error) {
    console.warn('Failed to increment search count:', error);
  }
}

export const updateProfileSearchCount = (handle: string) => {
  try {
    const searchCounts = getProfileSearchCounts();
    searchCounts[handle] = (searchCounts[handle] || 0) + 1;

    if (typeof window !== 'undefined') {
      localStorage.setItem('profileSearchCounts', JSON.stringify(searchCounts));

      // Also update the profile in the main profiles array
      const profiles = getProfiles();
      const updatedProfiles = profiles.map(profile => 
        profile.handle === handle 
          ? { ...profile, searchCount: searchCounts[handle] }
          : profile
      );

      localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
    }
  } catch (error) {
    console.warn('Error updating search count:', error);
  }
};

export function getProfileSearchCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  try {
    const saved = localStorage.getItem('profileSearchCounts');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Failed to load search counts:', error);
    return {};
  }
}