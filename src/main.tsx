import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { init, miniApp, mainButton, shareURL, initDataUser, showPopup, retrieveLaunchParams } from '@telegram-apps/sdk';
import { STORAGE_GAME_SCORE } from './constants.ts';

const initializeTelegramSDK = async () => {
    try {
        init();

        // Mini App готово
        miniApp.ready();

        // Главная кнопка установлена
        mainButton.mount();

        // Настраиваем свойства главной кнопки
        mainButton.setParams({
            backgroundColor: '#aa1388', // Цвет кнопки
            isEnabled: true, // Кнопка активна
            isVisible: true, // Кнопка видима
            text: 'Поделиться очками', // Текст на кнопке
            textColor: '#fff', // Цвет текста
        });

        // Добавляем слушатель кликов на кнопку
        mainButton.onClick(() => {
            try {
                // Получение текущих очков из localStorage
                const score = localStorage.getItem(STORAGE_GAME_SCORE) || 0;
                shareURL(`Посмотрите! У меня ${score} очков в игре!`);
                console.log('Окно выбора чата открыто для отправки сообщения.');
            } catch (error) {
                console.error('Ошибка при открытии окна выбора чата:', error);
            }
        });

        const params = retrieveLaunchParams(true);

        if (params) {
            showPopup({ title: 'Добро пожаловать', message: `Версия ${params.tgWebAppVersion}` });
        }

        const user = initDataUser();

        if (user) {
            //     const userName = [user.last_name, user.first_name].filter((s) => Boolean(s)).join(' ');
            //     await showPopup({ title: 'Добро пожаловать', message: `Пользователь ${userName}`, timeout: 1000 });
        }
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
};

initializeTelegramSDK();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
