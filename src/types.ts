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
