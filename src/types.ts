export type DeckType = {
    color: string;
    matched: boolean;
};

export type StateType = {
    deck: DeckType[];
    flipped: number[];
    matched: string[];
    turns: number;
    score: number;
    pendingReset: boolean;
    gameOver: boolean;
};

export type TelegramUser = {
    id: number;
    allows_write_to_pm?: boolean;
    language_code?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    username?: string;
};
