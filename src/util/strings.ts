function findLineNumberByCharIndex(text: string, charIndex: number): number | null {
    const lines = text.split(/\r?\n/); // Handle both Unix and Windows line endings
    let currentLength = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (currentLength + line.length >= charIndex) {
            return i + 1; // Return the line number (1-indexed)
        }
        currentLength += line.length + 1; // Add 1 for the newline character
    }

    return null; // If the character index is out of range
}

function splitFilename(filename: string) {
    const dotIndex = filename.lastIndexOf('.');

    if (dotIndex === -1) {
        return {
            name: filename,
            extension: ''
        };
    }

    return {
        name: filename.substring(0, dotIndex),
        extension: filename.substring(dotIndex)
    };
};

export { findLineNumberByCharIndex, splitFilename }