export const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  // If it's a full URL (like from unsplash or external CDN), return it
  if (url.startsWith('http')) return url;
  
  // Otherwise prepend the backend URL for static files
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};
