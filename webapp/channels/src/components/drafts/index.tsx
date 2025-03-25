// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {selectLhsItem} from 'actions/views/lhs';
import {suppressRHS, unsuppressRHS} from 'actions/views/rhs';

import DraftList from 'components/drafts/draft_list';

import {LhsItemType, LhsPage} from 'types/store/lhs';

import './drafts_and_schedule_posts.scss';
import DraftsAndSchedulePostsPageHeader from './drafts_and_schedule_posts_page_header';

function Drafts() {
    const dispatch = useDispatch();

    // When Drafts component mounts, select Drafts in the LHS
    // and suppress the RHS and restore RHS when component unmounts
    useEffect(() => {
        dispatch(selectLhsItem(LhsItemType.Page, LhsPage.Drafts));
        dispatch(suppressRHS);

        return () => {
            dispatch(unsuppressRHS);
        };
    }, []);

    // if (isScheduledPostsEnabled) {
    //     return (
    //         <DraftsAndSchedulePostsPageHeader>
    //             <DraftsAndSchedulePostsTab
    //                 team={team}
    //                 user={user}
    //                 displayUsername={displayUsername}
    //                 status={status}
    //                 drafts={drafts}
    //                 draftRemotes={draftRemotes}
    //                 scheduledPosts={scheduledPosts}
    //                 isScheduledPostsEnabled={isScheduledPostsEnabled}
    //             />
    //         </DraftsAndSchedulePostsPageHeader>
    //     );
    // }

    return (
        <DraftsAndSchedulePostsPageHeader>
            <DraftList/>
        </DraftsAndSchedulePostsPageHeader>
    );
}

export default memo(Drafts);
