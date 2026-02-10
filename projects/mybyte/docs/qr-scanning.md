# QR Code Scanning System

## Overview

The MyByte QR scanning system allows organizers to track event attendance by scanning participant QR codes. This system is implemented in `/projects/mybyte/pages/qrRead.tsx` and integrates with Firebase to manage event attendance and point allocation.

## How It Works

### Component Structure

The QR scanning interface is built using:
- **react-qr-reader** - Handles QR code scanning via device camera
- **OrganizerRoute** - Ensures only organizers/admins can access the scanner
- Real-time Firebase integration for attendance tracking

### Scan Flow

1. **Camera Activation**: The QR reader activates the device's rear camera (`facingMode: "environment"`)
2. **QR Code Detection**: When a QR code is detected, the system extracts the user ID (UID)
3. **Debouncing**: A 3-second debounce prevents duplicate scans of the same user
4. **Processing**: 
   - Validates the scanned UID
   - Checks if an event is selected
   - Retrieves user information from Firebase
   - Verifies attendance status
   - Calculates and updates points
5. **Feedback**: Visual and audio feedback indicates success, warning, or error

### Scan States

The system uses several visual states to provide feedback:

- **`idle`**: Waiting for a QR code scan (gray indicator)
- **`processing`**: Currently processing a scanned code (gray indicator)
- **`success`**: Attendance recorded successfully (green flash + sound)
- **`warning`**: User already attended this event (amber flash + sound)
- **`error`**: An error occurred (red flash + sound)

## Key Features

### 1. Debouncing

To prevent accidental duplicate scans, the system implements a 3-second debounce:

```typescript
const DEBOUNCE_MS = 3000;

if (lastScanRef.current) {
  const { uid: lastUid, time } = lastScanRef.current;
  if (uid === lastUid && now - time < DEBOUNCE_MS) {
    return; // Ignore duplicate scan
  }
}
```

### 2. Audio Feedback

The system provides three audio cues:
- **Success sound** (`/sounds/success.mp3`) - Attendance recorded
- **Warning sound** (`/sounds/warning.mp3`) - Already attended
- **Error sound** (`/sounds/error.mp3`) - Invalid scan or error

Audio is automatically unlocked on the first interaction to bypass browser autoplay restrictions.

### 3. Visual Feedback

- **Screen Flash**: Full-screen colored overlay indicates scan result
  - Green for success
  - Amber for warnings
  - Red for errors
- **Status Indicator**: Real-time status badge shows current state
- **User Preview**: Displays scanned user's name, shirt size, and current points

### 4. Scan Log

The interface maintains a log of the last 50 scans, showing:
- Participant name
- Event title
- Status (success/warning/error)
- Error message (if applicable)
- Timestamp

## Attendance Tracking

### Firebase Collections

The system interacts with the following Firebase collections:

- **`UH11-events`**: Contains all event definitions with points and metadata
- **`UH11-events/{eventId}/attendance`**: Stores attendance records per event

### Attendance Recording

When a QR code is scanned:

1. The `addAttendance()` function checks if the event exists
2. It queries the attendance subcollection for existing records
3. **For regular events**: Throws "Already attended" error if record exists
4. **For Point Store events**: Increments the `times` counter for multiple redemptions
5. Creates/updates the attendance document:
   ```typescript
   {
     uid: userId,
     timestamp: new Date(),
     times: 1 // or incremented value for Point Store
   }
   ```

### Point Store Events

Events with "[Point Store]" in their title allow multiple check-ins:
- Each scan increments the `times` counter
- Points are multiplied by the number of times attended
- Used for redemption-style events where users spend points

## User Data Retrieved

For each scan, the system fetches:
- **Name**: User's full name from the `users` collection
- **Shirt Size**: From the user's registration details
- **Current Points**: Dynamically calculated from all event attendance

## Error Handling

The system handles various error conditions:

| Error | Cause | Status |
|-------|-------|--------|
| "No QR Code has been scanned!" | Empty UID | Error |
| "Not valid User QR-Code" | UID contains "/" (likely a URL) | Error |
| "Please select an event." | No event selected in dropdown | Error |
| "Event not found" | Invalid event ID | Error |
| "User not found!" | UID doesn't exist in system | Error |
| "Not enough points" | User lacks points for negative point events | Error |
| "Already attended" | User already checked in to this event | Warning |

## Event Selection

Organizers must select an event from the dropdown before scanning:

```tsx
<select id="what-for">
  <option value="invalid">SELECT AN EVENT</option>
  {events.map((event) => (
    <option key={event.id} value={event.id}>
      {event.title}
    </option>
  ))}
</select>
```

Only **active** events are displayed in the dropdown. Events are fetched from Firebase with `active: true` filter.

## QR Code Format

Participant QR codes should contain only the user's UID (Firebase authentication ID). Any QR code containing a "/" character is rejected as invalid, preventing URL-based QR codes from being accidentally scanned.

## Camera Constraints

The scanner is configured to use:
- **Rear camera** preferred (`facingMode: "environment"`)
- **Full viewport** coverage for easy scanning
- **Continuous scanning** with no delay between reads (`scanDelay: 0`)

## Performance Considerations

- **Processing Lock**: The `isProcessing` flag prevents concurrent scan processing
- **Debouncing**: Prevents accidental duplicate scans of the same user
- **Async Processing**: Attendance recording is asynchronous to maintain UI responsiveness
- **Scan Log Limit**: Only the most recent 50 scans are retained in memory

## Security

- **Route Protection**: Only users with `ORGANIZER` or `ADMIN` roles can access the scanner
- **Firebase Validation**: All operations are validated against Firebase security rules
- **UID Validation**: QR codes are validated before processing to prevent malicious input
