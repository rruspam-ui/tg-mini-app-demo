import { STORAGE_GAME_SCORE } from './constants';
import type { TelegramUser } from './types';
import { createUser, findUserById, updateUser, type TUser } from './user';

// Получение кол-ва побед из локального хранилища
export const getScore = (): number => {
    const score = localStorage.getItem(STORAGE_GAME_SCORE);

    return score ? Number(score) : 0;
};

type TConfig = {
    isFetchDisabled: boolean;
    initData: string;
    user?: TUser;
};

const config: TConfig = {
    isFetchDisabled: false,
    initData: '',
};

export const setScore = (score: number): void => {
    localStorage.setItem(STORAGE_GAME_SCORE, score.toString());
};

export const getRemoteScore = async (tgUser: TelegramUser): Promise<number> => {
    const user = await findUserById(tgUser.id);

    if (user) {
        config.user = user;
        return user.score;
    }

    const emptyUser: TUser = {
        userId: tgUser.id.toString(),
        score: 0,
    };

    const newUser = await createUser(emptyUser);

    if (newUser) {
        config.user = newUser;
        return newUser.score;
    }

    return emptyUser.score;
};

export const setRemoteScore = async (score: number): Promise<void> => {
    const { user } = config;

    if (!user) {
        return;
    }

    const remoteUser = await findUserById(user.userId);

    if (remoteUser?.userKey) {
        const updatedUser: Required<TUser> = {
            userId: remoteUser.userId,
            userKey: remoteUser.userKey,
            score,
        };

        await updateUser(updatedUser);
        return;
    }

    const emptyUser: TUser = {
        userId: user.userId,
        score,
    };

    await createUser(emptyUser);
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
