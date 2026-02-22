
/**
 * Utility functions for handling images on the client side
 */

export const getProxiedImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // If it's already a local path or a blob, return it as is
    if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // Only proxy external URLs that might have CORS or referer restrictions
    if (
        url.includes('googleusercontent.com') ||
        url.includes('googleapis.com') ||
        url.includes('google.com') ||
        url.includes('streetviewpixels')
    ) {
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return url;
};

export const getFallbackLogo = (): string => {
    return '/uploads/workshops/autorepara.png';
};
