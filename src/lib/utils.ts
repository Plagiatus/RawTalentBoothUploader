export function delay(ms: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, ms);
    })
}

export function compareNumbers(a: number, b: number, epsilon: number): boolean {
    return Math.abs(a - b) < epsilon;
}