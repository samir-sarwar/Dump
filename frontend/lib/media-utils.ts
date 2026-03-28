const IMAGE_MIME_MAP: Record<string, string> = {
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
};

const VIDEO_MIME_MAP: Record<string, string> = {
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
};

export function getMimeType(filename: string, type: 'PHOTO' | 'VIDEO'): string {
  const dotIndex = filename.lastIndexOf('.');
  const ext = dotIndex >= 0 ? filename.substring(dotIndex).toLowerCase() : '';

  if (type === 'VIDEO') {
    return VIDEO_MIME_MAP[ext] ?? 'video/mp4';
  }

  return IMAGE_MIME_MAP[ext] ?? 'image/jpeg';
}
