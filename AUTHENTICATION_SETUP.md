# Authentication Setup Guide

Your project already has the authentication infrastructure in place! Here's what you need to do to enable it.

## What's Already Set Up ✅

1. **Supabase Integration** - Backend authentication service
2. **AuthProvider** - React context for auth state management
3. **useAuth Hook** - Custom hook for authentication functions
4. **PhoneAuth Component** - Phone OTP authentication UI (exists but not used)

## Steps to Enable Authentication

### 1. Set Up Supabase Project (Required)

#### Option A: Use Supabase Cloud (Recommended for Production)

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy your:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

3. **Create `.env` File**
   - In the root directory, create a `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

#### Option B: Use Supabase Local (For Development)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Start Local Supabase**
   ```bash
   supabase start
   ```

3. **Use Local Credentials**
   - The `.env` file will use localhost URLs automatically
   - Default local URL: `http://localhost:54321`

### 2. Configure Authentication Methods in Supabase

1. **Enable Phone Authentication**
   - Go to Authentication → Providers
   - Enable "Phone" provider
   - Configure SMS provider (Twilio, MessageBird, etc.)
   - **Note**: Phone auth requires paid SMS service for production

2. **Enable Email Authentication (Alternative/Recommended)**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Configure email templates
   - No additional service required (uses Supabase's email service)

### 3. Add Authentication UI to Your App

You have two options:

#### Option A: Use Existing PhoneAuth Component (Phone OTP)

Add to your Header component:

```tsx
import PhoneAuth from "@/components/PhoneAuth";

// In Header component JSX:
<div className="hidden md:block">
  <PhoneAuth />
</div>
```

#### Option B: Create Email/Password Authentication

I can help you create an email/password auth component if you prefer that method.

### 4. Add Protected Routes (Optional)

If you want to protect certain routes, you can add route guards:

```tsx
// Create a ProtectedRoute component
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

### 5. Use Authentication in Components

```tsx
import { useAuth } from "@/hooks/useAuth";

const MyComponent = () => {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.phone || user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
};
```

## Authentication Methods Available

### Currently Implemented:
- ✅ **Phone OTP** - Sign in with phone number + OTP code
- ✅ **Session Management** - Automatic session persistence
- ✅ **Sign Out** - Logout functionality

### Can Be Added:
- 🔄 **Email/Password** - Traditional email + password login
- 🔄 **Magic Link** - Passwordless email login
- 🔄 **OAuth Providers** - Google, GitHub, etc.
- 🔄 **Email OTP** - Email-based OTP (like phone OTP)

## Quick Start (Email/Password Recommended)

Would you like me to:
1. **Create an Email/Password auth component** (recommended - easier to set up, no SMS costs)
2. **Re-add the PhoneAuth component** to the header (requires SMS service setup)
3. **Create a login page** separate from the header
4. **Add both options** (email/password + phone OTP)

Let me know which option you prefer, and I'll implement it for you!

## Testing Authentication

1. Start your dev server: `npm run dev`
2. Make sure your `.env` file has valid Supabase credentials
3. Try signing in with the authentication method you chose
4. Check the browser console for any errors
5. Check Supabase Dashboard → Authentication → Users to see registered users

## Common Issues

- **"Invalid API key"** - Check your `.env` file credentials
- **"Phone auth requires SMS provider"** - Set up Twilio or MessageBird in Supabase
- **OTP not received** - Check SMS provider configuration in Supabase
- **Session not persisting** - Check browser localStorage
