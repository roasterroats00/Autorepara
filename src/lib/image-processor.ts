/**
 * Image Processing Library
 * Downloads and saves images from URLs for workshop listings
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export interface ImageProcessResult {
    logoUrl?: string;
    images: string[];
}

/**
 * Download image from URL and save to local storage
 */
export async function downloadAndSaveImage(
    imageUrl: string,
    workshopId: string,
    type: 'logo' | 'main_image' | 'gallery'
): Promise<string | null> {
    try {
        console.log(`[Image Processor] Downloading ${type} from:`, imageUrl);

        // Download image with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`[Image Processor] Failed to download (${response.status}):`, imageUrl);
            return null;
        }

        const buffer = await response.arrayBuffer();

        // Generate unique filename
        const hash = crypto.createHash('md5').update(Buffer.from(buffer)).digest('hex');
        const ext = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || 'jpg';
        const filename = `${type}-${workshopId.substring(0, 8)}-${hash.substring(0, 8)}.${ext}`;

        // Ensure upload directory exists
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'workshops');
        await mkdir(uploadsDir, { recursive: true });

        // Save file
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, Buffer.from(buffer));

        console.log(`[Image Processor] Saved ${type}:`, filename);

        // Return public URL
        return `/uploads/workshops/${filename}`;

    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            console.warn(`[Image Processor] Timeout downloading:`, imageUrl);
        } else {
            console.error(`[Image Processor] Error downloading image:`, (error as Error).message);
        }
        return null;
    }
}

/**
 * Process all images for a workshop from CSV row
 * @param row - Raw CSV row data
 * @param workshopId - Workshop UUID
 * @param mappedUrls - Optional pre-mapped URLs from column mapping (logo, mainImage)
 */
export async function processWorkshopImages(
    row: any,
    workshopId: string,
    mappedUrls?: { logo?: string; mainImage?: string }
): Promise<ImageProcessResult> {
    const result: ImageProcessResult = { images: [] };

    // Process logo - check mappedUrls first, then direct CSV columns
    let logoSource = mappedUrls?.logo || row['logo'];

    // If no logo, try to use main image as fallback logo (if it's not a streetview image)
    const mainImageSource = mappedUrls?.mainImage || row['main_image'];
    if (!logoSource && mainImageSource && !mainImageSource.includes('streetview')) {
        logoSource = mainImageSource;
    }

    if (logoSource) {
        const logoUrl = await downloadAndSaveImage(logoSource, workshopId, 'logo');
        if (logoUrl) {
            result.logoUrl = logoUrl;
        }
    }

    // Process main image (featured image)
    if (mainImageSource) {
        const mainImageUrl = await downloadAndSaveImage(mainImageSource, workshopId, 'main_image');
        if (mainImageUrl) {
            result.images.push(mainImageUrl);
        }
    }

    return result;
}
