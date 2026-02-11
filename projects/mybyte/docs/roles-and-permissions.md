# Roles and Permissions

## Overview

The MyByte system implements a role-based access control (RBAC) system to manage user permissions across the platform. User roles determine what features and pages users can access.

## User Roles

The system defines six distinct user roles in `/projects/mybyte/enums/userType.ts`:

```typescript
export enum Users {
    hacker = "HACKER",
    mentor = "MENTOR",
    judge = "JUDGE",
    volunteer = "VOLUNTEER",
    admin = "ADMIN",
    organizer = "ORGANIZER"
}
```

### Role Descriptions

| Role | Description | Typical Permissions |
|------|-------------|---------------------|
| **HACKER** | Standard event participant | Access to dashboard, event registration, QR code display |
| **MENTOR** | Event mentor/helper | Similar to hacker, may have additional mentor-specific features |
| **JUDGE** | Project judge | Access to judging interfaces (if implemented) |
| **VOLUNTEER** | Event volunteer | Similar to hacker, may have volunteer-specific features |
| **ORGANIZER** | Event organizer | Access to QR scanning, event management, attendance tracking |
| **ADMIN** | System administrator | Full access to all features including organizer capabilities |

## Role Assignment

### Initial Assignment

User roles are assigned when users register for events:

```typescript
// From AuthContext.tsx - Event Registration
await updateDoc(doc(userRef, user.uid), {
  "registered.HACKS11": true,
  school: data.school.value,
  user_type: Users.hacker,  // Assigned as HACKER by default
  points: 0,
});
```

### Default Role

- **New users** are assigned `user_type: null` upon account creation
- **Event registrants** are automatically assigned the `HACKER` role
- **Elevated roles** (ORGANIZER, ADMIN) must be assigned manually via Firebase Console

## Protected Routes

The system uses two main route protection components:

### 1. ProtectedRoute

Located in `/projects/mybyte/components/ProtectedRoute.tsx`

**Purpose**: Ensures user is authenticated

**Behavior**:
- Checks if `user.uid` exists
- Redirects unauthenticated users to `/login`
- Allows all authenticated users to access the wrapped content

**Usage**:
```tsx
<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>
```

### 2. OrganizerRoute

Located in `/projects/mybyte/components/OrganizerRoute.tsx`

**Purpose**: Restricts access to organizers and admins only

**Behavior**:
- First checks authentication (redirects to `/login` if not authenticated)
- Then checks if `user_type === Users.organizer || user_type === Users.admin`
- Redirects non-privileged users to `/dashboard`

**Usage**:
```tsx
<OrganizerRoute>
  <QRScannerPage />
</OrganizerRoute>
```

**Protected Pages**:
- `/qrRead.tsx` - QR code scanning interface

## UserInfo Context

User role information is stored in the `AuthContext` and accessed via the `useAuth()` hook:

```typescript
export interface UserInfoType {
  first_name: string | null;
  last_name: string | null;
  points: number;
  tid: string | null;           // Team ID
  school: string | null;
  registered: EventRegistered;   // Which events user registered for
  user_type: Users | null;       // User's role
}
```

### Accessing User Role

```typescript
const { user, userInfo, user_type } = useAuth();

// user_type contains: "HACKER", "ORGANIZER", "ADMIN", etc.
if (user_type === Users.admin) {
  // Admin-specific logic
}
```

## Firebase Data Structure

### users Collection

Each user document in the `users` collection contains:

```typescript
{
  uid: string,
  first_name: string,
  last_name: string,
  name: string,
  email: string,
  points: number,
  registered: {
    HACKS11?: boolean,
    ESPORTS11?: boolean,
    // ... other events
  },
  school: string | null,
  user_type: "HACKER" | "MENTOR" | "JUDGE" | "VOLUNTEER" | "ADMIN" | "ORGANIZER" | null,
  authProvider: "local" | "google.com",
  added_time: timestamp
}
```

## Role Elevation Process

To elevate a user to ORGANIZER or ADMIN:

1. Access the Firebase Console
2. Navigate to Firestore Database
3. Find the user's document in the `users` collection
4. Edit the `user_type` field
5. Set to `"ORGANIZER"` or `"ADMIN"`
6. Save changes

The user will receive elevated permissions on their next login or page refresh.

## Permission Implications

### HACKER/MENTOR/JUDGE/VOLUNTEER
- ✅ Can access dashboard
- ✅ Can register for events
- ✅ Can view/generate personal QR code
- ✅ Can view points balance
- ✅ Can join/create teams (if enabled)
- ❌ Cannot access QR scanner
- ❌ Cannot manage events

### ORGANIZER
- ✅ All HACKER permissions
- ✅ Can access QR scanning interface
- ✅ Can track event attendance
- ✅ Can view participant information during scanning

### ADMIN
- ✅ All ORGANIZER permissions
- ✅ Full system access
- ✅ Can perform any action

## Security Considerations

1. **Client-Side Protection**: Route protection is enforced in React components
2. **Server-Side Validation**: Firebase Security Rules should enforce role-based access
3. **Role Persistence**: User roles are stored in Firebase and persist across sessions
4. **Default Restrictions**: New users have minimal permissions until registered
5. **Principle of Least Privilege**: Users receive only necessary permissions for their role

## Best Practices

1. **Regular Audits**: Periodically review user roles in Firebase Console
2. **Minimal Elevation**: Only elevate users to ORGANIZER/ADMIN when necessary
3. **Documentation**: Maintain a list of users with elevated privileges
4. **Revocation**: Remove elevated privileges after events conclude if temporary
5. **Testing**: Test features with different role levels to ensure proper access control
