import OpenAI from 'openai';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ChunkInfo } from './types';
import { formatTime } from './utils';

interface TranscriptionOptions {
    language?: string;
    prompt?: string;
    temperature?: number;
}

/**
 * Transcribe an audio chunk using OpenAI's Whisper API
 * @param chunkInfo Object containing chunk path and timing info
 * @param openai OpenAI client instance
 * @param options Transcription options
 * @returns Transcription text with timestamp info
 */
export async function transcribeChunk(
    chunkInfo: ChunkInfo,
    openai: OpenAI,
    options: TranscriptionOptions = {}
): Promise<string> {
    console.log(`Transcribing chunk: ${formatTime(chunkInfo.startTime)} to ${formatTime(chunkInfo.endTime)}...`);

    try {
        const fileStream = fs.createReadStream(chunkInfo.path);

        const response = await openai.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-1',
            language: options.language,
            prompt: options.prompt,
            temperature: options.temperature
        });

        // Add timestamp to the beginning of the transcription
        return `[${formatTime(chunkInfo.startTime)}] ${response.text}`;
    } catch (error) {
        console.error(`Error transcribing chunk:`, error);
        throw error;
    }
}

/**
 * Transcribe all chunks and combine into a single transcription
 * @param chunks Array of chunk info objects
 * @param openai OpenAI client instance
 * @param options Transcription options
 * @returns Combined transcription text
 */
export async function transcribeAudio(
    chunks: ChunkInfo[],
    openai: OpenAI,
    options: TranscriptionOptions = {}
): Promise<string> {
    console.log(`Starting transcription of ${chunks.length} chunks...`);

    const transcriptions = await Promise.all(
        chunks.map(chunk => transcribeChunk(chunk, openai, options))
    );

    return transcriptions.join('\n\n');
}

/**
 * Save transcription to a file
 * @param transcription Transcription text
 * @param inputFilePath Original audio file path
 * @param outputDir Output directory
 * @returns Path to the saved transcription file
 */
export async function saveTranscription(
    transcription: string,
    inputFilePath: string,
    outputDir: string = './transcriptions'
): Promise<string> {
    await fs.ensureDir(outputDir);

    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputPath = path.join(outputDir, `${fileName}_transcription.txt`);

    await fs.writeFile(outputPath, transcription);
    console.log(`Transcription saved to: ${outputPath}`);

    return outputPath;
}