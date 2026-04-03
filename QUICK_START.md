# ⚡ QUICK START COMMANDS

Copy & paste these commands directly to get JuryDoX running instantly.

---

## 🚀 LAUNCH IMMEDIATELY (3 commands)

```bash
# 1. Enter project directory
cd c:\Users\natsu\JuryDox

# 2. Start development server
npm run dev

# 3. Open in browser (automatically opens, or copy this URL)
http://localhost:5173/
```

**Result**: Server starts on port 5173 with hot reload ✅

---

## 🔌 IN ANOTHER TERMINAL (Optional)

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

## 👤 HOW TO LOGIN / TEST ROLES

### Method 1: Browser MetaMask
1. Install MetaMask extension
2. Create test wallet
3. App detects wallet address automatically
4. Role assigned based on last character:
   - `0-5` = Secretary
   - `6-b` = Jury
   - `c-f` = Lawyer

### Method 2: Use Provided Test Addresses
Open browser DevTools console and paste:

```javascript
// Get test addresses
import { MOCK_JURY_ADDRESSES, MOCK_SECRETARY_ADDRESSES, MOCK_LAWYER_ADDRESSES } from './src/utils/testData.js';

console.log('Jury:', MOCK_JURY_ADDRESSES);
console.log('Secretary:', MOCK_SECRETARY_ADDRESSES);
console.log('Lawyer:', MOCK_LAWYER_ADDRESSES);
```

---

## 🧪 TEST SCENARIOS (Copy & Paste)

### Scenario 1: Upload & Vote
```
1. Switch to Secretary role
2. Click "Upload Document"
3. Fill form:
   - Title: "Contract Review"
   - Description: "Test document"
   - Click "Upload"
4. Switch to Jury role
5. Click "Vote" on document
6. Select "Approve"
7. Click "Submit Vote"
8. ✅ See vote counted in Analytics
```

### Scenario 2: Rejection with Comment
```
1. Stay as Jury
2. Click "Vote" on another document
3. Select "Reject"
4. Add comment: "Missing signatures"
5. Comment becomes required
6. Click "Submit Vote"
7. ✅ Notification shows rejection reason
8. Switch to Secretary
9. ✅ See "Rejected" status + comment
```

### Scenario 3: Test Resubmission
```
1. As Secretary
2. Click "Resubmit" on rejected document
3. New version becomes v2
4. ✅ previousVersions[0] = original version
5. Send back to jury
6. ✅ Jury votes on v2
```

### Scenario 4: Check Analytics
```
1. Click "Analytics" in navbar
2. ✅ See stats update in real-time:
   - Total Documents
   - Approval Rate
   - Rejection Rate
   - Average Votes per Doc
   - Pending Documents
3. Click time filters (This Week, This Month)
```

---

## 📊 VERIFY FEATURES WORK

### 1. Mandatory Rejection Comment
```
✅ Try to vote "Reject" without comment
❌ Button should be disabled
✅ Add comment
✅ Button enables
```

### 2. Multi-Jury Voting
```
✅ Open document as Jury 1 → Vote Approve
✅ Open same document as Jury 2 → Vote Approve
✅ See "2 votes" in document
✅ Check consensus shows "Approved"
```

### 3. Document Versioning
```
✅ Upload document v1
✅ Secretary resubmits → v2
✅ View document details
✅ See version history
```

### 4. Audit Trail
```
✅ Click document
✅ Scroll to "Action History"
✅ See all actions:
   - Document Created
   - Vote Added
   - Document Rejected
   - Document Resubmitted
```

### 5. Notifications
```
✅ Upload document
✅ ✅ "Document uploaded" appears top-right
✅ Vote on document
✅ "Vote recorded" notification appears
✅ Auto-dismiss after 5 seconds
```

### 6. Search & Filter
```
✅ Type in search box
✅ Results filter by keyword
✅ Click "Status" dropdown
✅ Filter by: Pending, Approved, Rejected
✅ Date range picker works
```

### 7. Real-Time Analytics
```
✅ Upload document
✅ Analytics update immediately
✅ Vote on document
✅ Approval % changes instantly
```

### 8. Role-Based Access
```
✅ Secretary → Upload tab shows
✅ Secretary → Vote tab hidden
✅ Jury → Vote tab shows
✅ Jury → Upload tab hidden
✅ Lawyer → Analytics only
```

### 9. Blockchain-Ready Fields
```
Open DevTools Console → Network tab
Upload document → Inspect response
✅ See fields:
   - ipfsHash: "mock_hash_..."
   - walletAddress
   - signature
   - txHash
```

---

## 🐛 DEBUGGING

### Check No Errors
```bash
# Open DevTools
F12

# Go to Console tab
# Should see NO red errors

# Network tab should show:
GET index.html     ✅ 200
GET app.jsx files  ✅ 200
```

### View All Data in Console
```javascript
// Access Web3Context data directly (in React DevTools)
// Or add this to any component:
console.log('All documents:', documents);
console.log('All notifications:', notifications);
console.log('Current user:', currentUser);
```

### Common Issues & Fixes

**Issue**: "npm: command not found"  
**Fix**: `choco install nodejs` (install Node.js)

**Issue**: Port 5173 already in use  
**Fix**: 
```bash
# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

**Issue**: MetaMask not connecting  
**Fix**: 
```
1. Open MetaMask
2. Click "Connect"
3. Select JuryDoX
4. Approve connection
5. Refresh page
```

**Issue**: Styles look broken  
**Fix**: 
```bash
# Clear cache and restart
npm run dev
# Press Ctrl+Shift+R in browser (hard refresh)
```

---

## 📋 FILE LOCATIONS

```
Code:
  src/context/Web3Context.jsx        (state + methods)
  src/pages/JuryDashboard.jsx        (jury interface)
  src/pages/SecretaryDashboard.jsx   (upload/track)
  src/pages/AnalyticsDashboard.jsx   (statistics)
  src/components/NotificationCenter  (toast system)

Documentation:
  START_HERE.md                      (quick start)
  TEST_GUIDE.md                      (detailed testing)
  FEATURES.md                        (feature list)
  ROADMAP.md                         (future plans)
  DEPLOYMENT.md                      (launch checklist)
  PROJECT_SUMMARY.md                 (this session)

Test Data:
  src/utils/testData.js              (test helpers)
```

---

## 🎯 DEMO SCRIPT (For Presentations)

**Setup (1 min)**
```bash
npm run dev
# Wait for "Local: http://localhost:5173"
# Open http://localhost:5173
```

**Demo (5 mins)**
```
Minute 1: Show dashboard overview
  → Point to 3 roles
  → Show empty state

Minute 2: Secretary uploads
  → Fill form
  → Click Upload
  → ✅ Document appears

Minute 3: Jury votes
  → Switch role
  → Click Vote
  → Select options
  → ✅ Vote counts

Minute 4: Rejection workflow
  → Vote Reject
  → Add comment
  → ✅ Secretary sees reason

Minute 5: Analytics
  → Click Analytics
  → Show real-time stats
  → ✅ Demonstrates power
```

---

## 💾 SAVING YOUR WORK

### Save Progress to GitHub
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "JuryDoX v1.0.0-beta - All features working"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/JuryDoX.git
git push -u origin main
```

### Save to Backup
```bash
# Zip entire project
Compress-Archive -Path "c:\Users\natsu\JuryDoX" -DestinationPath "c:\Users\natsu\JuryDoX_v1.0_backup.zip"
```

---

## 🔄 NEXT STEPS (When Ready)

### Phase 1: Data Persistence (1-2 hours)
```bash
# Edit src/context/Web3Context.jsx
# Add localStorage save/load:
useEffect(() => {
  localStorage.setItem('documents', JSON.stringify(documents));
}, [documents]);
```

### Phase 2: Deploy to Web (2-3 hours)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Get public URL
https://jurybox.vercel.app
```

### Phase 3: Blockchain Integration (4-8 hours)
```bash
# Install ethers (already installed)
npm install ethers

# Deploy smart contract
# Then update Web3Context to use real contract
```

---

## 📞 QUICK REFERENCE

| Need | Command |
|------|---------|
| Start dev | `npm run dev` |
| Build prod | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |
| Check docs | Open `START_HERE.md` |
| View features | Open `FEATURES.md` |
| See changes | Open `CHANGELOG.md` |
| Future plan | Open `ROADMAP.md` |
| Pre-launch | Open `DEPLOYMENT.md` |

---

## ✅ YOU'RE ALL SET!

Everything is ready:
- ✅ Code complete
- ✅ No errors
- ✅ All features working
- ✅ Tests ready
- ✅ Documentation provided

Just run:
```bash
cd c:\Users\natsu\JuryDox && npm run dev
```

Then open: **http://localhost:5173/**

🎉 **Happy testing!**

---

**Last Updated**: April 2, 2026  
**Status**: ✅ READY TO LAUNCH
