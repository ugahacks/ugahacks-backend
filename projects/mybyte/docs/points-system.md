# Points System

## Overview

MyByte implements a dynamic points system that tracks participant engagement across events. Points are calculated in real-time based on event attendance and can be spent at Point Store events.

## Points Calculation

### Dynamic Calculation

Points are **not stored per user** but are calculated dynamically by aggregating attendance records. The calculation is performed by the `getPoints()` function in `/projects/mybyte/interfaces/event.ts`:

```typescript
export const getPoints = async (userId: string) => {
  const events = await getEvents(false); // Get ALL events (active & inactive)
  
  let points = 0;
  for (const event of events) {
    const q = query(
      collection(db, "UH11-events", event.id, "attendance"),
      where("uid", "==", userId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      // Multiply event points by attendance times (for Point Store events)
      points += event.points * (snapshot.docs[0].data().times || 1);
    }
  }
  return points;
};
```

### Calculation Process

1. **Fetch All Events**: Retrieves all events from `UH11-events` (both active and inactive)
2. **Query Attendance**: For each event, checks if user has an attendance record
3. **Multiply by Times**: Calculates `event.points * times_attended`
4. **Sum Total**: Aggregates points across all events

### Why Dynamic?

Dynamic calculation ensures:
- **Data Integrity**: Single source of truth (attendance records)
- **Retroactive Updates**: Event point values can be adjusted retroactively
- **Accurate Totals**: No risk of desynchronization between attendance and points
- **Point Store Support**: Handles multiple redemptions naturally

## Event Points Assignment

### Point Values

Each event in the `UH11-events` collection has a `points` field:

```typescript
{
  id: string,
  title: string,
  description: string,
  timestamp: Date,
  points: number,    // Can be positive, negative, or zero
  active: boolean
}
```

### Point Types

| Point Value | Purpose | Example |
|-------------|---------|---------|
| **Positive** | Reward attendance | Workshop: +10 points |
| **Zero** | Track attendance only | Check-in: 0 points |
| **Negative** | Point Store redemption | Prize: -50 points |

## Attendance Records

### Standard Events

For regular events, attendance is recorded once per user:

```typescript
{
  uid: userId,
  timestamp: new Date(),
  times: 1
}
```

**Behavior**:
- First scan: Creates attendance record
- Subsequent scans: Throws "Already attended" error
- Points awarded: `event.points * 1`

### Point Store Events

Events with "[Point Store]" in the title allow multiple check-ins:

```typescript
// Detection
const isPointStore = (snapshot.data() as Event).title
  .toLowerCase()
  .includes("[point store]");

if (isPointStore) {
  await setDoc(doc(attendanceRef, userId), {
    uid: userId,
    timestamp: new Date(),
    times: alreadyAttended.docs[0].data().times
      ? alreadyAttended.docs[0].data().times + 1
      : 1,
  });
  return; // No error thrown
}
```

**Behavior**:
- First scan: Creates attendance record with `times: 1`
- Subsequent scans: Increments `times` counter
- Points applied: `event.points * times` (usually negative)

### Point Store Example

**Event**: "[Point Store] Prize Redemption" with `-50` points

| Scan # | Times Value | Points Applied | Total User Points |
|--------|-------------|----------------|-------------------|
| 1st    | 1           | -50            | 150 → 100         |
| 2nd    | 2           | -100           | 100 → 50          |
| 3rd    | 3           | -150           | 50 → 0            |

## Point Validation

### Insufficient Points Check

Before recording attendance, the system validates sufficient points for negative-point events:

```typescript
if (points + eventPoints < 0) {
  throw "Not enough points";
}
```

**Example**:
- User has 30 points
- Event costs -50 points
- Calculation: 30 + (-50) = -20 (would go negative)
- Result: Error thrown, attendance not recorded

### Point Floor

Users cannot have negative points. This prevents:
- Spending more than they have
- Going into "debt"
- Gaming the system

## Points Display

### Dashboard

Users can view their current points on the dashboard:

```typescript
// Points are fetched and displayed in real-time
const { userInfo } = useAuth();
console.log(userInfo.points); // Current point total
```

### QR Scanner Interface

When scanning QR codes, organizers see:
- **Before Scan**: User's current points
- **After Scan**: Updated points after event points are applied

```typescript
// Before attendance
const points = await getPoints(uid);
setUser({ name, shirtSize, points });

// After attendance
await addAttendance(eventId, uid);
setUser({ name, shirtSize, points: points + eventPoints });
```

## Point Synchronization

### User Collection Points Field

The `users` collection includes a `points` field, but this is **not the authoritative source**:

```typescript
// From registration
await updateDoc(doc(userRef, user.uid), {
  points: 0, // Initial value
});
```

### Synchronization Strategy

1. **Calculation Source**: Points are always calculated from attendance records
2. **Cache Field**: The `users.points` field could serve as a cache (currently not synchronized)
3. **Real-Time Updates**: Points are recalculated on demand when needed

### Recommendation

For improved performance, consider implementing a Cloud Function to update `users.points` whenever attendance changes. Currently, the system relies on dynamic calculation.

## Points Across Events

### Current Event Focus

Points are currently scoped to UGAHacks 11 (`UH11-events`):

```typescript
const eventsRef = collection(db, "UH11-events");
```

### Multi-Event Considerations

If implementing points across multiple hackathons:
1. Each event series has its own collection (e.g., `UH11-events`, `UH12-events`)
2. Points are calculated independently per event series
3. Users maintain separate point totals for each event

## Point Economy Design

### Earning Points

Typical point-earning activities:
- **Check-in**: 0-5 points (tracking attendance)
- **Workshops**: 10-25 points (educational content)
- **Mini-Events**: 15-50 points (challenges, activities)
- **Submissions**: 50-100 points (project submission)

### Spending Points

Point Store redemption events:
- **Small Items**: -25 to -50 points
- **Medium Items**: -75 to -150 points  
- **Large Items**: -200+ points

### Balancing

Consider total points available vs. redemption costs:
- If 10 events award ~50 points each = 500 points possible
- Ensure sufficient high-value redemption options
- Balance scarcity with accessibility

## Performance Considerations

### Query Complexity

Each `getPoints()` call:
1. Fetches all events (one query)
2. Queries attendance for each event (N queries)
3. Aggregates results in memory

**Optimization Opportunities**:
- Cache event list (changes infrequently)
- Batch attendance queries
- Implement Cloud Functions for background calculation
- Cache points in `users` collection with Firestore triggers

### Real-Time Updates

Points are recalculated:
- On dashboard load
- During QR code scanning
- When displaying user information

For high-traffic events, consider:
- Implementing proper caching
- Using Firestore triggers to maintain `users.points`
- Rate limiting point recalculations

## Edge Cases

### Retroactive Point Changes

**Scenario**: Event organizer changes an event's point value after attendance recorded

**Current Behavior**: 
- Points are recalculated dynamically
- All users receive updated point values automatically
- No manual intervention needed

### Deleted Events

**Scenario**: Event is removed from `UH11-events`

**Current Behavior**:
- Attendance records remain in subcollection
- Points calculation skips deleted events (not found in main query)
- Historical attendance preserved but points not counted

### Multiple Simultaneous Scans

**Scenario**: User's QR code scanned at multiple stations simultaneously

**Protection**:
- Firestore transactions prevent race conditions
- "Already attended" error thrown after first successful scan
- Debouncing on scanner side prevents accidental double-scans

## Best Practices

1. **Test Point Economy**: Before event, verify total possible points vs. redemption costs
2. **Monitor Point Inflation**: Track average points per user to ensure balanced economy
3. **Clear Communication**: Inform participants about point values and redemption options
4. **Regular Audits**: Verify point calculations match expected values
5. **Backup Strategy**: Have contingency plan for point disputes or calculation errors
