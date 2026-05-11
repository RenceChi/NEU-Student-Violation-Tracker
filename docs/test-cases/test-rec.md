# Test Cases — Record Violation Form + FK Integrity

| Field | Details |
|---|---|
| **Module** | Record Student Violation |
| **Covers** | Happy path, student search, auto-severity, manual override, form validation, FK integrity, role access |
| **Total Test Cases** | 10 |

---

<br>

# Test Cases

| Test-ID | Feature | Scenario | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|
| **TC-REC-001** | Record violation — full valid form | Officer records a complete, valid violation for an existing student | 1. Navigate to Violations tab.<br>2. Tap Add Record<br>3. Search student by ID.<br>3. Select the correct student from results.<br>4. Select a violation type from dropdown.<br>5. Confirm auto-assigned severity.<br>6. Confirm current date/time is pre-filled.<br>7. Select location.<br>8. Enter description<br>9. Tap Submit. | Violation is saved successfully.<br>Confirmation message shown.<br>Student's violation history is updated immediately with the new record.<br><br>New record shows:<br>- type<br>- date/time<br>- location<br>- description<br>- severity<br>- status<br>- officer name | New student violation recorded immediately and reflected on their history. | PASS | Suggestion: Student should be allowed also to 'View Details' of their violations.<br><br>'Recent violations' section on Officer's dashboard is not updated immediately, but can be seen on the separate Violations tab. |
| **TC-REC-002** | Student search by ID or name | 1. On Record Violation page, enter ID or name in search.<br>2. View results. | Returns all violation history of matched student.<br> | Returns all violation history of student. | Returns all violation history of student. | PASS | Tested also on partial name — Passed.<br><br>Case-insensitive — good.<br><br>Unpredicatable behavior when searching with random spaces (e.g., "S ", "T t") |
| **TC-REC-003** | Student search — no results | Officer searches for a name that doesn't exist | 1. Enter non-registered student in search.<br>2. View results. | Empty results state shown.<br>Message:<br>'No students found matching your search.'<br>No error thrown. | No result found. | PASS |  |
| **TC-REC-004** | Auto-severity assignment | System assigns severity based on violation type | 1. On Record Violation form, select violation type.<br>2. Observe severity field. | Severity field automatically updates immediately on type selection.<br>No manual input required. | Severity auto-assigned. | PASS |  |
| **TC-REC-005** | Manual severity override | Officer overrides auto-assigned severity | 1. Select violation type with default severity.<br>2. Manually change severity.<br>3. Submit the form. | Violation saved with modified severity.<br>Overridden severity reflected in violation history. | Overridden severity reflected in violation history. | PASS |  |
| **TC-REC-006** | Missing student — form validation | Officer submits without selecting a student | 1. Leave student field empty.<br>2. Fill all other fields.<br>3. Tap Submit. | Form does NOT submit.<br>Error on student field:<br>'Please select a student.'<br>No violation record created. | No violation record created.<br><br>Error message shown. | PASS | |
| **TC-REC-007** | Missing violation type — form validation | Officer submits without selecting violation type | 1. Select a student.<br>2. Leave violation type field empty.<br>3. Tap Submit. | Form does NOT submit.<br>Error:<br>'Please select a violation type.'<br>No record created. | No record created.<br><br>Error message shown. | PASS | |
| **TC-REC-008** | Missing description — form validation | Officer submits without entering a description | 1. Fill all fields except description.<br>2. Tap Submit. | Form does NOT submit.<br>Error on description field:<br>'Description is required.'<br>No record created. | No record created.<br><br>Error message shown. | PASS | |
| **TC-REC-009** | Same student, same violation type, same day | Officer records the same violation type for a student who already has one today | 1. Record another same violation for same student on the same day.<br>2. Submit. | System allows the duplicate (violations on the same day are valid — student can be tardy multiple times).<br>Both records appear in history separately with different timestamps. | Another violation record appeared. | PASS | Confirmation: Should duplicates be allowed even if same time? (e.g., "10:00:00 AM") |
| **TC-REC-010** | Student role cannot record a violation | 1. Log in as Student.<br>2. Navigate to Violations tab. | 'Add Violation' should not be shown. | No 'Add Violation' button seen | PASS | |

---

# Notes
- Student has no "Submit Appeal" button on their violations. Except for "Resolved" or those with assigned Sanctions already.
- On Violations tab > Appealed tab, 'No violations recorded' message is shown but on Appeals (on navbar) tab, there are two appeals shown.