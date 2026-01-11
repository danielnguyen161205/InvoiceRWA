# Verification Expiry Management

## Overview

This system automatically manages user verification status with a 30-day expiry mechanism:

- **Available Status**: User has completed KYB, KYC, UBO verification and been approved by admin
- **Unavailable Status**: User verification has expired (30+ days) or not yet completed
- **Auto-Reset**: After 30 days, status automatically resets to "Unavailable" and user must re-complete verification process

## Frontend Changes

### Profile Page Updates
- `profileName` class now displays Legal Name (from organization.legal_name)
- `profileEmail` class now displays User Status instead of email
- Status badge shows:
  - **Available** (green) - Active verification
  - **Unavailable** (red) - Expired or incomplete verification  
  - **Unavailable (Re-verification Required)** - Expired after 30 days

### Status Logic
- Available: KYC verified + Organization approved + < 30 days since verification
- Unavailable: Not verified, rejected, or expired (30+ days)
- Visual indicators with color-coded badges

## Backend Changes

### API Updates
- JWT tokens now include `legal_name` and `verified_at` fields
- Login endpoint returns user status information
- New admin endpoints for verification management

### New Services
- `VerificationService`: Handles expiry checking and status reset
- `check_expired_verifications()`: Resets organizations older than 30 days
- Admin API endpoints for verification statistics

### Database Impact
- Uses existing `organizations.verified_at` field for expiry calculation
- No new database migrations required

## Automated Daily Checks

### Setup Daily Script (Windows)

1. **Manual Run**:
   ```powershell
   cd Backend
   python scripts/daily_verification_check.py
   ```

2. **Windows Task Scheduler**:
   - Open Task Scheduler
   - Create Basic Task
   - Name: "Invoice RWA Verification Check"
   - Trigger: Daily at 2:00 AM
   - Action: Start a program
   - Program: `PowerShell.exe`
   - Arguments: `-File "C:\path\to\InvoiceRWA\Backend\scripts\run_daily_verification_check.ps1"`

3. **Manual PowerShell**:
   ```powershell
   .\Backend\scripts\run_daily_verification_check.ps1
   ```

### Linux/Mac Cron Job

Add to crontab (`crontab -e`):
```bash
0 2 * * * cd /path/to/InvoiceRWA/Backend && python scripts/daily_verification_check.py
```

## Admin Management

### API Endpoints
- `POST /api/admin/check-expired-verifications` - Manually trigger expiry check
- `GET /api/admin/verification-stats` - Get verification statistics

### Usage
```javascript
// Check expired verifications
fetch('/api/admin/check-expired-verifications', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
})

// Get stats
fetch('/api/admin/verification-stats', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
})
```

## Testing

### Test Expiry Logic
```python
# Set organization verified_at to 31 days ago
org.verified_at = datetime.utcnow() - timedelta(days=31)
db.commit()

# Run verification check
reset_count = VerificationService.check_expired_verifications(db)
# Should reset organization to PENDING status
```

### Test Frontend Status
1. Login with user that has approved organization
2. Check profile shows "Available" status
3. Modify `verified_at` in database to be 31 days old
4. Refresh profile - should show "Unavailable (Re-verification Required)"

## Monitoring

### Log Files
- `verification_check.log` - Daily check results
- Monitor for reset counts and any errors

### Health Checks
- Verify daily script is running via Task Scheduler/cron
- Check log files for successful execution
- Monitor user complaints about unexpected status changes

## Troubleshooting

### Common Issues
1. **Status not updating**: Check if `verified_at` is in JWT token
2. **Daily script not running**: Verify Task Scheduler/cron configuration
3. **Wrong status display**: Check frontend `getUserStatus()` logic
4. **CSS not applied**: Verify status badge classes are set correctly

### Manual Reset
```sql
-- Reset all expired organizations (31+ days)
UPDATE organizations 
SET status = 'PENDING', verified_at = NULL, verified_by = NULL 
WHERE status = 'APPROVED' AND verified_at < NOW() - INTERVAL '30 days';
```