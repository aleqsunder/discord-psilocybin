import { SKRSContext2D } from '@napi-rs/canvas'

export const ARROW_WIDTH: number = 30
export const ARROW_HEIGHT: number = 20
export const ARROW_Y_OFFSET: number = 10
export const SHAKE_DURATION: number = 2
export const SHAKE_AMPLITUDE: number = 8

export let arrowShakeOffset: number = 0
export let shakeTime: number = 0

export function triggerArrowShake(): void {
    if (shakeTime === 0) {
        shakeTime = SHAKE_DURATION
    }
}

export function updateArrowShake(velocity: number): void {
    if (shakeTime > 0) {
        const dynamicAmplitude: number = Math.min(SHAKE_AMPLITUDE, velocity / 7)
        arrowShakeOffset = -Math.random() * dynamicAmplitude
        shakeTime--
    } else {
        arrowShakeOffset = 0
    }
}

export function drawArrow(ctx: SKRSContext2D, x: number, y: number, width: number, height: number): void {
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate((arrowShakeOffset / 100) * Math.PI)
    ctx.translate(-(x + width / 2), -(y + height / 2))

    ctx.beginPath()
    ctx.moveTo(x + width / 2, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()
    ctx.fillStyle = 'red'
    ctx.fill()

    ctx.restore()
}
