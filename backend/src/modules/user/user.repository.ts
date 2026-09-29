import { DatabaseService } from '@platform/database';
import { IUpdateUserProfile } from '@shared/types';

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

    async getFollowers(userId: number): Promise<any[]> {
        const follows = await this.db.query(TABLES.FOLLOWS, {
            IndexName: 'followingId-index',
            KeyConditionExpression: 'followingId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
        });

        // Enrich with follower user data
        const enriched = await Promise.all(
            follows.map(async (f) => {
                const follower = await this.db.getItem(TABLES.USERS, { id: f.followerId });
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

    async getFollowing(userId: number): Promise<any[]> {
        const follows = await this.db.query(TABLES.FOLLOWS, {
            KeyConditionExpression: 'followerId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
        });

        // Enrich with following user data
        const enriched = await Promise.all(
            follows.map(async (f) => {
                const following = await this.db.getItem(TABLES.USERS, { id: f.followingId });
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

    async findUserById(id: number): Promise<any | null> {
        const user = await this.db.getItem(TABLES.USERS, { id });
        if (!user) return null;
        return this.enrichUserWithCounts(user);
    }

    async findUserByEmail(email: string): Promise<any | null> {
        const results = await this.db.query(TABLES.USERS, {
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        });
        if (results.length === 0) return null;
        return this.enrichUserWithCounts(results[0]);
    }

    async findUserByUsername(username: string): Promise<any | null> {
        const results = await this.db.query(TABLES.USERS, {
            IndexName: 'username-index',
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: { ':username': username },
        });
        if (results.length === 0) return null;
        return this.enrichUserWithCounts(results[0]);
    }

    async createUser(data: RegisterSchema): Promise<any> {
        const now = new Date().toISOString();
        const user = {
            id: Date.now(), // Auto-generated ID
            ...data,
            isVerified: false,
            isUserBanned: false,
            twoFactorEnabled: false,
            refreshToken: null,
            createdAt: now,
            updatedAt: now,
        };
        await this.db.putItem(TABLES.USERS, user);
        return this.enrichUserWithCounts(user);
    }

    async updateUserProfile(id: number, profile: IUpdateUserProfile): Promise<any> {
        const updateData = { ...profile, updatedAt: new Date().toISOString() };
        const updated = await this.db.updateItem(TABLES.USERS, { id }, updateData);
        return this.enrichUserWithCounts(updated);
    }

    async updateUserEmail(id: number, email: string): Promise<any> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                email,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async updatePassword(id: number, password: string): Promise<any> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                password,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async updateRefreshToken(id: number, refreshToken: string | null): Promise<any> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                refreshToken,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async updateTwoFactorEnabled(id: number, twoFactorEnabled: boolean): Promise<any> {
        return this.db.updateItem(
            TABLES.USERS,
            { id },
            {
                twoFactorEnabled,
                updatedAt: new Date().toISOString(),
            },
        );
    }

    async deleteUser(id: number): Promise<any> {
        const user = await this.db.getItem(TABLES.USERS, { id });
        await this.db.deleteItem(TABLES.USERS, { id });
        return user;
    }

    // ────────────────────────── Bookmarks ──────────────────────────

    async getBookmarks(userId: number): Promise<any[]> {
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
    ): Promise<any[]> {
        const params: Record<string, any> = {
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
    private async enrichUserWithCounts(user: any): Promise<any> {
        const [followersCount, followingCount] = await Promise.all([
            this.getFollowersCount(user.id),
            this.getFollowingCount(user.id),
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
