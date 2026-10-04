# CareCircle

CareCircle API Route Map

1. Backend Architecture
   The backend currently has 3 implemented modules:
   backend/src
   ├── modules/
   │ ├── health/
   │ ├── auth/
   │ └── user/
   │
   ├── appointments/ → TODO tests only
   ├── doses/ → TODO tests only
   ├── medications/ → TODO tests only
   └── summaries/ → TODO tests only
   Application.registerModules() mounts the main router at /.
   Module
   Base Route
   Status
   Health
   /health
   ✅ Implemented
   Authentication
   /auth
   ✅ Implemented
   Users
   /users
   ✅ Implemented
   Medications
   /api/medications
   🚧 TODO
   Appointments
   /api/appointments
   🚧 TODO
   Doses
   /api/doses
   🚧 TODO
   Summaries
   /api/summaries
   🚧 TODO

2. Global API Response Format
   All successful API responses follow a common envelope.
   Success
   {
   "success": true,
   "message": "string",
   "data": {}
   }
   data can be:
   Object { }
   Array [ ]
   null
   HTTP status code is not included in the JSON body. It is returned through the HTTP response status.
   Error
   {
   "success": false,
   "message": "string",
   "error": {
   "code": "VALIDATION_ERROR",
   "details": {}
   }
   }
   Common error codes include:
   VALIDATION_ERROR
   AUTHENTICATION_ERROR
   NOT_FOUND
   CONFLICT
   ...

3. Authentication
   Authentication supports both:
   Authorization: Bearer <accessToken>
   and:
   Cookie: access_token=<accessToken>
   Authentication-related endpoints also set:
   access_token
   refresh_token
   as HttpOnly + SameSite=Strict + Path=/ cookies.

4. Health Module
   Base route:
   /health
   Method
   Endpoint
   Auth
   Purpose
   GET
   /health/
   ❌
   Detailed health status
   GET
   /health/live
   ❌
   Liveness check
   GET
   /health/ready
   ❌
   Readiness/dependency check

GET /health/
Returns:
{
"status": "healthy",
"service": "api",
"version": "...",
"environment": "...",
"process": {
"pid": 123,
"node_version": "...",
"platform": "...",
"arch": "...",
"uptime_sec": 123,
"uptime_human": "..."
},
"memory": {
"heap_used_mb": 0,
"heap_total_mb": 0,
"rss_mb": 0,
"external_mb": 0
},
"dependencies": {
"database": {},
"cache": {}
},
"timestamp": "..."
}
Message:
Health check passed
GET /health/live
Used for Kubernetes/container liveness checks.
{
"status": "alive",
"pid": 123,
"node_version": "...",
"timestamp": "..."
}
Message:
Liveness check passed
GET /health/ready
Checks whether required dependencies are available.
Possible status:
ready
unavailable
Returns 200 when ready and 503 when unavailable.

5. Authentication Module
   Base route:
   /auth
   Method
   Endpoint
   Auth
   Purpose
   POST
   /auth/register
   ❌
   Register user
   POST
   /auth/login
   ❌
   Login
   POST
   /auth/logout
   ✅
   Logout
   POST
   /auth/forgot-password
   ❌
   Request password reset
   POST
   /auth/reset-password
   ❌
   Reset password
   POST
   /auth/refresh-token
   Refresh token
   Rotate tokens
   POST
   /auth/verify-email
   ❌
   Verify email

Register
POST /auth/register
Request:
{
"name": "John Doe",
"email": "john@example.com",
"password": "password123",
"confirmPassword": "password123",
"username": "john_doe",
"bio": "...",
"link": "https://example.com",
"avatar": "https://...",
"banner": "https://...",
"timezone": "Asia/Kolkata"
}
Important validation:
name: 3–50 characters
password: 8–24 characters
username: lowercase [a-z0-9_], 5–16 characters
bio: ≤150 characters
confirmPassword == password
Response:
201 Created
{
"success": true,
"message": "User registered successfully",
"data": {
"accessToken": "...",
"refreshToken": "..."
}
}
Cookies are also set.

Login
POST /auth/login
Request accepts either:
{
"email": "john@example.com",
"password": "password123"
}
or:
{
"username": "john_doe",
"password": "password123"
}
Response:
{
"success": true,
"message": "User logged in successfully",
"data": {
"accessToken": "...",
"refreshToken": "...",
"twoFactorEnabled": false
}
}
If 2FA is enabled, login redirects to:
/otp-verify

Logout
POST /auth/logout
Requires authentication.
Response:
{
"success": true,
"message": "Logged out successfully",
"data": null
}
Cookies are cleared.

Forgot Password
POST /auth/forgot-password
Request:
{
"email": "john@example.com"
}
Response:
{
"success": true,
"message": "OTP sent successfully to your email",
"data": {
"uuid": "..."
}
}
The OTP is stored using a cache key similar to:
otp:<uuid>
TTL:
5 minutes

Reset Password
POST /auth/reset-password
Request:
{
"uuid": "...",
"otp": "A1B2C3",
"password": "newpassword",
"confirmPassword": "newpassword"
}
Response:
{
"success": true,
"message": "Password reset successful",
"data": {
"accessToken": "...",
"refreshToken": "..."
}
}

Refresh Token
POST /auth/refresh-token
Refresh token can be supplied through:
Cookie: refresh_token
or:
{
"refreshToken": "..."
}
or:
x-refresh-token: <token>
Response:
{
"success": true,
"message": "Token rotation successful",
"data": {
"accessToken": "...",
"refreshToken": "..."
}
}

Verify Email
POST /auth/verify-email
Request:
{
"email": "john@example.com",
"token": "...",
"code": "A1B2C3"
}
Currently implemented as a stub.

6. Users Module
   Base route:
   /users
   User Object
   The common IUser structure is:
   {
   id: number,
   name: string,
   email: string,
   username: string,
   bio?: string,
   link?: string,
   avatar?: string,
   banner?: string,
   isVerified: boolean,
   isUserBanned: boolean,
   followersCount: number,
   followingCount: number,
   createdAt: string,
   updatedAt: string
   }
   Important
   password
   is always stripped from user responses.
   Profile responses additionally include:
   isFollowing: boolean

User Routes
Method
Endpoint
Auth
Purpose
GET
/users/profile/:id
❌
Get user profile
GET
/users/me
✅
Get current user
PATCH
/users/me
✅
Update profile
DELETE
/users/me
✅
Delete account
PATCH
/users/me/change-password
✅
Change password
PATCH
/users/me/change-email
✅
Change email
PATCH
/users/me/two-factor-authentication
✅
Enable/disable 2FA
POST
/users/me/avatar
✅
Update avatar
POST
/users/me/banner
✅
Update banner

Get Profile
GET /users/profile/:id
Example:
GET /users/profile/12
Requires:
id > 0
Returns:
{
"success": true,
"message": "Success",
"data": {
"...user fields": "...",
"isFollowing": false
}
}

Get Current User
GET /users/me
Requires authentication.
Returns the authenticated user's profile.

Update Profile
PATCH /users/me
Supports partial updates:
name
bio
link
avatar
timezone
Response:
{
"success": true,
"message": "Profile updated successfully",
"data": {}
}

Delete Account
DELETE /users/me
Request:
{
"password": "password123"
}
Response:
{
"success": true,
"message": "User deleted successfully",
"data": {}
}

Change Password
PATCH /users/me/change-password
Request:
{
"oldPassword": "...",
"newPassword": "..."
}
Minimum new password length:
8 characters

Change Email
PATCH /users/me/change-email
Request:
{
"email": "new@example.com",
"password": "..."
}

Two-Factor Authentication
PATCH /users/me/two-factor-authentication
Request:
{
"password": "...",
"twoFactorEnabled": true
}

Avatar
POST /users/me/avatar
Currently a stub.
Response:
{
"success": true,
"message": "Avatar update feature",
"data": null
}
Banner
POST /users/me/banner
Currently a stub.

7. Planned Medication Module
   ⚠️ Not implemented yet.
   Only TODO test placeholders currently exist.
   Expected routes:
   Method
   Endpoint
   Purpose
   GET
   /api/medications
   List medications
   GET
   /api/medications/:id
   Get medication
   POST
   /api/medications
   Create medication
   PATCH
   /api/medications/:id
   Update medication
   DELETE
   /api/medications/:id
   Delete medication

8. Planned Appointment Module
   ⚠️ Not implemented yet.
   Expected routes:
   Method
   Endpoint
   Purpose
   GET
   /api/appointments
   List appointments
   POST
   /api/appointments
   Create appointment
   PATCH
   /api/appointments/:id
   Update appointment
   DELETE
   /api/appointments/:id
   Delete appointment

9. Planned Dose Module
   ⚠️ Not implemented yet.
   Expected routes:
   Method
   Endpoint
   Purpose
   GET
   /api/doses/today
   Get today's doses
   GET
   /api/doses/due
   Get due doses
   POST
   /api/doses/confirm
   Confirm dose

10. Planned Summary Module
    ⚠️ Not implemented yet.
    Expected routes:
    Method
    Endpoint
    Purpose
    GET
    /api/summaries
    Get summaries
    GET
    /api/summaries/:date
    Get summary for date

11. Frontend Routes
Frontend routing is defined in:
frontend/src/App.tsx
All pages are rendered inside:
<Layout />

Current routes:
Route
Page
Backend Connected?
/
Today
❌ Mock data
/medications
Medications
❌ Mock data
/appointments
Appointments
❌ Mock data
/summaries
Summaries
❌ Mock data
/alerts
Alerts
❌ Mock data
/profile
Profile
❌ Mock data

Current frontend data comes primarily from:
state/care-circle.tsx
data/mock.json
There is currently no backend wiring for these screens.

12. Current Implementation Status
    CareCircle Backend
    │
    /mainRouter
    │
    ┌────────────────┼────────────────┐
    │ │ │
    /health /auth /users
    │ │ │
    ✅ ✅ ✅
    Complete Complete Complete

          ┌────────────────┼────────────────┐
          │                │                │

/medications /appointments /doses
│ │ │
🚧 🚧 🚧
TODO only TODO only TODO only

                           │
                      /summaries
                           │
                           🚧
                        TODO only

Overall status
Area
Status
Health API
✅ Complete
Authentication
✅ Complete
User/Profile API
✅ Mostly complete
Avatar upload
🚧 Stub
Banner upload
🚧 Stub
Medications API
✅ Complete
Appointments API
✅ Complete
Doses API
✅ Complete
Summaries API
✅ Complete
Frontend routing
✅ Complete
Frontend → Backend integration
❌ Not implemented
Mock data
✅ Currently used

Recommended implementation order

1. Medications
   ↓
2. Appointments
   ↓
3. Doses
   ↓
4. Summaries
   ↓
5. Replace frontend mock data
   ↓
6. Connect frontend → API
   ↓
7. Integration + E2E tests
   This gives CareCircle a clear path from the current authentication/profile foundation → core healthcare functionality → frontend integration.
