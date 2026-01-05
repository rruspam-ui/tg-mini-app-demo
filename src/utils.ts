import { STORAGE_GAME_SCORE } from './constants';

export const getScore = (): number => {
    const score = localStorage.getItem(STORAGE_GAME_SCORE);

    return score ? Number(score) : 0;
};

export const setScore = (score: number): void => {
    localStorage.setItem(STORAGE_GAME_SCORE, score.toString());
};
