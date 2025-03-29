import * as fs from 'fs-extra';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';

/**
 * Get file size in MB
 * @param filePath Path to the file
 * @returns Size in MB
 */
export async function getFileSizeInMB(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size / (1024 * 1024);
}

/**
 * Get audio duration in seconds
 * @param filePath Path to the audio file
 * @returns Duration in seconds
 */
export function getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
        });
    });
}

/**
 * Create directory if it doesn't exist
 * @param dirPath Directory path
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
}

/**
 * Get file extension
 * @param filePath Path to the file
 * @returns File extension
 */
export function getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
}

/**
 * Check if file exists
 * @param filePath Path to the file
 * @returns Boolean indicating if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate that the file is an audio file
 * @param filePath Path to the file
 * @returns Boolean indicating if file is audio
 */
export function isAudioFile(filePath: string): boolean {
    const extension = getFileExtension(filePath);
    return ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'].includes(extension);
}

/**
 * Format time in seconds to HH:MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}