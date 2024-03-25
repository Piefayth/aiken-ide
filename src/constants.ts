const TOOLTIP_EXPIRE_TIME_MS = 2000


const FILE_EXTENSION_TO_MONACO_LANGUAGE: Record<string, string> = {
    ".ak": "aiken",
    ".js": "javascript",
    ".ts": "typescript",
    ".json": "json",
    ".txt": "plaintext"
}

const getFileLanguage = (filename: string) => {
    const fileExtension = filename.slice(filename.lastIndexOf('.'))
    return FILE_EXTENSION_TO_MONACO_LANGUAGE[fileExtension] || 'plaintext'
}
const ALLOWED_FILE_EXTENSIONS = Object.keys(FILE_EXTENSION_TO_MONACO_LANGUAGE)

export {
    TOOLTIP_EXPIRE_TIME_MS,
    ALLOWED_FILE_EXTENSIONS,
    FILE_EXTENSION_TO_MONACO_LANGUAGE,
    getFileLanguage // TODO: This goes somewhere else?
}