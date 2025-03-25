// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useCallback, useEffect} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList} from 'react-window';

import type {ScheduledPost} from '@mattermost/types/schedule_post';
import type {UserStatus} from '@mattermost/types/users';

import type {UserProfile} from 'components/suggestion/command_provider/app_command_parser/app_command_parser_dependencies';

import {useQuery} from 'utils/http_utils';

import DraftRow from '../draft_row';

interface Props {
    scheduledPosts: ScheduledPost[];
    user: UserProfile;
    displayName: string;
    status: UserStatus['status'];
}

type ItemData = {
    scheduledPosts: ScheduledPost[];
    displayName: string;
    status: UserStatus['status'];
    user: UserProfile;
    targetScheduledPostId: React.MutableRefObject<string | undefined>;
    targetId: string | null;
    getItemHeight: (index: number) => number;
};

// Default height as a fallback
const DEFAULT_ROW_HEIGHT = 100;

const ScheduledPostItem = ({index, style, data}: {index: number; style: React.CSSProperties; data: ItemData}) => {
    const {scheduledPosts, displayName, status, user, targetScheduledPostId, targetId} = data;
    const scheduledPost = scheduledPosts[index];

    const isInTargetChannelOrThread = scheduledPost.channel_id === targetId || scheduledPost.root_id === targetId;
    const hasError = Boolean(scheduledPost.error_code);
    const scrollIntoView = !targetScheduledPostId.current && isInTargetChannelOrThread && !hasError;

    if (scrollIntoView) {
        targetScheduledPostId.current = scheduledPost.id;
    }

    return (
        <div
            style={style}
        >
            <DraftRow
                key={scheduledPost.id}
                item={scheduledPost}
                displayName={displayName}
                status={status}
                user={user}
                scrollIntoView={targetScheduledPostId.current === scheduledPost.id}
            />
        </div>
    );
};

export default function ScheduledPosts(props: Props) {
    const query = useQuery();
    const targetId = query.get('target_id');
    const targetScheduledPostId = useRef<string>();
    const listRef = useRef<VariableSizeList>(null);

    // Function to determine row height - you can adjust this logic based on your needs
    const getItemHeight = useCallback((index: number) => {
        // You could use different logic here to determine height
        // For example, based on message length, attachments, etc.
        const scheduledPost = props.scheduledPosts[index];

        // Simple example: longer messages get more height
        if (scheduledPost.message.length > 1000) {
            return DEFAULT_ROW_HEIGHT * 2; // Double height for long messages
        } else if (scheduledPost.message.length > 500) {
            return DEFAULT_ROW_HEIGHT * 1.5; // 50% more height for medium messages
        } else if (scheduledPost.message.length < 100) {
            return DEFAULT_ROW_HEIGHT * 0.8; // Shorter for very short messages
        }

        // For files, add extra height
        if (scheduledPost.metadata?.files && scheduledPost.metadata.files.length > 0) {
            return DEFAULT_ROW_HEIGHT + (20 * scheduledPost.metadata.files.length);
        }

        return DEFAULT_ROW_HEIGHT; // Default height
    }, [props.scheduledPosts]);

    // Reset list when scheduled posts change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
        }
    }, [props.scheduledPosts]);

    if (props.scheduledPosts.length === 0) {
        return null;
    }

    const itemData: ItemData = {
        scheduledPosts: props.scheduledPosts,
        displayName: props.displayName,
        status: props.status,
        user: props.user,
        targetScheduledPostId,
        targetId,
        getItemHeight,
    };

    return (
        <div style={{height: '100%', width: '100%'}}>
            <AutoSizer>
                {({height, width}) => (
                    <VariableSizeList
                        ref={listRef}
                        height={height || 600} // Fallback height
                        width={width || '100%'}
                        itemCount={props.scheduledPosts.length}
                        itemSize={getItemHeight}
                        itemData={itemData}
                        overscanCount={5}
                    >
                        {ScheduledPostItem}
                    </VariableSizeList>
                )}
            </AutoSizer>
        </div>
    );
}
