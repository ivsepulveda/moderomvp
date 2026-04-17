
The user wants the "Recent Applications" pop-up on the Admin Dashboard (`src/pages/admin/Dashboard.tsx`) to show **full agency info** when clicked, instead of the current condensed view.

Looking at the current dialog, it already shows: agency name, email, website, idealista profile, listings/inquiries/years stats, associations, pitch, flags, rejection reason, approve/reject actions.

What's missing from the `applications` table that could enrich it:
- `created_at` (submission date) — currently not shown in dialog
- `id` (application reference)
- All fields are already displayed

So "full agency info" likely means: present everything more completely and clearly, including submission timestamp, application ID, full status timeline, and ensure no field is hidden or truncated.

## Plan

Upgrade the application detail dialog in `src/pages/admin/Dashboard.tsx` to a comprehensive agency profile view:

**1. Expand dialog width** — switch from `max-w-lg` to `max-w-2xl` with scroll for long content.

**2. Add a header block** with:
   - Agency name + initial avatar
   - Status badge (pending/approved/rejected) with color
   - Submission date + time ago
   - Application ID (short, copyable)

**3. Contact & Online Presence section** (clearly labeled):
   - Email (with mailto link)
   - Website (full URL visible, clickable)
   - Idealista profile (full URL visible, clickable)

**4. Market Presence section** (grid of stat cards — keep existing 3 + add):
   - Active listings
   - Monthly inquiries
   - Years operating
   - Professional associations (full text, no truncation)

**5. Pitch section** — "Why they're serious" displayed in full, no truncation, with proper line breaks preserved (`whitespace-pre-wrap`).

**6. Risk & Flags section** — show all flags clearly; if none, show "No flags raised" in muted green.

**7. Decision section** — if rejected, show rejection reason prominently. If approved, show "Approved" confirmation.

**8. Footer actions** — keep existing Approve / Reject buttons for pending applications.

### Files to edit
- `src/pages/admin/Dashboard.tsx` — refactor only the `<Dialog>` block (lines ~206–268). No schema changes, no new queries (all data already fetched).

### Out of scope
- No new database fields
- No changes to the Recent Applications list itself
- No changes to KPI cards or Flags & Alerts section
