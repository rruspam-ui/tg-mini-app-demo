import { STORAGE_GAME_SCORE } from './constants';

export const getScore = (): number => {
    const score = localStorage.getItem(STORAGE_GAME_SCORE);

    return score ? Number(score) : 0;
};

export const getRemoteScore = async (data: unknown): Promise<number> => {
    try {
        const response = await fetch('http://way-test.dev.tedo.ru/telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Дополнительные заголовки для CORS обычно не нужны.
                // Браузер автоматически обрабатывает preflight запросы.
                // Если сервер требует авторизацию, раскомментируйте:
                // 'Authorization': 'Bearer YOUR_TOKEN',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`result ==>`, result);
        return result.score ?? 0;
    } catch (error) {
        console.error('Failed to fetch remote score:', error);
        return 0;
    }
};

export const setScore = (score: number): void => {
    localStorage.setItem(STORAGE_GAME_SCORE, score.toString());
};

const sendLog = async (level: string, data: unknown): Promise<void> => {
    try {
        await fetch('http://way-test.dev.tedo.ru/telegram/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ level, data }),
        });
    } catch {
        /* empty */
    }
};

export const logInfo = async (message: unknown): Promise<void> => sendLog('INFO', { message });
export const logError = async (message: unknown): Promise<void> => sendLog('ERROR', { message });
export const logDebug = async (message: unknown): Promise<void> => sendLog('DEBUG', { message });
