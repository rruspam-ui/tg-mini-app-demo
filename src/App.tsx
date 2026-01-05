import { useEffect, useReducer } from 'react';
import type { CSSProperties } from 'react';
import './App.css';

type DeckType = {
    color: string;
    matched: boolean;
};

type ActionType = 'FLIP_CARD' | 'CHECK_MATCH' | 'RESET_FLIPPED' | 'INCREMENT_TURN' | 'RESET_GAME';

type StateType = {
    deck: DeckType[];
    flipped: number[];
    matched: string[];
    turns: number;
    score: number;
    pendingReset: boolean;
    gameOver: boolean;
};

const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];

const deck: DeckType[] = [];
// Каждому цвету добавляем две карточки
for (const color of colors) {
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
    score: 0,
    pendingReset: false,
    gameOver: false,
};

const gameReducer = (state: StateType, action: { type: ActionType; index?: number }): StateType => {
    switch (action.type) {
        case 'FLIP_CARD':
            // Переворачиваем карточку
            if (
                state.flipped.length < 2 &&
                action.index !== undefined &&
                !state.flipped.includes(action.index) &&
                !state.matched.includes(state.deck[action.index].color)
            ) {
                return { ...state, flipped: [...state.flipped, action.index] };
            }
            return state;
        case 'CHECK_MATCH': {
            // Проверяем совпадение перевернутых карточек
            const [first, second] = state.flipped;
            if (state.deck[first].color === state.deck[second].color) {
                const newMatched = [...state.matched, state.deck[first].color];
                const isGameOver = newMatched.length === state.deck.length / 2;
                return {
                    ...state,
                    matched: newMatched,
                    score: isGameOver ? state.score + 1 : state.score,
                    flipped: [],
                    pendingReset: false,
                    gameOver: isGameOver,
                };
            } else {
                return { ...state, pendingReset: true };
            }
        }
        case 'RESET_FLIPPED':
            // Сбрасываем перевернутые карточки
            return { ...state, flipped: [], pendingReset: false };
        case 'INCREMENT_TURN':
            // Увеличиваем счетчик попыток
            return { ...state, turns: state.turns + 1 };
        case 'RESET_GAME':
            // Сбрасываем состояние игры
            return {
                ...initialState,
                deck: generateDeck(),
                score: state.score,
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
            dispatch({ type: 'CHECK_MATCH' });
            dispatch({ type: 'INCREMENT_TURN' });
        }
    }, [state.flipped]);

    // Таймер для сброса перевернутых карточек
    useEffect(() => {
        if (state.pendingReset) {
            const timer = setTimeout(() => {
                dispatch({ type: 'RESET_FLIPPED' });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.pendingReset]);

    // Обработка клика на карточку
    const handleCardClick = (index: number) => {
        if (!state.gameOver && state.flipped.length < 2 && !state.flipped.includes(index)) {
            dispatch({ type: 'FLIP_CARD', index });
        }
    };

    const handlePlayAgain = () => {
        dispatch({ type: 'RESET_GAME' });
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
