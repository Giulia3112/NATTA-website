# AIpply - Project TODO

## Database & Backend
- [ ] Create opportunities table with mock data
- [ ] Create applications table to track user submissions
- [ ] Create procedures for opportunities CRUD operations
- [ ] Create procedures for applications CRUD operations
- [ ] Implement conflict detection logic (overlapping dates)

## Pages & Navigation
- [x] Home page (landing) with hero, features, social proof
- [ ] What is AIpply page (mission, beliefs, product pillars)
- [x] About page (story, problem, solution)
- [x] FAQ page (pricing, mobile app, countries, features)
- [x] Opportunities search page with filters and results
- [ ] Application details modal/page
- [x] User dashboard with Kanban board
- [x] Calendar view with conflict checking
- [x] Navigation structure and routing

## Features - Opportunities Search
- [x] Search bar with keyword query
- [x] Filter by opportunity type (Scholarship, Fellowship, Accelerator, etc.)
- [x] Filter by stage (High school, Undergraduate, Graduate, etc.)
- [x] Filter by region eligibility (Global, Africa, India, Brazil, etc.)
- [ ] Filter by deadline range (date picker)
- [x] Filter by mode (Online, In-person, Hybrid)
- [x] Filter by field/industry tags (Tech, Business, Climate, etc.)
- [x] Filter by funding type (Fully funded, Partial, Stipend, etc.)
- [ ] Sorting options (Deadline soonest, Most relevant, Highest funding)
- [x] Results list with opportunity cards
- [ ] Save opportunity functionality
- [ ] View opportunity details

## Features - Application Management
- [x] Kanban board with columns: Applied, In Progress, Accepted, Rejected
- [x] Application cards showing opportunity name, deadline, status, docs checklist
- [x] Add application modal with form
- [x] Edit application status
- [x] Delete application
- [x] Application notes/comments
- [ ] Required documents checklist per application

## Features - Calendar & Conflict Detection
- [x] Calendar view (month + agenda views)
- [x] Display application deadlines on calendar
- [ ] Display program start/end dates
- [x] Automatic conflict detection (overlapping accepted opportunities)
- [x] Conflict warning notifications
- [ ] Visual indicators for conflicts

## Design System
- [x] Color palette (neon blue, white, light gray, light blue)
- [x] Glassmorphism components
- [x] Subtle gradients and shadows
- [x] Responsive layout (mobile-first)
- [x] Typography hierarchy
- [x] Smooth animations
- [ ] Accessibility (high contrast, keyboard navigation)

## UI Components
- [ ] Sticky top navigation with CTA
- [ ] Hero section with headline and CTAs
- [ ] Feature cards with icons
- [ ] Opportunity cards
- [ ] Application cards
- [ ] Kanban board UI
- [ ] Calendar component
- [ ] Filter sidebar/panel
- [ ] Modal dialogs
- [ ] Toast notifications
- [ ] Footer with links

## Testing & Polish
- [ ] Test authentication flow
- [ ] Test opportunity search and filters
- [ ] Test application CRUD operations
- [ ] Test Kanban board interactions
- [ ] Test calendar and conflict detection
- [ ] Test responsive design on mobile
- [ ] Test accessibility (keyboard navigation, contrast)
- [ ] Performance optimization
- [ ] Cross-browser testing

## Profile Page (NEW)
- [x] Create user profile page with edit functionality
- [x] Add fields for name, email, bio, interests/tags
- [x] Implement interests selector with predefined tags
- [x] Add CEO personalized message about curated opportunities
- [x] Display user statistics (total applications, accepted, etc.)
- [x] Add logout button
- [ ] Save profile changes to database

## Saved Opportunities Feature (NEW)
- [x] Create SavedOpportunities page with list view
- [x] Add heart/bookmark icon to opportunity cards
- [x] Implement save/unsave functionality with localStorage
- [ ] Show saved count badge on navigation
- [x] Add remove from saved button on detail view
- [x] Sync saved state across pages
- [x] Add "Apply Now" button on saved opportunities page

## Opportunity Detail Page (NEW)
- [x] Create opportunity detail page component
- [x] Display complete opportunity information
- [x] Show requirements and eligibility criteria
- [x] Display application process steps
- [x] Add "Apply Now" button that opens application modal
- [x] Add "Save" button to save opportunity
- [x] Show related opportunities
- [x] Add back navigation

## Calendar Conflict Visual Indicators (NEW)
- [x] Add visual conflict indicators on calendar dates
- [x] Highlight overlapping accepted opportunities
- [x] Show conflict warnings with details
- [x] Add color coding for conflict severity
- [x] Display program start and end dates on calendar

## Deployment
- [ ] Create checkpoint before publishing
- [ ] Publish to production

## Login Page Customization (NEW)
- [ ] Add AIpply logo to login page via VITE_APP_LOGO
- [ ] Upload logo to S3 and configure environment variable

## Database & Backend Implementation (NEW)
- [x] Review current database schema and backend routers
- [x] Implement missing CRUD operations for applications
- [x] Implement missing CRUD operations for saved opportunities
- [x] Connect frontend to real database instead of mock data
- [ ] Add user profile update functionality
- [x] Test all database operations

## AI-Powered Opportunity Scraper (NEW)
- [x] Create scraper script for 2-3 trustworthy opportunity websites
- [x] Implement LLM-powered data extraction from scraped pages
- [x] Add opportunity validation and deduplication logic
- [x] Create admin review dashboard for scraped opportunities
- [x] Implement auto-upload to database after admin approval
- [ ] Add scheduled job to run scraper daily/weekly
- [x] Create backend endpoints for scraper management

## Expand Scraper Website Coverage (NEW)
- [x] Add OpportunityDesk.org to scraper targets
- [x] Add F6S.com programs to scraper targets
- [x] Add OpportunitiesCorners.com to scraper targets
- [x] Add PartiuIntercambio.org (Brazilian scholarships) to scraper targets
- [x] Add OpportunityTracker.ug (Uganda opportunities) to scraper targets

## Restrict Scraper Access (NEW)
- [x] Add email-based access control to scraper endpoints
- [x] Only allow alvaresgiulia@gmail.com to activate scraper
- [x] Update admin dashboard to show access restriction message

## Add Scraper Link to Admin Profile (NEW)
- [x] Add "AI Scraper" button/link to Profile page for admin users
- [x] Show scraper access badge for authorized email
- [ ] Add quick stats (pending opportunities count)

## Automated Scraping & Manual Opportunity Creation (NEW)
- [x] Implement scheduled scraping task to run every 2 days
- [x] Create cron job or scheduled task for automatic scraping
- [x] Add manual opportunity creation form to admin profile
- [x] Create backend endpoint for manual opportunity creation
- [x] Add validation for manual opportunity input
- [x] Display manual opportunities alongside scraped ones

## Add New Websites to Scraper (NEW)
- [x] Add Sebrae Startups programs (programas.sebraestartups.com.br)
- [x] Add Station F programs (stationf.co/programs/all)
- [x] Add Fulbright Brazil scholarships (fulbright.org.br/bolsas-para-brasileiros)
- [x] Add Opportunities Plus (opportunitiesplus.com/opportunities)

## Update Home Page Tagline (NEW)
- [x] Change tagline from "Built for emerging markets" to "Focused in emerging markets made for rising talents"

## Connect Opportunities to Database (NEW)
- [x] Add database query functions for fetching opportunities
- [x] Create tRPC endpoint for opportunities.list with filters
- [x] Create tRPC endpoint for opportunities.getById
- [x] Update Opportunities page to use database instead of mock data
- [x] Update OpportunityDetail page to fetch from database
- [x] Test search and filters with real data

## User Profile Persistence (NEW)
- [x] Update database schema to add bio and interests fields to users table
- [x] Push database migration for new fields
- [x] Create backend endpoint for updating user profile
- [x] Connect Profile page to save bio and interests
- [x] Test profile data persistence across sessions

## Add Favicon (NEW)
- [x] Convert AIpply logo to favicon format
- [x] Add favicon to client/public directory
- [x] Update HTML to reference favicon

## Admin Delete Opportunity (NEW)
- [x] Create backend endpoint for deleting opportunities (admin only)
- [x] Add delete button to OpportunityDetail page for admin users
- [ ] Add delete functionality to AdminScraper pending opportunities
- [x] Add confirmation dialog before deletion
- [x] Test deletion with database cleanup

## Fix JSON Parsing Bug in Opportunities Page (NEW)
- [x] Diagnose TypeError: fields.slice().map is not a function
- [x] Fix backend to parse JSON fields (fields, regions) before returning
- [x] Ensure all opportunity data has properly parsed arrays
- [x] Test Opportunities page with database data
- [x] Verify all tests still pass

## Update Favicon with New Logo (NEW)
- [x] Convert new AIpply logo to favicon formats (16x16, 32x32, 180x180)
- [x] Replace favicon.ico and PNG files in public directory
- [x] Test favicon displays correctly in browser tabs
- [x] Verify apple-touch-icon works on mobile devices

## Fix Login Issue for Users (URGENT)
- [ ] Check authentication logs for error messages
- [ ] Verify OAuth configuration and callback URL
- [ ] Test login flow with different user accounts
- [ ] Identify and fix root cause of login failures
- [ ] Verify all users can successfully log in

## Create Support Email for OAuth Configuration (NEW)
- [x] Draft professional email to Manus support
- [x] Include error message details
- [x] Specify callback URL to be registered
- [x] Provide project information
- [ ] Send email to support@manus.im

## Add Undefined/Rolling Deadline Support (NEW)
- [x] Update database schema to allow null deadline values
- [x] Update backend validation to accept null deadlines
- [x] Update manual opportunity form with "Rolling/No Deadline" checkbox
- [x] Update frontend display to show "Rolling Basis" for null deadlines
- [x] Update filters to handle opportunities without deadlines
- [x] Test creating and displaying opportunities with undefined deadlines

## Fix Favicon (Reapply Logo)
- [x] Verify current favicon files in public directory
- [x] Convert AIpply logo to all favicon formats (16x16, 32x32, 180x180, ico)
- [x] Replace favicon files in client/public
- [x] Test favicon displays correctly in browser

## Add Multi-stage Category for Startups
- [x] Add "Multi-stage" to STAGES constant in AddOpportunity.tsx
- [x] Update database schema enum to include Multi-stage
- [x] Test creating opportunity with Multi-stage selection
- [x] Verify Multi-stage displays correctly in all pages

## Restructure Funding System
- [x] Remove "Paid" from funding types enum
- [x] Add "Not certain" to funding types enum
- [x] Add new "fee" field to database schema (enum: No-fee, Paid)
- [x] Update AddOpportunity form with separate Fee field
- [x] Update all pages to display fee information
- [x] Migrate existing "Paid" opportunities to appropriate funding + fee combination
- [x] Test new funding structure

## Expand Opportunity Fields for Science-Based Categories
- [x] Add comprehensive scientific fields (Physics, Chemistry, Biology, Mathematics, etc.)
- [x] Add social sciences (Psychology, Sociology, Anthropology, Economics)
- [x] Add humanities (Literature, History, Philosophy, Languages)
- [x] Add medical/health sciences (Medicine, Nursing, Public Health, Pharmacy)
- [x] Update FIELDS constant in all pages (AddOpportunity, Opportunities, etc.)
- [x] Update scraper LLM prompts with new field categories
- [x] Test field selection and filtering with expanded options

## Activate Application Count in Profile
- [x] Investigate current profile page to find count display
- [x] Create backend endpoint to count applications by status
- [x] Update profile UI to fetch real application counts from database
- [x] Display counts for Applied, In Progress, Accepted, Rejected statuses
- [x] Test counts update when applications change status in kanban

## Admin Early Notification System
- [x] Create backend endpoint to list all subscribed users
- [x] Create backend endpoint to send notifications to users
- [x] Create AdminUsers page to display all registered users
- [x] Add notification sending interface with opportunity selection
- [x] Implement "Send to All" and "Send to Selected" functionality
- [ ] Add notification history/log for admin
- [x] Test sending notifications to users

## Fix React Hooks Error in AdminUsers
- [x] Identify conditional hook calls in AdminUsers page
- [x] Move hooks before conditional returns
- [x] Test AdminUsers page loads without errors

## Fix React Hooks Error in Profile Page
- [x] Identify conditional hook calls in Profile page
- [x] Move all hooks before conditional returns
- [x] Test Profile page loads without errors

## Add Admin Buttons to Profile Header
- [x] Add Scraper and Users buttons to Profile page header
- [x] Show buttons only for alvaresgiulia@gmail.com account
- [x] Style buttons consistently with header design
- [x] Test navigation to admin pages
