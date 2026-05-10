# Test Cases — Authentication

| Field | Details |
|---|---|
| **Module** | Authentication & Role-Based Access Control |
| **Covers** | Admin login, Officer login, Student login, edge cases, session management |
| **Total Test Cases** | 8 |

<br><br>

# Test Cases

| Test-ID | Feature | Scenario | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|
| **TC-AUTH-001** | Login — Admin | Admin logs in with valid credentials | 1. Open app.<br>2. Enter valid Admin email + password.<br>3. Tap Login. | Dashboard loads.<br><br>Role badge shows 'Admin'.<br><br>Full navigation visible (Violations History, Reports, Library, Appeals). | App shows dashboard for administrator.<br><br>Role shown as 'Administrator'<br><br>App shows the full navigation at the bottom. | PASS | The navigation bar seems to be optimized for a specific device only. It does not consider phones with navigation bar at the bottom, (e.g., Back, Home, Recents) making the app's navigation buttons difficult to press on some devices. |
| **TC-AUTH-002** | Login — Officer | Officer logs in with valid credentials | 1. Open app.<br>2. Enter valid Officer email + password.<br>3. Tap Login. | Dashboard loads.<br><br>Role badge shows 'Officer'.<br><br>Nav shows: Violations History, Library, Appeals.<br>Reports are hidden. | App shows dashboard for discipline officer.<br><br>Role shown as 'Discipline Officer'<br><br>App shows the limited navigation at the bottom: Violations History, Library, Appeals.<br><br> Some functions also are not available but available to Admin  | PASS | Same as TC-AUTH-001 |
| **TC-AUTH-003** | Login — Student | Student logs in with valid credentials | 1. Open app.<br>2. Enter valid Student email + password.<br>3. Tap Login. | Dashboard loads. Role badge shows 'Student'.<br><br>Nav shows: My Violations and My Appeals only. | App shows student's dashboard.<br><br>Role shown as 'Student'<br><br>App shows student's own violations and appeals only | PASS | Same as TC-AUTH-001 |
| **TC-AUTH-004** | Login — Wrong password | User enters incorrect password | 1. Open app.<br>2. Enter valid email + wrong password.<br>3. Tap Login. | Login fails.<br><br>Error message shown: 'Invalid email or password.'<br><br>User remains on login page. No role or dashboard data exposed. | User remains on login page.<br><br>Error message shown: 'Incorrect email or password.' | PASS | Error message shown does not reveal whether an email exists or not. Good. |
| **TC-AUTH-005** | Login — Unregistered email | User enters email not in system | 1. Open app.<br>2. Enter unregistered email + any password.<br>3. Tap Login. | Login fails.<br><br>Same generic error: 'Invalid email or password.' No indication email is unknown. | User remains on login page.<br><br>Error message shown: 'Incorrect email or password.' | PASS | Same message as TC-AUTH-004 |
| **TC-AUTH-006** | Login — Empty fields | User submits blank login form | 1. Open app.<br>2. Leave both fields empty.<br>3. Tap Login. | Form does not submit.<br>Validation errors appear on both fields:<br>'Email is required.' and 'Password is required.' | User remains on login page.<br><br>Error message shown: 'Missing Fields' | PASS |  |
| **TC-AUTH-007** | Login — Email only | User submits with only email filled | 1. Enter valid email.<br>2. Leave password blank.<br>3. Tap Login. | Form does not submit.<br>'Password is required.' error shown. | User remains on login page.<br><br>Error message shown: 'Missing Fields' | PASS | No hint whether an email exists or not. Good. |
| **TC-AUTH-008** | Logout | Logged-in user logs out | 1. Tap logout button.<br>2. Confirm logout if prompted. | Session is destroyed.<br>User redirected to login page.<br>Back button does NOT return to dashboard. | User logs out. | PASS | No confirmation prompt. |
---
<br><br>

# Notes
- No sign up button/function.
- No Google sign in (institutional emails only).
- Forgot password can't be tested.
- No users account control