
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
    getProfilePictureDirectory,
    isValidProfilePictureFilename,
} from '@/app/lib/profile-picture';

const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    if (!isValidProfilePictureFilename(filename)) {
        return new Response('Not found.', { status: 404 });
    }

    const extension = path.extname(filename).slice(1);
    const contentType = contentTypes[extension];

    if (!contentType) {
        return new Response('Not found.', { status: 404 });
    }

    try {
        const filePath = path.join(
            getProfilePictureDirectory(),
            filename
        );

        const image = await readFile(filePath);

        return new Response(new Uint8Array(image), {
            headers: {
                'Content-Type': contentType,
                'Content-Length': String(image.length),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            return new Response('Not found.', { status: 404 });
        }

        console.error('Profile picture retrieval error:', error);

        return new Response('Internal server error.', {
            status: 500,
        });
    }
}
