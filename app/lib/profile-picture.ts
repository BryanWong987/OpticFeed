
import 'server-only';

import path from 'node:path';

export const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024; // 5 MB

export const PROFILE_PICTURE_TYPES = {
    jpeg: {
        extension: 'jpg',
        contentType: 'image/jpeg',
    },
    png: {
        extension: 'png',
        contentType: 'image/png',
    },
    webp: {
        extension: 'webp',
        contentType: 'image/webp',
    },
} as const;

export function getProfilePictureDirectory(): string {
    const configuredDirectory = process.env.PROFILE_UPLOAD_DIR;

    if (!configuredDirectory) {
        throw new Error('PROFILE_UPLOAD_DIR is not configured.');
    }

    return path.resolve(process.cwd(), configuredDirectory);
}

export function getImageType(
    bytes: Uint8Array
): keyof typeof PROFILE_PICTURE_TYPES | null {

    // JPEG
    if (
        bytes[0] === 0xFF &&
        bytes[1] === 0xD8 &&
        bytes[2] === 0xFF
    ) {
        return 'jpeg';
    }

    // PNG
    if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4E &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0D &&
        bytes[5] === 0x0A &&
        bytes[6] === 0x1A &&
        bytes[7] === 0x0A
    ) {
        return 'png';
    }

    // WEBP
    if (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ) {
        return 'webp';
    }

    return null;
}

export function isValidProfilePictureFilename(
    filename: string
): boolean {
    return /^\d+-[a-f0-9]{32}\.(jpg|png|webp)$/.test(filename);
}
