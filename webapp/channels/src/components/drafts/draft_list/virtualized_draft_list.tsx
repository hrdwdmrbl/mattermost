// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {CSSProperties} from 'react';
import React, {useMemo, useRef, useCallback} from 'react';
import {useSelector} from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList} from 'react-window';

import type {UserProfile} from '@mattermost/types/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import type {Draft} from 'selectors/drafts';
import {getDraftRemotes} from 'selectors/drafts';

import DraftRow from 'components/drafts/draft_row';

import type {GlobalState} from 'types/store';

import EmptyDraftList from './empty_draft_list';

const OVERSCAN_COUNT = 5;
const DEFAULT_ROW_HEIGHT = 100;

type Props = {
    drafts: Draft[];
}

export default function VirtualizedDraftList({drafts}: Props) {
    const currentUser = useSelector(getCurrentUser);
    const userStatus = useSelector((state: GlobalState) => getStatusForUserId(state, currentUser.id));

    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);
    const userDisplayName = useMemo(() => displayUsername(currentUser, teammateNameDisplaySetting), [currentUser, teammateNameDisplaySetting]);

    const draftRemotes = useSelector(getDraftRemotes);

    const listRef = useRef<VariableSizeList>(null);

    // Function to determine row height - you can adjust this logic based on your needs
    const getItemHeight = useCallback((index: number) => {
        // You could use different logic here to determine height
        // For example, based on message length, attachments, etc.
        const draft = drafts[index];

        // Simple example: longer messages get more height
        if (draft.value.message.length > 1000) {
            return DEFAULT_ROW_HEIGHT * 2; // Double height for long messages
        } else if (draft.value.message.length > 500) {
            return DEFAULT_ROW_HEIGHT * 1.5; // 50% more height for medium messages
        } else if (draft.value.message.length < 100) {
            return DEFAULT_ROW_HEIGHT * 0.8; // Shorter for very short messages
        }

        // For files, add extra height
        if (draft.value.fileInfos && draft.value.fileInfos.length > 0) {
            return DEFAULT_ROW_HEIGHT + (20 * draft.value.fileInfos.length);
        }

        return DEFAULT_ROW_HEIGHT; // Default height
    }, [drafts]);

    // Reset list when drafts change
    React.useEffect(() => {
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
        }
    }, [drafts]);

    if (drafts.length === 0) {
        return <EmptyDraftList/>;
    }

    return (
        <div className='DraftList Drafts__main'>
            <AutoSizer>
                {({height, width}) => (
                    <VariableSizeList
                        ref={listRef}
                        height={height}
                        width={width}
                        itemCount={drafts.length}
                        itemSize={getItemHeight}
                        itemData={drafts}
                        overscanCount={OVERSCAN_COUNT}
                    >
                        {({index, style, data}) => (
                            <div style={style}>

                            <DraftRow
                                key={data[index].key}
                                displayName={userDisplayName}
                                item={data[index].value}
                                isRemote={draftRemotes?.[data[index].key]}
                                user={currentUser}
                                status={userStatus}
                                // parentStyle={style}
                                />
                                </div>
                        )}
                    </VariableSizeList>
                )}
            </AutoSizer>
        </div>
    );
}
