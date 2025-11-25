# WebSocket Connection Setup

This document explains how WebSocket connections work in the InhouseApp for both authenticated and unauthenticated users.

## Overview

The app supports two types of WebSocket connections:

1. **Authenticated Connection** - For signed-in users (using Clerk token)
2. **Anonymous Connection** - For unauthenticated users on the `/try` page (using anonymous_user_id)

## Architecture

### Files Modified/Created

- `app/providers/wsClient.ts` - Core WebSocket client with connection helpers
- `app/try/_layout.tsx` - Layout for `/try` route that establishes anonymous connection
- `app/try/index.tsx` - Entry point for `/try` route
- `app/try/LandingPage.tsx` - Landing page that uses the WebSocket connection

### How It Works

#### For Authenticated Users (Existing Implementation)

1. User signs in via Clerk
2. `app/App.tsx` (line 51-115) establishes WebSocket connection
3. Connection uses: `wss://api-dev.inhouse.app/ws?token=${token}`
4. Connection is active for all authenticated routes

#### For Unauthenticated Users (New Implementation)

1. User visits `/try` route
2. `app/try/_layout.tsx` establishes anonymous WebSocket connection
3. Anonymous ID is generated/retrieved from SecureStore
4. Connection uses: `wss://api-dev.inhouse.app/ws?anonymous_user_id=${anonymousId}`
5. Same WebSocket message handlers are used (from `wsClient.ts`)

## Anonymous User ID Management

### Storage
- Anonymous IDs are stored in `expo-secure-store`
- Key: `anonymous_user_id`
- Persists across app sessions
- UUID v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### Functions

```typescript
// Get or create anonymous user ID
const anonymousId = await getAnonymousUserId();

// Connect anonymous WebSocket
const ws = await connectAnonymousWebSocket();
```

## Connection Flow

### Anonymous Connection Flow

```
1. User opens /try page
   ↓
2. TryLayout component mounts
   ↓
3. getAnonymousUserId() called
   ↓
4. Check SecureStore for existing ID
   ↓
5. If not found, generate new UUID
   ↓
6. Store in SecureStore
   ↓
7. Connect WebSocket with anonymous_user_id
   ↓
8. WebSocket connection established
   ↓
9. User can create threads and send messages
```

## Message Handling

Both authenticated and anonymous connections use the same message handlers from `app/providers/wsClient.ts`:

- `handleWebSocketMessage()` - Main message router
- `handleNewFormatMessage()` - Handles new message format
- `handleLegacyMessage()` - Handles legacy message format

### Key Message Types

- `chat_created` - New thread created
- `message_added` - Message added to thread
- `new_title` - Thread title updated
- `enable_messaging` - Enable/disable messaging
- `document_generated` - Document created

## WebSocket Instance Management

The app maintains a single WebSocket instance at a time:

```typescript
// Global WebSocket instance
let wsInstance: WebSocket | null = null;

// Set instance
setWebSocketInstance(ws);

// Get instance
const ws = getWebSocketInstance();
```

## Environment Variables

Required environment variable:

```
EXPO_PUBLIC_WS_BASE_ENDPOINT=wss://api-dev.inhouse.app
```

Falls back to `wss://api-dev.inhouse.app` if not set.

## Testing

To test the anonymous connection:

1. Ensure user is NOT signed in
2. Navigate to `/try` route
3. Check console logs for:
   ```
   Initializing anonymous WebSocket for /try page
   Connecting anonymous WebSocket...
   Anonymous WebSocket connected successfully
   ```
4. Try sending a message on the landing page
5. Verify thread creation and message handling

## Backend Compatibility

The anonymous WebSocket connection is compatible with the existing backend implementation:

- Backend endpoint: `/ws?anonymous_user_id=${id}`
- Same as web version: `inhouse/src/WebsocketProvider.js` (line 362)
- Backend validates anonymous_user_id and creates/retrieves user session

## Security Notes

1. Anonymous IDs are stored securely in expo-secure-store
2. Each device gets a unique anonymous ID
3. IDs persist across app sessions for continuity
4. Backend should implement rate limiting for anonymous connections
5. Anonymous users have limited functionality compared to authenticated users

## Troubleshooting

### Connection fails
- Check EXPO_PUBLIC_WS_BASE_ENDPOINT is set correctly
- Verify backend is running and accessible
- Check network connectivity
- Look for error logs in console

### Anonymous ID not persisting
- Check SecureStore permissions
- Verify app has storage access
- Check for SecureStore errors in logs

### Messages not being handled
- Verify WebSocket connection is established
- Check message format matches expected format
- Look for errors in `handleWebSocketMessage()`

## Future Improvements

1. Add reconnection logic for anonymous connections
2. Implement heartbeat/ping for connection health
3. Add connection status indicators in UI
4. Migrate anonymous users to authenticated when they sign up
5. Add analytics for anonymous user behavior
