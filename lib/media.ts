// Shared by server and client: which stored files are photos vs. videos, and the video limits.
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_VIDEO_SECONDS = 60;
export const MAX_VIDEOS_PER_POST = 4;

export const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };

const MEDIA_PATH = /^(photos\/[\w-]+\.(jpg|png|webp)|videos\/[\w-]+\.(mp4|mov|webm))$/;
export const isMediaPath = (p: unknown): p is string => typeof p === "string" && MEDIA_PATH.test(p);
export const isVideoPath = (p: string) => p.startsWith("videos/");
export const VIDEO_UPLOAD_PATH = /^videos\/[0-9a-f-]{36}\.(mp4|mov|webm)$/;
