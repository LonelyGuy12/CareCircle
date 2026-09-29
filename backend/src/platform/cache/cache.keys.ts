export const CacheKeys = {
    user: (userId: string) => `user:${userId}`,
    userProfile: (userId: string) => `user:${userId}:profile`,
    userSettings: (userId: string) => `user:${userId}:settings`,

    task: (taskId: string) => `task:${taskId}`,
    taskList: (userId: string, queryHash?: string) =>
        queryHash ? `tasks:${userId}:${queryHash}` : `tasks:${userId}`,
    taskUpcoming: (userId: string, days: number) => `tasks:${userId}:upcoming:${days}`,
    taskOverdue: (userId: string) => `tasks:${userId}:overdue`,

    folder: (folderId: string) => `folder:${folderId}`,
    folderList: (userId: string) => `folders:${userId}`,

    team: (teamId: string) => `team:${teamId}`,
    teamList: (userId: string) => `teams:${userId}`,
    teamMembers: (teamId: string) => `team:${teamId}:members`,
    teamStats: (teamId: string) => `team:${teamId}:stats`,

    session: (sessionId: string) => `session:${sessionId}`,

    activities: (userId: string) => `activities:${userId}`,
    teamActivities: (teamId: string) => `team:${teamId}:activities`,

    notifications: (userId: string) => `notifications:${userId}`,
    notificationCount: (userId: string) => `notifications:${userId}:count`,
};

export const TTL = {
    VERY_SHORT: 30,
    SHORT: 60,
    MEDIUM: 300,
    LONG: 900,
    VERY_LONG: 3600,
    DAY: 86400,
};
