import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { splitAudioFile, cleanupChunks } from './audioSplitter';
import { transcribeAudio, saveTranscription } from './transcriber';
import { isAudioFile, fileExists, ensureDirectoryExists } from './utils';
import { CliArgs } from './types';

// Load environment variables
dotenv.config();

async function main() {
    // Debug: Log received arguments
    console.log('Raw arguments:', process.argv);

    // Parse command line arguments
    const argv = yargs(hideBin(process.argv))
        .strictOptions(true)
        .options({
            input: {
                alias: 'i',
                describe: 'Path to the input audio file',
                type: 'string',
                demandOption: true
            },
            output: {
                alias: 'o',
                describe: 'Output directory for transcriptions',
                type: 'string',
                default: process.env.OUTPUT_DIR || './transcriptions'
            },
            maxChunkSize: {
                alias: 'm',
                describe: 'Maximum chunk size in MB',
                type: 'number',
                default: Number(process.env.MAX_CHUNK_SIZE_MB) || 25
            },
            language: {
                alias: 'l',
                describe: 'Language of the audio (ISO-639-1 code)',
                type: 'string'
            },
            prompt: {
                alias: 'p',
                describe: 'Prompt to guide the transcription',
                type: 'string'
            },
            temperature: {
                alias: 't',
                describe: 'Temperature for the OpenAI API',
                type: 'number',
                default: 0
            }
        })
        .help()
        .parseSync() as CliArgs;

    try {
        // Validate input file
        if (!await fileExists(argv.input)) {
            throw new Error(`Input file does not exist: ${argv.input}`);
        }

        if (!isAudioFile(argv.input)) {
            throw new Error(`Input file is not a supported audio file: ${argv.input}`);
        }

        // Validate API key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not found. Please set it in the .env file or as an environment variable.');
        }

        // Create output directory
        const outputDir = path.resolve(argv.output || './transcriptions');
        await ensureDirectoryExists(outputDir);

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: apiKey
        });

        console.log(`Processing audio file: ${argv.input}`);
        console.log(`Output directory: ${outputDir}`);
        console.log(`Maximum chunk size: ${argv.maxChunkSize}MB`);

        // Split audio file into chunks if necessary
        const chunks = await splitAudioFile(argv.input, argv.maxChunkSize);

        // Transcribe audio chunks
        const transcription = await transcribeAudio(chunks, openai, {
            language: argv.language,
            prompt: argv.prompt,
            temperature: argv.temperature
        });

        // Save transcription to a file
        await saveTranscription(transcription, argv.input, outputDir);

        // Clean up temporary files
        await cleanupChunks(chunks);

        console.log('Transcription complete!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the main function
main();