export function generateUUID(length = 8) {
    return [...Array(length)].map(() =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}