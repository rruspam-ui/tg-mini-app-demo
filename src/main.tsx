import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import {
    miniApp,
    mainButton,
    shareURL,
    initData,
    popup,
    retrieveLaunchParams,
    retrieveRawInitData,
} from '@tma.js/sdk-react';
import { init } from './init.ts';
import { getScore, setInitData, getRemoteInfo, getRecord } from './utils.ts';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';
import { APP_VERSION } from './constants.ts';

const root = createRoot(document.getElementById('root')!);

try {
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;
    const debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;

    // Configure all application dependencies.
    await init({
        debug,
        mockForMacOS: platform === 'macos',
    });

    // Запрашиваем очки с сервера и сохраняем в localStorage
    const user = initData.user();
    if (user) {
        await getRemoteInfo(user);
    }

    // Инициализируем React интерфейс после сохранения очков
    root.render(
        <StrictMode>
            <App />
        </StrictMode>,
    );

    // Mini App готово
    miniApp.ready();

    // Главная кнопка установлена
    mainButton.mount();

    // Настраиваем свойства главной кнопки
    mainButton.setParams({
        bgColor: '#aa1388', // Цвет кнопки
        isEnabled: true, // Кнопка активна
        isVisible: true, // Кнопка видима
        text: 'Поделиться очками', // Текст на кнопке
        textColor: '#fff', // Цвет текста
    });

    // Добавляем слушатель кликов на кнопку
    mainButton.onClick(() => {
        try {
            // Получение текущих очков из localStorage
            const score = getScore();
            const record = getRecord();
            shareURL(`Посмотрите!\nУ меня ${score} очков в игре!\nМой лучший результат - ${record} ходов`);
        } catch {
            /* empty */
        }
    });

    setInitData(retrieveRawInitData());

    if (user) {
        const userName = [user.last_name, user.first_name].filter((s) => Boolean(s)).join(' ');
        const messages = [`Добро пожаловать ${userName}`];

        messages.push(`Версия приложения ${APP_VERSION}`);

        await popup.show({ message: messages.join('\n') });
    }
} catch {
    /* empty */
}
