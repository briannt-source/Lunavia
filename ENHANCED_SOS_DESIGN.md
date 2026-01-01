# Enhanced SOS/Emergency System Design Document

## Tổng quan

Hệ thống khẩn cấp nâng cao với one-tap SOS button, auto-location sharing, emergency response workflow, và safety check-in system.

## Tính năng

### 1. Emergency Button (SOS)
- **One-tap SOS:**
  - Quick access SOS button trong app
  - Auto-trigger emergency report
  - Immediate notification to operator and support team

- **Auto-location Sharing:**
  - GPS location capture
  - Location history tracking
  - Real-time location updates

- **Emergency Contacts:**
  - Pre-configured emergency contacts
  - Auto-notification to contacts
  - Multiple contact methods (SMS, call, app notification)

### 2. Emergency Response
- **24/7 Support Team:**
  - Admin/support staff monitoring
  - Immediate response workflow
  - Escalation procedures

- **Response Actions:**
  - Acknowledge emergency
  - Contact guide/operator
  - Dispatch help
  - Resolve emergency

### 3. Safety Check-ins
- **Scheduled Check-ins:**
  - Auto-schedule check-ins during tour
  - Configurable intervals (e.g., every 2 hours)
  - Check-in reminders

- **Missed Check-in Alerts:**
  - Alert if check-in missed
  - Auto-escalation after X missed check-ins
  - Contact guide/operator

- **Check-in Status:**
  - SAFE
  - NEEDS_ATTENTION
  - MISSED
  - EMERGENCY

## Database Schema

### Enhanced EmergencyReport Model
```prisma
model EmergencyReport {
  id               String            @id @default(cuid())
  tourId           String
  tour             Tour              @relation(fields: [tourId], references: [id], onDelete: Cascade)
  guideId          String
  guide            User              @relation(fields: [guideId], references: [id], onDelete: Cascade)
  
  type             EmergencyType     // SOS, EMERGENCY, INCIDENT, SAFETY_CHECK
  description      String            @db.Text
  severity         EmergencySeverity // LOW, MEDIUM, HIGH, CRITICAL
  status           EmergencyStatus   @default(PENDING)
  
  // Location
  location         String?           // Address
  latitude         Float?            // GPS latitude
  longitude        Float?            // GPS longitude
  locationAccuracy Float?            // GPS accuracy in meters
  
  // Response
  operatorResponse String?           @db.Text
  respondedBy      String?           // Admin/Operator user ID
  respondedAt      DateTime?
  resolvedAt       DateTime?
  resolvedBy       String?           // Admin user ID
  resolutionNotes  String?           @db.Text
  
  // Escalation
  escalated        Boolean           @default(false)
  escalatedAt      DateTime?
  escalatedBy      String?           // Admin user ID
  escalationLevel  Int               @default(1) // 1-5
  
  // Emergency contacts notified
  contactsNotified String[]          // Contact IDs notified
  
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @default(now()) @updatedAt
  
  checkIns         SafetyCheckIn[]
  
  @@index([tourId])
  @@index([guideId])
  @@index([status])
  @@index([severity])
  @@index([createdAt])
  @@map("emergency_reports")
}

enum EmergencyType {
  SOS              // One-tap SOS button
  EMERGENCY        // General emergency
  INCIDENT         // Non-emergency incident
  SAFETY_CHECK     // Safety check-in
}

enum EmergencySeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum EmergencyStatus {
  PENDING          // Awaiting response
  ACKNOWLEDGED     // Response team acknowledged
  IN_PROGRESS      // Response in progress
  RESOLVED         // Emergency resolved
  CANCELLED        // False alarm or cancelled
}
```

### SafetyCheckIn Model
```prisma
model SafetyCheckIn {
  id                String            @id @default(cuid())
  emergencyReportId String?           // If triggered by emergency
  emergencyReport   EmergencyReport?  @relation(fields: [emergencyReportId], references: [id], onDelete: SetNull)
  tourId            String
  tour              Tour               @relation(fields: [tourId], references: [id], onDelete: Cascade)
  guideId           String
  guide             User               @relation(fields: [guideId], references: [id], onDelete: Cascade)
  
  status            CheckInStatus      @default(SAFE)
  location          String?           // Address
  latitude          Float?
  longitude         Float?
  notes             String?           @db.Text
  
  scheduledAt       DateTime          // When check-in was scheduled
  checkedInAt       DateTime?        // When guide actually checked in
  missed            Boolean           @default(false)
  missedAt          DateTime?        // When check-in was marked as missed
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @default(now()) @updatedAt
  
  @@index([tourId])
  @@index([guideId])
  @@index([scheduledAt])
  @@index([missed])
  @@map("safety_check_ins")
}

enum CheckInStatus {
  SAFE              // All good
  NEEDS_ATTENTION   // Minor issue
  MISSED            // Check-in missed
  EMERGENCY         // Emergency situation
}
```

### EmergencyContact Model
```prisma
model EmergencyContact {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  phone       String
  email       String?
  relationship String? // "FAMILY", "FRIEND", "COLLEAGUE", etc.
  priority    Int      @default(1) // 1 = highest priority
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt
  
  @@index([userId])
  @@map("emergency_contacts")
}
```

## Business Rules

### SOS Button
1. **One-tap Activation:**
   - Guide taps SOS button
   - System creates CRITICAL emergency report
   - Auto-capture GPS location
   - Immediate notification to operator and support team

2. **Location Sharing:**
   - GPS coordinates captured automatically
   - Location updated every X minutes during emergency
   - Location history maintained

### Emergency Response
1. **Response Workflow:**
   - PENDING → ACKNOWLEDGED (support team acknowledges)
   - ACKNOWLEDGED → IN_PROGRESS (response initiated)
   - IN_PROGRESS → RESOLVED (emergency handled)

2. **Escalation:**
   - If no response within X minutes, escalate
   - Escalation level increases (1-5)
   - Higher escalation = more contacts notified

### Safety Check-ins
1. **Scheduling:**
   - Auto-schedule check-ins during active tours
   - Interval configurable (default: 2 hours)
   - Check-ins scheduled based on tour duration

2. **Missed Check-in:**
   - If check-in missed, alert operator
   - After X missed check-ins, escalate to emergency
   - Contact guide via multiple channels

## Implementation Plan

### Phase 1: Database & Models
1. Enhance EmergencyReport model
2. Add SafetyCheckIn model
3. Add EmergencyContact model
4. Add enums (EmergencyType, EmergencySeverity, EmergencyStatus, CheckInStatus)
5. Create migration

### Phase 2: Services & Use Cases
1. EmergencyService - Create, respond, resolve emergencies
2. SafetyCheckInService - Schedule, track check-ins
3. EmergencyContactService - Manage emergency contacts
4. CreateSOSUseCase - One-tap SOS
5. RespondToEmergencyUseCase - Support team response
6. ScheduleCheckInUseCase - Auto-schedule check-ins
7. ProcessMissedCheckInUseCase - Handle missed check-ins

### Phase 3: Integration
1. Integrate với tour lifecycle
2. Auto-schedule check-ins when tour starts
3. GPS location capture
4. Emergency notification system
5. Cron job for check-in monitoring

### Phase 4: Test
1. Test SOS button
2. Test emergency response workflow
3. Test safety check-ins
4. Test missed check-in escalation

