export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dedent = (str: string) => str.replace(/^\t+|^ +/gm, '');