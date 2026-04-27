# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Set Up SMS Service (Optional but Recommended)
1. Visit https://semaphore.co and create an account
2. Get your API key from the dashboard
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```
4. Edit `.env.local` and replace `your_api_key_here` with your actual API key

### Step 2: Run the Website
```bash
npm run dev
```

### Step 3: Open in Browser
Visit: http://localhost:3000

## 📝 Quick Usage

1. **Add Customer**: Fill the form and click "Add Customer"
2. **Send Reminder**: Click "📱 Send SMS" button to send payment reminder
3. **Edit/Delete**: Use the action buttons in the table

## 💡 Tips

- **Red** text = Overdue payment
- **Orange** text = Due in 1-3 days  
- **Yellow** text = Due in 4-7 days
- **Green** text = More than 7 days

- Data is saved in your browser automatically
- Works offline (except SMS feature)
- Mobile-friendly design

## ⚠️ Without SMS Setup

The website works perfectly without SMS configuration! You can:
- Track all customer debts
- View deadlines and overdue accounts
- Add/edit/delete customers
- See summary statistics

You just won't be able to send SMS until you add the API key.

Enjoy! 🎉
