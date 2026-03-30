# CometChatSettingsInterface Documentation

## Overview

The `CometChatSettingsInterface` defines the complete configuration settings for the CometChat Visual Builder. It enables or disables various features within the chat application, including messaging, AI-assisted interactions, group management, calling, and UI customization.

## Structure

The interface is organized into the following categories:

- **Chat Features** (`chatFeatures`)
- **Call Features** (`callFeatures`)
- **Layout** (`layout`)
- **Style** (`style`)
- **No Code** (`noCode`) - Optional
- **Agent** (`agent`) - Optional

---

## 1. Chat Features (`chatFeatures`)

The `chatFeatures` section consists of multiple subcategories that define various chat functionalities.

### 1.1 Core Messaging Experience (`coreMessagingExperience`)

Controls fundamental chat functionalities:

| Property | Type | Description |
|----------|------|-------------|
| `typingIndicator` | boolean | Displays when a user is typing |
| `threadConversationAndReplies` | boolean | Enables threaded conversations and replies |
| `photosSharing` | boolean | Allows sharing of images |
| `videoSharing` | boolean | Supports video file sharing |
| `audioSharing` | boolean | Enables sharing of audio recordings |
| `fileSharing` | boolean | Allows file sharing |
| `editMessage` | boolean | Enables editing sent messages |
| `deleteMessage` | boolean | Allows users to delete their sent messages |
| `messageDeliveryAndReadReceipts` | boolean | Shows message delivery and read receipts |
| `userAndFriendsPresence` | boolean | Displays users' online/offline status |
| `conversationAndAdvancedSearch` | boolean (optional) | Enables conversation and advanced search functionality |
| `moderation` | boolean (optional) | Enables content moderation features |
| `quotedReplies` | boolean (optional) | Allows quoting messages in replies |
| `markAsUnread` | boolean (optional) | Enables marking messages as unread |

### 1.2 Deeper User Engagement (`deeperUserEngagement`)

Enhances user interaction through additional features:

| Property | Type | Description |
|----------|------|-------------|
| `mentions` | boolean | Enables @mentions in chat |
| `mentionAll` | boolean (optional) | Allows @all mentions to notify all group members |
| `reactions` | boolean | Allows users to react to messages |
| `messageTranslation` | boolean | Provides message translation capabilities |
| `polls` | boolean | Enables creating and participating in polls |
| `collaborativeWhiteboard` | boolean | Allows real-time whiteboard collaboration |
| `collaborativeDocument` | boolean | Enables document collaboration |
| `voiceNotes` | boolean | Allows sending voice notes |
| `emojis` | boolean | Supports emojis in chat |
| `stickers` | boolean | Allows sending stickers |
| `userInfo` | boolean | Displays user profile information |
| `groupInfo` | boolean | Shows group details |

### 1.3 AI User Copilot (`aiUserCopilot`)

Provides AI-powered assistance:

| Property | Type | Description |
|----------|------|-------------|
| `conversationStarter` | boolean | Suggests AI-generated conversation starters |
| `conversationSummary` | boolean | Summarizes chat conversations |
| `smartReply` | boolean | Suggests smart replies based on context |

### 1.4 User Management (`userManagement`) - Optional

| Property | Type | Description |
|----------|------|-------------|
| `friendsOnly` | boolean (optional) | Restricts chat to friends only |

### 1.5 Group Management (`groupManagement`)

Manages group-related functionalities:

| Property | Type | Description |
|----------|------|-------------|
| `createGroup` | boolean | Allows users to create new groups |
| `addMembersToGroups` | boolean | Enables adding members to groups |
| `joinLeaveGroup` | boolean | Allows users to join or leave groups |
| `deleteGroup` | boolean | Enables group deletion by admins |
| `viewGroupMembers` | boolean | Displays group member lists |

### 1.6 Moderator Controls (`moderatorControls`)

Provides moderation features for group management:

| Property | Type | Description |
|----------|------|-------------|
| `kickUsers` | boolean | Allows moderators to remove users from groups |
| `banUsers` | boolean | Enables banning users from groups |
| `promoteDemoteMembers` | boolean | Allows promoting or demoting group members |
| `reportMessage` | boolean (optional) | Enables message reporting functionality |

### 1.7 Private Messaging Within Groups (`privateMessagingWithinGroups`)

| Property | Type | Description |
|----------|------|-------------|
| `sendPrivateMessageToGroupMembers` | boolean | Enables private messaging within groups |

---

## 2. Call Features (`callFeatures`)

Defines voice and video call functionalities.

### 2.1 Voice and Video Calling (`voiceAndVideoCalling`)

| Property | Type | Description |
|----------|------|-------------|
| `oneOnOneVoiceCalling` | boolean | Enables one-on-one voice calls |
| `oneOnOneVideoCalling` | boolean | Supports one-on-one video calls |
| `groupVideoConference` | boolean | Allows group video calls |
| `groupVoiceConference` | boolean | Enables group voice-only calls |

---

## 3. Layout (`layout`)

Configures UI layout options:

| Property | Type | Description |
|----------|------|-------------|
| `withSideBar` | boolean | Determines if the sidebar is visible |
| `tabs` | string[] | Defines available UI tabs (e.g., `['chats', 'calls', 'users', 'groups']`) |
| `chatType` | string | Specifies default chat type (`'user'` or `'group'`) |

---

## 4. Style (`style`)

Handles theme and UI styling preferences.

### 4.1 Theme

| Property | Type | Description |
|----------|------|-------------|
| `theme` | string | Defines the theme mode (`'light'`, `'dark'`, or `'system'`) |

### 4.2 Color

| Property | Type | Description |
|----------|------|-------------|
| `brandColor` | string | Primary UI color (hex code, e.g., `'#6852D6'`) |
| `primaryTextLight` | string | Text color in light mode (hex code) |
| `primaryTextDark` | string | Text color in dark mode (hex code) |
| `secondaryTextLight` | string | Secondary text color in light mode (hex code) |
| `secondaryTextDark` | string | Secondary text color in dark mode (hex code) |

### 4.3 Typography

| Property | Type | Description |
|----------|------|-------------|
| `font` | string | Specifies the UI font family (e.g., `'roboto'`) |
| `size` | string | Defines the font size preference (e.g., `'default'`) |

---

## 5. No Code (`noCode`) - Optional

Configures no-code deployment and customization options for embedded chat widgets:

| Property | Type | Description |
|----------|------|-------------|
| `docked` | boolean | Determines if the chat widget is displayed in docked mode |

### 5.1 Styles

| Property | Type | Description |
|----------|------|-------------|
| `buttonBackGround` | string | Background color for the docked chat button (hex code) |
| `buttonShape` | string | Shape of the docked button (e.g., `'rounded'`) |
| `openIcon` | string | URL for the icon displayed when chat is closed |
| `closeIcon` | string | URL for the icon displayed when chat is open |
| `customJs` | string | Custom JavaScript code to be executed |
| `customCss` | string | Custom CSS styles to be applied |
| `dockedAlignment` | string (optional) | Position of the docked button (`'left'` or `'right'`) |

---

## 6. Agent (`agent`) - Optional

Configures agent-specific features for customer support scenarios:

| Property | Type | Description |
|----------|------|-------------|
| `chatHistory` | boolean | Enables access to previous chat history |
| `newChat` | boolean | Allows starting new chat conversations |
| `agentIcon` | string | URL or path to the agent's profile icon |
| `showAgentIcon` | boolean | Determines if the agent icon should be displayed |

---

## Summary

The `CometChatSettingsInterface` allows full customization of chat, calling, layout, style, no-code deployment, and agent configurations, making it a powerful tool for building dynamic chat experiences across various use cases.
