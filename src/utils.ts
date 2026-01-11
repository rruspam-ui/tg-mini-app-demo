import type { TelegramUser } from './types';
import { createUser, findUserById, updateUser, type TUser, type TUserCreate, type TUserUpdate } from './user';

type TConfig = {
    isFetchDisabled: boolean;
    initData: string;
    user?: TUser;
};

const config: TConfig = {
    isFetchDisabled: false,
    initData: '',
};

// Кол-во побед
export const getScore = (): number => {
    return config.user?.score ?? 0;
};

// Наилучший результат (кол-во попыток)
export const getRecord = (): number => {
    return config.user?.record ?? 0;
};

// Наилучший результат (кол-во попыток)
export const setRecord = (record: number): number => {
    const { user } = config;

    if (!user) {
        return 0;
    }

    if (!user.record || user.record > record) {
        user.record = record;
    }

    return user.record;
};

// Получение данных с сервера и сохранение в конфигурации
export const getRemoteInfo = async (tgUser: TelegramUser): Promise<void> => {
    const user = await findUserById(tgUser.id);

    if (user) {
        config.user = user;
    }
};

export const setRemoteInfo = async (score: number): Promise<void> => {
    const { user } = config;

    if (!user?.record) {
        return;
    }

    if (user.userKey) {
        // Защита от повторных обновлений
        if (user.score !== score) {
            user.score = score;

            const updatedUser: TUserUpdate = {
                userId: user.userId,
                userKey: user.userKey,
                score,
                record: user.record,
            };

            await updateUser(updatedUser);
        }
    } else {
        const emptyUser: TUserCreate = {
            userId: user.userId,
            score,
            record: user.record,
        };

        const newUser = await createUser(emptyUser);

        if (newUser) {
            user.userKey = newUser.userKey;
            user.score = score;
        }
    }
};

export const setInitData = (data: string | undefined): void => {
    if (!data) {
        console.warn(`SET Init data is not exist!!!`);
        return;
    }

    config.initData = data;
};

// const sendLog = async (level: string, data: unknown): Promise<void> => {
//     if (config.isFetchDisabled) {
//         return;
//     }

//     try {
//         console.log('SEND LOG ==>', level, data);
//         console.log('Authorization ==>', config.initData);

//         // const response = await fetch(getApiUrl('/telegram/logger'), {
//         //     method: 'POST',
//         //     mode: 'cors', // Явно указываем CORS режим
//         //     headers: {
//         //         Authorization: `tma ${config.initData}`,
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify({ level, data }),
//         // });

//         // if (!response.ok) {
//         //     console.warn(`Logging failed: ${response.status} ${response.statusText}`);
//         // }
//     } catch (error) {
//         config.isFetchDisabled = true;
//         // CORS ошибки будут перехвачены здесь
//         // В продакшене лучше не логировать, чтобы не засорять консоль
//         if (import.meta.env.DEV) {
//             console.warn('Failed to send log to server (CORS or network error):', error);
//         }
//     }
// };

// export const logInfo = async (message: unknown): Promise<void> => sendLog('INFO', { message });
// export const logError = async (message: unknown): Promise<void> => sendLog('ERROR', { message });
// export const logDebug = async (message: unknown): Promise<void> => sendLog('DEBUG', { message });
