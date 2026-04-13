# Design Rationale

## Overview
This document explains the key design decisions made for the system, focusing on usability, clarity, and alignment with how users interact with knowledge management tools. The goal of the design is to make information easy to create, find, and manage with minimal friction.

---

## 6. Color Palette and Typography Choices

### Color Palette
The system uses a clean and minimal color palette composed of:
- **Primary color**: Blue (for actions and highlights)
- **Neutral colors**: White, light gray, and dark gray (for backgrounds and text)
- **Accent color**: Subtle green for success states and feedback

### Rationale
This palette was chosen to:
- Promote **readability and focus**, which is critical in a knowledge management tool
- Reduce visual clutter so users can concentrate on content rather than UI elements
- Use familiar color conventions (e.g., blue for links/actions, green for success)

A minimal palette also ensures consistency across pages and avoids overwhelming users who are primarily interacting with text-heavy content.

---

### Typography
The system uses:
- A **sans-serif font** for body text (e.g., clean and modern)
- Clear hierarchy with:
  - Larger, bold headings
  - Medium-weight subheadings
  - Regular body text

### Rationale
Typography was designed to:
- Improve **scannability**, allowing users to quickly locate relevant information
- Maintain **readability** during long reading sessions
- Create a clear **visual hierarchy**, helping users distinguish between titles, sections, and content

This is especially important in knowledge systems where users often skim before diving deeper.

---

## 7. Navigation Structure

### Structure
The application uses a simple and intuitive navigation structure:
- Top-level navigation:
  - Home / Dashboard
  - Search
  - Create / Add New
- Secondary navigation:
  - Item details view
  - Edit view

### Rationale
The navigation reflects how users typically think about knowledge:
- **Find information** → Search
- **Create information** → Add New
- **Browse information** → Home/Dashboard

This aligns with a **task-oriented mental model**, where users are focused on actions rather than system structure.

The shallow hierarchy ensures:
- Fewer clicks to reach key features
- Reduced cognitive load
- Faster task completion

---

## 8. Key Design Decisions

### Most Proud Of: Search-Centered Experience
The most impactful design decision was making **search a central feature** of the interface.

#### Why this matters:
- Users of knowledge systems often **know what they are looking for**
- Search provides the fastest path to information
- It reduces reliance on navigation and manual browsing

By prioritizing search:
- The system feels faster and more responsive
- Users can retrieve information with minimal effort

---

### What I Would Change: Enhanced Filtering and Organization
If given more time, I would improve:
- Advanced filtering (tags, categories, date ranges)
- Better organization (folders or collections)

#### Why:
- As the dataset grows, simple search may not be enough
- Users may want more control over how information is grouped and retrieved

This would improve scalability and long-term usability.

---

## 9. Usability Walkthrough Results

### Method
A usability walkthrough was conducted by simulating common user tasks:
- Creating a new knowledge item
- Searching for existing content
- Navigating between pages

---

### Key Findings

#### 1. Users Expected Immediate Feedback
- Some actions (e.g., saving content) lacked clear confirmation

**Change Made:**
- Added success messages and visual feedback after actions

---

#### 2. Search Behavior Needed Clarity
- Users were unsure if search was case-sensitive or how results were matched

**Change Made:**
- Standardized search to be case-insensitive
- Improved placeholder text (e.g., “Search by keyword or tag”)

---

#### 3. Navigation Was Clear but Could Be Faster
- Users understood the navigation but wanted quicker access to key actions

**Change Made:**
- Added shortcuts (e.g., visible “Add New” button)
- Ensured key actions are always accessible

---

#### 4. Form Validation Was Not Obvious
- Users attempted to submit empty forms without clear guidance

**Change Made:**
- Added inline validation messages
- Highlighted required fields

---

### Summary of Improvements
As a result of the walkthrough:
- Feedback mechanisms were improved
- Search usability was clarified
- Navigation was streamlined
- Input validation became more user-friendly

---

## Conclusion
The design focuses on simplicity, clarity, and efficiency. By aligning the interface with user expectations and continuously refining it through usability testing, the system provides a strong foundation for managing and retrieving knowledge effectively.
