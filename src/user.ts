import { STORAGE_URL } from './constants';

export type TUser = {
    userKey?: string;
    userId: string;
    score: number;
};

type TFirebaseFields = {
    score: {
        integerValue: string | number;
    };
    user_id: {
        stringValue: string;
    };
};

type TFirebaseChange = {
    fields: TFirebaseFields;
};

type TFirebaseDocument = {
    name: string;
    fields: TFirebaseFields;
    createTime: Date;
    updateTime: Date;
};

type TFirebaseUserResult = {
    readTime: Date;
    document?: TFirebaseDocument;
};

const mapFirebaseDocumentToUser = (document: TFirebaseDocument): TUser => {
    const user: TUser = {
        userId: document.fields.user_id.stringValue,
        score: Number(document.fields.score.integerValue),
        userKey: document.name.split('/').pop(),
    };

    console.log(`result User ==>`, user);

    return user;
};

export const findUserById = async (userId: number | string): Promise<TUser | null> => {
    try {
        const request = {
            structuredQuery: {
                from: [
                    {
                        collectionId: 'scores',
                    },
                ],
                where: {
                    fieldFilter: {
                        field: {
                            fieldPath: 'user_id',
                        },
                        op: 'EQUAL',
                        value: {
                            stringValue: userId.toString(),
                        },
                    },
                },
                limit: 1,
            },
        };

        console.log('SEND POST findUserById ==>', request);

        const response = await fetch(STORAGE_URL.USER_QUERY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users: TFirebaseUserResult[] = await response.json();
        console.log('findUserById result ==>', users);
        const user = users?.[0];

        if (!user?.document) {
            console.log('User not exist:', userId);
            return null;
        }

        return mapFirebaseDocumentToUser(user.document);
    } catch (error) {
        console.error('Failed to fetch get user:', error);
    }

    return null;
};

export const findUserByKey = async (userKey: string): Promise<TUser | null> => {
    try {
        console.log('SEND GET findUserByKey ==>', userKey);
        const response = await fetch(`STORAGE_URL.USER_GET/${userKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user: TFirebaseUserResult = await response.json();
        console.log('findUserByKey result ==>', user);

        if (!user?.document) {
            console.log('User not exist:', userKey);
            return null;
        }

        return mapFirebaseDocumentToUser(user.document);
    } catch (error) {
        console.error('Failed to fetch get user:', error);
    }

    return null;
};

export const createUser = async (user: TUser): Promise<TUser | null> => {
    try {
        const { userId, score } = user;

        const request: TFirebaseChange = {
            fields: {
                user_id: {
                    stringValue: userId,
                },
                score: {
                    integerValue: score,
                },
            },
        };

        console.log('SEND POST createUser ==>', request);

        const response = await fetch(STORAGE_URL.USER_CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newUser: TFirebaseDocument = await response.json();
        console.log('createUser result ==>', newUser);

        if (!newUser) {
            console.log('User not created:', userId);
            return null;
        }

        return mapFirebaseDocumentToUser(newUser);
    } catch (error) {
        console.error('Failed to fetch create user:', error);
    }

    return null;
};

export const updateUser = async (user: Required<TUser>): Promise<TUser | null> => {
    try {
        const { userId, score, userKey } = user;

        const request: TFirebaseChange = {
            fields: {
                user_id: {
                    stringValue: userId,
                },
                score: {
                    integerValue: score,
                },
            },
        };

        console.log('SEND PATCH updateUser ==>', request);

        const response = await fetch(`STORAGE_URL.USER_UPDATE/${userKey}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newUser: TFirebaseDocument = await response.json();
        console.log('updateUser result ==>', newUser);

        if (!newUser) {
            console.log('User not updated:', userId);
            return null;
        }

        return mapFirebaseDocumentToUser(newUser);
    } catch (error) {
        console.error('Failed to fetch update user:', error);
    }

    return null;
};
