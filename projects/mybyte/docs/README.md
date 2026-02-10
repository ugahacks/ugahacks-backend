# MyByte Documentation

Welcome to the MyByte system documentation! This folder contains comprehensive guides covering all aspects of the MyByte event management platform used by UGAHacks.

## Documentation Structure

### Core System Documentation

1. **[QR Code Scanning](./qr-scanning.md)**
   - QR scanner implementation and workflow
   - Scan states and feedback mechanisms
   - Attendance tracking process
   - Audio/visual feedback system
   - Error handling and debouncing
   - Performance considerations

2. **[Roles and Permissions](./roles-and-permissions.md)**
   - User role types (HACKER, ORGANIZER, ADMIN, etc.)
   - Permission levels for each role
   - Protected routes and access control
   - Role assignment process
   - Route protection components

3. **[Points System](./points-system.md)**
   - Dynamic points calculation methodology
   - Event points assignment
   - Point Store mechanics
   - Attendance multipliers
   - Points validation and integrity
   - Performance optimization considerations

4. **[Firebase Collections](./firebase-collections.md)**
   - Complete database schema
   - `users` collection (general SSO/MyByte system)
   - Event-specific collections (UH11-user-registration-details, eSports11-user-registration-details)
   - Collection relationships and data flow
   - Difference between authentication and event registration
   - Historical data retention

5. **[Registration Flows](./registration-flows.md)**
   - MyByte account creation (signup.tsx)
   - UGAHacks 11 event registration (register.tsx)
   - eSports 11 tournament registration (esports.tsx)
   - Data written to Firebase for each flow
   - Registration prerequisites and dependencies
   - Email confirmation process

### Operational Documentation

6. **[Troubleshooting Guide](./troubleshooting.md)**
   - Common QR scanning issues
   - Registration problems
   - Authentication errors
   - Points calculation issues
   - Performance troubleshooting
   - Emergency procedures

7. **[Security Posture](./security.md)**
   - Authentication mechanisms
   - Authorization and access control
   - Firebase security rules
   - Data protection measures
   - Input validation
   - Compliance considerations
   - Threat model and risk assessment

## Quick Start Guide

### For Event Participants

1. **Create Account**: Visit `/signup` and register with email/password or Google
2. **Register for Event**: Complete the registration form at `/register`
3. **Access Dashboard**: View your QR code and points at `/dashboard`
4. **Optional**: Register for eSports tournament at `/esports`

### For Organizers

1. **Get Elevated Access**: Admin must set your `user_type` to `ORGANIZER` in Firebase
2. **Access QR Scanner**: Navigate to `/qrRead`
3. **Select Event**: Choose the event from the dropdown
4. **Scan QR Codes**: Point camera at participant QR codes to record attendance
5. **Monitor Results**: View real-time feedback and scan log

### For Administrators

1. **Configure Events**: Create/edit events in `UH11-events` collection
2. **Manage Roles**: Assign user roles in `users` collection
3. **Review Security**: Ensure Firebase security rules are properly configured
4. **Monitor System**: Check Firebase Console for errors and usage

## Key Concepts

### Authentication vs Registration

- **Authentication** (`users` collection): Your MyByte account - persists across all events
- **Registration** (event collections): Event-specific details - separate for each hackathon

### Points System

- Points are **calculated dynamically** from attendance records
- Not stored directly - computed from `UH11-events/{eventId}/attendance` subcollections
- Supports positive (rewards) and negative (redemptions) points
- Point Store events allow multiple check-ins with multipliers

### User Roles

- **HACKER**: Default participant role
- **ORGANIZER**: Can access QR scanner and track attendance
- **ADMIN**: Full system access

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  MyByte System                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Authentication Layer (Firebase Auth)               │
│  ├── Email/Password                                 │
│  └── Google OAuth                                   │
│                                                      │
│  Database Layer (Firestore)                         │
│  ├── users (persistent identity)                    │
│  ├── UH11-user-registration-details (event data)    │
│  ├── eSports11-user-registration-details            │
│  ├── UH11-events (event definitions)                │
│  │   └── attendance subcollections                  │
│  └── team (team management)                         │
│                                                      │
│  Storage Layer (Firebase Storage)                   │
│  └── resume/ (user resume uploads)                  │
│                                                      │
│  Application Layer (Next.js)                        │
│  ├── /signup - Account creation                     │
│  ├── /login - Authentication                        │
│  ├── /dashboard - User dashboard                    │
│  ├── /register - Event registration                 │
│  ├── /esports - Tournament registration             │
│  └── /qrRead - QR scanner (organizers only)         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## File Locations

### Key Source Files

- **QR Scanner**: `/projects/mybyte/pages/qrRead.tsx`
- **Registration**: `/projects/mybyte/pages/register.tsx`
- **eSports Registration**: `/projects/mybyte/pages/esports.tsx`
- **Signup**: `/projects/mybyte/pages/signup.tsx`
- **Dashboard**: `/projects/mybyte/pages/dashboard.tsx`
- **Auth Context**: `/projects/mybyte/context/AuthContext.tsx`
- **Event Interface**: `/projects/mybyte/interfaces/event.ts`
- **User Types**: `/projects/mybyte/enums/userType.ts`

### Configuration Files

- **Firebase Config**: `/projects/mybyte/config/firebase.ts`
- **Next.js Config**: `/projects/mybyte/next.config.js`
- **Package Config**: `/projects/mybyte/package.json`

## Common Tasks

### Adding a New Event

1. Add document to `UH11-events` collection:
   ```typescript
   {
     title: "Workshop: Introduction to React",
     description: "Learn React basics",
     timestamp: new Date("2026-02-07T14:00:00"),
     points: 15,
     active: true
   }
   ```

2. Event automatically appears in QR scanner dropdown

### Elevating User to Organizer

1. Open Firebase Console
2. Navigate to Firestore Database
3. Go to `users` collection
4. Find user document by UID or email
5. Edit `user_type` field
6. Set value to `"ORGANIZER"`
7. User must refresh/re-login to see changes

### Adjusting Point Values

1. Edit event document in `UH11-events`
2. Update `points` field
3. Points recalculated automatically for all users
4. No manual updates needed

### Exporting User Data

Use Firebase Console or Firebase Admin SDK:
```javascript
const snapshot = await db.collection('UH11-user-registration-details').get();
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

## Development Workflow

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn workspace mybyte run dev

# Access at http://localhost:3000
```

### Testing

```bash
# Run linter
yarn workspace mybyte run lint

# Type checking
yarn workspace mybyte run type-check
```

### Deployment

Managed via GitHub Actions workflows - see `/.github/workflows/`

## Additional Resources

- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **React Hook Form**: [react-hook-form.com](https://react-hook-form.com)

## Getting Help

- **Technical Issues**: tech@ugahacks.com
- **General Questions**: hello@ugahacks.com
- **Security Concerns**: tech@ugahacks.com (subject: SECURITY)

## Contributing

When contributing to MyByte:

1. Follow existing code style and patterns
2. Update documentation for any changes
3. Test thoroughly before submitting
4. Consider security implications
5. Update this documentation as needed

## License

Copyright UGAHacks. All rights reserved.

---

**Last Updated**: February 2026  
**Version**: UGAHacks 11
