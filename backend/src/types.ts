export type Author = {
    id: string,
    username: string,
    avatar: string | null
}

export type Page<T> = {
    items: T[],
    total: number,
    page: number,
    totalPages: number
}

export type Post = {
    id: number,
    title: string,
    content: string,
    imageUrl: string | null,
    isPublished: boolean,
    created_at: Date,
    updatedAt: Date,
    user_id: string,
    commentCount: number
}

export type Comment = {
    id: number,
    user_id: string,
    content: string,
    created_at: Date
    updated_at: Date
}

