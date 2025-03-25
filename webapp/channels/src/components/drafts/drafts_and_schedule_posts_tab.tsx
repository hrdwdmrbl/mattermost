// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Badge} from '@mui/base';
import React, {useCallback, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useHistory, useLocation} from 'react-router-dom';

import type {Draft} from '@mattermost/types/drafts';
import type {ScheduledPost} from '@mattermost/types/schedule_post';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

// import DraftList from 'components/drafts/draft_list/draft_list';
import ScheduledPostList from 'components/drafts/scheduled_post_list';
import Tab from 'components/tabs/tab';
import Tabs from 'components/tabs/tabs';
import Header from 'components/widgets/header/header';

import {DRAFT_URL_SUFFIX, SCHEDULED_POST_URL_SUFFIX} from 'utils/constants';

type Props = {
    team: Team['display_name'];
    user: UserProfile;
    displayUsername: string;
    status: string;
    drafts: Draft[];
    draftRemotes: Record<string, boolean>;
    scheduledPosts: ScheduledPost[];
    isScheduledPostsEnabled: boolean;
}

export const DraftsAndSchedulePostsTab = ({
    team,
    user,
    displayUsername,
    status,
    drafts,
    draftRemotes,
    scheduledPosts,
    isScheduledPostsEnabled,
}: Props) => {
    const history = useHistory();
    const location = useLocation();
    const isDraftsTab = location.pathname.includes(DRAFT_URL_SUFFIX);
    const isScheduledPostsTab = location.pathname.includes(SCHEDULED_POST_URL_SUFFIX);

    const handleSwitchTabs = useCallback((key) => {
        if (key === 0 && isScheduledPostsTab) {
            history.push(`/${team}/drafts`);
        } else if (key === 1 && isDraftsTab) {
            history.push(`/${team}/scheduled_posts`);
        }
    }, [history, isDraftsTab, isScheduledPostsTab, team]);

    const scheduledPostsTabHeading = useMemo(() => {
        return (
            <div className='drafts_tab_title'>
                <FormattedMessage
                    id='schedule_post.tab.heading'
                    defaultMessage='Scheduled'
                />
                {scheduledPosts?.length > 0 && (
                    <Badge
                        className='badge'
                        badgeContent={scheduledPosts.length}
                    />
                )}
            </div>
        );
    }, [scheduledPosts?.length]);

    const draftTabHeading = useMemo(() => {
        return (
            <div className='drafts_tab_title'>
                <FormattedMessage
                    id='drafts.heading'
                    defaultMessage='Drafts'
                />
                {drafts.length > 0 && (
                    <Badge
                        className='badge'
                        badgeContent={drafts.length}
                    />
                )}
            </div>
        );
    }, [drafts?.length]);

    const activeTab = isDraftsTab ? 0 : 1;
    const EMPTY_LIST: ScheduledPost[] = [];
    const EMPTY_DRAFTS: Draft[] = [];

    if (!isScheduledPostsEnabled) {
        return (
            <DraftList
                drafts={drafts}
                user={user}
                displayUsername={displayUsername}
                draftRemotes={draftRemotes}
                status={status}
            />
        );
    }

    return (
        <div
            id='app-content'
            className='Drafts app__content'
        >
            <Header
                level={2}
                className='Drafts__header'
                heading={heading}
                subtitle={subtitle}
            />
            <Tabs
                id='draft_tabs'
                activeKey={activeTab}
                mountOnEnter={true}
                unmountOnExit={true}
                onSelect={handleSwitchTabs}
            >
                <Tab
                    eventKey={0}
                    title={draftTabHeading}
                    unmountOnExit={true}
                    tabClassName='drafts_tab'
                    tabIndex={0}
                >
                    <DraftList
                        drafts={drafts || EMPTY_DRAFTS}
                        user={user}
                        displayUsername={displayUsername}
                        draftRemotes={draftRemotes}
                        status={status}
                    />
                </Tab>

                <Tab
                    eventKey={1}
                    title={scheduledPostsTabHeading}
                    unmountOnExit={true}
                    tabClassName='drafts_tab'
                >
                    <ScheduledPostList
                        scheduledPosts={scheduledPosts || EMPTY_LIST}
                        user={user}
                        displayUsername={displayUsername}
                        status={status}
                    />
                </Tab>
            </Tabs>
        </div>
    );
};

