# Mahallu Management System - Functional Requirements & Workflow Documentation
## A Simple Guide for Everyone

---

## 📖 Table of Contents

1. [What is This System?](#what-is-this-system)
2. [Who Can Use This System?](#who-can-use-this-system)
3. [Main Features Overview](#main-features-overview)
4. [Detailed Feature Descriptions](#detailed-feature-descriptions)
5. [Workflow Processes](#workflow-processes)
6. [How Different Parts Work Together](#how-different-parts-work-together)
7. [Common Tasks and How to Do Them](#common-tasks-and-how-to-do-them)

---

## What is This System?

The **Mahallu Management System** is a digital platform designed to help manage a Mahallu (local community/mosque administration). Think of it as a comprehensive digital office that helps organize:

- **People**: Families and their members in the community
- **Money**: Collections, payments, and financial records
- **Events**: Programs, meetings, and registrations
- **Organizations**: Committees, institutes, and madrasas
- **Documents**: Certificates, NOCs (No Objection Certificates), and registrations

### Why Do We Need This?

Instead of using paper files, spreadsheets, and manual record-keeping, this system:
- ✅ Keeps all information in one secure place
- ✅ Makes it easy to find information quickly
- ✅ Tracks money and collections automatically
- ✅ Generates reports instantly
- ✅ Ensures data security and privacy
- ✅ Allows multiple people to work together safely

---

## Who Can Use This System?

The system has **5 types of users**, each with different permissions:

### 1. **Super Admin** 👑
**Who they are:** The main administrator who manages the entire system

**What they can do:**
- Create and manage multiple Mahallus (tenants)
- See all data from all Mahallus
- Create and manage all types of users
- Access everything in the system
- Switch between different Mahallus to view their data

**Example:** A central administrator managing 10 different Mahallus across different locations

---

### 2. **Mahall Admin** 🏛️
**Who they are:** The administrator of a specific Mahallu

**What they can do:**
- Manage families and members in their Mahallu
- Create and manage users (Mahall users, Survey users, Institute users, Member users)
- Manage financial accounts and ledgers
- Handle registrations (Nikah, Death, NOC)
- Manage committees and meetings
- View reports and statistics
- Manage collectibles (Varisangya, Zakat)

**Example:** The secretary or president of a local Mahallu managing their community

---

### 3. **Institute User** 🏫
**Who they are:** Staff members who manage institute-related activities

**What they can do:**
- Manage institute accounts and financial records
- Create and manage categories, wallets, and ledgers
- Record income and expenses for institutes
- View institute-related data only

**Example:** An accountant or administrator working for a madrasa or educational institute

---

### 4. **Survey User** 📋
**Who they are:** Staff members who collect and manage survey data

**What they can do:**
- View and manage family and member information
- Update survey data
- Access basic information (but cannot manage users or finances)

**Example:** Field workers collecting information about families and members

---

### 5. **Member User** 👤
**Who they are:** Community members (individuals registered in the system) who can access their own information

**What they can do:**
- View their own profile and family information
- View their own payment history (Varisangya, Zakat)
- View their wallet balance and transactions
- Make online payments (if payment gateway integrated)
- Request registrations (Nikah, Death, NOC)
- View notifications sent to them
- Update their contact information (limited fields)
- View community programs and events
- Access public announcements and feeds

**What they cannot do:**
- Cannot see other members' information (except own family members)
- Cannot access administrative functions
- Cannot manage users or finances
- Cannot approve registrations
- Cannot view reports or statistics
- Cannot see inactive or deleted family members

**Example:** A community member who wants to check their payment history, make a Varisangya payment online, or request a NOC certificate

**Note:** Member users are linked to their Member record in the system. They log in using their phone number and can only access their own data and related family information. They can view their family members (active members only) using the family members endpoint.

---

## Main Features Overview

The system is organized into **15 main modules**:

| Module | What It Does | Who Uses It |
|--------|--------------|-------------|
| **Dashboard** | Shows overview statistics and quick insights | Everyone (Admin roles) |
| **Families** | Manages family records and information | Mahall Admin, Survey User |
| **Members** | Manages individual member details | Mahall Admin, Survey User, Member User (own profile) |
| **Users** | Creates and manages system users | Super Admin, Mahall Admin |
| **Institutes** | Manages educational and religious institutes | Mahall Admin |
| **Programs** | Manages community programs and events | Mahall Admin, Member User (view only) |
| **Madrasa** | Manages madrasa information | Mahall Admin |
| **Committees** | Manages committees and their members | Mahall Admin |
| **Meetings** | Records and manages committee meetings | Mahall Admin |
| **Registrations** | Handles Nikah, Death, and NOC registrations | Mahall Admin, Member User (request only) |
| **Collectibles** | Manages Varisangya and Zakat collections | Mahall Admin, Member User (own payments) |
| **Master Accounts** | Manages financial accounts and ledgers | Mahall Admin, Institute User |
| **Reports** | Generates various reports | Mahall Admin |
| **Social** | Manages banners, feeds, and support tickets | Mahall Admin, Member User (view feeds, create support tickets) |
| **Notifications** | Sends and manages notifications | Everyone |

---

## Detailed Feature Descriptions

### 1. Dashboard 📊

**What it shows:**
- Total number of families, members, and users
- Statistics about different areas and wards
- Quick overview of recent activities
- Charts showing distributions (by area, gender, etc.)

**How it works:**
- Automatically calculates numbers from the database
- Updates in real-time as data changes
- Shows different views based on user role

**Example:** When you log in, you immediately see "We have 150 families, 450 members, and 5 active users"

---

### 2. Families 👨‍👩‍👧‍👦

**What it does:**
- Stores information about each family in the Mahallu
- Tracks family location, contact details, and status
- Links members to their families

**Key Information Stored:**
- House name and number
- Family head name
- Contact number
- Address (ward, area, place, state, district, pin code)
- Varisangya grade (A, B, C, or D)
- Approval status (approved, unapproved, pending)

**Workflow:**
1. Family information is entered (by Survey User or Mahall Admin)
2. Status is set to "pending" initially
3. Mahall Admin reviews and approves/rejects
4. Approved families can be used for other operations

**Why it matters:**
- Helps organize community members
- Enables targeted communication
- Supports financial collections (Varisangya is based on family grade)
- Required before adding members

---

### 3. Members 👤

**What it does:**
- Stores detailed information about each individual member
- Links members to their families
- Tracks personal details like age, gender, blood group, education

**Key Information Stored:**
- Name and age
- Gender
- Blood group (for blood bank)
- Health status
- Phone number
- Education level
- Family relationship
- Status (active, inactive, deleted)

**Status Management:**
- **Active**: Member is active and visible in the system
- **Inactive**: Member is temporarily disabled, not shown in default views
- **Deleted**: Member is marked as deleted, not shown in default views
- Members are never permanently deleted - only their status changes
- When status changes, linked user account (if exists) is also updated

**Workflow:**
1. A family must exist first
2. Member details are added
3. Member is linked to their family
4. Member status is set to "active" by default
5. Member can be used in registrations, collections, etc.
6. To remove a member from view, change status to "inactive" or "deleted"

**Why it matters:**
- Enables personalized services
- Supports blood bank database
- Required for registrations (Nikah, Death)
- Helps track community demographics
- Status-based management preserves data history

**Note:** A "Member" is a data record (a person in the system). A "Member User" is a user account that allows a member to log in and access their own information. Not all members need to be Member Users - only those who want to access the system themselves.

---

### 4. Users 👥

**What it does:**
- Creates and manages system users
- Assigns roles and permissions
- Controls who can access what

**User Types:**
- **Mahall Users**: Full access to Mahallu operations
- **Survey Users**: Can view and update survey data
- **Institute Users**: Can manage institute finances
- **Member Users**: Can access their own information only

**Status Management:**
- **Active**: User can login and access the system
- **Inactive**: User cannot login, account is disabled
- Users are never permanently deleted - only their status changes
- When member user status changes, linked member status is also updated

**Workflow:**
1. Super Admin or Mahall Admin creates a new user
2. User details are entered (name, phone, email)
3. Role is assigned
4. Default password is set (user can change later)
5. User status is set to "active" by default
6. User receives login credentials
7. To disable a user, change status to "inactive" (not delete)

**Security:**
- Each user has their own login
- Passwords are encrypted
- Users can only see data from their assigned Mahallu
- Activity is logged for security
- Status-based access control ensures inactive users cannot login

---

### 5. Institutes 🏫

**What it does:**
- Manages information about educational and religious institutes
- Links institutes to financial accounts
- Tracks institute details and activities

**Key Information Stored:**
- Institute name and type
- Address and contact details
- Status (active/inactive)
- Related programs and activities

**Why it matters:**
- Organizes different institutes under the Mahallu
- Links to financial management
- Supports program management

---

### 6. Programs 📅

**What it does:**
- Manages community programs and events
- Tracks program details, dates, and participants
- Organizes community activities

**Key Information Stored:**
- Program name and description
- Date and time
- Location
- Organizer details
- Status

**Why it matters:**
- Helps plan and organize community events
- Tracks program history
- Enables better event management

---

### 7. Madrasa 📚

**What it does:**
- Manages madrasa-specific information
- Tracks students, teachers, and activities
- Links to educational programs

**Key Information Stored:**
- Madrasa name and address
- Contact information
- Capacity and current enrollment
- Related programs

**Why it matters:**
- Centralizes madrasa information
- Supports educational planning
- Links to institute accounts for financial management

---

### 8. Committees 👥

**What it does:**
- Manages different committees in the Mahallu
- Tracks committee members and their roles
- Links committees to meetings

**Key Information Stored:**
- Committee name and type
- Members and their roles
- Formation date
- Status

**Why it matters:**
- Organizes committee structure
- Enables meeting management
- Tracks committee activities

---

### 9. Meetings 📝

**What it does:**
- Records committee meetings
- Stores meeting minutes and decisions
- Links meetings to committees

**Key Information Stored:**
- Meeting date and time
- Committee name
- Agenda items
- Decisions made
- Attendees

**Why it matters:**
- Maintains meeting records
- Tracks decisions and actions
- Provides historical record

---

### 10. Registrations 📄

**What it does:**
- Handles three types of registrations:
  1. **Nikah Registration**: Marriage registrations
  2. **Death Registration**: Death certificate registrations
  3. **NOC (No Objection Certificate)**: Various certificate requests

#### Nikah Registration 💒

**What it stores:**
- Groom and bride names and ages
- Nikah date
- Witness details
- Mahr (dower) information
- Status (pending/approved/rejected)

**Workflow:**
1. Application is submitted with groom and bride details
2. Status is set to "pending"
3. Mahall Admin reviews and approves/rejects
4. Approved registrations can be used for NOC generation

#### Death Registration ⚱️

**What it stores:**
- Deceased person's name
- Death date and place
- Cause of death
- Informant details
- Status (pending/approved/rejected)

**Workflow:**
1. Death is reported with details
2. Status is set to "pending"
3. Mahall Admin verifies and approves
4. Death certificate can be issued

#### NOC (No Objection Certificate) 📜

**What it stores:**
- Applicant name and details
- Purpose of NOC
- Type (common or nikah-related)
- Issue and expiry dates
- Status (pending/approved/rejected)

**Workflow:**
1. Applicant requests NOC with purpose
2. If for Nikah, links to Nikah registration
3. Status is set to "pending"
4. Mahall Admin reviews and approves/rejects
5. NOC is issued with dates

**Why it matters:**
- Digitizes registration processes
- Reduces paperwork
- Maintains proper records
- Enables quick certificate generation

---

### 11. Collectibles 💰

**What it does:**
- Manages two types of collections:
  1. **Varisangya**: Regular monthly/annual contributions from families
  2. **Zakat**: Charitable contributions

#### Varisangya 💵

**What it stores:**
- Family or member name
- Amount paid
- Payment date
- Payment method (cash, bank transfer, etc.)
- Receipt number
- Remarks

**Types:**
- **Family Varisangya**: Paid by family (based on family grade)
- **Member Varisangya**: Paid by individual member

**Workflow:**
1. Payment is received from family or member
2. Amount and details are recorded
3. Payment is linked to family/member wallet
4. Wallet balance is updated automatically
5. Receipt can be generated

#### Zakat 🕌

**What it stores:**
- Payer name
- Amount
- Payment date
- Payment method
- Category
- Receipt number

**Workflow:**
1. Zakat payment is received
2. Details are recorded
3. Payment is categorized
4. Receipt is generated

**Wallet System:**
- Each family and member has a wallet
- Payments automatically update wallet balance
- Transaction history is maintained
- Can view wallet balance and transactions

**Why it matters:**
- Automates collection tracking
- Maintains financial records
- Generates receipts automatically
- Tracks payment history
- Supports financial reporting

---

### 12. Master Accounts 💳

**What it does:**
- Manages financial accounts for institutes
- Tracks income and expenses
- Maintains ledgers and categories
- Manages wallets (main, reserve, charity)

**Components:**

#### Institute Accounts 🏢
- Links to institutes
- Tracks account details and balances

#### Categories 📂
- Income categories (donations, fees, etc.)
- Expense categories (salaries, maintenance, etc.)

#### Wallets 💼
- **Main Wallet**: Primary operating account
- **Reserve Wallet**: Savings/reserve funds
- **Charity Wallet**: Charitable funds

#### Ledgers 📖
- Income ledgers
- Expense ledgers
- Tracks all financial transactions

#### Ledger Items 📝
- Individual income/expense entries
- Links to categories and ledgers
- Records date, amount, description

**Workflow:**
1. Institute account is created
2. Categories are set up (income and expense)
3. Wallets are created (main, reserve, charity)
4. Ledgers are created for tracking
5. Transactions are recorded as ledger items
6. Balances are updated automatically

**Why it matters:**
- Maintains proper financial records
- Tracks income and expenses
- Supports budgeting and planning
- Enables financial reporting
- Ensures transparency

---

### 13. Reports 📊

**What it does:**
- Generates various reports for analysis
- Provides insights into community data

**Report Types:**

#### Area Report 🗺️
- Shows family and member distribution by area
- Helps understand geographic distribution

#### Blood Bank Report 🩸
- Lists all members with blood group information
- Helps organize blood donation drives
- Enables quick search for blood donors

#### Orphans Report 👶
- Identifies orphaned children in the community
- Helps organize support programs

**Why it matters:**
- Provides data-driven insights
- Supports decision-making
- Helps plan programs and services
- Enables better resource allocation

---

### 14. Social 🌐

**What it does:**
- Manages social media-like features
- Handles community communication

**Components:**

#### Banners 🎨
- Displays announcements and important messages
- Shown on dashboard or public pages

#### Feeds 📰
- Community news and updates
- Information sharing platform

#### Activity Logs 📋
- Records all system activities
- Tracks who did what and when
- Security and audit trail

#### Support Tickets 🎫
- Community members can raise support requests
- Track and resolve issues
- Communication channel

**Why it matters:**
- Improves community communication
- Maintains activity records
- Provides support mechanism
- Enhances engagement

---

### 15. Notifications 🔔

**What it does:**
- Sends notifications to users
- Keeps users informed about important updates

**Types:**
- System notifications
- Approval requests
- Important announcements
- Reminders

**Features:**
- Mark as read/unread
- Mark all as read
- Notification history

**Why it matters:**
- Keeps users informed
- Ensures timely responses
- Improves communication

---

## Workflow Processes

### Workflow 1: Adding a New Family and Members

**Step-by-step process:**

1. **Login** → User logs into the system
2. **Navigate to Families** → Click on "Families" menu
3. **Create Family** → Click "Add New Family"
4. **Enter Family Details**:
   - House name (required)
   - Family head name
   - Contact number
   - Address details (ward, area, place, state, district, pin code)
   - Varisangya grade (A, B, C, or D)
5. **Save Family** → Family is created with "pending" status
6. **Approve Family** → Mahall Admin reviews and approves
7. **Add Members** → Navigate to Members → Add New Member
8. **Link to Family** → Select the approved family
9. **Enter Member Details**:
   - Name (required)
   - Age, gender
   - Blood group
   - Health status
   - Phone number
   - Education
10. **Save Member** → Member is added to the family

**Why this order matters:**
- Family must exist before members can be added
- Family must be approved before it can be used in other operations
- Members are automatically linked to their family

---

### Workflow 2: Recording a Varisangya Payment

**Step-by-step process:**

1. **Login** → Mahall Admin logs in
2. **Navigate to Collectibles** → Click on "Varisangya"
3. **Select Type** → Choose "Family Varisangya" or "Member Varisangya"
4. **Create Payment** → Click "Add New Payment"
5. **Select Family/Member** → Choose from approved families/members
6. **Enter Payment Details**:
   - Amount (required)
   - Payment date (required)
   - Payment method (cash, bank transfer, etc.)
   - Receipt number (optional)
   - Remarks (optional)
7. **Save Payment** → Payment is recorded
8. **Automatic Updates**:
   - Wallet balance is updated automatically
   - Transaction is recorded in wallet history
   - Receipt can be generated

**What happens automatically:**
- Wallet balance increases
- Transaction history is updated
- Payment is linked to family/member
- Can be used in reports

---

### Workflow 3: Processing a Nikah Registration

**Step-by-step process:**

1. **Login** → Mahall Admin logs in
2. **Navigate to Registrations** → Click on "Nikah Registrations"
3. **Create Registration** → Click "Add New Registration"
4. **Enter Groom Details**:
   - Name (required)
   - Age
   - Link to member (if exists in system)
5. **Enter Bride Details**:
   - Name (required)
   - Age
   - Link to member (if exists in system)
6. **Enter Nikah Details**:
   - Nikah date (required)
   - Wali name
   - Witness 1 and Witness 2
   - Mahr amount and description
7. **Save Registration** → Status is set to "pending"
8. **Review** → Mahall Admin reviews the registration
9. **Approve/Reject** → Change status to "approved" or "rejected"
10. **Generate NOC** (if needed):
    - Navigate to NOC
    - Create NOC linked to this Nikah registration
    - Approve and issue NOC

**Why this matters:**
- Maintains proper marriage records
- Enables certificate generation
- Supports NOC requests
- Provides legal documentation

---

### Workflow 4: Managing Institute Finances

**Step-by-step process:**

1. **Create Institute Account**:
   - Navigate to Master Accounts → Institute Accounts
   - Create account for the institute
   - Link to institute

2. **Set Up Categories**:
   - Navigate to Categories
   - Create income categories (donations, fees, etc.)
   - Create expense categories (salaries, maintenance, etc.)

3. **Create Wallets**:
   - Navigate to Wallets
   - Create Main Wallet
   - Create Reserve Wallet (optional)
   - Create Charity Wallet (optional)

4. **Create Ledgers**:
   - Navigate to Ledgers
   - Create Income Ledger
   - Create Expense Ledger

5. **Record Transactions**:
   - Navigate to Ledger Items
   - For Income: Select income ledger, category, wallet
   - Enter amount, date, description
   - Save → Wallet balance increases
   - For Expense: Select expense ledger, category, wallet
   - Enter amount, date, description
   - Save → Wallet balance decreases

6. **View Reports**:
   - Check wallet balances
   - View transaction history
   - Generate financial reports

**Why this structure:**
- Maintains proper accounting
- Separates income and expenses
- Tracks different fund types
- Enables financial reporting

---

### Workflow 5: Creating and Managing Users

**Step-by-step process:**

1. **Login** → Super Admin or Mahall Admin logs in
2. **Navigate to Users** → Click on "Users" menu
3. **Select User Type**:
   - Mahall Users (for Mahall Admin)
   - Survey Users (for survey staff)
   - Institute Users (for institute staff)
   - Member Users (for community members)
4. **Create User** → Click "Add New User"
5. **Enter User Details**:
   - Name (required)
   - Phone number (required, used for login)
   - Email (optional)
   - Role is automatically set based on user type
   - For Member Users: Link to existing Member record (optional)
6. **Save User** → User is created with default password
7. **User Receives Credentials**:
   - Phone number (for login)
   - Default password
   - User can change password after first login
8. **User Can Login**:
   - Uses phone number and password
   - Or uses OTP (One-Time Password) sent to phone

**Special Note for Member Users:**
- Member users are typically created from existing Member records
- They can only access their own information
- Their access is limited to viewing their profile, payments, and making requests
- They cannot access administrative functions

**Security Features:**
- Each user has unique login
- Passwords are encrypted
- Users can only access their Mahallu's data
- Member users can only see their own data
- Activity is logged

---

## How Different Parts Work Together

### Data Relationships

The system works like a web where everything is connected:

```
Tenant (Mahallu)
    │
    ├─── Users (who can access)
    │
    ├─── Families
    │       │
    │       ├─── Members (belong to families)
    │       │
    │       └─── Varisangya Payments (family-level)
    │
    ├─── Members
    │       │
    │       ├─── Varisangya Payments (member-level)
    │       │
    │       ├─── Nikah Registration (groom/bride)
    │       │
    │       ├─── Death Registration (deceased)
    │       │
    │       └─── NOC (applicant)
    │
    ├─── Institutes
    │       │
    │       └─── Master Accounts (financial management)
    │
    ├─── Committees
    │       │
    │       └─── Meetings (committee meetings)
    │
    ├─── Programs
    │
    ├─── Madrasa
    │
    └─── Collectibles (Varisangya, Zakat)
```

### How Data Flows

**Example: Complete Varisangya Collection Flow**

1. **Family is Created** → Family record exists
2. **Members are Added** → Members linked to family
3. **Payment is Received** → Varisangya payment recorded
4. **Wallet is Updated** → Family/member wallet balance increases
5. **Transaction is Logged** → Transaction history updated
6. **Report is Generated** → Can see collection statistics

**Example: Registration to Certificate Flow**

1. **Member Exists** → Member record in system
2. **Nikah Registration** → Marriage is registered
3. **Registration Approved** → Status changed to approved
4. **NOC Requested** → NOC application created
5. **NOC Linked** → NOC linked to Nikah registration
6. **NOC Approved** → Certificate is issued
7. **NOC Expires** → System tracks expiry date

### Multi-Tenancy (Multiple Mahallus)

**How it works:**
- Each Mahallu is a separate "tenant"
- Each tenant has its own data
- Users can only see their tenant's data
- Super Admin can see all tenants
- Super Admin can switch between tenants

**Example:**
- Mahallu A has 100 families
- Mahallu B has 150 families
- Mahall Admin of Mahallu A can only see 100 families
- Super Admin can see all 250 families
- Member User from Mahallu A can only see their own profile and data
- Data is completely separated and secure

---

### Workflow 6: Member User Login and Self-Service

**Step-by-step process for Member Users:**

1. **Member User Login**:
   - Member User opens the system
   - Enters phone number (registered phone)
   - Chooses login method:
     - Password login (if password is set)
     - OTP login (One-Time Password sent to phone)

2. **After Login - Dashboard View**:
   - Sees personalized dashboard
   - Shows their own profile summary
   - Shows their wallet balance
   - Shows recent payments
   - Shows pending requests (if any)

3. **View Own Profile**:
   - Navigate to "My Profile"
   - View personal information
   - View family information (their family only)
   - Update contact details (limited fields)

4. **View Payment History**:
   - Navigate to "My Payments"
   - View all Varisangya payments made
   - View Zakat payments made
   - View transaction history
   - Download receipts

5. **View Wallet**:
   - Navigate to "My Wallet"
   - View current balance
   - View all transactions
   - See payment dates and amounts

6. **Make Payment Request** (if online payment integrated):
   - Navigate to "Make Payment"
   - Select payment type (Varisangya/Zakat)
   - Enter amount
   - Choose payment method
   - Complete payment
   - Receive confirmation

7. **Request Registration**:
   - Navigate to "My Requests"
   - Request Nikah Registration
   - Request Death Registration
   - Request NOC
   - Track request status

8. **View Notifications**:
   - Navigate to "Notifications"
   - View all notifications sent to them
   - Mark notifications as read

9. **View Community Information**:
   - View community programs and events
   - View announcements and feeds
   - View public banners

10. **View Family Members**:
    - Navigate to "My Family Members"
    - View all active members from their family
    - See family member details (name, age, gender, etc.)
    - Only active members are shown (inactive/deleted are hidden)

**Security for Member Users:**
- Can only access their own data
- Cannot see other members' information (except own family members)
- Cannot access administrative functions
- All actions are logged
- Data is protected by tenant isolation
- Can only see active family members (inactive/deleted are hidden)

**Note:** Member users can view their family members using the `/api/member-user/family-members` endpoint. Only active members are shown by default.

---

## Common Tasks and How to Do Them

### Task 1: Approve a Pending Family

**Steps:**
1. Login as Mahall Admin
2. Go to Families → Unapproved Families
3. Find the family you want to approve
4. Click on the family to view details
5. Click "Approve" button
6. Family status changes to "approved"
7. Family can now be used in other operations

**Why approve?**
- Ensures data quality
- Prevents incorrect data entry
- Required before using family in payments or registrations

---

### Task 2: Generate a Report

**Steps:**
1. Login
2. Go to Reports
3. Select report type (Area, Blood Bank, Orphans)
4. Apply filters if needed (date range, area, etc.)
5. Click "Generate Report"
6. View report on screen
7. Export if needed (PDF, Excel)

**What reports show:**
- Statistics and numbers
- Charts and graphs
- Detailed lists
- Summary information

---

### Task 3: Send a Notification

**Steps:**
1. Login
2. Go to Notifications
3. Click "Create Notification"
4. Enter notification details:
   - Title
   - Message
   - Target users (all or specific)
5. Click "Send"
6. Users receive notification

**When to use:**
- Important announcements
- Approval requests
- Reminders
- Updates

---

### Task 4: View Wallet Balance

**Steps:**
1. Login
2. Go to Collectibles → Wallets
3. Select wallet type (Family or Member)
4. Search for family/member
5. View wallet balance
6. Click to see transaction history

**What you can see:**
- Current balance
- All transactions
- Payment dates
- Payment amounts
- Transaction types

---

### Task 5: Search for a Member

**Steps:**
1. Login
2. Go to Members
3. Use search bar
4. Enter member name or phone number
5. Results appear instantly
6. Click on member to view full details

**What you can see:**
- Member details
- Family information
- Payment history
- Registration history
- Related records
- Member status (active/inactive/deleted)

---

### Task 6: Change Member or User Status

**Steps:**
1. Login as Mahall Admin or Super Admin
2. Go to Members or Users
3. Find the member/user you want to update
4. Click on the member/user to view details
5. Click "Update Status" or use status dropdown
6. Select new status:
   - **Active**: Make visible and usable
   - **Inactive**: Hide from default views (temporary)
   - **Deleted**: Mark as deleted (members only)
7. Save changes

**What happens:**
- Member/User status is updated
- If member user, linked user account status is also updated
- Record is hidden/shown based on status
- Data is preserved (not deleted)

**Why use status instead of delete:**
- Preserves data history
- Allows recovery if needed
- Maintains relationships with other records
- Better for auditing and reporting

---

## Key Concepts Explained Simply

### What is "Tenant"?

**Simple Explanation:**
A tenant is like a separate organization. Each Mahallu is a tenant. Just like different companies have separate offices, different Mahallus have separate data spaces.

**Example:**
- Tenant 1 = Mahallu A (Kochi)
- Tenant 2 = Mahallu B (Calicut)
- Each has its own families, members, and data
- They don't see each other's data

---

### What is "Status"?

**Simple Explanation:**
Status tells you the current state of a record. Like a traffic light, it shows what condition something is in.

**For Families and Registrations:**
- 🟡 **Pending** = Waiting for approval
- 🟢 **Approved** = Ready to use
- 🔴 **Rejected** = Not approved

**For Members and Users:**
- 🟢 **Active** = Currently active and visible in the system
- 🟡 **Inactive** = Temporarily disabled, not shown in default views
- 🔴 **Deleted** = Marked as deleted, not shown in default views (members only)

**Important Notes:**
- Members and Users are **never permanently deleted** - only their status changes
- This preserves data history and allows recovery if needed
- When you "delete" a member or user, it actually changes their status
- Frontend automatically filters to show only active records by default
- To see inactive/deleted records, use status filter in search

**Example:**
- Family status: "pending" → needs approval
- Family status: "approved" → can be used
- Registration status: "pending" → waiting for review
- Member status: "active" → visible and can be used
- Member status: "inactive" → hidden from default views
- User status: "active" → can login
- User status: "inactive" → cannot login

---

### What is "Wallet"?

**Simple Explanation:**
A wallet is like a digital bank account. It stores money balance and transaction history.

**Example:**
- Family wallet balance: ₹5,000
- Member makes payment: ₹500
- New balance: ₹5,500
- Transaction is recorded automatically

---

### What is "Role"?

**Simple Explanation:**
Role determines what a user can do in the system. Like job titles:
- Super Admin = CEO (can do everything)
- Mahall Admin = Manager (can manage their Mahallu)
- Institute User = Accountant (can manage finances)
- Survey User = Field Worker (can collect data)

---

## Security and Privacy

### How Data is Protected

1. **User Authentication:**
   - Each user has unique login
   - Passwords are encrypted
   - OTP verification available

2. **Data Isolation:**
   - Each Mahallu's data is separate
   - Users can only see their Mahallu's data
   - Super Admin can see all (for management)

3. **Activity Logging:**
   - All actions are recorded
   - Who did what and when
   - Security audit trail

4. **Access Control:**
   - Role-based permissions
   - Users can only access allowed features
   - Protected routes and data

---

## Best Practices

### For Data Entry

1. ✅ **Enter complete information** - Fill all required fields
2. ✅ **Verify before approving** - Check details before approval
3. ✅ **Use consistent formats** - Follow naming conventions
4. ✅ **Link related records** - Connect families, members, payments
5. ✅ **Add remarks** - Include notes for important records

### For Financial Management

1. ✅ **Record immediately** - Enter payments as soon as received
2. ✅ **Verify amounts** - Double-check payment amounts
3. ✅ **Generate receipts** - Always create receipts for payments
4. ✅ **Regular reconciliation** - Check balances regularly
5. ✅ **Keep backups** - Export reports regularly

### For User Management

1. ✅ **Assign appropriate roles** - Give users correct permissions
2. ✅ **Use strong passwords** - Encourage password changes
3. ✅ **Review access regularly** - Remove unused accounts
4. ✅ **Train users** - Ensure users understand their role
5. ✅ **Monitor activity** - Check activity logs regularly

---

## Troubleshooting Common Issues

### Issue: Cannot see families/members

**Possible Causes:**
- Family not approved (check status)
- Member/User status is inactive or deleted (check status)
- Wrong tenant selected (check tenant switcher)
- User doesn't have permission (check role)
- Default view shows only active records

**Solution:**
- Approve pending families
- Check member/user status (should be active)
- Use status filter to see inactive/deleted records
- Check tenant selection
- Verify user role and permissions

---

### Issue: Payment not updating wallet

**Possible Causes:**
- Family/member not selected correctly
- Payment not saved properly
- Wallet doesn't exist

**Solution:**
- Verify family/member selection
- Check payment was saved successfully
- Ensure wallet exists (created automatically)

---

### Issue: Cannot approve registration

**Possible Causes:**
- User doesn't have permission
- Registration details incomplete
- Related records missing

**Solution:**
- Check user role (must be Mahall Admin)
- Verify all required fields filled
- Ensure related members/families exist

---

## Glossary of Terms

| Term | Simple Explanation |
|------|-------------------|
| **Mahallu** | Local community/mosque administration |
| **Tenant** | Separate organization/Mahallu in the system |
| **Family** | A household unit in the community |
| **Member** | Individual person in a family |
| **Varisangya** | Regular contribution/payment from families |
| **Zakat** | Charitable contribution |
| **Nikah** | Islamic marriage ceremony |
| **NOC** | No Objection Certificate |
| **Wallet** | Digital account storing balance |
| **Ledger** | Financial record book |
| **Status** | Current state - For Families/Registrations: pending/approved/rejected. For Members: active/inactive/deleted. For Users: active/inactive |
| **Role** | User's permission level (super_admin, mahall, institute, survey, member) |
| **Dashboard** | Overview page showing statistics |
| **Report** | Summary of data in readable format |

---

## Conclusion

This Mahallu Management System is designed to:
- ✅ Simplify community management
- ✅ Digitize records and processes
- ✅ Improve efficiency and accuracy
- ✅ Ensure data security and privacy
- ✅ Enable better decision-making through reports
- ✅ Support multiple Mahallus in one system

**Remember:**
- Start with families, then add members
- Always approve families before using them
- Record payments immediately
- Generate receipts for all transactions
- Review and approve registrations promptly
- Use reports to understand your community better

---

## Support and Help

If you need help:
1. Check this documentation
2. Review workflow guides
3. Contact system administrator
4. Check activity logs for errors
5. Review user permissions

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**For:** Mahallu Management System Users

