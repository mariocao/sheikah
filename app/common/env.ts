export const inDevelopment: boolean = process.env.NODE_ENV === "development"

export const inDarwin: boolean = process.platform === "darwin"

export const inHotMode: boolean = "HOT" in process.env
