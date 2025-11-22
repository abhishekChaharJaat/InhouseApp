# WebSocket Implementation for React Native App

This document describes the WebSocket implementation added to the React Native app (inhouseApp), modeled after the web app implementation.

## What Was Implemented

### 1. Enhanced Redux Store (`store/messageSlice.ts`)

Added WebSocket-related state and actions to manage real-time communication:

**New State Fields:**
- `connectionStatus` - WebSocket connection status ('connected' | 'connecting' | 'disconnected' | 'error')
- `awaitingResponse` - Flag indicating if waiting for a response
- `requestIds` - Array to track WebSocket message IDs
- `chatInputMessage` - Current message being typed
- `isWsReconnected` - Flag for reconnection detection
- `showConnectionErrorModal` - Display connection error UI
- `retryWS` - Retry connection flag
- `retryWSState` - Retry state tracking
- `threadLastMsgType` - Last message type received

**New Redux Actions:**
- `setConnectionStatus` - Update connection status
- `setAwaitingResponse` - Set/unset awaiting response flag
- `setMessagingDisabled` - Control message input
- `addMessage` - Add new messages to thread
- `setChatInputMessage` - Update input text
- `setupNewThread` - Initialize new thread
- `updateThreadDataTitle` - Update thread title
- `addRequestIds` - Track message IDs
- `setShowConnectionErrorModal` - Show/hide error modal
- `setRetryWS` - Control retry logic
- `setRetryWSState` - Update retry state
- `setIsWsReconnected` - Mark reconnection
- `setThreadLastMsgType` - Track last message type
- `resetThreadData` - Reset thread state

### 2. WebSocket Provider (`app/providers/WebSocketProvider.tsx`)

A comprehensive WebSocket management component that handles:

**Connection Management:**
- Automatic connection on app launch
- Reconnection on app foreground
- Connection retry logic (max 10 retries)
- Connection health monitoring (ping/pong)
- Mutex to prevent multiple concurrent connections

**Message Handling:**
- Send messages through WebSocket
- Receive and process incoming messages
- Message ID tracking for reliability
- Support for both new and legacy message formats

**Key Features:**
- **Auto-reconnect**: Automatically reconnects on connection loss
- **Health checks**: Sends ping every 15 seconds, timeout after 60 seconds
- **App state handling**: Reconnects when app comes to foreground
- **Error handling**: Shows error modal after max retries
- **Redux integration**: Dispatches actions for state updates

**API:**
```typescript
const { sendMessage, createMessage, isConnected } = useWebSocket();

// Create a message
const message = createMessage('chat', 'create-thread', {});

// Send the message
const success = sendMessage(message);
```

### 3. Environment Configuration

Added WebSocket endpoint configuration in `.env`:

```env
EXPO_PUBLIC_WS_BASE_ENDPOINT=wss://api-dev.inhouse.app
```

### 4. Integration

WebSocketProvider is integrated in `app/_layout.tsx` to wrap the entire app:

```tsx
<WebSocketProvider>
  <ContactHelp />
  <SideNav />
  <SinglePlanModal />
  <Stack screenOptions={{ headerShown: false }} />
</WebSocketProvider>
```

## How to Use WebSocket in Your Components

### Basic Example

```tsx
import { useWebSocket } from '@/app/providers/WebSocketProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setChatInputMessage } from '@/store/messageSlice';

function ChatComponent() {
  const dispatch = useDispatch();
  const { sendMessage, createMessage, isConnected } = useWebSocket();

  // Get state from Redux
  const threadData = useSelector((state: RootState) => state.message.threadData);
  const chatInput = useSelector((state: RootState) => state.message.chatInputMessage);
  const awaitingResponse = useSelector((state: RootState) => state.message.awaitingResponse);

  // Send a message
  const handleSend = () => {
    const message = createMessage('ask', 'add-message', {
      thread_id: threadData.id,
      message: chatInput,
    });
    sendMessage(message);
  };

  return (
    // Your UI here
  );
}
```

### Creating a New Thread

```tsx
const handleCreateThread = () => {
  const message = createMessage('chat', 'create-thread', {});
  sendMessage(message);
};
```

### Sending a Message to Existing Thread

```tsx
const handleSendMessage = () => {
  const message = createMessage('ask', 'add-message', {
    thread_id: threadData.id,
    message: chatInputMessage,
  });
  sendMessage(message, true); // true = scroll to bottom
};
```

### Listening to Connection Status

```tsx
const connectionStatus = useSelector((state: RootState) => state.message.connectionStatus);

useEffect(() => {
  if (connectionStatus === 'connected') {
    console.log('WebSocket connected!');
  } else if (connectionStatus === 'error') {
    console.log('WebSocket error!');
  }
}, [connectionStatus]);
```

### Handling Messages

Messages are automatically added to Redux when received:

```tsx
const messages = useSelector((state: RootState) => state.message.threadData.messages);

<FlatList
  data={messages}
  renderItem={({ item }) => (
    <Text>{item.message_text}</Text>
  )}
/>
```

## Message Types Handled

The WebSocket provider handles these message types:

### New Format (status_code: 200)
- `chat_created` - New thread created
- `message_added` - Message successfully added
- `new_title` - Thread title updated
- `enable_messaging` - Messaging enabled
- `document_generated` - Document created

### Legacy Format
- `chat/thread-created` - Thread creation
- `chat/message-added` - Message added
- `chat/new-message-available` - New AI message
- `ai_title_available` - Title available

## Connection Behavior

**On App Launch:**
1. WebSocketProvider initializes
2. Gets authentication token from Clerk
3. Establishes WebSocket connection
4. Starts ping/pong health checks

**On Connection Loss:**
1. Detects disconnection
2. Attempts to reconnect (up to 10 times)
3. Shows error modal if max retries reached

**On App Foreground:**
1. Checks connection status
2. Sends ping to verify connection
3. Reconnects if needed

## Configuration

### Change WebSocket Endpoint

Edit `.env` file:

```env
EXPO_PUBLIC_WS_BASE_ENDPOINT=wss://your-api-url.com
```

### Adjust Connection Parameters

Edit `app/providers/WebSocketProvider.tsx`:

```typescript
const MAX_RETRIES = 10;           // Max reconnection attempts
const CONNECTION_CHECK_INTERVAL = 10000;  // Check every 10 seconds
const PING_INTERVAL = 15000;      // Ping every 15 seconds
const CONNECTION_TIMEOUT = 60000; // Timeout after 60 seconds
```

## Comparison with Web App

This implementation mirrors the web app (`inhouse/src/WebsocketProvider.js`) with these adaptations:

| Feature | Web App | React Native App |
|---------|---------|------------------|
| WebSocket API | Browser WebSocket | React Native WebSocket |
| Connection management | ✅ | ✅ |
| Auto-reconnect | ✅ | ✅ |
| Ping/Pong health | ✅ | ✅ |
| App state handling | Visibility API | AppState API |
| Redux integration | ✅ | ✅ |
| Message recovery | ✅ | Simplified |
| Error handling | ✅ | ✅ |

## Troubleshooting

### Connection Not Established

1. Check `.env` has correct WebSocket endpoint
2. Verify authentication token is available
3. Check network connectivity
4. Review console for errors

### Messages Not Appearing

1. Verify thread ID is set in state
2. Check `requestIds` array includes message ID
3. Ensure `messaging_disabled` is false
4. Check Redux state updates

### Frequent Disconnections

1. Check network stability
2. Adjust `CONNECTION_TIMEOUT` if needed
3. Review server-side WebSocket configuration

## Next Steps

To fully replicate web app functionality, consider adding:

1. **Message Recovery**: Persist pending messages and retry on reconnection
2. **File Attachments**: Support for uploading files through WebSocket
3. **Quick Actions**: Handle quick action buttons in messages
4. **Document Unlock**: Support for locked document generation
5. **Error Logging**: Add Sentry or similar for error tracking

## Example Component

See `app/examples/WebSocketExample.tsx` for a complete working example.

## Testing

To test the WebSocket connection:

1. Launch the app
2. Check Redux DevTools for `connectionStatus: 'connected'`
3. Create a new thread
4. Send a message
5. Verify message appears in thread
6. Put app in background, then foreground
7. Verify reconnection works

## Support

For issues or questions, refer to:
- Web app implementation: `inhouse/src/WebsocketProvider.js`
- Redux slice: `store/messageSlice.ts`
- Provider: `app/providers/WebSocketProvider.tsx`
