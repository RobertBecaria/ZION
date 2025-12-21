# Test Results - Good Will Module Permission Testing

## Testing Protocol
Test the Good Will module features with different user roles to verify permissions

## User Roles to Test

### 1. Organizer Role
- User who created the event via their organizer profile
- Should have: Full access to QR code, manage attendees, delete event, chat access

### 2. Attendee Role (RSVP = GOING)
- User who clicked "Иду" (Going) on an event
- Should have: Chat access, review submission, photo upload

### 3. Non-Attendee Role
- User who has NOT RSVP'd to the event
- Should have: View event details only, NO chat access, NO review submission

### 4. Co-Organizer Role
- User added as co-organizer to an event
- Should have: Same as organizer (QR code, chat, manage)

## Test Credentials
- Admin (Organizer): admin@test.com / testpassword123
- Test User (Regular): testuser@test.com / testpassword123

## APIs to Test with Permissions
- POST /api/goodwill/events/{event_id}/reviews - Only attendees can review
- POST /api/goodwill/events/{event_id}/photos - Only attendees can upload
- GET/POST /api/goodwill/events/{event_id}/chat - Only attendees/organizers
- GET /api/goodwill/events/{event_id}/qr-code - Only organizers/co-organizers
- POST /api/goodwill/events/{event_id}/co-organizers - Only organizers

## Incorporate User Feedback
- Verify error messages are in Russian
- Test edge cases for permission denials
