import path from 'path'
import {execFile} from 'node:child_process'
import {mkdtemp, readFile, rm, stat, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'

const MAX_VIDEO_BYTES = Math.floor(1.5 * 1000 * 1024)

export async function toVideoDataUrl(videoUrl: string): Promise<string> {
    if (videoUrl.startsWith('data:')) {
        return videoUrl
    }

    const response = await fetch(videoUrl)
    if (!response.ok) {
        throw new Error(`VIDEO_FETCH_FAILED_${response.status}`)
    }

    const contentTypeHeader = response.headers.get('content-type') ?? ''
    const contentType = contentTypeHeader.split(';')[0].trim()
    const initialMimeType = contentType || getVideoMimeTypeFromUrl(videoUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length <= MAX_VIDEO_BYTES) {
        const base64 = buffer.toString('base64')
        return `data:${initialMimeType};base64,${base64}`
    }

    const tempDir = await mkdtemp(path.join(tmpdir(), 'video-'))
    const inputPath = path.join(tempDir, `input${videoExtFromMime(initialMimeType)}`)
    await writeFile(inputPath, buffer)

    try {
        const compressed = await maybeCompressVideo(inputPath, tempDir)
        const outputBuffer = await readFile(compressed.outputPath)
        const mimeType = getVideoMimeType(compressed.outputPath)
        const base64 = outputBuffer.toString('base64')
        return `data:${mimeType};base64,${base64}`
    } finally {
        await rm(tempDir, {recursive: true, force: true})
    }
}

function getVideoMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.webm') return 'video/webm'
    if (ext === '.mov') return 'video/quicktime'
    return 'video/mp4'
}

function getVideoMimeTypeFromUrl(videoUrl: string): string {
    try {
        const url = new URL(videoUrl)
        const ext = path.extname(url.pathname).toLowerCase()
        if (ext === '.webm') return 'video/webm'
        if (ext === '.mov') return 'video/quicktime'
    } catch {
        return 'video/mp4'
    }

    return 'video/mp4'
}

function videoExtFromMime(mimeType: string): string {
    const mime = mimeType.toLowerCase()
    if (mime.includes('webm')) return '.webm'
    if (mime.includes('quicktime')) return '.mov'
    return '.mp4'
}

async function maybeCompressVideo(pathToVideo: string, tempDir: string): Promise<{outputPath: string}> {
    const inputStat = await stat(pathToVideo)
    if (inputStat.size <= MAX_VIDEO_BYTES) {
        return {outputPath: pathToVideo}
    }

    let targetSize = 480
    let crf = 28
    let audioBitrate = 32
    let outputPath = path.join(tempDir, 'video-0.mp4')

    for (let i = 0; i < 6; i += 1) {
        outputPath = path.join(tempDir, `video-${i}.mp4`)
        await runFfmpeg([
            '-y',
            '-i',
            pathToVideo,
            '-vf',
            `scale=w='if(gt(iw,ih),${targetSize},-2)':h='if(gt(iw,ih),-2,${targetSize})',fps=6`,
            '-c:v',
            'libx264',
            '-preset',
            'veryfast',
            '-crf',
            String(crf),
            '-c:a',
            'aac',
            '-b:a',
            `${audioBitrate}k`,
            outputPath
        ])

        const outStat = await stat(outputPath)
        if (outStat.size <= MAX_VIDEO_BYTES) {
            return {outputPath}
        }

        if (targetSize > 320) targetSize -= 80
        if (crf < 40) crf += 4
        if (audioBitrate > 16) audioBitrate -= 8
    }

    return {outputPath}
}

function runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile('ffmpeg', args, error => {
            if (error) {
                reject(error)
                return
            }

            resolve()
        })
    })
}
