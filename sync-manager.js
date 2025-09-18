export class SyncManager {
    constructor() {
        this.isUpdating = false;
        this.lastSource = null;
        this.debounceTimer = null;
        this.codemirrorEditor = null;
        this.milkdownEditor = null;
        this.syncDelay = 500;
    }

    init(codemirrorEditor, milkdownEditor) {
        this.codemirrorEditor = codemirrorEditor;
        this.milkdownEditor = milkdownEditor;
    }

    handleCodeMirrorChange(content) {
        if (this.isUpdating) return;

        clearTimeout(this.debounceTimer);
        this.updateStatus('syncing');

        this.debounceTimer = setTimeout(async () => {
            if (this.lastSource === 'milkdown') {
                this.lastSource = null;
                this.updateStatus('ready');
                return;
            }

            this.isUpdating = true;
            this.lastSource = 'codemirror';

            try {
                const cursorPos = this.codemirrorEditor.getCursorPosition();

                await this.milkdownEditor.setContent(content);

                const approximatePos = this.calculateApproximatePosition(content, cursorPos);
                if (approximatePos >= 0) {
                    this.milkdownEditor.setCursorPosition(approximatePos);
                }

                this.updateWordCount(content);
                this.updateStatus('ready');
            } catch (error) {
                console.error('Error syncing to Milkdown:', error);
                this.updateStatus('error');
            } finally {
                setTimeout(() => {
                    this.isUpdating = false;
                    this.lastSource = null;
                }, 100);
            }
        }, this.syncDelay);
    }

    handleMilkdownChange(content) {
        if (this.isUpdating) return;

        clearTimeout(this.debounceTimer);
        this.updateStatus('syncing');

        this.debounceTimer = setTimeout(() => {
            if (this.lastSource === 'codemirror') {
                this.lastSource = null;
                this.updateStatus('ready');
                return;
            }

            this.isUpdating = true;
            this.lastSource = 'milkdown';

            try {
                const currentContent = this.codemirrorEditor.getContent();

                if (currentContent !== content) {
                    const cursorPos = this.codemirrorEditor.getCursorPosition();

                    this.codemirrorEditor.setContent(content);

                    const newCursorPos = this.adjustCursorPosition(currentContent, content, cursorPos);
                    this.codemirrorEditor.setCursorPosition(newCursorPos);
                }

                this.updateWordCount(content);
                this.updateStatus('ready');
            } catch (error) {
                console.error('Error syncing to CodeMirror:', error);
                this.updateStatus('error');
            } finally {
                setTimeout(() => {
                    this.isUpdating = false;
                    this.lastSource = null;
                }, 100);
            }
        }, this.syncDelay);
    }

    calculateApproximatePosition(content, position) {
        const textBeforeCursor = content.substring(0, position);
        const linesBeforeCursor = textBeforeCursor.split('\n').length;
        const lastLineLength = textBeforeCursor.split('\n').pop().length;

        let approximatePos = 0;
        const lines = content.split('\n');

        for (let i = 0; i < Math.min(linesBeforeCursor - 1, lines.length); i++) {
            approximatePos += lines[i].length + 1;
        }

        if (linesBeforeCursor <= lines.length) {
            approximatePos += Math.min(lastLineLength, lines[linesBeforeCursor - 1]?.length || 0);
        }

        return Math.min(approximatePos, content.length);
    }

    adjustCursorPosition(oldContent, newContent, oldPosition) {
        if (oldContent === newContent) {
            return oldPosition;
        }

        const commonPrefixLength = this.getCommonPrefixLength(oldContent, newContent);

        if (oldPosition <= commonPrefixLength) {
            return oldPosition;
        }

        const commonSuffixLength = this.getCommonSuffixLength(
            oldContent.substring(commonPrefixLength),
            newContent.substring(commonPrefixLength)
        );

        const oldEndPosition = oldContent.length - commonSuffixLength;

        if (oldPosition >= oldEndPosition) {
            const offset = oldContent.length - oldPosition;
            return Math.max(0, newContent.length - offset);
        }

        const ratio = (oldPosition - commonPrefixLength) / (oldEndPosition - commonPrefixLength);
        const newEndPosition = newContent.length - commonSuffixLength;
        const newPosition = commonPrefixLength + Math.round(ratio * (newEndPosition - commonPrefixLength));

        return Math.min(Math.max(0, newPosition), newContent.length);
    }

    getCommonPrefixLength(str1, str2) {
        let i = 0;
        const minLength = Math.min(str1.length, str2.length);
        while (i < minLength && str1[i] === str2[i]) {
            i++;
        }
        return i;
    }

    getCommonSuffixLength(str1, str2) {
        let i = 0;
        const minLength = Math.min(str1.length, str2.length);
        while (i < minLength &&
               str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
            i++;
        }
        return i;
    }

    updateStatus(status) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusElement.className = status === 'syncing' ? 'syncing' : '';
        }
    }

    updateWordCount(content) {
        const words = content.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `Words: ${wordCount}`;
        }
    }

    destroy() {
        clearTimeout(this.debounceTimer);
        this.codemirrorEditor = null;
        this.milkdownEditor = null;
    }
}