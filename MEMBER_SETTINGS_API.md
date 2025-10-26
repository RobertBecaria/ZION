# Member Settings & Permission Request System API

## Overview
This system allows members to manage their own settings and request permission changes, with admin approval workflow.

## Features
1. **Self-Service Settings**: Members can update job title directly
2. **Permission Requests**: Members request role/department/team changes
3. **Admin Approval**: Admins review and approve/reject requests
4. **Team Creation**: Any member can create teams
5. **Leave Company**: Members can leave organizations

---

## API Endpoints

### 1. Update Member Settings
**Endpoint**: `PUT /api/work/organizations/{organization_id}/members/me`

**Description**: Member updates their own settings

**Request Body**:
```json
{
  "job_title": "Senior Developer",
  "requested_role": "MANAGER",
  "requested_custom_role_name": null,
  "requested_department": "Engineering",
  "requested_team": "Backend Team",
  "reason": "I've been leading the backend team for 6 months"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Настройки обновлены",
  "job_title_updated": true,
  "change_requests_created": ["role", "department", "team"]
}
```

**Notes**:
- `job_title` is applied immediately (no approval)
- Role/department/team changes create change requests

---

### 2. Get Change Requests (Admin Only)
**Endpoint**: `GET /api/work/organizations/{organization_id}/change-requests?status=PENDING`

**Description**: Get all change requests for the organization

**Query Parameters**:
- `status` (optional): PENDING, APPROVED, REJECTED (default: PENDING)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organization_id": "org-uuid",
      "user_id": "user-uuid",
      "request_type": "ROLE_CHANGE",
      "current_role": "EMPLOYEE",
      "requested_role": "MANAGER",
      "requested_custom_role_name": null,
      "reason": "Leading backend team",
      "status": "PENDING",
      "created_at": "2025-01-26T10:00:00Z",
      "user_first_name": "John",
      "user_last_name": "Doe",
      "user_email": "john@example.com",
      "user_avatar_url": "https://..."
    }
  ]
}
```

---

### 3. Approve Change Request
**Endpoint**: `POST /api/work/organizations/{organization_id}/change-requests/{request_id}/approve`

**Description**: Admin approves a change request

**Response**:
```json
{
  "success": true,
  "message": "Запрос одобрен"
}
```

**Notes**:
- Applies the requested changes to member profile
- Updates request status to APPROVED
- Records reviewer and review time

---

### 4. Reject Change Request
**Endpoint**: `POST /api/work/organizations/{organization_id}/change-requests/{request_id}/reject`

**Request Body** (optional):
```json
{
  "rejection_reason": "Need more experience in current role"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Запрос отклонен"
}
```

---

### 5. Create Team
**Endpoint**: `POST /api/work/organizations/{organization_id}/teams`

**Description**: Any member can create a team

**Request Body**:
```json
{
  "name": "Backend Team",
  "description": "Backend development team",
  "department_id": "dept-uuid",
  "team_lead_id": "user-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Команда создана",
  "team_id": "team-uuid"
}
```

**Notes**:
- Creator is automatically added as first team member
- If `team_lead_id` not provided, creator becomes team lead

---

### 6. Get Teams
**Endpoint**: `GET /api/work/organizations/{organization_id}/teams`

**Description**: Get all teams in the organization

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "team-uuid",
      "organization_id": "org-uuid",
      "name": "Backend Team",
      "description": "Backend development team",
      "department_id": "dept-uuid",
      "team_lead_id": "user-uuid",
      "member_ids": ["user1", "user2"],
      "created_by": "user-uuid",
      "created_at": "2025-01-26T10:00:00Z",
      "is_active": true
    }
  ]
}
```

---

### 7. Leave Organization (Already exists)
**Endpoint**: `POST /api/work/organizations/{organization_id}/leave`

**Description**: Member leaves the organization

**Response**:
```json
{
  "message": "Successfully left the organization",
  "organization_id": "org-uuid"
}
```

**Notes**:
- Owner cannot leave (must transfer ownership first)
- Last admin cannot leave (must promote another admin first)
- Soft delete (sets is_active: false)

---

## Database Collections

### `work_change_requests`
```javascript
{
  id: "uuid",
  organization_id: "uuid",
  user_id: "uuid",
  request_type: "ROLE_CHANGE" | "DEPARTMENT_CHANGE" | "TEAM_CHANGE",
  
  // Current values
  current_role: "EMPLOYEE",
  current_department: "Sales",
  current_team: null,
  
  // Requested values
  requested_role: "MANAGER",
  requested_custom_role_name: null,
  requested_department: "Engineering",
  requested_team: "Backend Team",
  
  reason: "Leading team for 6 months",
  status: "PENDING" | "APPROVED" | "REJECTED",
  reviewed_by: "admin-uuid",
  reviewed_at: "2025-01-26T10:30:00Z",
  rejection_reason: "Need more experience",
  created_at: "2025-01-26T10:00:00Z"
}
```

### `work_teams`
```javascript
{
  id: "uuid",
  organization_id: "uuid",
  name: "Backend Team",
  description: "Backend development",
  department_id: "dept-uuid",
  team_lead_id: "user-uuid",
  member_ids: ["user1", "user2"],
  created_by: "user-uuid",
  created_at: "2025-01-26T10:00:00Z",
  updated_at: "2025-01-26T10:00:00Z",
  is_active: true
}
```

---

## Frontend Implementation Guide

### UI Structure

**For Admins**:
```
Organization Profile
└── [НАСТРОЙКИ] button
    └── Settings Modal/Panel
        ├── Tab 1: Company Settings (admin features)
        │   ├── Edit Organization
        │   ├── Member Management
        │   ├── ЗАПРОСЫ НА ИЗМЕНЕНИЯ (Change Requests) ← NEW
        │   └── Delete Organization
        └── Tab 2: МОИ НАСТРОЙКИ (Personal Settings)
            ├── Request Role Change
            ├── Request Department Change
            ├── Edit Job Title (immediate)
            ├── Create/Join Teams
            └── Leave Company
```

**For Members (non-admin)**:
```
Organization Profile
└── [НАСТРОЙКИ] button
    └── МОИ НАСТРОЙКИ (Personal Settings Only)
        ├── Request Role Change
        ├── Request Department Change
        ├── Edit Job Title (immediate)
        ├── Create/Join Teams
        └── Leave Company
```

### Components Needed

1. **WorkMemberSettings.js**: Personal settings component
   - Role change request form
   - Department/team request forms
   - Job title edit (direct)
   - Leave company button

2. **WorkChangeRequestsManager.js**: Admin approval interface
   - List pending requests
   - Show user info and requested changes
   - Approve/Reject buttons
   - Filter by status

3. **WorkOrganizationSettings.js**: Update to have tabs
   - Tab 1: Company Settings (admin only)
   - Tab 2: Personal Settings (all members)

4. **WorkTeamManager.js**: Team creation and management
   - Create team form
   - List teams
   - Join team requests

---

## Workflow Example

### Member Requests Role Change:
1. Member opens "МОИ НАСТРОЙКИ"
2. Changes role from EMPLOYEE to MANAGER
3. Adds reason: "Leading backend team for 6 months"
4. Clicks "ОТПРАВИТЬ ЗАПРОС"
5. System creates change request with status PENDING

### Admin Reviews Request:
1. Admin opens "НАСТРОЙКИ" → "ЗАПРОСЫ НА ИЗМЕНЕНИЯ"
2. Sees "John Smith requests: EMPLOYEE → MANAGER"
3. Reviews reason and member performance
4. Clicks [ОДОБРИТЬ] or [ОТКЛОНИТЬ]
5. If approved: Member's role immediately updated to MANAGER
6. If rejected: Request marked rejected with optional reason

### Member Creates Team:
1. Member opens "МОИ НАСТРОЙКИ" → "Команды"
2. Clicks "СОЗДАТЬ КОМАНДУ"
3. Fills: Name, Description, Department
4. Team created immediately (no approval needed)
5. Member becomes team lead automatically

---

## Testing Checklist

### Backend Testing:
- [ ] Member can update job title directly
- [ ] Member can request role change
- [ ] Member can request department change
- [ ] Member can request team change
- [ ] Admin can view pending requests
- [ ] Admin can approve requests (changes applied)
- [ ] Admin can reject requests (with reason)
- [ ] Any member can create teams
- [ ] Member can leave organization
- [ ] Owner cannot leave
- [ ] Last admin cannot leave

### Frontend Testing:
- [ ] Settings button shows for all members
- [ ] Admins see two tabs (Company + Personal)
- [ ] Members see one section (Personal only)
- [ ] Role change form works
- [ ] Department/team request forms work
- [ ] Job title updates immediately
- [ ] Change requests list displays
- [ ] Approve/reject buttons functional
- [ ] Leave company confirmation modal
- [ ] Team creation form works

---

## Error Handling

- **403**: Not authorized (non-admin trying to approve requests)
- **404**: Request not found or already processed
- **400**: Invalid data (e.g., requesting same role as current)
- **500**: Server error

All errors should show Russian error messages to users.
