import { useEffect, useReducer } from 'react';
import type { CSSProperties } from 'react';
import { MEMORY_COLORS } from './constants';
import { EAction } from './enums';
import type { DeckType, StateType } from './types';
import { getScore, setScore } from './utils';
import './App.css';

const deck: DeckType[] = [];

// Каждому цвету добавляем две карточки
for (const color of MEMORY_COLORS) {
    deck.push({ color, matched: false });
    deck.push({ color, matched: false });
}

const generateDeck = (): DeckType[] => {
    // Перемешиваем колоду
    return deck.sort(() => Math.random() - 0.5);
};

const initialState: StateType = {
    deck: generateDeck(),
    // Перевернутые карточки
    flipped: [],
    // Совпавшие карточки
    matched: [],
    // Счетчик попыток
    turns: 0,
    // Общий счет
    score: getScore(),
    pendingReset: false,
    gameOver: false,
};

const gameReducer = (state: StateType, action: { type: EAction; index?: number }): StateType => {
    switch (action.type) {
        case EAction.FLIP_CARD:
            // Переворачиваем карточку
            if (
                action.index !== undefined &&
                state.flipped.length < 2 &&
                !state.flipped.includes(action.index) &&
                !state.matched.includes(state.deck[action.index].color)
            ) {
                return { ...state, flipped: [...state.flipped, action.index] };
            }

            return state;
        case EAction.CHECK_MATCH: {
            if (state.flipped.length !== 2) {
                return state;
            }

            // Проверяем совпадение перевернутых карточек
            const [first, second] = state.flipped;
            // Увеличиваем счетчик попыток
            const turns = state.turns + 1;

            if (state.deck[first].color === state.deck[second].color) {
                const newMatched = [...state.matched, state.deck[first].color];
                const isGameOver = newMatched.length === state.deck.length / 2;
                const score = isGameOver ? state.score + 1 : state.score;

                if (isGameOver) {
                    setScore(score);
                }

                return {
                    ...state,
                    matched: newMatched,
                    turns,
                    score,
                    flipped: [],
                    pendingReset: false,
                    gameOver: isGameOver,
                };
            }

            return { ...state, turns, pendingReset: true };
        }
        case EAction.RESET_FLIPPED:
            // Сбрасываем перевернутые карточки
            return { ...state, flipped: [], pendingReset: false };
        case EAction.RESET_GAME:
            // Сбрасываем состояние игры, оставляя счетчик побед
            return {
                ...initialState,
                deck: generateDeck(),
                score: getScore(),
            };
        default:
            return state;
    }
};

function App() {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Проверка на совпадение перевернутых карточек
    useEffect(() => {
        if (state.flipped.length === 2) {
            dispatch({ type: EAction.CHECK_MATCH });
        }
    }, [state.flipped]);

    // Таймер для сброса перевернутых карточек
    useEffect(() => {
        if (state.pendingReset) {
            const timer = setTimeout(() => {
                dispatch({ type: EAction.RESET_FLIPPED });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.pendingReset]);

    // Обработка клика на карточку
    const handleCardClick = (index: number) => {
        if (!state.gameOver && state.flipped.length < 2 && !state.flipped.includes(index)) {
            dispatch({ type: EAction.FLIP_CARD, index });
        }
    };

    const handlePlayAgain = () => {
        dispatch({ type: EAction.RESET_GAME });
    };

    return (
        <>
            <div className="App">
                {' '}
                <h1>Memory Game</h1>{' '}
                <div className="info">
                    {' '}
                    <p>Очки: {state.score}</p> <p>Попытки: {state.turns}/15</p>{' '}
                </div>{' '}
                <div className="deck">
                    {' '}
                    {state.deck.map((card, index) => (
                        <div
                            key={index}
                            className={`card ${
                                state.flipped.includes(index) || state.matched.includes(card.color)
                                    ? 'flipped show'
                                    : ''
                            }`}
                            style={{ '--card-color': card.color } as CSSProperties}
                            onClick={() => handleCardClick(index)}
                        />
                    ))}{' '}
                </div>{' '}
                {state.gameOver && (
                    <>
                        {' '}
                        <div className="overlay" />{' '}
                        <div className="game-over">
                            {' '}
                            <h2>Вы выиграли!</h2> <button onClick={handlePlayAgain}>Заново</button>{' '}
                        </div>{' '}
                    </>
                )}
                {!state.gameOver && state.turns >= 15 && (
                    <>
                        {' '}
                        <div className="overlay" />{' '}
                        <div className="game-over">
                            {' '}
                            <h2>Игра окончена!</h2> <button onClick={handlePlayAgain}>Заново</button>{' '}
                        </div>{' '}
                    </>
                )}
            </div>
        </>
    );
}

export default App;
