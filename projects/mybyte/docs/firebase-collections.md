# Firebase Collections

## Overview

MyByte uses Firebase Firestore as its primary database. The system maintains a clear separation between **authentication/user management** and **event-specific registration data**.

## Collection Architecture

### Two-Tier Structure

1. **User Collection** (`users`) - Persistent user accounts across all events
2. **Event Collections** - Event-specific registration and attendance data

This separation allows:
- Users to maintain a single account across multiple events
- Event-specific data to be isolated and managed independently
- Historical data retention for past events
- Clean data architecture for each event iteration

## Core Collections

### 1. users Collection

**Path**: `/users`

**Purpose**: Central user account management (SSO and MyByte authentication)

**Document Structure**:
```typescript
{
  uid: string,                    // Firebase Auth UID (document ID)
  first_name: string,             // User's first name
  last_name: string,              // User's last name
  name: string,                   // Full name
  email: string,                  // Email address
  authProvider: "local" | "google.com",  // Authentication method
  points: number,                 // Current points (may not be synchronized)
  school: string | null,          // School affiliation
  tid: string | null,             // Team ID reference
  user_type: "HACKER" | "MENTOR" | "JUDGE" | "VOLUNTEER" | "ADMIN" | "ORGANIZER" | null,
  registered: {                   // Event registration status
    HACKS9?: boolean,
    HACKSX?: boolean,
    ESPORTSX?: boolean,
    HACKS11?: boolean,
    ESPORTS11?: boolean,
    // ... other events
  },
  added_time: Timestamp           // Account creation timestamp
}
```

**Created When**: 
- User signs up with email/password
- User signs in with Google (first time)

**Purpose in System**:
- **Authentication**: Tracks user credentials and auth method
- **Authorization**: Stores user role (`user_type`)
- **Registration Status**: Tracks which events user has registered for
- **Cross-Event Identity**: Maintains user identity across multiple events

### 2. UH11-user-registration-details Collection

**Path**: `/UH11-user-registration-details`

**Purpose**: Stores detailed registration information for UGAHacks 11 event

**Document Structure**:
```typescript
{
  uid: string,                           // Links to users collection
  firstName: string,                     // From registration form
  lastName: string,                      // From registration form
  email: string,                         // User's email
  phoneNumber: string,                   // Contact number
  
  // Demographics
  age: number,
  gender: string,                        // From Genders enum
  race: string,                          // From Races enum
  
  // Academic Information
  school: string,                        // School name
  inputSchool?: string,                  // Custom school (if "Other")
  year: string,                          // Student year
  levelOfStudy: string,                  // Undergraduate, Graduate, etc.
  major: string,                         // Major selection
  inputMajor?: string,                   // Custom major (if "Other")
  minor?: string,                        // Optional minor
  
  // Event-Specific
  participated: boolean,                 // Previous hackathon participation
  hopeToSee: string,                     // Expectations/interests
  dietaryRestrictions: string,           // Dietary needs
  inputDietaryRestrictions?: string,     // Custom restrictions (if "Other")
  shirtSize: string,                     // T-shirt size
  elCreditInterest?: boolean,            // Experiential learning credit interest
  
  // Location
  countryResidence: string,              // Country of residence
  
  // Agreements
  codeOfConduct: boolean,                // MLH Code of Conduct agreement
  eventLogisticsInfo: boolean,           // Logistics info agreement
  mlhCommunication: boolean,             // MLH communication opt-in
  
  // Status
  accepted: boolean | null,              // Admin acceptance status
  checkedIn: boolean,                    // Physical check-in status
  checkedOut: boolean,                   // Check-out status
  
  // Files
  resumeLink: string | null,             // Firebase Storage URL for resume
  
  // Metadata
  submitted_time: Timestamp              // Registration submission time
}
```

**Created When**: 
- User completes the registration form at `/register`
- Form submission triggers `storeUserRegistrationInformation()`

**Corresponding User Update**:
```typescript
// users collection is updated simultaneously
await updateDoc(doc(userRef, user.uid), {
  "registered.HACKS11": true,
  school: data.school.value,
  user_type: Users.hacker,
  points: 0,
});
```

### 3. eSports11-user-registration-details Collection

**Path**: `/eSports11-user-registration-details`

**Purpose**: Stores registration information for eSports 11 tournament

**Document Structure**:
```typescript
{
  firstName: string,                // Participant's first name
  lastName: string,                 // Participant's last name
  gamerTag: string,                 // Gaming handle/nickname
  phoneNumber: string,              // Contact number
  
  // Game Selection
  selectedGameOne: string,          // Primary game choice
  selectedGameTwo: string,          // Secondary game choice
  
  // Tournament Info
  skillLevelDescription: string,    // Self-assessed skill level
  setUpDescription: string,         // Gaming setup details
  keyBindingsDescription: string,   // Control preferences
  
  // Agreements
  tardy_agreement: boolean,         // Late arrival acknowledgment
  
  // Metadata
  submitted_time: Timestamp         // Registration submission time
}
```

**Created When**: 
- User completes eSports registration form at `/esports`
- Form submission triggers `storeESportsRegistrationInformation()`

**Corresponding User Update**:
```typescript
await updateDoc(doc(userRef, user.uid), {
  "registered.ESPORTS11": true,
});
```

**Prerequisites**: 
- User must be registered for UGAHacks 11 first (enforced in UI)

### 4. UH11-events Collection

**Path**: `/UH11-events`

**Purpose**: Defines all events for UGAHacks 11 with attendance tracking

**Document Structure**:
```typescript
{
  id: string,                 // Document ID (used for references)
  title: string,              // Event name (e.g., "Opening Ceremony")
  description: string,        // Event details
  timestamp: Date,            // Event date/time
  points: number,             // Points awarded (positive, negative, or zero)
  active: boolean             // Whether event appears in QR scanner
}
```

**Subcollection**: `/UH11-events/{eventId}/attendance`

Each attendance document:
```typescript
{
  uid: string,                // User ID (document ID)
  timestamp: Timestamp,       // When attendance was recorded
  times: number               // Number of times attended (for Point Store events)
}
```

**Purpose**:
- Track which events exist
- Define point values for each event
- Store attendance records per event
- Support Point Store redemptions with `times` counter

## Supporting Collections

### 5. team Collection

**Path**: `/team`

**Purpose**: Manages team formation for hackathon projects

**Document Structure**:
```typescript
{
  members: string[],          // Array of member email addresses
  submitted?: boolean | null  // Whether team submitted project
}
```

**User Reference**:
- User documents in `users` collection have `tid` field linking to team document

### 6. UH11-registrationMail Collection

**Path**: `/UH11-registrationMail`

**Purpose**: Triggers email notifications via Firebase extension

**Document Structure**:
```typescript
{
  to: string,                 // Recipient email
  message: {
    subject: string,          // Email subject
    text: string,             // Plain text (optional)
    html: string              // HTML email body
  },
  createdAt?: Timestamp,      // When email was queued
  uid?: string,               // User ID (metadata)
  type?: string               // Email type (metadata)
}
```

**Created When**:
- User registers for UGAHacks 11
- Triggers confirmation email via `triggerRegistrationEmail()`

### 7. email-templates Collection

**Path**: `/email-templates`

**Purpose**: Stores reusable email templates

**Document Examples**:
- `uh11` - UGAHacks 11 registration confirmation template
- `esports11Registration` - eSports 11 confirmation template

**Document Structure**:
```typescript
{
  html: string,    // HTML email template
  subject?: string // Optional subject line
}
```

## Staging Collections

For development/testing purposes, staging variants exist:

- `users-stage`
- `user-registration-details-stage`
- `user-e-sports-details-stage`
- `user-workshop-details-stage`
- `team-stage`

These allow testing without affecting production data.

## Collection Relationships

### Registration Flow

```
User Signs Up
      ↓
  [users] document created
      ↓
User Registers for UGAHacks 11
      ↓
  [UH11-user-registration-details] created
  [users].registered.HACKS11 = true
  [UH11-registrationMail] triggered
      ↓
(Optional) User Registers for eSports 11
      ↓
  [eSports11-user-registration-details] created
  [users].registered.ESPORTS11 = true
```

### Attendance Flow

```
Organizer Scans QR Code
      ↓
  Query [UH11-events] for event details
      ↓
  Check [UH11-events/{eventId}/attendance] for existing record
      ↓
  Create/Update attendance document
      ↓
  Calculate points from all attendance records
```

## Historical Collections

Past events maintain their own collections:

- `UH9-user-registration-details` - UGAHacks 9
- `UHX-user-registration-details` - UGAHacks X
- `user-registration-details` - UGAHacks 8
- `user-e-sports-details` - eSports 8

These are **not deleted** and serve as:
- Historical records
- Reference for future events
- Data for analytics and reports

## Key Differences: users vs Event Collections

### users Collection (General SSO/MyByte System)

**Purpose**: Central identity and authentication
**Scope**: Spans all events and time periods
**Contains**:
- Authentication credentials (linked to Firebase Auth)
- Basic user info (name, email)
- Current role and permissions
- Registration status flags for all events
- School affiliation (persists across events)

**When Used**:
- Login/authentication
- Role-based access control
- Cross-event user lookup
- Team management

### Event Collections (e.g., UH11-user-registration-details)

**Purpose**: Event-specific registration details
**Scope**: Single event only
**Contains**:
- Comprehensive registration form data
- Event-specific preferences
- Demographic information
- Acceptance/check-in status
- Documents (resume upload)

**When Used**:
- Collecting detailed participant information
- Managing event logistics (dietary restrictions, shirts, etc.)
- Participant acceptance/waitlist management
- Event-specific analytics

### Why This Separation?

1. **Data Privacy**: Event-specific data doesn't persist unnecessarily
2. **Scalability**: Each event's data is isolated
3. **Flexibility**: Different events can collect different information
4. **Performance**: Queries are faster with smaller, focused collections
5. **Organization**: Clear data boundaries make management easier

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     User Signs Up/Logs In                   │
│                           ↓                                  │
│                    [users] Collection                        │
│              (Persistent Identity & Auth)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                             ↓
┌───────────────────────┐              ┌──────────────────────────┐
│  Event Registration   │              │    Event Registration    │
│                       │              │                          │
│ UH11-user-registration│              │eSports11-user-registration│
│     -details          │              │       -details           │
│                       │              │                          │
│ (Event-Specific Data) │              │  (Tournament Data)       │
└───────────────────────┘              └──────────────────────────┘
        ↓                                             ↓
    Updates                                       Updates
[users].registered.HACKS11                [users].registered.ESPORTS11
```

## Best Practices

1. **Never Delete User Accounts**: Preserve `users` collection across events
2. **Archive Event Data**: Keep event collections for historical reference
3. **Use Subcollections**: Organize related data (attendance under events)
4. **Consistent Naming**: Follow `{EVENT_CODE}-{collection-name}` convention
5. **Link Documents**: Always include `uid` to link event data back to users
6. **Timestamp Everything**: Include `submitted_time` or `added_time` for auditing
7. **Validate References**: Ensure event registration requires authenticated user
8. **Index Queries**: Add Firestore indexes for common query patterns
