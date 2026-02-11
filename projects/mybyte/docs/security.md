# Security Posture

## Overview

MyByte implements multiple layers of security to protect user data, ensure proper authentication, and enforce authorization controls. This document outlines the security mechanisms, best practices, and considerations for the system.

## Authentication Mechanisms

### 1. Firebase Authentication

MyByte leverages Firebase Authentication for identity management.

**Supported Methods**:

1. **Email/Password Authentication**
   - Traditional credentials stored securely by Firebase
   - Passwords never stored in application code
   - Minimum 6-character password requirement
   - Email verification required before first login

2. **Google OAuth (SSO)**
   - Delegates authentication to Google
   - No passwords stored in system
   - Leverages Google's security infrastructure
   - Automatic email verification (via Google)

### Authentication Flow Security

**Email/Password Registration**:
```typescript
// Password never stored in Firestore or application code
const res = await createUserWithEmailAndPassword(auth, email, password);

// User forced to verify email before login
sendEmailVerification(user);
signOut(auth); // Immediately signed out until verified

// Login checks for verification
if (!user.emailVerified) {
  signOut(auth);
  return false;
}
```

**Security Features**:
- ✅ Passwords hashed by Firebase (bcrypt/scrypt)
- ✅ Email verification prevents fake accounts
- ✅ Password reset via secure email links
- ✅ Automatic session management
- ✅ Token-based authentication

### 2. Session Management

**Token Lifecycle**:
- Firebase issues JWT tokens upon successful authentication
- Tokens automatically refreshed by Firebase SDK
- Tokens expire after inactivity
- Sessions persist across page refreshes (via cookies)

**Security Controls**:
- Secure, HttpOnly cookies used for session storage
- Tokens validated on every request
- Automatic logout on token expiration
- No manual token management required

### 3. Account Takeover Protection

**Email Verification**:
- Prevents creation of accounts with unauthorized emails
- Confirms user controls the email address

**Password Reset Security**:
- Reset links sent only to registered email
- Links expire after 1 hour
- Single-use tokens
- Cannot reuse old passwords (Firebase default)

## Authorization & Access Control

### Role-Based Access Control (RBAC)

MyByte implements a role-based system with six distinct roles:

```typescript
enum Users {
    hacker = "HACKER",      // Default event participant
    mentor = "MENTOR",      // Event mentor
    judge = "JUDGE",        // Project judge
    volunteer = "VOLUNTEER",// Event volunteer
    admin = "ADMIN",        // Full system access
    organizer = "ORGANIZER" // Event management access
}
```

### Permission Levels

| Role | Dashboard | QR Scanner | User Data | Event Mgmt |
|------|-----------|------------|-----------|------------|
| HACKER | ✅ | ❌ | Own only | ❌ |
| MENTOR | ✅ | ❌ | Own only | ❌ |
| JUDGE | ✅ | ❌ | Own only | ❌ |
| VOLUNTEER | ✅ | ❌ | Own only | ❌ |
| ORGANIZER | ✅ | ✅ | View during scan | Limited |
| ADMIN | ✅ | ✅ | Full access | Full |

### Route Protection

**Client-Side Guards**:

1. **ProtectedRoute Component**
   ```typescript
   // Ensures user is authenticated
   if (user.uid == null) {
     router.push("/login");
   }
   ```

2. **OrganizerRoute Component**
   ```typescript
   // Ensures user is organizer or admin
   if (user_type !== Users.organizer && user_type !== Users.admin) {
     router.push("/dashboard");
   }
   ```

**Protected Pages**:
- `/dashboard` - ProtectedRoute (any authenticated user)
- `/register` - ProtectedRoute (any authenticated user)
- `/esports` - ProtectedRoute (any authenticated user)
- `/qrRead` - OrganizerRoute (organizers and admins only)

### Data Access Controls

**User Context**:
```typescript
// Users can only access their own data
const { user, userInfo } = useAuth();

// Operations scoped to authenticated user
await setDoc(doc(registerRef, user.uid), {...}); // Can only write to own UID
```

**Organizer Scanning**:
```typescript
// During QR scanning, organizers can read:
const name = await getNameOfUser(scannedUID);      // Name only
const shirtSize = await getTShirtSizeOfUser(uid);  // T-shirt size only
const points = await getPoints(uid);                // Points only

// No access to sensitive data (email, phone, demographics)
```

## Firebase Security Rules

### Importance

**Client-side protection is not sufficient!** 

While the application implements route guards and permission checks, these can be bypassed by malicious users. Firebase Security Rules provide server-side enforcement.

### Recommended Security Rules

**Firestore Security Rules** (example structure):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Registration details - users can only access their own
    match /UH11-user-registration-details/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // eSports registration - same pattern
    match /eSports11-user-registration-details/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events - organizers and admins can read, only admins can write
    match /UH11-events/{eventId} {
      allow read: if request.auth != null && 
                     (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ORGANIZER' ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ADMIN');
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ADMIN';
      
      // Attendance subcollection - organizers can write
      match /attendance/{userId} {
        allow read: if request.auth != null && 
                       (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ORGANIZER' ||
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ADMIN');
        allow write: if request.auth != null && 
                        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ORGANIZER' ||
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ADMIN');
      }
    }
    
    // Teams - members can read their team, authenticated users can create
    match /team/{teamId} {
      allow read: if request.auth != null && 
                     request.auth.email in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.email in resource.data.members;
    }
    
    // Email templates - only admins can access
    match /email-templates/{templateId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ADMIN';
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'ADMIN';
    }
    
    // Registration mail queue - system can write, users can't access
    match /UH11-registrationMail/{mailId} {
      allow read: if false;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage Security Rules** (for resume uploads):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Resume uploads - users can only upload to their own folder
    match /resume/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024 && // 10MB limit
                      request.resource.contentType == 'application/pdf';
    }
  }
}
```

### Rule Testing

Test security rules using Firebase Emulator Suite:
```bash
firebase emulators:start --only firestore,storage
```

## Data Protection

### Personal Information

**Sensitive Data Collected**:
- Email addresses
- Phone numbers
- Full names
- Demographic information (gender, race)
- Academic information (school, major)
- Dietary restrictions
- Resume files

**Protection Measures**:

1. **Access Control**
   - Users can only access their own data
   - Admins have full access (for event management)
   - Organizers have limited read access (during scanning)

2. **Data Minimization**
   - Only collect necessary information
   - Separate authentication from detailed registration
   - Event-specific data isolated in separate collections

3. **Purpose Limitation**
   - Data used only for stated purposes (event management)
   - Not shared with third parties (except MLH if user opts in)

### Data Storage

**Encryption**:
- ✅ Data encrypted at rest (Firebase default)
- ✅ Data encrypted in transit (HTTPS/TLS)
- ✅ No plaintext credentials stored
- ✅ Resume files stored securely in Firebase Storage

**Backup & Recovery**:
- Firebase automatic backups
- Point-in-time recovery available
- Historical data preserved (past events)

### Data Retention

**User Accounts** (`users` collection):
- Retained indefinitely for multi-event participation
- Users can request deletion (requires manual process)

**Event Registration Data**:
- Retained for duration of event + archival period
- Historical events maintained for reference
- Can be purged after sufficient time

**Attendance Records**:
- Retained for point calculation and auditing
- Part of event historical data

## Input Validation & Sanitization

### Form Validation

**Client-Side Checks**:
```typescript
// Email validation
register("email", { required: "Email is required" })

// Phone number validation
isValidPhoneNumber(phoneNumber)

// Name pattern matching
pattern: {
  value: /^[a-z ,.'-]+$/i,
  message: "Contains invalid characters"
}

// Character limits
maxLength: 50

// Required agreements
required: "You must agree to continue"
```

**Server-Side Validation**:
- Firebase validates data types
- Security rules enforce structure
- File uploads validated for type and size

### QR Code Validation

**Protection Against Malicious QR Codes**:

```typescript
// Reject empty UIDs
if (!uid) throw "No QR Code has been scanned!";

// Reject URLs or formatted strings
if (uid.includes("/")) throw "Not valid User QR-Code";

// Verify user exists before processing
const name = await getNameOfUser(uid);
if (!name) throw "User not found!";
```

**Prevents**:
- URL injection
- Path traversal attempts
- Processing non-user QR codes
- Unauthorized user access

### File Upload Security

**Resume Upload Protection**:

1. **File Type Restriction**
   - Only PDF files accepted
   - Validated in storage rules: `contentType == 'application/pdf'`

2. **File Size Limits**
   - Recommended: < 10MB
   - Enforced in storage rules: `size < 10 * 1024 * 1024`

3. **Path Isolation**
   - Files stored in user-specific paths: `/resume/{userId}/`
   - Prevents overwriting other users' files

4. **Access Control**
   - Users can only access their own uploads
   - Download URLs are authenticated

## HTTPS/TLS

**Encryption in Transit**:
- ✅ All Firebase connections use HTTPS/TLS
- ✅ OAuth flows secured by Google
- ✅ No plaintext transmission of credentials
- ✅ Secure cookie transmission

**Deployment Requirements**:
- Must deploy to HTTPS-enabled hosting
- Firebase Hosting provides automatic HTTPS
- Custom domains require valid SSL certificates

## Third-Party Integrations

### Firebase Services

**Security Considerations**:
- ✅ Trusted, enterprise-grade infrastructure
- ✅ Automatic security updates
- ✅ DDoS protection
- ✅ Compliance certifications (SOC 2, ISO 27001)

**API Keys**:
- Firebase client API keys are safe to expose publicly
- Access controlled by Firebase Security Rules
- No sensitive operations possible with client API key alone

### Major League Hacking (MLH)

**Data Sharing** (if user opts in):
- User agrees to MLH Code of Conduct
- Can opt into MLH communication
- MyByte doesn't automatically share data with MLH
- Users responsible for any MLH data sharing they initiate

### Google OAuth

**Security**:
- ✅ Industry-standard OAuth 2.0 flow
- ✅ No passwords stored by MyByte
- ✅ Tokens managed by Firebase
- ✅ Scopes limited to basic profile info

## Security Best Practices

### For Developers

1. **Never Commit Secrets**
   - Use environment variables for sensitive config
   - Keep `firebase-config.js` values safe (though client keys are okay)
   - Never commit service account keys

2. **Validate All Input**
   - Client-side validation for UX
   - Server-side validation (security rules) for security
   - Never trust client data

3. **Implement Principle of Least Privilege**
   - Users get minimum necessary permissions
   - Role elevation only when needed
   - Regular role audits

4. **Keep Dependencies Updated**
   - Regular `npm audit` and `yarn audit`
   - Update Firebase SDK regularly
   - Monitor for security advisories

5. **Use Transactions**
   - For critical operations (attendance recording)
   - Prevents race conditions
   - Ensures data consistency

### For Administrators

1. **Role Management**
   - Audit ORGANIZER/ADMIN roles regularly
   - Remove elevated privileges after events
   - Document all elevated users

2. **Security Rules Review**
   - Test rules with Firebase Emulator
   - Review rules before deploying
   - Monitor Firebase Console for security alerts

3. **Access Logging**
   - Enable Cloud Logging for production
   - Monitor for suspicious activity
   - Review access patterns

4. **Backup Procedures**
   - Regular exports of critical data
   - Test restoration procedures
   - Document backup locations

5. **Incident Response**
   - Have plan for security incidents
   - Know how to revoke access quickly
   - Document escalation procedures

### For Organizers

1. **QR Scanner Device Security**
   - Use trusted devices for scanning
   - Don't leave scanner unattended
   - Log out when done scanning

2. **Physical Security**
   - Protect devices with scanner access
   - Don't share organizer credentials
   - Report lost/stolen devices immediately

3. **Data Handling**
   - Don't screenshot or photograph user data
   - Don't share participant information
   - Follow event privacy policies

## Compliance Considerations

### GDPR (if applicable)

**User Rights**:
- Right to access (users can view their data)
- Right to rectification (users can update registration)
- Right to erasure (manual deletion process required)
- Right to data portability (export functionality needed)

**Implementation**:
- Clear privacy policy required
- User consent for data collection
- Data retention policies
- Ability to delete user data

### FERPA (for educational institutions)

- Academic information (school, major) may be protected
- Minimize sharing of educational records
- Obtain consent for data use

### Event-Specific Requirements

- MLH Code of Conduct compliance
- University policies (if applicable)
- Sponsor data sharing restrictions

## Threat Model

### Identified Threats

1. **Unauthorized Access**
   - **Mitigation**: Authentication required, role-based access control

2. **Account Takeover**
   - **Mitigation**: Email verification, secure password reset, OAuth

3. **Data Breach**
   - **Mitigation**: Firebase security rules, encryption, access logging

4. **Privilege Escalation**
   - **Mitigation**: Role validation on every request, security rules

5. **QR Code Injection**
   - **Mitigation**: Input validation, UID format checking

6. **Session Hijacking**
   - **Mitigation**: Secure cookies, HTTPS, automatic token expiration

7. **Malicious File Upload**
   - **Mitigation**: File type/size validation, path isolation

### Risk Assessment

| Threat | Likelihood | Impact | Risk Level | Mitigation Status |
|--------|-----------|--------|------------|-------------------|
| Unauthorized Data Access | Medium | High | High | ✅ Mitigated |
| Account Takeover | Low | High | Medium | ✅ Mitigated |
| Privilege Escalation | Low | High | Medium | ✅ Mitigated |
| QR Code Abuse | Medium | Low | Low | ✅ Mitigated |
| DDoS Attack | Low | Medium | Low | ✅ Firebase Protected |

## Security Checklist

**Before Deployment**:
- [ ] Firebase Security Rules deployed and tested
- [ ] Storage Security Rules configured
- [ ] HTTPS/TLS enabled
- [ ] Environment variables configured
- [ ] Admin/Organizer roles assigned appropriately
- [ ] Email templates configured
- [ ] Backup procedures documented
- [ ] Incident response plan in place

**Regular Maintenance**:
- [ ] Review user roles monthly
- [ ] Audit access logs
- [ ] Update dependencies
- [ ] Test backup restoration
- [ ] Review security rules
- [ ] Monitor Firebase billing (unusual activity)

## Reporting Security Issues

**If you discover a security vulnerability**:

1. **DO NOT** open a public GitHub issue
2. Email: tech@ugahacks.com with subject "SECURITY"
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response Timeline**:
- Acknowledgment within 48 hours
- Assessment within 1 week
- Fix deployment ASAP for critical issues

## Conclusion

MyByte implements defense-in-depth security with multiple layers:
1. Authentication via Firebase
2. Client-side route protection
3. Server-side security rules
4. Input validation
5. Secure data storage
6. Encryption in transit and at rest

Regular security reviews, dependency updates, and adherence to best practices maintain the security posture of the system.
