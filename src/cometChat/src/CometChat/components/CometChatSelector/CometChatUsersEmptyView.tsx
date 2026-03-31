import React from 'react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

type CometChatUsersEmptyViewProps = {
  loggedInUser: CometChat.User | null;
};

export function CometChatUsersEmptyView({ loggedInUser }: CometChatUsersEmptyViewProps) {
  return (
    <div className="cometchat-users-empty-state">
      <div className="cometchat-users-empty-state__eyebrow">Chat Directory</div>
      <div className="cometchat-users-empty-state__title">No other users are available yet</div>
      <p className="cometchat-users-empty-state__description">
        CometChat hides the signed-in account from this list. If only one Appwrite account has been synced,
        this directory will stay empty until another user signs in.
      </p>

      {loggedInUser && (
        <div className="cometchat-users-empty-state__identity">
          <div className="cometchat-users-empty-state__identity-label">Signed in as</div>
          <div className="cometchat-users-empty-state__identity-name">{loggedInUser.getName()}</div>
          <code className="cometchat-users-empty-state__identity-uid">{loggedInUser.getUid()}</code>
        </div>
      )}
    </div>
  );
}
