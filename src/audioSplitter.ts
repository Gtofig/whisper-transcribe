import * as fs from 'fs-extra';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { getAudioDuration, getFileSizeInMB, formatTime } from './utils';

interface ChunkInfo {
    path: string;
    startTime: number;
    endTime: number;
}

/**
 * Split audio file into chunks
 * @param filePath Path to the audio file
 * @param maxChunkSizeMB Maximum chunk size in MB
 * @returns Array of paths to chunk files
 */
export async function splitAudioFile(
    filePath: string,
    maxChunkSizeMB: number = 25
): Promise<ChunkInfo[]> {
    const fileSize = await getFileSizeInMB(filePath);

    // If file is smaller than the max chunk size, return original file
    if (fileSize <= maxChunkSizeMB) {
        console.log(`File is ${fileSize.toFixed(2)}MB, which is under the ${maxChunkSizeMB}MB limit. No splitting required.`);
        return [{
            path: filePath,
            startTime: 0,
            endTime: await getAudioDuration(filePath)
        }];
    }

    console.log(`File is ${fileSize.toFixed(2)}MB, which exceeds the ${maxChunkSizeMB}MB limit. Splitting into chunks...`);

    // Calculate number of chunks needed
    const totalDuration = await getAudioDuration(filePath);
    console.log(`Audio duration: ${formatTime(totalDuration)}`);

    // Estimate number of chunks (with a safety factor)
    const estimatedChunks = Math.ceil(fileSize / maxChunkSizeMB) + 1;
    const chunkDuration = totalDuration / estimatedChunks;

    const tempDir = path.join(path.dirname(filePath), '.temp');
    await fs.ensureDir(tempDir);

    const fileBaseName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath);

    const chunks: ChunkInfo[] = [];

    // Create chunks
    for (let i = 0; i < estimatedChunks; i++) {
        const startTime = i * chunkDuration;
        const endTime = Math.min((i + 1) * chunkDuration, totalDuration);

        if (startTime >= totalDuration) break;

        const chunkPath = path.join(tempDir, `${fileBaseName}_chunk${i + 1}${fileExt}`);

        await new Promise<void>((resolve, reject) => {
            ffmpeg(filePath)
                .setStartTime(startTime)
                .setDuration(endTime - startTime)
                .output(chunkPath)
                .on('end', () => {
                    console.log(`Created chunk ${i + 1}/${estimatedChunks}: ${formatTime(startTime)} to ${formatTime(endTime)}`);
                    resolve();
                })
                .on('error', (err: Error) => {
                    console.error(`Error creating chunk ${i + 1}:`, err);
                    reject(err);
                })
                .run();
        });

        const chunkSize = await getFileSizeInMB(chunkPath);
        if (chunkSize > maxChunkSizeMB) {
            console.warn(`Warning: Chunk ${i + 1} is ${chunkSize.toFixed(2)}MB, which exceeds the ${maxChunkSizeMB}MB limit.`);
            // You could implement recursive splitting here if needed
        }

        chunks.push({
            path: chunkPath,
            startTime,
            endTime
        });
    }

    console.log(`Split audio into ${chunks.length} chunks.`);
    return chunks;
}

/**
 * Clean up temporary chunk files
 * @param chunks Array of chunk info objects
 */
export async function cleanupChunks(chunks: ChunkInfo[]): Promise<void> {
    if (chunks.length <= 1) return; // If only one chunk, it's the original file

    const tempDir = path.dirname(chunks[0].path);

    console.log('Cleaning up temporary chunk files...');
    await fs.remove(tempDir);
    console.log('Temporary files cleaned up.');
}