export function formatTime(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600)
    const minutes: number = Math.floor((seconds % 3600) / 60)
    const secs: number = seconds % 60

    const pad = (num: number) => num.toString().padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    } else {
        return `${pad(minutes)}:${pad(secs)}`
    }
}
