/**
 * Information about an audio chunk
 */
export interface ChunkInfo {
    /** Path to the audio chunk file */
    path: string;
    /** Start time in seconds */
    startTime: number;
    /** End time in seconds */
    endTime: number;
}

/**
 * Command line arguments
 */
export interface CliArgs {
    /** Path to the input audio file */
    input: string;
    /** Output directory for transcriptions */
    output?: string;
    /** Maximum chunk size in MB */
    maxChunkSize?: number;
    /** Language of the audio (ISO-639-1 code) */
    language?: string;
    /** Prompt to guide the transcription */
    prompt?: string;
    /** Temperature for the OpenAI API */
    temperature?: number;
}