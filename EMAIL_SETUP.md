# Email Setup Guide for Hostel Hub

## Gmail Configuration

To enable email receipts for payments, you need to configure Gmail SMTP settings.

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Click on "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "Hostel Hub" as the name
6. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Add these to your `backend/.env` file:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
RECEIPT_EMAIL=receipts@hostelhub.com
```

### Step 4: Test Email Configuration
Visit: `http://localhost:5000/api/fee/test-email`

This will verify your email configuration and show any errors.

### Common Issues:

1. **"Invalid login" error**: 
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error**:
   - App passwords are required for Gmail SMTP
   - Regular passwords won't work with modern Gmail security

3. **"Authentication failed" error**:
   - Double-check your email and app password
   - Make sure there are no extra spaces

### Alternative Email Providers:

If you prefer other email providers, update the transporter configuration in `backend/utils/mailer.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// For Yahoo
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Testing:
After setup, make a test payment to verify emails are being sent correctly. Check the server logs for detailed email sending information. 