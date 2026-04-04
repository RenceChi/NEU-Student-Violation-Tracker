Field |	Description |	Example
Test ID |	Unique identifier |	TC-001
Feature |	What feature is being tested |	Knowledge Search
Scenario |	The specific situation being tested |	User searches for a keyword that exists in the database
Steps |	Step-by-step actions to reproduce |	1. Navigate to Search. 2. Type 'onboarding'. 3. Press Enter.
Expected Result |	What should happen |	App returns all knowledge items tagged 'onboarding'
Actual Result |	What actually happened |	Returned 3 results — correct
Status |	Pass / Fail / Blocked |	Pass
Notes |	Any observations |	Search is case-insensitive — confirm this is intended behavior

You need at least 10 test cases covering: core CRUD operations, search/retrieval, navigation, edge cases (empty inputs, special characters), and one negative test (what happens when something should fail).
