// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {FixedSizeList} from 'react-window';

import type {ScheduledPost} from '@mattermost/types/schedule_post';
import type {UserStatus} from '@mattermost/types/users';

import type {UserProfile} from 'components/suggestion/command_provider/app_command_parser/app_command_parser_dependencies';

import {useQuery} from 'utils/http_utils';

import DraftRow from '../draft_row';

interface Props {
    scheduledPosts: ScheduledPost[];
    user: UserProfile;
    displayUsername: string;
    status: UserStatus['status'];
}

type ItemData = {
    scheduledPosts: ScheduledPost[];
    displayUsername: string;
    status: UserStatus['status'];
    user: UserProfile;
    targetScheduledPostId: React.MutableRefObject<string | undefined>;
    targetId: string | null;
};

const ROW_HEIGHT = 100; // Adjust based on your design requirements

const ScheduledPostItem = ({index, style, data}: {index: number; style: React.CSSProperties; data: ItemData}) => {
    const {scheduledPosts, displayUsername, status, user, targetScheduledPostId, targetId} = data;
    const scheduledPost = scheduledPosts[index];

    const isInTargetChannelOrThread = scheduledPost.channel_id === targetId || scheduledPost.root_id === targetId;
    const hasError = Boolean(scheduledPost.error_code);
    const scrollIntoView = !targetScheduledPostId.current && isInTargetChannelOrThread && !hasError;

    if (scrollIntoView) {
        targetScheduledPostId.current = scheduledPost.id;
    }

    return (
        <DraftRow
            key={scheduledPost.id}
            item={scheduledPost}
            displayName={displayUsername}
            status={status}
            user={user}
            scrollIntoView={targetScheduledPostId.current === scheduledPost.id}
        />
    );
};

export default function VirtualizedScheduledPostList(props: Props) {
    const query = useQuery();
    const targetId = query.get('target_id');
    const targetScheduledPostId = useRef<string>();

    if (props.scheduledPosts.length === 0) {
        return null;
    }

    const itemData: ItemData = {
        scheduledPosts: props.scheduledPosts,
        displayUsername: props.displayUsername,
        status: props.status,
        user: props.user,
        targetScheduledPostId,
        targetId,
    };

    return (
        <AutoSizer>
            {({height, width}) => (
                <FixedSizeList
                    height={height}
                    width={width}
                    itemCount={props.scheduledPosts.length}
                    itemSize={ROW_HEIGHT}
                    itemData={itemData}
                    overscanCount={5}
                >
                    {ScheduledPostItem}
                </FixedSizeList>
            )}
        </AutoSizer>
    );
}
