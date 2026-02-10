# Registration Flows

## Overview

MyByte implements three distinct registration flows:
1. **MyByte Account Creation** - Initial system authentication
2. **UGAHacks 11 Event Registration** - Main hackathon registration
3. **eSports 11 Event Registration** - Tournament registration

Each flow serves a different purpose and writes to different Firebase collections.

## Flow 1: MyByte Account Creation

**File**: `/projects/mybyte/pages/signup.tsx`

**Purpose**: Create a persistent user account in the MyByte system

### User Journey

1. User visits `/signup` page
2. Chooses authentication method:
   - **Email/Password** registration
   - **Google Sign-In** (SSO)
3. System creates account and redirects appropriately

### Email/Password Registration

**Form Fields**:
```typescript
{
  email: string,
  first_name: string,
  last_name: string,
  password: string,
  password_confirm: string
}
```

**Process**:
```typescript
const signUp = async (first_name, last_name, email, password) => {
  // 1. Create Firebase Auth account
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;
  
  // 2. Create Firestore user document
  await setDoc(doc(userRef, user.uid), {
    uid: user.uid,
    first_name: first_name,
    last_name: last_name,
    name: first_name + " " + last_name,
    authProvider: "local",
    email: email,
    points: 0,
    registered: {},              // Empty - no events yet
    school: null,                // Set during event registration
    user_type: null,             // Assigned during event registration
    added_time: serverTimestamp()
  });
  
  // 3. Send verification email
  sendEmailVerification(user);
  
  // 4. Sign out (must verify email before logging in)
  signOut(auth);
};
```

**Data Written to Firebase**:

- **Firebase Authentication**: Email/password credentials
- **`users` Collection**: User document with basic information

**Next Steps**: 
- User receives verification email
- Must verify email before logging in
- Redirected to `/emailVerification` page

### Google Sign-In Registration

**Process**:
```typescript
const logInWithGoogle = async () => {
  // 1. Trigger Google OAuth popup
  const res = await signInWithPopup(auth, googleProvider);
  
  // 2. Check if user document exists
  const userDoc = await getDoc(doc(userRef, res.user.uid));
  
  // 3. If new user, create document
  if (!userDoc.exists()) {
    const [first_name, last_name] = getFirstAndLastNameFromGoogleName(
      res.user.displayName
    );
    
    await setDoc(doc(userRef, res.user.uid), {
      uid: res.user.uid,
      first_name: first_name,
      last_name: last_name,
      name: res.user.displayName,
      authProvider: "google.com",
      email: res.user.email,
      points: 0,
      registered: {},
      school: null,
      user_type: null,
      added_time: serverTimestamp()
    });
  }
};
```

**Data Written to Firebase**:

- **Firebase Authentication**: Google OAuth token
- **`users` Collection**: User document (only if first-time sign-in)

**Benefits**:
- No email verification required
- Instant access to dashboard
- Simpler registration process

### Account Creation Summary

**What Goes to Firebase**:
- ✅ Authentication credentials (Firebase Auth)
- ✅ Basic user information (`users` collection)
- ✅ Initial state (no events, no role, 0 points)

**What Does NOT Go to Firebase**:
- ❌ Event registration details
- ❌ Demographic information
- ❌ Event preferences
- ❌ User role assignment

## Flow 2: UGAHacks 11 Event Registration

**File**: `/projects/mybyte/pages/register.tsx`

**Purpose**: Collect comprehensive hackathon registration information

**Prerequisites**: 
- Must be authenticated (logged into MyByte account)
- Protected by `<ProtectedRoute>` component

### Registration Form

**Form Sections**:

1. **Personal Information**
   - First Name, Last Name, Age
   - Email, Phone Number
   - Country of Residence

2. **Demographics**
   - Gender
   - Race/Ethnicity

3. **Academic Information**
   - School (searchable dropdown from CSV)
   - Year/Level of Study
   - Major, Minor
   - Experiential Learning Credit Interest

4. **Event Information**
   - Previous Hackathon Participation
   - What Hoping to See
   - Dietary Restrictions
   - Shirt Size

5. **Agreements**
   - MLH Code of Conduct
   - Event Logistics Information
   - MLH Communication Opt-in

6. **Optional**
   - Resume Upload (PDF)

### Form Submission Process

```typescript
const storeUserRegistrationInformation = async (data: RegisterForm) => {
  // 1. Upload resume to Firebase Storage (if provided)
  let downloadURL: string | null = null;
  if (data.resume?.[0]) {
    const storageRef = ref(storage, "resume/" + user.uid + "/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    downloadURL = await uploadCompleteAndGetURL(uploadTask);
  }
  
  // 2. Create registration details document
  await setDoc(doc(registerRef, user.uid), {
    // All form fields...
    resumeLink: downloadURL,
    submitted_time: serverTimestamp(),
    
    // Initial status fields
    accepted: null,
    checkedIn: false,
    checkedOut: false,
  });
  
  // 3. Update user document with registration status
  await updateDoc(doc(userRef, user.uid), {
    "registered.HACKS11": true,
    school: data.school.value,
    user_type: Users.hacker,    // Assign HACKER role
    points: 0,
  });
  
  // 4. Set user information in context
  await setUserInformation(user.uid);
};
```

### Email Confirmation

```typescript
const triggerRegistrationEmail = async () => {
  // 1. Fetch email template from Firestore
  const uh11RegistrationDoc = await getDoc(doc(emailTemplates, "uh11"));
  const emailHTML = uh11RegistrationDoc.data().html;
  
  // 2. Create mail document (triggers Firebase email extension)
  await setDoc(doc(registerMail, user.uid), {
    to: user.email,
    message: {
      subject: "Thank you for registering for UGAHacks 11",
      text: "",
      html: emailHTML,
    },
  });
};
```

### Data Written to Firebase

**1. Firebase Storage** (if resume uploaded):
- Path: `/resume/{userId}/{filename}`
- File: User's resume PDF
- Access: Download URL stored in registration doc

**2. `UH11-user-registration-details` Collection**:
```typescript
{
  uid: user.uid,
  // Personal
  firstName, lastName, age, email, phoneNumber,
  countryResidence,
  
  // Demographics
  gender, race,
  
  // Academic
  school, inputSchool, year, levelOfStudy,
  major, inputMajor, minor, elCreditInterest,
  
  // Event
  participated, hopeToSee,
  dietaryRestrictions, inputDietaryRestrictions,
  shirtSize,
  
  // Agreements
  codeOfConduct, eventLogisticsInfo, mlhCommunication,
  
  // Status
  accepted: null,
  checkedIn: false,
  checkedOut: false,
  
  // Files
  resumeLink: downloadURL,
  
  // Metadata
  submitted_time: serverTimestamp()
}
```

**3. `users` Collection** (update):
```typescript
{
  "registered.HACKS11": true,
  school: data.school.value,
  user_type: "HACKER",
  points: 0
}
```

**4. `UH11-registrationMail` Collection**:
```typescript
{
  to: user.email,
  message: {
    subject: "Thank you for registering for UGAHacks 11",
    html: emailHTML
  }
}
```

### Success Flow

1. Registration form submitted
2. Data written to Firebase
3. Email queued
4. User redirected to `/registrationSuccess`
5. Success page displays confirmation

## Flow 3: eSports 11 Event Registration

**File**: `/projects/mybyte/pages/esports.tsx`

**Purpose**: Register for eSports tournament at UGAHacks 11

**Prerequisites**:
- Must be authenticated
- **Must be registered for UGAHacks 11** (enforced in UI)
- Protected by `<ProtectedRoute>` component

### Registration Form

**Form Fields**:
```typescript
{
  firstName: string,
  lastName: string,
  gamerTag: string,              // Gaming handle
  phoneNumber: string,
  selectedGameOne: string,       // Primary game selection
  selectedGameTwo: string,       // Secondary game selection
  skillLevelDescription: string, // Textarea (max 400 chars)
  setUpDescription: string,      // Textarea (max 400 chars)
  keyBindingsDescription: string,// Textarea (max 400 chars)
  tardyAgreement: boolean        // Late arrival acknowledgment
}
```

**Available Games** (from enum):
- Super Smash Bros. Ultimate
- Mario Kart 8

### Form Submission Process

```typescript
const storeESportsRegistrationInformation = async (data: eSportsForm) => {
  // 1. Validate user is authenticated
  if (!user?.uid) {
    throw new Error("User not authenticated");
  }
  
  // 2. Create eSports registration document
  await setDoc(doc(eSportsRef, user.uid), {
    firstName: data.firstName,
    lastName: data.lastName,
    gamerTag: data.gamerTag,
    phoneNumber: data.phoneNumber,
    selectedGameOne: data.selectedGameOne,
    selectedGameTwo: data.selectedGameTwo,
    skillLevelDescription: data.skillLevelDescription,
    setUpDescription: data.setUpDescription,
    keyBindingsDescription: data.keyBindingsDescription,
    tardy_agreement: data.tardyAgreement,
    submitted_time: serverTimestamp(),
  });
  
  // 3. Update user document
  await updateDoc(doc(userRef, user.uid), {
    "registered.ESPORTS11": true,
  });
  
  // 4. Refresh user information in context
  setUserInformation(user.uid);
};
```

### Email Confirmation

```typescript
const triggerESportsRegistrationEmail = async (data: eSportsForm) => {
  // 1. Fetch template
  const templateDoc = await getDoc(doc(emailTemplates, "esports11Registration"));
  const emailHTML = templateDoc.data().html;
  
  // 2. Queue email
  await addDoc(registerMail, {
    to: user.email,
    message: {
      subject: "Thank you for registering for eSports 11",
      html: emailHTML,
    },
    createdAt: serverTimestamp(),
    uid: user.uid,
    type: "esports11",
  });
};
```

### Data Written to Firebase

**1. `eSports11-user-registration-details` Collection**:
```typescript
{
  firstName, lastName,
  gamerTag,
  phoneNumber,
  selectedGameOne, selectedGameTwo,
  skillLevelDescription,
  setUpDescription,
  keyBindingsDescription,
  tardy_agreement,
  submitted_time: serverTimestamp()
}
```

**2. `users` Collection** (update):
```typescript
{
  "registered.ESPORTS11": true
}
```

**3. `UH11-registrationMail` Collection**:
```typescript
{
  to: user.email,
  message: {
    subject: "Thank you for registering for eSports 11",
    html: emailHTML
  },
  createdAt: serverTimestamp(),
  uid: user.uid,
  type: "esports11"
}
```

### Success Flow

1. eSports form submitted
2. Data written to Firebase
3. Email queued
4. User redirected to `/eSportsRegistrationSuccess`
5. Success page displays confirmation

## Registration Dependencies

```
┌─────────────────────────────┐
│  1. Create MyByte Account   │
│     (signup.tsx)            │
│  ✓ Email/Password OR Google │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  2. Register for UGAHacks11 │
│     (register.tsx)          │
│  ✓ Comprehensive form       │
│  ✓ Resume upload            │
│  ✓ Role assigned: HACKER    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  3. Register for eSports11  │
│     (esports.tsx)           │
│  ✓ Tournament details       │
│  ✓ Game selection           │
│  ✓ Optional participation   │
└─────────────────────────────┘
```

**Key Points**:
1. **Account must exist** before any event registration
2. **UGAHacks 11 registration required** before eSports registration
3. **eSports is optional** - can participate in hackathon without tournament

## Data Comparison

### Account Creation vs Event Registration

| Aspect | Account Creation | Event Registration |
|--------|------------------|-------------------|
| **Collection** | `users` | `UH11-user-registration-details` |
| **Scope** | System-wide | Event-specific |
| **Persistence** | Permanent | Event-scoped |
| **Data Volume** | Minimal | Comprehensive |
| **Purpose** | Authentication | Event logistics |

### What Each Registration Adds

**Account Creation** (`users`):
```typescript
{
  uid, first_name, last_name, name, email,
  authProvider, points: 0,
  registered: {},
  school: null,
  user_type: null,
  added_time
}
```

**UGAHacks 11 Registration** (adds to `UH11-user-registration-details` + updates `users`):
```typescript
// New document in UH11-user-registration-details
{
  all form fields...
}

// Updates to users document
{
  "registered.HACKS11": true,
  school: "University of Georgia",
  user_type: "HACKER",
  points: 0
}
```

**eSports 11 Registration** (adds to `eSports11-user-registration-details` + updates `users`):
```typescript
// New document in eSports11-user-registration-details
{
  tournament form fields...
}

// Updates to users document
{
  "registered.ESPORTS11": true
}
```

## Email Notifications

All registrations trigger email confirmations:

1. **Account Verification** (email/password only)
   - Firebase built-in email
   - Must verify before logging in

2. **UGAHacks 11 Confirmation**
   - Custom HTML template from `email-templates/uh11`
   - Sent via Firebase email extension
   - Document created in `UH11-registrationMail`

3. **eSports 11 Confirmation**
   - Custom HTML template from `email-templates/esports11Registration`
   - Sent via Firebase email extension
   - Document created in `UH11-registrationMail`

## Form Validation

### Built-in Validation

- **Email**: Valid email format required
- **Phone**: International phone number validation via `react-phone-number-input`
- **Required Fields**: Marked with red asterisk
- **Pattern Matching**: Names validated for valid characters
- **Character Limits**: Text areas have max length constraints

### Custom Validation

- **School Selection**: CSV-based list with "Other" option
- **Major Selection**: Predefined list with "Other" option
- **Checkbox Validation**: Required agreements must be checked
- **eSports Prerequisite**: Must be registered for UGAHacks 11

## Error Handling

### Registration Errors

```typescript
try {
  await storeUserRegistrationInformation(data);
  await triggerRegistrationEmail();
  router.push("/registrationSuccess");
} catch (error) {
  console.error("Registration failed:", error);
  // Button re-enables automatically
}
```

### Common Issues

| Error | Cause | Resolution |
|-------|-------|------------|
| Email already in use | Duplicate account | Redirect to login |
| Weak password | Less than 6 characters | Form validation error |
| File upload failure | Storage error | Show error, allow retry |
| Network error | Firebase unavailable | Show error, allow retry |

## Best Practices

1. **Progressive Registration**: Start simple (account), then detailed (event)
2. **Clear Prerequisites**: Show requirements before forms (e.g., UGAHacks 11 before eSports)
3. **Save Progress**: Consider implementing draft saves for long forms
4. **Validation Feedback**: Provide immediate feedback on form errors
5. **Confirmation Emails**: Always send confirmation after successful registration
6. **Resume Uploads**: Validate file type and size before upload
7. **Data Consistency**: Always update both event collection and users collection
8. **Error Recovery**: Provide clear error messages and recovery paths
