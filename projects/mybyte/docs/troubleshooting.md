# Troubleshooting Guide

## Overview

This guide covers common issues with the MyByte system and their solutions. Issues are organized by category for easy reference.

## QR Code Scanning Issues

### Issue: QR Scanner Not Working

**Symptoms**:
- Camera doesn't activate
- Black screen in scanner
- "Permission denied" error

**Causes & Solutions**:

1. **Camera Permissions Not Granted**
   - **Solution**: Grant camera permissions in browser settings
   - Chrome: Settings → Privacy and Security → Site Settings → Camera
   - Safari: Preferences → Websites → Camera
   - **iOS Safari**: Requires HTTPS connection (HTTP won't work)

2. **Wrong Browser**
   - **Solution**: Use a modern browser that supports camera access
   - ✅ Chrome, Firefox, Safari, Edge (recent versions)
   - ❌ Older browsers, some in-app browsers

3. **Device Doesn't Have Camera**
   - **Solution**: Use a device with a camera or rear-facing camera

### Issue: QR Code Not Being Recognized

**Symptoms**:
- Scanner active but nothing happens when QR code shown
- Multiple attempts needed to scan

**Causes & Solutions**:

1. **QR Code Too Far/Too Close**
   - **Solution**: Position QR code 6-12 inches from camera
   - Ensure code is within the scanner frame overlay

2. **Poor Lighting**
   - **Solution**: Improve lighting conditions
   - Avoid glare on screen if scanning from another device
   - Ensure QR code is well-lit

3. **Damaged or Low-Quality QR Code**
   - **Solution**: 
   - Request fresh QR code from dashboard
   - Increase screen brightness if scanning from device
   - Ensure QR code is not pixelated or corrupted

4. **Wrong QR Code Format**
   - **System Expects**: Plain UID string (e.g., "abc123xyz789")
   - **System Rejects**: URLs (anything with "/") or other formatted data
   - **Solution**: Use QR code generated from MyByte dashboard only

### Issue: "Already attended" Warning

**Symptoms**:
- Amber screen flash
- Warning sound plays
- Message: "Already attended"

**Cause**: User has already checked into this event

**Solutions**:

1. **For Regular Events**: This is expected behavior - users can only attend once
2. **For Point Store Events**: System should allow multiple scans
   - **If It Doesn't**: Check that event title contains "[Point Store]" (case-insensitive)
   - Fix in Firebase: Edit event title to include marker

### Issue: "Not enough points" Error

**Symptoms**:
- Red screen flash
- Error sound plays
- Attendance not recorded

**Cause**: User attempting negative-point event with insufficient balance

**Solutions**:

1. **Check User's Points**: View in scanner preview panel
2. **Verify Event Points**: Check selected event's point value
3. **User Needs to Earn More**: Direct user to point-earning events
4. **Override (Admin)**: 
   - Manually adjust user's points in Firebase Console
   - Path: `users/{uid}/points`

### Issue: Duplicate/Rapid Scans

**Symptoms**:
- Multiple scans registered quickly
- Point inflation

**Built-in Protection**: 3-second debounce prevents this

**If It Occurs**:
1. Check scanner implementation hasn't been modified
2. Verify `DEBOUNCE_MS` constant is set to 3000
3. Check `lastScanRef` is functioning properly

**Manual Fix**:
- Remove duplicate attendance records in Firebase
- Path: `UH11-events/{eventId}/attendance/{uid}`
- Adjust user points if necessary

### Issue: No Sound Feedback

**Symptoms**:
- Scans work but no audio plays
- Silent operation

**Causes & Solutions**:

1. **Device Muted**
   - **Solution**: Unmute device or increase volume

2. **Browser Autoplay Restrictions**
   - **Solution**: System auto-unlocks audio on first scan
   - If still silent: Click anywhere on page to activate audio context

3. **Sound Files Missing**
   - **Solution**: Verify files exist in `/public/sounds/`:
     - `success.mp3`
     - `warning.mp3`
     - `error.mp3`

### Issue: Scanner Performance Slow

**Symptoms**:
- Long delay between scan and feedback
- "Processing..." state hangs

**Causes & Solutions**:

1. **Slow Network Connection**
   - **Solution**: 
   - Check internet connection
   - Wait for Firebase queries to complete
   - Consider caching event data

2. **Firebase Latency**
   - **Solution**:
   - Verify Firebase is accessible
   - Check Firestore region configuration
   - Monitor Firebase console for issues

3. **Points Calculation Heavy**
   - **Cause**: `getPoints()` queries all events
   - **Solution**: 
   - Optimize points calculation
   - Implement caching
   - Pre-calculate points with Cloud Functions

## Registration Issues

### Issue: Can't Create Account

**Symptoms**:
- "Email already in use" error
- Account creation fails

**Solutions**:

1. **Email Already Registered**
   - **Solution**: Use password reset or log in instead
   - Path: `/login` → "Forgot password"

2. **Weak Password**
   - **Requirement**: Minimum 6 characters
   - **Solution**: Use stronger password

3. **Invalid Email Format**
   - **Solution**: Check email for typos
   - Ensure proper format: `name@domain.com`

### Issue: Email Verification Not Received

**Symptoms**:
- Created account but no verification email
- Can't log in (email not verified)

**Solutions**:

1. **Check Spam/Junk Folder**
   - Look for email from Firebase/MyByte

2. **Wrong Email Address**
   - Verify email address used during signup
   - Create new account with correct email if needed

3. **Email Delivery Delay**
   - Wait 5-10 minutes
   - Check email provider's delivery status

4. **Resend Verification**
   - Currently not implemented in UI
   - **Workaround**: Create new account or contact admin

### Issue: Google Sign-In Fails

**Symptoms**:
- OAuth popup doesn't appear
- "Popup blocked" message
- Sign-in fails after Google authentication

**Solutions**:

1. **Popup Blocker**
   - **Solution**: Allow popups for the site
   - Browser settings → Popups → Add site to allowed list

2. **Third-Party Cookies Disabled**
   - **Solution**: Enable third-party cookies for Firebase/Google
   - Required for OAuth flow

3. **Wrong Google Account**
   - **Solution**: Sign out of Google and try again with correct account

### Issue: Can't Register for Event

**Symptoms**:
- Registration form won't submit
- Validation errors
- "Please fill out this field" messages

**Solutions**:

1. **Required Fields Missing**
   - **Solution**: Fill all fields marked with red asterisk (*)
   - Scroll through form to find empty required fields

2. **Invalid Phone Number**
   - **Solution**: Enter complete phone number with country code
   - Use international format

3. **Checkbox Agreements Not Checked**
   - **Solution**: Must check:
     - MLH Code of Conduct
     - Event Logistics Information

4. **Resume Upload Failed**
   - **Solutions**:
   - Check file is PDF format
   - Ensure file size is reasonable (< 10MB recommended)
   - Try uploading again
   - Skip resume upload and submit without (if optional)

### Issue: Registration Confirmation Email Not Received

**Symptoms**:
- Successfully registered but no confirmation email

**Solutions**:

1. **Check Spam/Junk Folder**

2. **Email Still Processing**
   - Firebase extension may have delay
   - Wait 5-10 minutes

3. **Email Extension Not Configured**
   - **Admin Check**: Verify Firebase Email Extension installed
   - Check extension logs in Firebase Console

4. **Template Missing**
   - **Admin Check**: Verify template exists in `email-templates` collection
   - Document IDs: `uh11`, `esports11Registration`

### Issue: Can't Register for eSports

**Symptoms**:
- eSports registration form not accessible
- Dashboard shows eSports grayed out
- Alert: "Please register for UGAHacks 11 first"

**Cause**: Must register for main event before tournament

**Solution**:
1. Complete UGAHacks 11 registration first
2. Then access eSports registration

### Issue: Resume Upload Fails

**Symptoms**:
- File selected but upload doesn't complete
- Registration hangs on submission
- Error during form submission

**Solutions**:

1. **File Too Large**
   - **Solution**: Compress PDF or use smaller file
   - Recommended: < 10MB

2. **Wrong File Type**
   - **Solution**: Convert to PDF if needed
   - Only PDFs accepted

3. **Storage Permissions**
   - **Admin Check**: Verify Firebase Storage rules allow uploads
   - Path: `/resume/{userId}/`

4. **Network Issues**
   - **Solution**: 
   - Check internet connection
   - Try uploading again
   - Use faster/more stable connection

## Authentication Issues

### Issue: Can't Log In

**Symptoms**:
- Correct email/password but login fails
- "Email not verified" error
- Credentials rejected

**Solutions**:

1. **Email Not Verified** (email/password accounts only)
   - **Solution**: Check email for verification link
   - Click link to verify
   - Then log in

2. **Wrong Password**
   - **Solution**: Use password reset
   - Path: `/login` → "Forgot password"

3. **Account Doesn't Exist**
   - **Solution**: Create account at `/signup`

4. **Google Account Issues**
   - **Solution**: Try signing in with email/password instead
   - Or use different Google account

### Issue: Logged Out Unexpectedly

**Symptoms**:
- Redirected to login page
- Session doesn't persist
- Have to log in repeatedly

**Causes & Solutions**:

1. **Cookies Disabled**
   - **Solution**: Enable cookies in browser settings
   - Firebase Auth requires cookies

2. **Private/Incognito Mode**
   - **Solution**: Use regular browsing mode
   - Private mode clears session on close

3. **Shared Computer Auto-Logout**
   - **Expected**: Security feature
   - **Solution**: Log in again when needed

### Issue: Password Reset Not Working

**Symptoms**:
- Reset email not received
- Reset link doesn't work
- "User not found" error

**Solutions**:

1. **Email Not in System**
   - **Verify**: Check email address spelling
   - Try with correct email

2. **Reset Email in Spam**
   - **Solution**: Check spam/junk folder

3. **Reset Link Expired**
   - **Solution**: Request new password reset
   - Links expire after 1 hour

## Points Calculation Issues

### Issue: Points Don't Match Expected Value

**Symptoms**:
- User reports incorrect point total
- Points higher/lower than expected

**Diagnostic Steps**:

1. **Verify Event Points**
   - Check `UH11-events` collection
   - Confirm point values for each event

2. **Check Attendance Records**
   - Path: `UH11-events/{eventId}/attendance/{uid}`
   - Verify `times` multiplier (especially for Point Store)

3. **Manual Calculation**
   - Sum: (event1.points × times1) + (event2.points × times2) + ...
   - Compare with displayed total

**Common Causes**:

1. **Point Store Multiple Redemptions**
   - **Expected**: Points multiply by `times` value
   - Example: -50 points × 3 times = -150 points

2. **Retroactive Event Point Changes**
   - **Expected**: Dynamic calculation reflects current values
   - If event points changed, all users affected

3. **Deleted Events**
   - Points from deleted events not counted
   - Attendance records remain but aren't calculated

**Solution**:
- If legitimate error, manually adjust in Firebase Console
- Path: `users/{uid}/points` (though not authoritative)
- Better: Adjust attendance records or event points

### Issue: Points Not Updating After Scan

**Symptoms**:
- QR scan successful
- Dashboard still shows old point total

**Solutions**:

1. **Refresh Dashboard**
   - **Solution**: Reload page
   - Points calculated on page load

2. **Caching Issue**
   - **Solution**: 
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear browser cache

3. **Attendance Not Recorded**
   - **Check**: `UH11-events/{eventId}/attendance/{uid}`
   - If missing, scan again

## Data Integrity Issues

### Issue: User Data Inconsistent

**Symptoms**:
- `users` collection doesn't match event collection
- Registration status out of sync

**Diagnostic**:

1. **Check `users.registered` Flags**
   ```
   users/{uid}/registered.HACKS11
   users/{uid}/registered.ESPORTS11
   ```

2. **Check Event Collections**
   ```
   UH11-user-registration-details/{uid}
   eSports11-user-registration-details/{uid}
   ```

3. **Verify Consistency**
   - If `registered.HACKS11 = true`, registration doc should exist
   - If registration doc exists, flag should be true

**Solutions**:

1. **Missing Registration Flag**
   - Manually set in Firebase Console
   - Example: `registered.HACKS11 = true`

2. **Missing Registration Document**
   - User needs to register again
   - Or manually create document from backup

### Issue: Team Data Corrupted

**Symptoms**:
- Can't view team
- Team members missing
- Duplicate teams

**Solutions**:

1. **Check `users.tid`**
   - Verify points to valid document in `team` collection

2. **Check `team` Document**
   - Verify members array is valid
   - Check all member emails exist

3. **Repair**
   - Update `team/{tid}/members` array
   - Update `users/{uid}/tid` references

## Performance Issues

### Issue: Slow Page Loads

**Symptoms**:
- Dashboard takes long to load
- Registration forms lag

**Causes & Solutions**:

1. **Large Data Queries**
   - **Solution**: Implement pagination
   - Cache event lists
   - Optimize Firestore queries

2. **Unindexed Queries**
   - **Solution**: Add composite indexes in Firestore
   - Check Firebase Console for index suggestions

3. **Heavy Points Calculation**
   - **Solution**: 
   - Implement Cloud Functions to pre-calculate
   - Cache points in `users` collection
   - Update via Firestore triggers

### Issue: High Firebase Costs

**Symptoms**:
- Unexpected Firebase billing
- High read/write counts

**Causes**:

1. **Frequent Points Recalculation**
   - Each `getPoints()` call queries all events
   - Multiplied by user count = many reads

2. **Inefficient Queries**
   - Unindexed queries are expensive
   - Multiple queries where one would suffice

**Solutions**:

1. **Implement Caching**
   - Cache points in `users.points`
   - Update via Firestore triggers on attendance changes

2. **Batch Operations**
   - Group related operations
   - Use transactions where appropriate

3. **Optimize Queries**
   - Add proper indexes
   - Limit query results
   - Use pagination

## Admin/Organizer Tools

### Issue: Can't Access QR Scanner

**Symptoms**:
- `/qrRead` page redirects to dashboard
- "Unauthorized" or similar message

**Cause**: User doesn't have ORGANIZER or ADMIN role

**Solution**:
1. Admin must elevate user role in Firebase Console
2. Path: `users/{uid}/user_type`
3. Set to: `"ORGANIZER"` or `"ADMIN"`
4. User must refresh/re-login to see change

### Issue: Events Not Showing in Scanner

**Symptoms**:
- QR scanner dropdown is empty
- "SELECT AN EVENT" is only option

**Causes & Solutions**:

1. **No Active Events**
   - **Check**: `UH11-events` collection
   - **Solution**: Ensure at least one event has `active: true`

2. **Events Query Error**
   - **Check**: Browser console for errors
   - **Solution**: Verify Firebase connection and permissions

3. **Wrong Collection**
   - **Verify**: Querying correct collection (`UH11-events`)

## Getting Additional Help

### Information to Provide

When reporting an issue, include:

1. **User Information**
   - User ID (UID) if available
   - Email address
   - When issue occurred

2. **Issue Details**
   - What were you trying to do?
   - What happened instead?
   - Error messages (exact text)
   - Screenshots if applicable

3. **Environment**
   - Browser and version
   - Device type (mobile/desktop)
   - Operating system

4. **Steps to Reproduce**
   - Numbered steps to replicate the issue
   - Expected vs actual behavior

### Contact

For issues not covered in this guide:
- Email: tech@ugahacks.com
- Include all relevant information listed above

### Emergency Procedures

**During Event - Critical Issues**:

1. **QR Scanner Down**
   - Backup: Manual sign-in sheet
   - Record names/emails for later entry

2. **Firebase Outage**
   - Check: status.firebase.google.com
   - Wait for resolution
   - Use backup procedures

3. **Data Loss**
   - Restore from Firebase automatic backups
   - Contact Firebase support if needed
