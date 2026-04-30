import React from 'react';
import { ListItem } from '@/src/ui/ListItem';
import { Bullet } from '@/src/ui/Bullet';

export interface PlayerLeaderboardListItemProps {
    title: string;
    description: string;
    score: number;
    highlight?: boolean;
}

/** Shared row for player leaderboard (tab) and final results screen. */
export const PlayerLeaderboardListItem = ({
    title,
    description,
    score,
    highlight = false,
}: PlayerLeaderboardListItemProps) => (
    <ListItem
        title={title}
        titleVariant="h5"
        style={{ borderRadius: 0 }}
        description={description}
        variant={highlight ? 'highlight' : 'default'}
        right={<Bullet size="sm" value={score} variant="primary" />}
    />
);
