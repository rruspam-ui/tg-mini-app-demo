import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { miniApp, mainButton, shareURL, initData, popup, retrieveLaunchParams } from '@tma.js/sdk-react';
import { init } from './init.ts';
import { logInfo, getScore, getRemoteScore, setScore, logDebug } from './utils.ts';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';
import { APP_VERSION } from './constants.ts';

const root = createRoot(document.getElementById('root')!);

try {
    await logInfo('=======================');

    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;
    const debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;
    await logInfo({ debug });

    // Configure all application dependencies.
    await init({
        debug,
        eruda: debug && ['ios', 'android', 'macos'].includes(platform),
        mockForMacOS: platform === 'macos',
    }).then(() => {
        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    });

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
            shareURL(`Посмотрите! У меня ${score} очков в игре!`);
            console.log('Окно выбора чата открыто для отправки сообщения.');
        } catch (error) {
            console.error('Ошибка при открытии окна выбора чата:', error);
        }
    });

    const params = retrieveLaunchParams();
    const user = initData.user();

    if (user) {
        await logInfo({ user });
        await logInfo({ params });

        const score = await getRemoteScore(user);
        await logDebug(score);
        setScore(score);

        const userName = [user.last_name, user.first_name].filter((s) => Boolean(s)).join(' ');
        const messages = [`Добро пожаловать ${userName}`];

        if (params) {
            // messages.push(`Версия ${params.tgWebAppVersion}`);
        }

        messages.push(`Версия приложения ${APP_VERSION}`);

        await popup.show({ message: messages.join('\n') });
    }
} catch (error) {
    console.error('Ошибка инициализации:', error);
}
