# 🚀 Quick Deployment Reference

## For Render.com Deployment

### Step 1: Create PostgreSQL (2 minutes)
1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `config-manager-db`
3. Create and copy **Internal Database URL**

### Step 2: Update Web Service (1 minute)
1. Go to your web service → **Environment**
2. Add/Update:
   ```
   DATABASE_URL=postgresql://...  # from Step 1
   JWT_SECRET=your-strong-secret
   ```
3. Save and Deploy

### Step 3: Verify (1 minute)
```bash
curl https://your-app.onrender.com/api/status
```
Should see: `"status": "connected"`

---

## For Local Development

### Option A: Without Database (Easiest)
```bash
cd server
npm install
node server.js
```
Console shows: `⚠️ DATABASE_URL not set`
→ This is OK, uses filesystem for local dev

### Option B: With Local PostgreSQL

**Setup (first time only):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb config_manager
```

**Update `.env`:**
```env
DATABASE_URL=postgresql://localhost/config_manager
```

**Run:**
```bash
node server.js
```

---

## Testing Checklist

```bash
# Check database status
curl http://localhost:3000/api/status

# Check health
curl http://localhost:3000/health

# Login to UI (default credentials)
# Username: admin
# Password: password (bcrypt hashed)
```

---

## What Changed

| Before | After |
|--------|-------|
| Files: `deployed_configs/` | Database: PostgreSQL |
| Render restart → Lost configs | Render restart → Configs persist |
| Local only | Production ready |

---

## Key New Files

- `server/db.js` - Database module (don't modify)
- `DATABASE_SETUP.md` - Full setup guide
- `IMPLEMENTATION_COMPLETE.md` - Technical summary
- `.env.example` - Environment reference

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db  # Add this for Render
JWT_SECRET=change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt>
PORT=3000
```

---

## Still Have Issues?

1. Check `/api/status` endpoint
2. Read `DATABASE_SETUP.md`
3. Check Render logs for errors
4. Verify DATABASE_URL is set correctly
5. Confirm PostgreSQL service is running (on Render)

---

## Database URLs by Provider

**Render (Internal):**
```
postgresql://user:pass@dpg-xxx.postgres.render.com/config_manager
```

**Local:**
```
postgresql://localhost/config_manager
```

**AWS RDS:**
```
postgresql://user:pass@xxx.rds.amazonaws.com/config_manager
```
