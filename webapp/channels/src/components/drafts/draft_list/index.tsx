// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {makeGetDrafts} from 'selectors/drafts';

import EmptyDraftList from './empty_draft_list';
import VirtualizedDraftList from './virtualized_draft_list';

export default function DraftList() {
    const getDrafts = useMemo(() => makeGetDrafts(), []);
    const drafts = useSelector(getDrafts);

    if (drafts.length === 0) {
        return <EmptyDraftList/>;
    }

    return (
        <VirtualizedDraftList
            drafts={drafts}
        />
    );
}
