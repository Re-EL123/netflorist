# 🚚 Netflorist Driver App - Complete Build Workflow

## 📋 Project Overview

**App Name:** Netflorist Driver Delivery App  
**Platform:** React Native (Expo)  
**Backend:** Supabase  
**Design System:** Netflorist Brand Colors  
**Status:** ✅ Complete Authentication & Dashboard

---

## 🎨 Design System

### Color Palette
```javascript
{
  primaryRed: '#EF3E62',      // Main brand color, CTAs, headers
  primaryPurple: '#7E33C8',   // Accent color, links
  darkGray: '#404040',        // Primary text
  mediumGray: '#565656',      // Secondary text
  lightGray: '#F1F5F5',       // Backgrounds
  inputGray: '#9A9EA6',       // Placeholders
  errorRed: '#E20000',        // Errors, alerts
  successGreen: '#38AF4B',    // Success messages
  white: '#FFFFFF',           // Cards, inputs
}
```

### Typography
- **Font:** Poppins
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)

### Spacing
```javascript
{
  xs: 4,   sm: 8,   md: 16,   lg: 24,   xl: 32
}
```

---

## 🔐 Supabase Configuration

### Connection Details
```javascript
const supabaseUrl = 'https://xaikxueachrjydabuueb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaWt4dWVhY2hyanlkYWJ1dWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMzkyNjUsImV4cCI6MjA4NjgxNTI2NX0.OmdiEby0PMJ6Bdnk22ilg2VvysfU7SE9JduIJ8gdKQk';
```

### Database Schema

#### `drivers` table
```sql
id                UUID PRIMARY KEY (auto-generated)
user_id           UUID REFERENCES auth.users(id) UNIQUE NOT NULL
full_name         TEXT NOT NULL
phone             TEXT NOT NULL
license_number    TEXT NOT NULL
vehicle_type      TEXT NOT NULL
status            TEXT DEFAULT 'pending' ('pending'|'approved'|'active'|'inactive'|'suspended')
profile_image_url TEXT
rating            DECIMAL(2,1) DEFAULT 0.0
total_deliveries  INTEGER DEFAULT 0
created_at        TIMESTAMP WITH TIME ZONE
updated_at        TIMESTAMP WITH TIME ZONE
```

#### `deliveries` table (future use)
```sql
id                  UUID PRIMARY KEY
driver_id           UUID REFERENCES drivers(id)
order_id            TEXT NOT NULL
customer_name       TEXT NOT NULL
customer_phone      TEXT NOT NULL
pickup_address      TEXT NOT NULL
delivery_address    TEXT NOT NULL
pickup_latitude     DECIMAL(10, 8)
pickup_longitude    DECIMAL(11, 8)
delivery_latitude   DECIMAL(10, 8)
delivery_longitude  DECIMAL(11, 8)
status              TEXT DEFAULT 'pending'
scheduled_time      TIMESTAMP WITH TIME ZONE
accepted_time       TIMESTAMP WITH TIME ZONE
picked_up_time      TIMESTAMP WITH TIME ZONE
delivered_time      TIMESTAMP WITH TIME ZONE
delivery_fee        DECIMAL(10, 2)
distance_km         DECIMAL(10, 2)
notes               TEXT
proof_of_delivery_url TEXT
signature_url       TEXT
customer_rating     INTEGER (1-5)
customer_feedback   TEXT
created_at          TIMESTAMP WITH TIME ZONE
updated_at          TIMESTAMP WITH TIME ZONE
```

#### `earnings` table (future use)
```sql
id          UUID PRIMARY KEY
driver_id   UUID REFERENCES drivers(id) NOT NULL
delivery_id UUID REFERENCES deliveries(id)
amount      DECIMAL(10, 2) NOT NULL
type        TEXT ('delivery'|'bonus'|'adjustment'|'withdrawal')
description TEXT
status      TEXT DEFAULT 'pending' ('pending'|'paid'|'cancelled')
paid_at     TIMESTAMP WITH TIME ZONE
created_at  TIMESTAMP WITH TIME ZONE
```

### RLS Policies
- ✅ Drivers can view/update their own profile
- ✅ Drivers can insert their profile during registration
- ✅ Drivers can view/update their own deliveries
- ✅ Drivers can view their own earnings
- ✅ Auto-update driver stats when delivery is completed

---

## 📁 Project Structure

```
netflorist-driver-app/
├── App.js                          # Main navigation controller
├── screens/
│   ├── SplashScreen.js            # 3-second animated splash
│   ├── Login.js                   # Email/password login
│   ├── Register.js                # Driver registration form
│   ├── ForgotPassword.js          # Password reset flow
│   └── Dashboard.js               # 4-tab driver dashboard
├── assets/
│   └── logo.png                   # Netflorist logo (120x120px)
├── lib/
│   └── supabase.js               # Supabase client (optional)
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🚀 Complete File Reference

### 1. App.js (Main Navigation Controller)

**Purpose:** Central navigation, auth state management, screen routing

**Key Features:**
- Manages screen state: `splash` → `login` → `register` → `forgotPassword` → `dashboard`
- Listens to `supabase.auth.onAuthStateChange()`
- Passes callbacks: `onLoginSuccess`, `onNavigateToLogin`, `onLogout`
- Exports `supabase` client for use in screens

**Screen Flow:**
```
Splash (3s) → Login ⟷ Register
                 ↓         ↓
            ForgotPassword
                 ↓
              Dashboard
```

---

### 2. screens/SplashScreen.js

**Duration:** 3 seconds  
**Animations:** Fade, scale, slide  
**Callback:** `onComplete()` → navigates to login or dashboard

**Key Elements:**
- Netflorist logo (180x180px)
- Title: "Driver"
- Subtitle: "Deliver Happiness"
- Decorative circles with rgba(255,255,255,0.1)
- Background: #EF3E62

---

### 3. screens/Login.js ✅ OPTIMIZED

**Purpose:** Driver authentication with Supabase

**Form Fields:**
- Email (email-address keyboard)
- Password (secure, with show/hide toggle)

**Validation:**
- Email: required, valid format
- Password: required, min 6 characters

**Flow:**
```javascript
handleLogin() {
  1. Validate form
  2. supabase.auth.signInWithPassword(email, password)
  3. Fetch driver profile from drivers table
  4. Check status:
     - 'pending' → Alert & sign out
     - 'suspended' → Alert & sign out
     - 'active' → onLoginSuccess(driverData)
  5. Navigate to Dashboard
}
```

**Optimizations (prevents web refresh):**
- ✅ `useRef` for Animated values
- ✅ Separate `handleEmailChange` and `handlePasswordChange`
- ✅ `outlineStyle: 'none'` on inputs
- ✅ `editable={!isLoading}` on inputs
- ✅ `disabled={isLoading}` on buttons
- ✅ Functional state updates

**Navigation:**
- "Forgot Password?" → ForgotPassword screen
- "Register here" → Register screen

---

### 4. screens/Register.js ✅ OPTIMIZED

**Purpose:** Driver registration with profile creation

**Form Fields:**
- Full Name (min 3 chars)
- Email (valid format)
- Phone (10 digits)
- License Number (required)
- Vehicle Type (required)
- Password (min 6 chars)
- Confirm Password (must match)

**Flow:**
```javascript
handleRegister() {
  1. Validate all fields
  2. supabase.auth.signUp(email, password, { data: { full_name } })
  3. Insert into drivers table:
     - user_id, full_name, phone, license_number, vehicle_type
     - status: 'pending' (awaits admin approval)
  4. Show success alert
  5. Navigate to Login
}
```

**Optimizations:**
- ✅ `useRef` for Animated values
- ✅ `useCallback` for `updateField` (memoized)
- ✅ Functional state updates
- ✅ `outlineStyle: 'none'` on inputs
- ✅ `editable={!isLoading}` on all inputs

**Navigation:**
- "Sign in here" → Login screen

---

### 5. screens/ForgotPassword.js

**Purpose:** Password reset via email

**Form Fields:**
- Email (required, valid format)

**States:**
- Form state: Enter email
- Success state: Email sent confirmation

**Flow:**
```javascript
handleResetPassword() {
  1. Validate email
  2. supabase.auth.resetPasswordForEmail(email, {
       redirectTo: 'netfloristdriver://reset-password'
     })
  3. Show success state with:
     - "Check Your Email" message
     - Display email address
     - "Resend email" option
     - "Back to Login" button
}
```

**Navigation:**
- "Back to Login" → Login screen
- "Resend email" → Reset form state

---

### 6. screens/Dashboard.js 🎯 MAIN DASHBOARD

**Purpose:** Driver's main interface with 4 tabs

**Props:**
- `session` - Supabase auth session
- `driverProfile` - Driver data from database
- `onLogout` - Logout callback

#### Tab 1: HOME 🏠

**Features:**
- Hero banner with driver greeting and online/offline status
- Online/Offline toggle button (changes between active/inactive)
- Stats row: Total Deliveries, Rating, Today's Earnings
- Active delivery card (if online + has active delivery):
  - Order ID, delivery address, customer phone
  - "NAVIGATE" button (for future Google Maps integration)
- Recent deliveries list (last 5 completed)
- Pull-to-refresh

**Data Fetched:**
```javascript
fetchDriverProfile() // Get updated driver stats
fetchDeliveries()    // Get deliveries for this driver
```

#### Tab 2: ORDERS 📦

**Features:**
- List of all deliveries for this driver
- Each card shows:
  - Order ID
  - Status badge (pending/in_transit/delivered)
  - Delivery address
  - Date
  - Delivery fee
- Status-based styling
- Pull-to-refresh

#### Tab 3: EARNINGS 💰

**Features:**
- Total earnings summary card (sum of all delivery fees)
- Stats grid:
  - Completed deliveries count
  - Average rating
  - Average per order
- Transaction history (all completed deliveries)
- Pull-to-refresh

**Calculations:**
```javascript
totalEarnings = deliveries
  .filter(d => d.status === 'delivered')
  .reduce((sum, d) => sum + d.delivery_fee, 0)
```

#### Tab 4: PROFILE 👤

**Features:**
- Profile header with:
  - Avatar with first letter of name
  - Full name
  - Email
  - Status badge
- Driver information cards:
  - Full Name
  - Phone Number
  - License Number
  - Vehicle Type
- Performance stats:
  - Total Deliveries
  - Rating
- Support card:
  - Phone: 087 240 1200
  - Hours: Mon-Fri 8am-5pm, Sat 8am-1pm
- Sign out button with confirmation

**Navigation:**
- "SIGN OUT" → Logout alert → Login screen

---

## 🔧 Key Technical Patterns

### Authentication Flow
```javascript
// In App.js
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    if (!session) setDriverProfile(null);
  });

  return () => subscription.unsubscribe();
}, []);
```

### Preventing Web Refresh (Critical for Expo Snack)
```javascript
// 1. Use useRef for Animated values
const fadeAnim = useRef(new Animated.Value(0)).current;

// 2. Use useCallback for handlers
const updateField = useCallback((field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
}, []);

// 3. Functional state updates
setErrors((prev) => ({ ...prev, email: null }));

// 4. Add to input styles
input: {
  outlineStyle: 'none', // Prevents focus outline reflow
}

// 5. Disable during loading
<TextInput editable={!isLoading} />
<TouchableOpacity disabled={isLoading} />
```

### Data Fetching Pattern
```javascript
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) throw error;
    if (data) setData(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "table 'public.drivers' not found"
**Solution:** Run `supabase-schema.sql` in Supabase SQL Editor

### Issue 2: Web preview refreshes on input
**Solution:** Use optimized Login/Register files with:
- `useRef` for animations
- `useCallback` for handlers
- `outlineStyle: 'none'`
- Functional state updates

### Issue 3: User can login but no profile shown
**Solution:** Check driver status in database:
```sql
SELECT * FROM drivers WHERE user_id = 'user-uuid-here';
```
Status must be `'active'` not `'pending'`

### Issue 4: RLS policy prevents access
**Solution:** Verify policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'drivers';
```

### Issue 5: Images not loading
**Solution:** Add `logo.png` (120x120px) to `/assets` folder

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "expo": "~54.0.33",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-svg": "15.12.1",
    "@expo/vector-icons": "^15.0.3",
    "react-native-paper": "4.9.2",
    "lucide-react-native": "*",
    "@supabase/supabase-js": "*",
    "expo-constants": "~17.0.4",
    "expo-location": "~18.0.7",
    "expo-camera": "~16.0.10",
    "expo-image-picker": "~16.0.6",
    "dotenv": "^16.4.7",
    "@react-native-async-storage/async-storage": "2.1.0"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@babel/preset-env": "^7.26.0",
    "babel-jest": "^29.7.0",
    "jest": "^29.7.0",
    "eslint": "^8.57.0",
    "prettier": "^3.4.2"
  }
}
```

---

## 🚦 Setup Checklist

### Phase 1: Initial Setup
- [x] Create Expo Snack project
- [x] Install dependencies
- [x] Add Netflorist logo to `/assets`
- [x] Set up Supabase project
- [x] Get Supabase URL and anon key

### Phase 2: Database Setup
- [x] Run `supabase-schema.sql` in Supabase SQL Editor
- [x] Verify tables created: `drivers`, `deliveries`, `earnings`
- [x] Verify RLS policies enabled
- [x] Test RLS policies work

### Phase 3: App Development
- [x] Create SplashScreen.js
- [x] Create Login.js with Supabase auth
- [x] Create Register.js with profile creation
- [x] Create ForgotPassword.js
- [x] Create Dashboard.js with 4 tabs
- [x] Implement App.js navigation
- [x] Optimize for web preview (prevent refresh)

### Phase 4: Testing
- [x] Test registration flow
- [x] Test login flow
- [x] Test forgot password flow
- [x] Test dashboard tabs
- [x] Test online/offline toggle
- [x] Test logout flow
- [ ] Test on physical device (iOS)
- [ ] Test on physical device (Android)

### Phase 5: Future Features (Not Yet Built)
- [ ] Google Maps navigation integration
- [ ] Real-time delivery tracking
- [ ] Push notifications for new orders
- [ ] Photo capture for proof of delivery
- [ ] Digital signature capture
- [ ] In-app chat with support
- [ ] Earnings withdrawal system
- [ ] Performance analytics
- [ ] Document upload (license, insurance)

---

## 🎯 Testing Accounts

### Test Driver Account
```
Email: test@driver.com
Password: test123
Status: Set to 'active' in database for testing
```

To create test driver:
```sql
-- 1. Register via app
-- 2. Update status in database:
UPDATE drivers 
SET status = 'active' 
WHERE email = 'test@driver.com';
```

---

## 📊 Status Overview

### ✅ Completed Features
1. ✅ Splash screen with animations
2. ✅ Login with Supabase auth
3. ✅ Registration with driver profile
4. ✅ Forgot password flow
5. ✅ Dashboard with 4 tabs (Home, Orders, Earnings, Profile)
6. ✅ Online/Offline status toggle
7. ✅ Driver stats display
8. ✅ Recent deliveries list
9. ✅ Earnings calculation
10. ✅ Profile information display
11. ✅ Logout functionality
12. ✅ Web refresh optimization
13. ✅ Database schema with RLS
14. ✅ Auto-update triggers

### 🔜 Pending Features (Future Development)
1. 🔜 Accept/decline delivery requests
2. 🔜 Google Maps navigation
3. 🔜 Real-time GPS tracking
4. 🔜 Push notifications
5. 🔜 Photo proof of delivery
6. 🔜 Digital signature
7. 🔜 In-app chat
8. 🔜 Document uploads
9. 🔜 Withdrawal requests
10. 🔜 Performance analytics

---

## 💡 Important Notes

### Security
- ✅ All Supabase queries use RLS (Row Level Security)
- ✅ Drivers can only access their own data
- ✅ Password reset requires email verification
- ✅ Auth tokens managed by Supabase
- ⚠️ Never commit `.env` file with real credentials

### Performance
- ✅ Optimized for Expo Snack web preview
- ✅ Prevents unnecessary re-renders
- ✅ Uses memoization (useCallback)
- ✅ Database indexes on frequently queried columns
- ✅ Pull-to-refresh for data updates

### UX/UI
- ✅ Consistent Netflorist branding
- ✅ Smooth animations throughout
- ✅ Loading states for async operations
- ✅ Error messages for validation
- ✅ Touch feedback on buttons
- ✅ Keyboard-aware forms

### Data Flow
```
User Action → Form Validation → Supabase API Call → 
Database Update → RLS Check → Response → 
UI Update → Navigation
```

---

## 🔗 Quick Links

- **Supabase Project:** https://app.supabase.com/project/xaikxueachrjydabuueb
- **SQL Editor:** https://app.supabase.com/project/xaikxueachrjydabuueb/sql/new
- **Table Editor:** https://app.supabase.com/project/xaikxueachrjydabuueb/editor
- **Auth Users:** https://app.supabase.com/project/xaikxueachrjydabuueb/auth/users
- **Expo Snack:** https://snack.expo.dev

---

## 📞 Support Contact

**Netflorist Driver Support:**
- Phone: 087 240 1200
- Hours: Mon-Fri 8am-5pm, Sat 8am-1pm

---

## 🎓 Key Learnings

1. **Always use `useRef` for Animated values** to prevent recreation on re-renders
2. **Use `useCallback`** for functions passed to multiple child components
3. **Functional state updates** prevent stale closure issues
4. **`outlineStyle: 'none'`** prevents web input focus issues
5. **RLS policies are essential** for multi-tenant security
6. **Auto-update triggers** keep stats synchronized
7. **Pull-to-refresh** improves UX for data updates
8. **Status checks after login** prevent unauthorized access
9. **Separate success states** improve password reset UX
10. **Memoization reduces re-renders** significantly

---

## 🚀 Next Session Continuity

**To continue this project:**

1. Review this workflow document
2. Check current Supabase schema status
3. Verify all tables exist and RLS is enabled
4. Test authentication flow
5. Continue from "Future Features" section

**Current State:**
- ✅ Authentication: Complete
- ✅ Dashboard: Complete (4 tabs)
- ✅ Database: Schema created
- 🔜 Next: Delivery management features

---

## 📝 Version History

- **v1.0** - Initial build with auth and dashboard (Current)
- **v2.0** - Delivery management (Planned)
- **v3.0** - Real-time tracking (Planned)
- **v4.0** - Advanced features (Planned)

---

**Last Updated:** February 17, 2026  
**Build Status:** ✅ Phase 1 Complete  
**Next Milestone:** Delivery Management System
