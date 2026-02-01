# Quick Start Guide

## Prerequisites Check
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] At least 500MB free disk space
- [ ] Supabase account created

## Setup Steps

### 1. Free Up Disk Space (if needed)
```powershell
# Check available space
Get-PSDrive C

# Clear npm cache if needed
npm cache clean --force
```

### 2. Install Dependencies
```powershell
cd Systema
npm install
```

### 3. Configure Supabase

a. Create a Supabase project:
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name and strong password
   - Wait for project to be ready

b. Set up the database:
   - In Supabase dashboard, go to SQL Editor
   - Click "New Query"
   - Copy and paste contents from `supabase-schema.sql`
   - Click "Run" to execute

c. Get your credentials:
   - Go to Settings > API
   - Copy "Project URL" and "anon public" key

d. Configure environment:
   - Copy `.env.example` to `.env`
   - Edit `.env` and add:
     ```
     VITE_SUPABASE_URL=your_project_url_here
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

### 4. Start Development Server
```powershell
npm run dev
```

### 5. Open in Browser
Navigate to: http://localhost:5173

## Troubleshooting

### "ENOSPC: no space left on device"
- Free up disk space (at least 500MB)
- Clear npm cache: `npm cache clean --force`
- Try again

### "Supabase error: Invalid API key"
- Check `.env` file has correct credentials
- Ensure no extra spaces in URLs/keys
- Verify Supabase project is active

### "Module not found" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Canvas not loading
- Check browser console for errors (F12)
- Ensure React Flow CSS is loaded
- Try hard refresh (Ctrl+Shift+R)

## Demo Features to Try

1. **Explore the demo architecture**
   - Zoom/pan the canvas
   - Click nodes to see details
   - Hover over connections

2. **Edit a component**
   - Click on "API Gateway" node
   - Metadata panel opens on right
   - Edit fields and save

3. **Simulation mode**
   - Click "Start Simulation" button
   - Click on a node to toggle failure
   - Observe visual changes

4. **Validation warnings**
   - Check bottom-left for warnings
   - Click "Background Worker" (has no failure modes)
   - See warning about missing data

5. **Add a connection**
   - Drag from the white dot on right side of a node
   - Connect to white dot on left side of another node
   - New edge is created

## Next Steps

- [ ] Add your own components
- [ ] Define failure modes for all components
- [ ] Add recovery strategies for critical components
- [ ] Invite collaborators (requires Supabase auth setup)
- [ ] Export your architecture

## Support

Issues? Check:
- README.md for full documentation
- GitHub issues for known problems
- Supabase docs for database help
