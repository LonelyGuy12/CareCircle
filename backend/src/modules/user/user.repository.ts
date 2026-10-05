import { DatabaseService } from '@platform/database';
import { IUpdateUserProfile, IUser } from '@shared/types';

import { RegisterSchema } from '../auth/auth.validator';

// DynamoDB table names
const TABLES = {
    USERS: 'users',
    FOLLOWS: 'follows',
    BOOKMARKS: 'bookmarks',
    LIKES: 'likes',
} as const;

export class UserRepository {
    constructor(private readonly db: DatabaseService) {}

    // ────────────────────────── Follow operations ──────────────────────────

    async followUser(followerId: number, followingId: number) {
        return this.db.putItem(TABLES.FOLLOWS, {
            followerId,
            followingId,
            createdAt: new Date().toISOString(),
        });
    }

    async unfollowUser(followerId: number, followingId: number) {
        return this.db.deleteItem(TABLES.FOLLOWS, { followerId, followingId });
    }

    async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        const item = await this.db.getItem(TABLES.FOLLOWS, { followerId, followingId });
        return !!item;
    }

    async getFollowersCount(userId: number): Promise<number> {
        const followers = await this.db.query(TABLES.FOLLOWS, {
            IndexName: 'followingId-index',
            KeyConditionExpression: 'followingId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
            Select: 'COUNT',
        });
        return followers.length;
    }

    async getFollowingCount(userId: number): Promise<number> {
        const following = await this.db.query(TABLES.FOLLOWS, {
            KeyConditionExpression: 'followerId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
            Select: 'COUNT',
        });
        return following.length;
    }

    async getFollowers(userId: number): Promise<Record<string, unknown>[]> {
        const follows = await this.db.query<{ followerId: number; followingId: number }>(
            TABLES.FOLLOWS,
            {
                IndexName: 'followingId-index',
                KeyConditionExpression: 'followingId = :uid',
                ExpressionAttributeValues: { ':uid': userId },
            },
        );

        // Enrich with follower user data
        const enriched = await Promise.all(
            follows.map(async (f) => {
                const follower = await this.db.getItem<{
                    id: number;
                    name: string;
                    username: string;
                    avatar?: string | null;
                    bio?: string | null;
                    isVerified: boolean;
                }>(TABLES.USERS, { id: f.followerId });
                return {
                    ...f,
                    follower: follower
                        ? {
                              id: follower.id,
                              name: follower.name,
                              username: follower.username,
                              avatar: follower.avatar,
                              bio: follower.bio,
                              isVerified: follower.isVerified,
                          }
                        : null,
                };
            }),
        );
        return enriched.filter((f) => f.follower);
    }

    async getFollowing(userId: number): Promise<Record<string, unknown>[]> {
        const follows = await this.db.query<{ followerId: number; followingId: number }>(
            TABLES.FOLLOWS,
            {
                KeyConditionExpression: 'followerId = :uid',
                ExpressionAttributeValues: { ':uid': userId },
            },
        );

        // Enrich with following user data
        const enriched = await Promise.all(
            follows.map(async (f) => {
                const following = await this.db.getItem<{
                    id: number;
                    name: string;
                    username: string;
                    avatar?: string | null;
                    bio?: string | null;
                    isVerified: boolean;
                }>(TABLES.USERS, { id: f.followingId });
                return {
                    ...f,
                    following: following
                        ? {
                              id: following.id,
                              name: following.name,
                              username: following.username,
                              avatar: following.avatar,
                              bio: following.bio,
                              isVerified: following.isVerified,
                          }
                        : null,
                };
            }),
        );
        return enriched.filter((f) => f.following);
    }

    // ────────────────────────── User CRUD ──────────────────────────

    async findUserById(id: number): Promise<IUser | null> {
        const user = await this.db.getItem<IUser>(TABLES.USERS, { id });
        if (!user) return null;
        return this.enrichUserWithCounts(user);
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        const results = await this.db.query<IUser>(TABLES.USERS, {
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        });
        if (results.length === 0 || !results[0]) return null;
        return this.enrichUserWithCounts(results[0]);
    }

    async findUserByUsername(username: string): Promise<IUser | null> {
        const results = await this.db.query<IUser>(TABLES.USERS, {
            IndexName: 'username-index',
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: { ':username': username },
        });
        if (results.length === 0 || !results[0]) return null;
        return this.enrichUserWithCounts(results[0]);
    }

    async createUser(data: RegisterSchema): Promise<IUser> {
        const now = new Date().toISOString();
        const user: IUser = {
            id: Date.now(), // Auto-generated ID
            ...data,
            isVerified: false,
            isUserBanned: false,
            twoFactorEnabled: false,
            refreshToken: null,
            createdAt: now,
            updatedAt: now,
        };
        await this.db.putItem<IUser>(TABLES.USERS, user);
        return this.enrichUserWithCounts(user);
    }

    async updateUserProfile(id: number, profile: IUpdateUserProfile): Promise<IUser> {
        const updateData = { ...profile, updatedAt: new Date().toISOString() };
        const updated = await this.db.updateItem<IUser>(TABLES.USERS, { id }, updateData);
        if (!updated) {
            throw new Error(`Failed to update user with id ${id}`);
        }
        return this.enrichUserWithCounts(updated);
    }

    async updateUserEmail(id: number, email: string): Promise<Record<string, unknown> | null> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                email,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async updatePassword(id: number, password: string): Promise<Record<string, unknown> | null> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                password,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async updateRefreshToken(
        id: number,
        refreshToken: string | null,
    ): Promise<Record<string, unknown> | null> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                refreshToken,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async updateTwoFactorEnabled(
        id: number,
        twoFactorEnabled: boolean,
    ): Promise<Record<string, unknown> | null> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                twoFactorEnabled,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async deleteUser(id: number): Promise<IUser | null> {
        const user = await this.db.getItem<IUser>(TABLES.USERS, { id });
        await this.db.deleteItem(TABLES.USERS, { id });
        return user;
    }

    // ────────────────────────── Bookmarks ──────────────────────────

    async getBookmarks(userId: number): Promise<Record<string, unknown>[]> {
        return this.db.query(TABLES.BOOKMARKS, {
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
        });
    }

    // ────────────────────────── Likes ──────────────────────────

    async getLikes(
        userId: number,
        limit: number,
        cursor?: number,
        _currentUserId?: number,
    ): Promise<Record<string, unknown>[]> {
        const params: Record<string, unknown> = {
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
            Limit: limit,
        };

        if (cursor) {
            params.ExclusiveStartKey = { userId, id: cursor };
        }

        return this.db.query(TABLES.LIKES, params);
    }

    // ────────────────────────── Helpers ──────────────────────────

    /**
     * Enrich a raw user record with follower/following/post/like/article counts.
     * Mimics the old Prisma `_count` include behaviour.
     */
    private async enrichUserWithCounts(user: IUser): Promise<IUser> {
        const userId = typeof user.id === 'number' ? user.id : Number(user.id);
        const [followersCount, followingCount] = await Promise.all([
            this.getFollowersCount(userId),
            this.getFollowingCount(userId),
        ]);

        return {
            ...user,
            _count: {
                followers: followersCount,
                following: followingCount,
                likes: 0,
                posts: 0,
                articles: 0,
            },
        };
    }
}
