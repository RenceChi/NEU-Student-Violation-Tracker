# KM Conceptual Report: NEU Student Violation Tracker

## 1. Problem Statement
In many schools like NEU, student violation records are treated only as administrative logs rather than knowledge assets. Experienced teachers and counselors possess valuable **tacit knowledge** such as recognizing early behavioral patterns, understanding contextual factors (family issues, peer influence), and knowing effective informal interventions. However, this knowledge is rarely captured or shared. Explicit records are often limited to basic checkboxes and short descriptions. This results in repeated violations, inconsistent disciplinary actions, missed opportunities for preventive measures, and limited organizational learning for the school.

Our NEU Student Violation Tracker aims to transform violation management into a true Knowledge Management system that captures, shares, and creates knowledge for better student guidance and school improvement.

## 2. KM Framework: The SECI Model
The SECI model developed by Ikujiro Nonaka and Hirotaka Takeuchi (1995) describes knowledge creation as a continuous spiral of conversion between tacit and explicit knowledge.

- **Socialization (Tacit → Tacit)**: Sharing experiences through direct interaction and observation.
- **Externalization (Tacit → Explicit)**: Converting personal insights into documented forms (reports, notes, tags).
- **Combination (Explicit → Explicit)**: Synthesizing multiple records into patterns, trends, and new knowledge (dashboards, analytics).
- **Internalization (Explicit → Tacit)**: Reflecting on documented knowledge to improve personal understanding and future actions.

SECI was chosen over Communities of Practice because it provides a clear, structured process for turning individual teacher insights into school-wide organizational knowledge. It fits perfectly with our goal of moving from simple violation logging to continuous learning and prevention.

### 3. Framework-to-App Mapping (7 User Stories)

The following table maps our 7 user stories to the four phases of the SECI model. This mapping demonstrates how the NEU Student Violation Tracker functions as a genuine Knowledge Management system rather than a simple logging tool. Authentication has been added as User Story 7 to resolve the HIGH risk identified in the review (missing Student/Parent authentication for US-06 Appeal Process).

| # | User Story | SECI Phase | KM Rationale |
|---|------------|------------|--------------|
| 1 | As a teacher/adviser, I can submit a new student violation report including student details, violation type, description, date, and supporting notes/photos. | **Externalization** (Tacit → Explicit) | Converts the teacher's tacit knowledge (observations, judgment, and context) into structured, documented explicit knowledge that can be shared. |
| 2 | As an officer/admin, I can view a dashboard showing violation statistics, trends by type, grade level, and time period. | **Combination** (Explicit + Explicit) | Reconfigures and synthesizes multiple explicit violation records into meaningful patterns, analytics, and higher-level knowledge for school decision-making. |
| 3 | As a teacher or counselor, I can search and view the full violation history of a specific student with all past incidents and resolutions. | **Internalization** (Explicit → Tacit) | Enables users to absorb documented cases, reflect on patterns, and enrich their own tacit knowledge for better handling of future violations. |
| 4 | As a teacher, I can add comments or discuss a violation case with other teachers/counselors in a threaded discussion section. | **Socialization** (Tacit → Tacit) | Facilitates direct sharing of experiential and tacit insights among staff through interaction and observation of others’ approaches. |
| 5 | As a student, I can view my own violation record (with guidance) and any assigned sanctions or lessons learned. | **Internalization** (Explicit → Tacit) | Helps students reflect on their actions, internalize consequences, and develop better behavioral understanding. |
| 6 | As an admin/officer, I can assign sanctions, link violations to school policies, and generate official reports. | **Combination** (Explicit + Explicit) | Combines explicit violation data with school policies to create new, actionable knowledge and formal outputs. |
| 7 | As a student or parent/guardian, I want to securely authenticate and log in to the system (using institutional email), so that I can access my personal dashboard, submit/view appeals, track status, upload evidence, and receive notifications while ensuring data privacy and role-based access. | **Socialization** (Tacit → Tacit) | Authentication serves as a foundational enabler for Socialization by ensuring only authorized users can safely share tacit knowledge through discussions, notifications, and collaborative case handling. |

## 4. Knowledge Architecture (Draft)
- **Taxonomy**: Violation Type (Behavioral, Academic, Attendance, Others), Severity (Minor, Major), Contributing Factors.
- **Tagging**: Multi-tags for context, intervention used, and outcome.
- **Retrieval**: Search by keyword, filter by tags, and "similar cases" feature.

## 5. Limitations & Future Work
This version focuses on internal knowledge conversion within the school. Future enhancements could include parent access for internalization and AI-based pattern detection.

## 6. References
Nonaka, I., & Takeuchi, H. (1995). *The knowledge-creating company*. Oxford University Press.
