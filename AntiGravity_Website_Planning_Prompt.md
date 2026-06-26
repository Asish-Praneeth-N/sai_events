# AntiGravity Planning Prompt – Website First (Next.js + Supabase)

## Project Context

You have been provided with the complete Event Management Platform Requirement Specification.

The platform will eventually contain:
- Customer Website
- Vendor Website
- Customer Mobile App
- Vendor Mobile App
- Admin Panel

However, at this stage, we are building **only the Website platform**.

### Technology Stack

Frontend:
- Next.js (latest stable version)
- TypeScript

Backend & Database:
- Supabase
- PostgreSQL (Supabase managed)

Important:
- Supabase will be the **single source of truth**.
- The same database must later support:
  - Website
  - Customer Mobile App
  - Vendor Mobile App
  - Admin Panel
- Therefore all recommendations must consider future scalability and shared database usage.

---

## Your Task

First, thoroughly study and understand the complete requirement document.

Do NOT start coding.

Do NOT generate implementation yet.

Do NOT change any business flow.

Do NOT redesign the product.

Do NOT remove or add features.

Treat the requirement document as the final business specification.

---

## Phase 1 – Requirement Understanding

Analyze and understand:

- User Roles
  - Admin
  - Customer
  - Vendor

- Modules
- Business Rules
- Status Flow
- Notification Flow
- Vendor Assignment Flow
- Category/Subcategory Structure
- Customer Request Flow
- Vendor Flow
- Admin Flow

Provide a concise summary of your understanding before moving forward.

---

## Phase 2 – Website Scope Identification

Based strictly on the requirements:

Identify:

1. Which website modules are required.
2. Which modules are dependent on other modules.
3. Which modules are foundational.
4. Which modules can be developed independently.
5. Which modules should be delayed until core data structures exist.

Create a dependency map.

---

## Phase 3 – Development Order Recommendation

Recommend the BEST order to build the website.

The recommendation must be based on:

- Lowest risk first
- Strong database foundation
- Reusable architecture
- Future mobile app compatibility
- Dependency management
- Ability to test incrementally

For every recommended module explain:

- Why it should be built now
- What future modules depend on it
- What database entities it requires

---

## Phase 4 – Define Milestone 1

Select ONLY ONE module to build first.

The selected module should:

- Unlock future development
- Minimize rework
- Be the most logical starting point
- Follow the actual business flow

Explain:

- Why this module should be first
- Why other modules should wait
- What success looks like when this module is completed

---

## Phase 5 – Milestone Completion Criteria

For the chosen first module provide:

### Functional Scope
Exactly what should be included.

### Out of Scope
Exactly what should NOT be built yet.

### Database Requirements
Required tables only.

### Pages Required
List pages.

### Components Required
List components.

### User Actions
List actions.

### Validation Rules
List validations.

### Test Scenarios
List testing scenarios.

### Completion Checklist
A checklist that clearly determines whether Milestone 1 is finished.

---

## Constraints

You must NOT:

- Generate code yet
- Generate SQL yet
- Generate Supabase schemas yet
- Generate APIs yet
- Generate UI designs yet

You must ONLY:

- Understand
- Analyze
- Plan
- Prioritize
- Recommend the best first module

Wait for approval after presenting the recommendation.

The goal is to establish the correct development sequence before implementation begins.
