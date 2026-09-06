import {spawn, ChildProcessWithoutNullStreams} from 'child_process'
import {Canvas, createCanvas, SKRSContext2D} from '@napi-rs/canvas'

export interface GifRenderOptions {
    width: number
    height: number
    fps: number
    frames: number
    // 0 — бесконечный повтор, -1 — проиграть один раз
    loop?: number
    // Размер палитры и дизеринг. По умолчанию 64 цвета без дизеринга: дизеринг добавляет шум,
    // который гифка почти не сжимает, поэтому без него файл выходит меньше и кодируется быстрее
    maxColors?: number
    dither?: string
    drawFrame: (context: SKRSContext2D, frame: number) => void
}

const DEFAULT_MAX_COLORS: number = 64
const DEFAULT_DITHER: string = 'none'

// Кадры уходят в ffmpeg сырыми пикселями через stdin, а гифка забирается из stdout.
// Так мы не тратим время на кодирование каждого кадра в jpeg и не пишем сотни файлов на диск.
export function renderGif(options: GifRenderOptions): Promise<Buffer> {
    const {
        width,
        height,
        fps,
        frames,
        loop = 0,
        maxColors = DEFAULT_MAX_COLORS,
        dither = DEFAULT_DITHER,
        drawFrame,
    } = options

    return new Promise<Buffer>((resolve, reject) => {
        const ffmpeg: ChildProcessWithoutNullStreams = spawn('ffmpeg', [
            '-hide_banner',
            '-loglevel', 'error',
            '-f', 'rawvideo',
            '-pix_fmt', 'rgba',
            '-s', `${width}x${height}`,
            '-framerate', String(fps),
            '-i', 'pipe:0',
            '-filter_complex',
            `[0:v]split[a][b];[a]palettegen=max_colors=${maxColors}:stats_mode=diff[p];[b][p]paletteuse=dither=${dither}`,
            '-loop', String(loop),
            '-f', 'gif',
            'pipe:1',
        ])

        const chunks: Buffer[] = []
        let errorOutput: string = ''

        ffmpeg.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
        ffmpeg.stderr.on('data', (chunk: Buffer) => {
            errorOutput += chunk.toString()
        })

        ffmpeg.on('error', reject)
        ffmpeg.on('close', (code: number|null) => {
            if (code !== 0) {
                reject(new Error(`ffmpeg завершился с кодом ${code}: ${errorOutput.slice(-500)}`))
                return
            }

            resolve(Buffer.concat(chunks))
        })

        const canvas: Canvas = createCanvas(width, height)
        const context: SKRSContext2D = canvas.getContext('2d')

        const writeFrames = async (): Promise<void> => {
            for (let frame: number = 0; frame < frames; frame++) {
                context.clearRect(0, 0, width, height)
                drawFrame(context, frame)

                const {data} = context.getImageData(0, 0, width, height)
                const buffer: Buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength)

                if (!ffmpeg.stdin.write(buffer)) {
                    await new Promise<void>(done => ffmpeg.stdin.once('drain', () => done()))
                }
            }

            ffmpeg.stdin.end()
        }

        writeFrames().catch(error => {
            ffmpeg.kill()
            reject(error)
        })
    })
}
