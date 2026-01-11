import { STORAGE_URL } from './constants';

export type TUser = {
    userKey?: string;
    userId: string;
    score: number;
    record?: number;
};

export type TUserCreate = Required<Omit<TUser, 'userKey'>>;
export type TUserUpdate = Required<TUser>;

type TFirebaseFields = {
    user_id: {
        stringValue: string;
    };
    score: {
        integerValue: string | number;
    };
    record?: {
        integerValue: string | number;
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
        userKey: document.name.split('/').pop(),
        score: Number(document.fields.score.integerValue),
        record: document.fields.record ? Number(document.fields.record.integerValue) : undefined,
    };

    return user;
};

const fetchUserData = async <T>(url: string, method: string, body?: string): Promise<T | undefined> => {
    try {
        const config =
            method === 'GET'
                ? undefined
                : {
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      method,
                      body,
                  };

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }

    return undefined;
};

export const findUserById = async (userId: number | string): Promise<TUser | null> => {
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

    const users = await fetchUserData<TFirebaseUserResult[]>(STORAGE_URL.USER_QUERY, 'POST', JSON.stringify(request));
    const user = users?.[0];

    if (!user?.document) {
        console.log('User not exist:', userId);
        return null;
    }

    return mapFirebaseDocumentToUser(user.document);
};

export const findUserByKey = async (userKey: string): Promise<TUser | null> => {
    const user = await fetchUserData<TFirebaseUserResult>(`STORAGE_URL.USER_GET/${userKey}`, 'GET');

    if (!user?.document) {
        console.log('User not exist:', userKey);
        return null;
    }

    return mapFirebaseDocumentToUser(user.document);
};

export const createUser = async (user: TUserCreate): Promise<TUser | null> => {
    const { userId, score, record } = user;

    const request: TFirebaseChange = {
        fields: {
            user_id: {
                stringValue: userId,
            },
            score: {
                integerValue: score,
            },
            record: {
                integerValue: record,
            },
        },
    };

    const newUser = await fetchUserData<TFirebaseDocument>(STORAGE_URL.USER_CREATE, 'POST', JSON.stringify(request));

    if (!newUser) {
        console.log('User not created:', userId);
        return null;
    }

    return mapFirebaseDocumentToUser(newUser);
};

export const updateUser = async (user: TUserUpdate): Promise<TUser | null> => {
    const { userId, score, userKey, record } = user;

    const request: TFirebaseChange = {
        fields: {
            user_id: {
                stringValue: userId,
            },
            score: {
                integerValue: score,
            },
            record: {
                integerValue: record,
            },
        },
    };

    const newUser = await fetchUserData<TFirebaseDocument>(
        `${STORAGE_URL.USER_UPDATE}/${userKey}`,
        'PATCH',
        JSON.stringify(request),
    );

    if (!newUser) {
        console.log('User not updated:', userId);
        return null;
    }

    return mapFirebaseDocumentToUser(newUser);
};
