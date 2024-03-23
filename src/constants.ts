const TOOLTIP_EXPIRE_TIME_MS = 2000
const CURSED_ZERO_WIDTH_SPACE = "​"


const FILE_EXTENSION_TO_MONACO_LANGUAGE: Record<string, string> = {
    ".ak": "aiken",
    ".js": "javascript",
    ".ts": "typescript",
    ".json": "json",
    ".txt": "plaintext"
}

const ALLOWED_FILE_EXTENSIONS = Object.keys(FILE_EXTENSION_TO_MONACO_LANGUAGE)

export {
    TOOLTIP_EXPIRE_TIME_MS,
    CURSED_ZERO_WIDTH_SPACE,
    ALLOWED_FILE_EXTENSIONS,
    FILE_EXTENSION_TO_MONACO_LANGUAGE
}