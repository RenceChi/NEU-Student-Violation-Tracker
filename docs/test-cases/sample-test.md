# Test Cases

## Test Case Template

| Field | Description | Example |
|------|------------|---------|
| **Test ID** | Unique identifier | TC-001 |
| **Feature** | What feature is being tested | Knowledge Search |
| **Scenario** | The specific situation being tested | User searches for a keyword that exists in the database |
| **Steps** | Step-by-step actions to reproduce | 1. Navigate to Search <br> 2. Type 'onboarding' <br> 3. Press Enter |
| **Expected Result** | What should happen | App returns all knowledge items tagged 'onboarding' |
| **Actual Result** | What actually happened | Returned 3 results — correct |
| **Status** | Pass / Fail / Blocked | Pass |
| **Notes** | Any observations | Search is case-insensitive — confirm intended behavior |

You need at least 10 test cases covering: core CRUD operations, search/retrieval, navigation, edge cases (empty inputs, special characters), and one negative test (what happens when something should fail).

---

## Test Cases

### TC-001: Create Item (CRUD - Create)
| Field | Details |
|------|---------|
| **Test ID** | TC-001 |
| **Feature** | Knowledge Management |
| **Scenario** | User creates a new knowledge item |
| **Steps** | 1. Click "Add New" <br> 2. Enter title and content <br> 3. Click Save |
| **Expected Result** | New item is saved and appears in the list |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-002: Read/View Item (CRUD - Read)
| Field | Details |
|------|---------|
| **Test ID** | TC-002 |
| **Feature** | Knowledge Management |
| **Scenario** | User views an existing item |
| **Steps** | 1. Navigate to list <br> 2. Click an item |
| **Expected Result** | Item details are displayed correctly |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-003: Update Item (CRUD - Update)
| Field | Details |
|------|---------|
| **Test ID** | TC-003 |
| **Feature** | Knowledge Management |
| **Scenario** | User edits an existing item |
| **Steps** | 1. Open item <br> 2. Click Edit <br> 3. Modify content <br> 4. Save |
| **Expected Result** | Changes are saved and reflected |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-004: Delete Item (CRUD - Delete)
| Field | Details |
|------|---------|
| **Test ID** | TC-004 |
| **Feature** | Knowledge Management |
| **Scenario** | User deletes an item |
| **Steps** | 1. Select item <br> 2. Click Delete <br> 3. Confirm action |
| **Expected Result** | Item is removed from the list |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-005: Search Existing Keyword (Search)
| Field | Details |
|------|---------|
| **Test ID** | TC-005 |
| **Feature** | Search |
| **Scenario** | User searches for existing keyword |
| **Steps** | 1. Navigate to Search <br> 2. Type keyword <br> 3. Press Enter |
| **Expected Result** | Matching results are displayed |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-006: Search Non-Existing Keyword (Negative Test)
| Field | Details |
|------|---------|
| **Test ID** | TC-006 |
| **Feature** | Search |
| **Scenario** | User searches for a keyword that does not exist |
| **Steps** | 1. Navigate to Search <br> 2. Type random keyword <br> 3. Press Enter |
| **Expected Result** | No results message is shown |
| **Actual Result** |  |
| **Status** |  |
| **Notes** | Should handle gracefully without errors |

---

### TC-007: Navigation Between Pages (Navigation)
| Field | Details |
|------|---------|
| **Test ID** | TC-007 |
| **Feature** | Navigation |
| **Scenario** | User navigates between pages |
| **Steps** | 1. Click menu links (Home, Search, Create) |
| **Expected Result** | Correct pages load without errors |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-008: Empty Input on Create (Edge Case)
| Field | Details |
|------|---------|
| **Test ID** | TC-008 |
| **Feature** | Validation |
| **Scenario** | User submits empty form |
| **Steps** | 1. Click Add New <br> 2. Leave fields empty <br> 3. Click Save |
| **Expected Result** | Validation error is shown |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |

---

### TC-009: Special Characters in Search (Edge Case)
| Field | Details |
|------|---------|
| **Test ID** | TC-009 |
| **Feature** | Search |
| **Scenario** | User searches with special characters |
| **Steps** | 1. Enter symbols (e.g., @#$%) <br> 2. Press Enter |
| **Expected Result** | System handles input safely without crashing |
| **Actual Result** |  |
| **Status** |  |
| **Notes** | Check for security issues (e.g., injection) |

---

### TC-010: Large Input Handling (Edge Case)
| Field | Details |
|------|---------|
| **Test ID** | TC-010 |
| **Feature** | Performance / Validation |
| **Scenario** | User inputs very long text |
| **Steps** | 1. Enter long text (>1000 chars) <br> 2. Save or search |
| **Expected Result** | System handles input or shows limit error |
| **Actual Result** |  |
| **Status** |  |
| **Notes** |  |
