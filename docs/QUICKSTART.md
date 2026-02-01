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

1. **Sign up / Sign in**
   - Click "Sign In" in top right
   - Create an account or sign in
   - Your architectures will be saved automatically

2. **Explore the demo architecture**
   - Zoom/pan the canvas (scroll to zoom, drag to pan)
   - Click nodes to see details
   - Hover over connections

3. **Edit a component**
   - Click on "API Gateway" node
   - Metadata panel opens on right
   - Edit fields and save

4. **Add a new component**
   - Click "+ Add Component" button in toolbar
   - Fill in the form
   - Component appears on canvas

5. **Simulation mode**
   - Click "Start Simulation" button
   - Click on a node to toggle failure
   - Observe visual changes (components turn red)

6. **Validation warnings**
   - Check bottom-left for warnings
   - Click "Background Worker" (has no failure modes)
   - See warning about missing data

7. **Add a connection**
   - Drag from the white dot on right side of a node
   - Connect to white dot on left side of another node
   - New edge is created

8. **Save your work**
   - Click "Save" button (requires sign-in)
   - Architecture is saved to your account

9. **Load architectures**
   - Click "Load" button
   - See your saved architectures
   - Click to load any architecture

10. **Tutorial**
    - Click graduation cap icon
    - Follow interactive guide
    - Learn all features step-by-step

## Next Steps

- [ ] Complete the tutorial if you haven't already
- [ ] Create your own architecture from scratch
- [ ] Add your own components with failure modes
- [ ] Define recovery strategies for critical components
- [ ] Save and organize multiple architectures
- [ ] Invite collaborators (share button in toolbar)
- [ ] Export your architecture (JSON format)

## Support

Issues? Check:
- README.md for full documentation
- GitHub issues for known problems
- Supabase docs for database help
