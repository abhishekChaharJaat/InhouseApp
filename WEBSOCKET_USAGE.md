# WebSocket Integration - Complete Guide

## Overview

WebSocket has been fully integrated into your React Native app using your existing ChatBox component. The implementation mirrors your web app's flow for creating threads and handling messages.

## How It Works

### 1. From Home Page (`/home`)

**User Flow:**
1. User types a message in ChatBox
2. User taps send button
3. App creates a new thread via WebSocket
4. App automatically sends the user's message to the new thread
5. App redirects to `/chat/[threadId]`
6. User sees their message and AI response

**Technical Flow:**
```typescript
// Home.tsx
handleSend() {
  // 1. Store message to send after thread creation
  setPendingInitialMessage(trimmedMessage);

  // 2. Create thread
  const message = createMessage("chat", "create-thread", {});
  sendMessage(message);
}

// WebSocketProvider listens for chat_created response
onMessage: 'chat_created' => {
  // 3. Setup thread in Redux
  dispatch(setupNewThread({ threadId }));

  // 4. Send pending message
  const msg = createMessage('ask', 'add-message', {
    thread_id: threadId,
    message: pendingInitialMessage
  });
  sendMessage(msg);
}

// Home.tsx useEffect watches for thread creation
useEffect(() => {
  if (threadData?.id) {
    // 5. Redirect to chat page
    router.push(\`/chat/\${threadData.id}\`);
  }
}, [threadData?.id]);
```

### 2. From Chat Page (`/chat/[threadId]`)

**User Flow:**
1. User types a message in ChatBox
2. User taps send button
3. Message is sent via WebSocket
4. AI response appears in chat

**Technical Flow:**
```typescript
// ChatPage.tsx
handleSend() {
  // Send message to existing thread
  const message = createMessage("ask", "add-message", {
    thread_id: threadId,
    message: trimmedMessage,
  });

  sendMessage(message, true);
}

// WebSocketProvider listens for message_added response
onMessage: 'message_added' => {
  // Add new messages to Redux
  dispatch(addMessage({
    new_messages: message.payload.new_messages,
    thread_id: message.payload.thread_id
  }));
}
```

## Files Modified

### ✅ Core Implementation

1. **`store/messageSlice.ts`** - Enhanced Redux store
   - Added WebSocket connection state
   - Added message management actions
   - Added thread management actions

2. **`app/providers/WebSocketProvider.tsx`** - WebSocket manager
   - Handles connection lifecycle
   - Routes WebSocket messages
   - Manages pending initial messages
   - Auto-reconnection logic

3. **`app/_layout.tsx`** - App layout
   - Wraps app with WebSocketProvider

4. **`.env`** - Environment configuration
   - Added `EXPO_PUBLIC_WS_BASE_ENDPOINT`

### ✅ UI Integration

5. **`app/home/Home.tsx`** - Home page
   - Integrated ChatBox with WebSocket
   - Thread creation logic
   - Auto-redirect to chat page

6. **`app/chat/ChatPage.tsx`** - Chat page
   - Integrated ChatBox with WebSocket
   - Message sending logic
   - Auto-scroll on new messages

### ✅ Existing Components (No Changes)

- **`app/chat/components/ChatBox.tsx`** - Reusable chat input (props-based)
- **`app/chat/RenderMessages.tsx`** - Message display

## Message Flow Diagram

```
HOME PAGE
┌─────────────────────────────────────────────┐
│ User types: "Review my contract"            │
│ User taps Send                              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 1. setPendingInitialMessage(message)        │
│ 2. sendMessage(create-thread)               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        WebSocket Server
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Response: chat_created { thread_id: "123" } │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ WebSocketProvider:                          │
│ 1. dispatch(setupNewThread(123))            │
│ 2. sendMessage(add-message, "Review...")    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Home.tsx:                                   │
│ router.push('/chat/123')                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        CHAT PAGE /chat/123
┌─────────────────────────────────────────────┐
│ Shows: User message + AI response           │
│ User can continue chatting                  │
└─────────────────────────────────────────────┘
```

## Key Features

✅ **Thread Creation from Home**
- User types message on home page
- Thread auto-created via WebSocket
- Message auto-sent to new thread
- Auto-redirect to chat page

✅ **Messaging in Chat Page**
- User sends messages via WebSocket
- Real-time message updates
- Auto-scroll to latest message
- Disabled when messaging blocked

✅ **Connection Management**
- Auto-connect on app launch
- Auto-reconnect on disconnection
- Ping/pong health checks
- Reconnect when app comes to foreground

✅ **State Management**
- All WebSocket state in Redux
- Connection status tracking
- Message tracking
- Thread data synchronization

## Usage Examples

### Send Message from Home

```tsx
// In Home.tsx - already implemented
const handleSend = () => {
  setPendingInitialMessage(inputMessage);
  const message = createMessage("chat", "create-thread", {});
  sendMessage(message);
  // Will auto-redirect to /chat/[threadId] after creation
};
```

### Send Message in Chat

```tsx
// In ChatPage.tsx - already implemented
const handleSend = () => {
  const message = createMessage("ask", "add-message", {
    thread_id: threadId,
    message: inputMessage,
  });
  sendMessage(message, true);
};
```

### Check Connection Status

```tsx
const connectionStatus = useSelector((state: RootState) => state.message.connectionStatus);
const { isConnected } = useWebSocket();

if (!isConnected) {
  Alert.alert("Not connected to server");
}
```

### Access Messages

```tsx
const messages = useSelector((state: RootState) => state.message.threadData.messages);
const awaitingResponse = useSelector((state: RootState) => state.message.awaitingResponse);
```

## Redux State Structure

```typescript
{
  message: {
    threadData: {
      id: string | null,           // Current thread ID
      title: string,                // Thread title
      messages: Array,              // All messages
      messaging_disabled: boolean,  // Can user send?
      // ... other fields
    },
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error',
    awaitingResponse: boolean,      // Waiting for AI response?
    chatInputMessage: string,       // Current input text
    // ... other fields
  }
}
```

## WebSocket Message Types Handled

### Outgoing (Client → Server)

- `chat/create-thread` - Create new thread
- `chat/add-message` - Send message to thread
- `chat/ping` - Health check

### Incoming (Server → Client)

**New Format (status_code: 200):**
- `chat_created` - Thread created successfully
- `message_added` - Message added to thread
- `new_title` - Thread title updated
- `enable_messaging` - Messaging re-enabled
- `document_generated` - Document created
- `pong` - Health check response

**Legacy Format:**
- `chat/thread-created` - Thread creation
- `chat/message-added` - Message added
- `chat/new-message-available` - New AI message
- `ai_title_available` - Title available

## Comparison: Web App vs React Native App

| Feature | Web App | React Native App | Status |
|---------|---------|------------------|--------|
| WebSocket Connection | ✅ | ✅ | ✅ Implemented |
| Thread Creation from Home | ✅ | ✅ | ✅ Implemented |
| Auto-send Initial Message | ✅ | ✅ | ✅ Implemented |
| Auto-redirect to Chat | ✅ | ✅ | ✅ Implemented |
| Send Messages in Chat | ✅ | ✅ | ✅ Implemented |
| Real-time Updates | ✅ | ✅ | ✅ Implemented |
| Auto-reconnect | ✅ | ✅ | ✅ Implemented |
| Ping/Pong Health Check | ✅ | ✅ | ✅ Implemented |
| File Attachments | ✅ | ⏳ | Coming Soon |
| Message Recovery | ✅ | ⏳ | Future |

## Testing

### Test Thread Creation

1. Open app
2. Go to Home page
3. Type a message: "Help me draft a contract"
4. Tap send
5. ✅ Should redirect to `/chat/[threadId]`
6. ✅ Should show your message
7. ✅ Should show AI response

### Test Messaging

1. Open existing chat thread
2. Type a message
3. Tap send
4. ✅ Message should appear
5. ✅ Should show "Waiting for response..."
6. ✅ AI response should appear

### Test Connection

1. Put app in background
2. Wait 30 seconds
3. Bring app to foreground
4. ✅ Should reconnect automatically
5. ✅ Should be able to send messages

## Troubleshooting

### Messages Not Sending

**Check:**
1. Is WebSocket connected? (`connectionStatus === 'connected'`)
2. Is `awaitingResponse` false?
3. Is `messaging_disabled` false?
4. Check console for errors

**Fix:**
- Wait for connection to establish
- Check Redux state
- Verify token is valid

### Thread Not Created

**Check:**
1. Did you call `setPendingInitialMessage()`?
2. Was `create-thread` WebSocket sent?
3. Check Redux `threadData.id`

**Fix:**
- Check console logs
- Verify WebSocket connection
- Check server response

### No Redirect After Thread Creation

**Check:**
1. Is `threadData.id` set in Redux?
2. Is the useEffect in Home.tsx running?

**Fix:**
- Check Redux DevTools
- Add console.log in useEffect

## Next Steps

To fully match web app functionality, consider adding:

1. **File Attachments**
   - Upload files before sending message
   - Display attachments in messages
   - Support PDF and DOCX

2. **Quick Action Buttons**
   - Pre-filled prompts on home page
   - Example: "Draft customer contract"

3. **Thread History**
   - List of all user threads
   - Navigate between threads

4. **Document Generation**
   - Handle `document_generated` messages
   - Display and download documents

5. **Error Recovery**
   - Persist pending messages
   - Retry failed sends
   - Offline queue

## Documentation

- **Full Implementation**: `WEBSOCKET_IMPLEMENTATION.md`
- **This Guide**: `WEBSOCKET_USAGE.md`
- **Web App Reference**: `inhouse/src/WebsocketProvider.js`

## Support

If you encounter issues:
1. Check Redux state in DevTools
2. Check console logs for WebSocket events
3. Verify `.env` has correct endpoint
4. Test connection status
5. Review `WEBSOCKET_IMPLEMENTATION.md` for details
