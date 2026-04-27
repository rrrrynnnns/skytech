# Sari-Sari Utang Manager - Setup Instructions

## Overview
This is a debt management system for sari-sari stores. It helps you track customer debts and send SMS reminders for payment deadlines.

## Features
- ✅ Add, edit, and delete customer records
- ✅ Track debt amounts and payment deadlines
- ✅ Visual indicators for overdue/upcoming payments
- ✅ Send SMS reminders to customers
- ✅ Dashboard with summary statistics
- ✅ Data stored locally in browser

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure SMS Service (Semaphore)

**Option A: Semaphore (Recommended for Philippines)**
1. Go to [https://semaphore.co](https://semaphore.co)
2. Sign up for an account
3. Get your API key from the dashboard
4. Create a `.env.local` file in the root directory:
   ```
   SEMAPHORE_API_KEY=your_api_key_here
   ```

**Option B: Other SMS Providers**
You can modify `/app/api/send-sms/route.ts` to use other SMS providers like:
- Twilio (international)
- Vonage (formerly Nexmo)
- M360 (Philippines)
- Chikka (Philippines)

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Adding a Customer
1. Fill in the form at the top:
   - **Customer Name**: Full name of customer
   - **Phone Number**: Mobile number (e.g., 09123456789)
   - **Amount**: Debt amount in pesos
   - **Deadline**: Payment due date
   - **Notes**: Optional reminder notes
2. Click "Add Customer"

### Sending SMS Reminders
1. Click the "📱 Send SMS" button next to any customer
2. The system will send a message like:
   ```
   Hi Juan Dela Cruz! This is a reminder that your payment 
   of ₱1,000.00 is due on 3/15/2026. Thank you!
   ```

### Managing Customers
- **Edit**: Click "Edit" to modify customer details
- **Delete**: Click "Delete" to remove a customer (with confirmation)

### Understanding Status Colors
- 🟢 **Green**: More than 7 days until deadline
- 🟡 **Yellow**: 4-7 days until deadline
- 🟠 **Orange**: 1-3 days until deadline
- 🔴 **Red**: Overdue

## Important Notes

### Data Storage
- All customer data is stored in your browser's localStorage
- Data persists across browser sessions
- **Backup regularly** - export your data or keep manual records
- Clearing browser data will delete all records

### SMS Costs
- Semaphore requires prepaid credits
- Each SMS costs approximately ₱0.50-1.00 per message
- Monitor your credit balance regularly

### Phone Number Format
- Philippines: Use format `09123456789` (11 digits)
- For other countries, adjust format as needed

## Production Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable: `SEMAPHORE_API_KEY`
4. Deploy

### Security Recommendations
- Never commit `.env.local` to version control
- Keep your API key secret
- Consider adding authentication if deploying publicly
- Use HTTPS in production

## Troubleshooting

### SMS Not Sending
1. Check if `.env.local` file exists with valid API key
2. Verify API key is active on Semaphore dashboard
3. Check if you have sufficient credits
4. Verify phone number format is correct
5. Check browser console for error messages

### Data Not Saving
1. Check if browser allows localStorage
2. Try clearing cache and reloading
3. Ensure JavaScript is enabled

## Customization

### Change SMS Message Template
Edit the message in `/app/page.tsx` around line 88:
```typescript
const message = `Your custom message template here`;
```

### Modify Colors or Styling
The app uses Tailwind CSS. Edit classes in `/app/page.tsx` to customize appearance.

## Support
For issues with:
- Semaphore API: [https://semaphore.co/docs](https://semaphore.co/docs)
- Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)

## License
Free to use for your sari-sari store business.
