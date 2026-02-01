# SystemA - Installation Troubleshooting Guide

## Issue: "ENOSPC: no space left on device"

This error occurs when there's insufficient disk space to install npm packages.

### Solution Steps:

#### 1. Check Available Space
```powershell
# Check free space on C: drive
Get-PSDrive C

# You need at least 500MB free for node_modules
```

#### 2. Clear npm Cache
```powershell
# This can free up 100-300MB
npm cache clean --force

# Verify cache is cleared
npm cache verify
```

#### 3. Clear Windows Temp Files
```powershell
# Clear temp folder (safe to delete)
Remove-Item $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue

# Clear Windows temp
Remove-Item C:\Windows\Temp\* -Recurse -Force -ErrorAction SilentlyContinue
```

#### 4. Clean Up Desktop
```powershell
# Check Desktop folder size
Get-ChildItem $env:USERPROFILE\Desktop -Recurse | Measure-Object -Property Length -Sum
```

#### 5. Empty Recycle Bin
```powershell
Clear-RecycleBin -Force
```

#### 6. Remove Old Node Modules
```powershell
# If you have other projects, you can delete their node_modules
# Navigate to each project and run:
Remove-Item node_modules -Recurse -Force
```

#### 7. Use Disk Cleanup
```powershell
# Run Windows Disk Cleanup tool
cleanmgr /d C:
```

---

## Alternative: Install to Different Drive

If C: drive is too full, you can move the project:

### Option A: Use External Drive
```powershell
# Copy project to external drive (e.g., D:)
Copy-Item -Path "C:\Users\franc\Desktop\Franco\SystemA\Systema" -Destination "D:\Systema" -Recurse

# Navigate to new location
cd D:\Systema

# Install there
npm install
```

### Option B: Use WSL (Windows Subsystem for Linux)
If you have WSL installed:
```bash
# In WSL terminal
cd /mnt/d/
git clone https://github.com/Altyd/Systema.git
cd Systema
npm install
```

---

## Alternative: Minimal Install (If Really Stuck)

If you can't free up space, you can try a minimal development setup:

### 1. Use CDN for React/ReactFlow
Create a basic HTML file without npm:

```html
<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- This won't be ideal, but works for testing -->
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

**Note**: This is NOT recommended for development, just for emergency viewing.

---

## Check Disk Space Usage

### Find Large Files
```powershell
# Find large files on C: drive
Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue | 
  Sort-Object Length -Descending | 
  Select-Object -First 20 FullName, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

### Find Large Folders
```powershell
# Find which folders are taking up space
Get-ChildItem C:\Users\franc -Directory | 
  ForEach-Object { 
    $size = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | 
             Measure-Object -Property Length -Sum).Sum / 1MB
    [PSCustomObject]@{
      Folder = $_.Name
      'Size(MB)' = [math]::Round($size, 2)
    }
  } | Sort-Object 'Size(MB)' -Descending
```

---

## Common Space Hogs

### 1. Downloads Folder
```powershell
# Check Downloads size
Get-ChildItem $env:USERPROFILE\Downloads | Measure-Object -Property Length -Sum

# Clear old downloads (BE CAREFUL!)
# Remove-Item $env:USERPROFILE\Downloads\* -Force
```

### 2. Browser Cache
- **Chrome**: Settings > Privacy > Clear browsing data
- **Edge**: Settings > Privacy > Choose what to clear
- **Firefox**: Options > Privacy > Clear Data

### 3. Windows Update Files
```powershell
# Clean up Windows updates
Dism.exe /online /Cleanup-Image /StartComponentCleanup
```

### 4. System Restore Points
```powershell
# Delete old restore points
vssadmin delete shadows /for=c: /oldest
```

---

## After Freeing Space

### Verify and Install
```powershell
# 1. Navigate to project
cd C:\Users\franc\Desktop\Franco\SystemA\Systema

# 2. Verify space
Get-PSDrive C

# 3. Clear npm cache one more time
npm cache clean --force

# 4. Try install
npm install

# 5. If it fails again, try with verbose logging
npm install --verbose
```

---

## Still Having Issues?

### Option 1: Use Lighter Package Manager
```powershell
# Try pnpm (uses less disk space)
npm install -g pnpm
pnpm install
```

### Option 2: Use Yarn
```powershell
# Try yarn
npm install -g yarn
yarn install
```

### Option 3: Install Dependencies One at a Time
```powershell
# Install critical dependencies only
npm install react react-dom
npm install reactflow
npm install @supabase/supabase-js
npm install zustand
# ... continue for each package
```

---

## How Much Space Do You Need?

**Minimum Requirements**:
- node_modules: ~300MB
- Build cache: ~50MB
- npm cache: ~100MB
- **Total**: ~500MB free space recommended

**Current Package Sizes** (approximate):
- react + react-dom: ~1MB
- reactflow: ~2MB
- @supabase/supabase-js: ~200KB
- zustand: ~20KB
- tailwindcss: ~15MB
- vite: ~12MB
- typescript: ~40MB
- **Total node_modules**: ~250-350MB

---

## Prevention for Future

### 1. Regular Cleanup
```powershell
# Add to your weekly routine
npm cache clean --force
Clear-RecycleBin -Force
Remove-Item $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue
```

### 2. Use .gitignore
```
node_modules/
dist/
.env
*.log
```

### 3. Monitor Space
```powershell
# Create a monitoring script
Get-PSDrive C | Select-Object Name, @{Name='Free(GB)';Expression={[math]::Round($_.Free/1GB,2)}}
```

---

## Contact for Help

If you're still stuck:
1. Check the GitHub Issues page
2. Post in discussions with error log
3. Include output of `npm install --verbose`

---

## Summary Checklist

Before running `npm install`:
- [ ] Have at least 500MB free on C: drive
- [ ] Cleared npm cache (`npm cache clean --force`)
- [ ] Cleared temp files
- [ ] Emptied recycle bin
- [ ] Closed other applications
- [ ] Restarted computer (if needed)

Then try:
```powershell
cd Systema
npm install
```

Good luck! 🚀
