# GitHub Project Setup Guide

## How to Create & Use GitHub Project Board

### Step 1: Create the Project
1. Go to https://github.com/ZINC137/SIH26036
2. Click the **"Projects"** tab (top navigation)
3. Click **"New Project"** button
4. Choose **"Board"** template
5. Name it: **"SIH Development"**
6. Click **"Create"**

---

### Step 2: Add Issues to Project

Once the project is created, you'll have a board with columns:
- **To do**
- **In progress**
- **Done**

#### Add Existing Issues:
1. In the project board, click **"Add item"**
2. Search and select issues:
   - Issue #2: Public User Dashboard
   - Issue #3: LMO Official Dashboard
   - Issue #4: Field Officer Dashboard
   - Issue #5: Admin Dashboard

3. Or drag issues directly from the Issues list into columns

---

### Step 3: Organize the Board

**Recommended Setup:**

**To do Column:**
- Issue #2: Public User Dashboard
- Issue #3: LMO Official Dashboard
- Issue #4: Field Officer Dashboard
- Issue #5: Admin Dashboard
- (Add more as backend/mobile work starts)

**In progress Column:**
- (Drag issues here when team starts working)

**Done Column:**
- (Will populate as issues are completed)

---

### Step 4: Using the Board

#### When Starting Work:
1. Assign issue to yourself
2. Click on issue → Change status to "In progress"
3. Or drag the card to "In progress" column

#### When Work is Complete:
1. Create a Pull Request
2. Get it reviewed and merged
3. Close the issue
4. Drag card to "Done" column

#### Track Progress:
- Project shows `X of Y issues completed`
- Visual progress bar appears
- Team can see current status at a glance

---

## Alternative: Use PROGRESS.md

If you prefer manual tracking without the project board:
- View: `/PROGRESS.md` in your repo
- Shows all completed, in-progress, and pending tasks
- Update manually or I can help automate it

---

## Quick Commands to Add Issues to Project (Manual)

You can also use CLI once auth is fixed:
```bash
gh project item-add <project-id> --issue <issue-number>
```

---

## That's It! 🎉

Your GitHub Project is now ready to track all development progress visually!

**Next:** Start assigning issues to team members and watch the board fill up as work gets done.
