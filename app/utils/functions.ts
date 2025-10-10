export function Log(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
        console.log({...args});
    }
}

export function parseUrlEncodedToRegularObject(encodedString: string) {
    const params = new URLSearchParams(encodedString);
    const regularObject = Object.fromEntries(params.entries());

    return regularObject;
}

export function removeEncodedSpaces(encodedString: string): string {
    return encodedString.slice(1, encodedString.length - 1);
}