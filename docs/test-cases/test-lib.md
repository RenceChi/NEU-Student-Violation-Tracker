# Test Cases — Violation Library CRUD + Deletion Guard

| Field | Details |
|---|---|
| **Module** | Manage Violation Types & Sanctions Library |
| **Covers** | Add/Edit/Delete violation types, Add/Edit/Delete sanctions, deletion guards, linking, access control |
| **Total Test Cases** | 12 |

---
<br><br>

# Test Cases

| Test-ID | Feature | Scenario | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|
| **TC-LIB-001** | Add violation type | Admin adds a new violation type with all required fields | 1. Navigate to Violation Library.<br>2. Tap 'Add Violation Type'.<br>3. Fill in the fields <br>4. Tap Save. | New violation type appears in the violation types list.<br><br>All entered fields are saved correctly.| New violation type appears in the list.<br><br>All entered fields are saved correctly. | PASS | No success confirmation shown. Minor issue. |
| **TC-LIB-002** | Add violation type — missing required field | Admin submits violation type form without a name | 1. Leave Name field blank.<br>2. Fill all other fields.<br>3. Tap Save. | Form does NOT submit.<br><br>Validation error shown on Name field:<br>'Name is required.'<br>No record created. | Error message shown: 'Name is required.' No record created | PASS | Description field is nullable. |
| **TC-LIB-003** | Edit violation type | Admin edits an existing violation type | 1. Tap Edit on any existing violation type.<br>2. Change fields.<br>3. Tap Save. | Updated fields are saved.<br>Changes reflected immediately in the violation types list. | Violation type updates on Library, but when creating a new Record Violation, the violation type is not updated. | FAIL | Recording a new violation uses the old/outdated violation type list.<br><br>Only gets updated upon logging out then logging back in. |
| **TC-LIB-004** | Delete violation type — not in use | Admin deletes a violation type with no active violations | 1. Tap Delete on the unused violation type.<br>2. Confirm deletion in prompt. | Violation type is removed from the list.<br><br>It no longer appears as an option when recording new violations. | Library immediately gets updated, but the deleted Violation type still appears as an option when recording a new violation | FAIL | Same issue as TC-LIB-003 |
| **TC-LIB-005** | Delete violation type — IN USE | Admin attempts to delete a violation type linked to active violations | 1. Tap Delete on the in-use violation type.<br>2. Confirm deletion in the prompt. | Deletion is BLOCKED.<br><br>Error message shown:<br>'Cannot delete — this violation type is used in active student violations.'<br>Violation type remains in the list unchanged. | Violation type library remains unchanged, but no error message shown. | PASS | Please add error message to indicate that violation type is still in use on active violations. |
| **TC-LIB-006** | Add sanction | Admin adds a new sanction with all required fields | 1. Navigate to Sanctions section of the library.<br>2. Tap 'Add Sanction'.<br>3. Fill in the fields<br>4. Tap Save. | New sanction appears in the sanctions list.<br>All fields saved correctly. | New sanction appears in the list.<br><br>All entered fields are saved correctly. | PASS | Same issue as TC-LIB-001.<br><br>Description and Duration are nullable. |
| **TC-LIB-007** | Edit sanction | Admin edits an existing sanction | 1. Tap Edit on any existing sanction.<br>2. Change fields.<br>3. Tap Save. | Updated fields are saved.<br>Changes reflected in the list immediately. | Changes are reflected immediately in the Sanctions Library List, but when Assigning Sanction for a specific violation, the list is not updated. | FAIL | Assigning sanction uses the old/outdated sanctions list.<br><br>Only gets updated upon logging out then logging back in. |
| **TC-LIB-008** | Delete sanction — not in use | Admin deletes a sanction with no active assignments | 1. Tap Delete on the unused sanction.<br>2. Confirm. | Sanction removed from list.<br>No longer appears as option when assigning sanctions. | Sanction removed from list.<br>No longer appears as option when assigning sanctions. | PASS |  |
| **TC-LIB-009** | Delete sanction — IN USE | Admin attempts to delete a sanction currently assigned to an open violation | 1. Tap Delete on the in-use sanction.<br>2. Confirm. | Deletion BLOCKED.<br>Error:<br>'Cannot delete — this sanction is assigned to active violation records.'<br><br>Sanction remains unchanged. | Sanction library remains unchanged, but no error message shown. | PASS | Please add error message to indicate that sanction is still in use on active violations. |
| **TC-LIB-010** | Link sanction to violation type | Admin links a sanction to a specific violation type | 1. Open violation type.<br>2. Navigate to linked sanctions section.<br>3. Select any sanction from the list.<br>4. Save. | The sanction now appears as a recommended sanction when recording the linked violation.<br>Link is visible in the violation type detail view. | Link is visible in the violation type detail view.<br><br>No noticeable difference to unlinked sanctions | FAIL | Linking sanctions does not seem to make any difference aside from being visible in the violation type detail view |
| **TC-LIB-011** | Officer cannot write on library management | Discipline Officer attempts to edit library management | 1. Log in as Discipline Officer.<br>2. Go to library. | No Add/Edit/Delete controls visible. | No Add/Edit/Delete controls visible. | PASS | Officer can only read the library - intended. |
| **TC-LIB-012** | Duplicate violation type name | Admin tries to create a violation type with a name that already exists | 1. Tap Add Violation Type.<br>2. Enter Name of an existing violation (exact duplicate).<br>3. Fill all other fields.<br>4. Tap Save. | Duplicate is blocked OR a clear warning is shown.<br>Error:<br>'A violation type with this name already exists.'<br>No duplicate record created. | Error message is shown stating a UNIQUE constraint.<br><br>No duplicate record is shown | PASS | Tested on the Sanctions too and they allow duplicates. |

---

# Notes
- Violation type description cannot be seen/not shown.
- In 'Assign Sanction' page, "Add custom sanction" button does not work, back button(upper-left) does not work.
- Assigning sanction allows multiple sanctions on one violation (need to clarify if intended).
- Assigning sanction does not go back to list automatically (as if pressing the back button).
- Violation auto resolves upon assigning sanction (need to clarify if intended).