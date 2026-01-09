import { STORAGE_GAME_SCORE } from './constants';

// В разработке используем прокси Vite для обхода CORS
// В продакшене используем прямой URL (требует настройки CORS на сервере)
const getApiUrl = (path: string): string => {
    if (import.meta.env.DEV) {
        // В разработке используем прокси через Vite
        return `/api${path}`;
    }
    // В продакшене используем прямой URL
    return `https://firestore.googleapis.com/v1/projects/tg-memory-game/databases/(default)/documents${path}`;
};

// Получение кол-ва побед из локального хранилища
export const getScore = (): number => {
    const score = localStorage.getItem(STORAGE_GAME_SCORE);

    return score ? Number(score) : 0;
};

const config = {
    isFetchDisabled: false,
    initData: '',
};

export const getRemoteScore = async (data: unknown): Promise<number> => {
    try {
        if (config.isFetchDisabled) {
            return getScore();
        }

        return getScore();

        const response = await fetch(getApiUrl('/telegram'), {
            method: 'POST',
            mode: 'cors', // Явно указываем CORS режим
            headers: {
                'Content-Type': 'application/json',
                // Дополнительные заголовки для CORS обычно не нужны.
                // Браузер автоматически обрабатывает preflight запросы.
                // Если сервер требует авторизацию, раскомментируйте:
                // 'Authorization': 'Bearer YOUR_TOKEN',
                Authorization: `tma ${config.initData}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const score = result.score ?? 0;

        setScore(score);

        return score;
    } catch (error) {
        config.isFetchDisabled = true;
        console.error('Failed to fetch remote score:', error);
        return getScore();
    }
};

export const setScore = (score: number): void => {
    localStorage.setItem(STORAGE_GAME_SCORE, score.toString());
};

export const setInitData = (data: string | undefined): void => {
    if (!data) {
        console.warn(`SET Init data is not exist!!!`);
        return;
    }

    config.initData = data;
};

const sendLog = async (level: string, data: unknown): Promise<void> => {
    if (config.isFetchDisabled) {
        return;
    }

    try {
        console.log('SEND LOG ==>', level, data);
        console.log('Authorization ==>', config.initData);

        // const response = await fetch(getApiUrl('/telegram/logger'), {
        //     method: 'POST',
        //     mode: 'cors', // Явно указываем CORS режим
        //     headers: {
        //         Authorization: `tma ${config.initData}`,
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ level, data }),
        // });

        // if (!response.ok) {
        //     console.warn(`Logging failed: ${response.status} ${response.statusText}`);
        // }
    } catch (error) {
        config.isFetchDisabled = true;
        // CORS ошибки будут перехвачены здесь
        // В продакшене лучше не логировать, чтобы не засорять консоль
        if (import.meta.env.DEV) {
            console.warn('Failed to send log to server (CORS or network error):', error);
        }
    }
};

export const logInfo = async (message: unknown): Promise<void> => sendLog('INFO', { message });
export const logError = async (message: unknown): Promise<void> => sendLog('ERROR', { message });
export const logDebug = async (message: unknown): Promise<void> => sendLog('DEBUG', { message });
