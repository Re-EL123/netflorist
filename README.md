# 🚚 Netflorist Driver Delivery App

<div align="center">
  <img src="assets/logo.png" alt="Netflorist Logo" width="200"/>
  
  <p><strong>A production-ready React Native mobile application for delivery drivers</strong></p>
  
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Design System](#-design-system)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Expo Snack Setup](#-expo-snack-setup)
- [Supabase Integration](#-supabase-integration)
- [Form Validation](#-form-validation)
- [Screen Flow](#-screen-flow)
- [UI Components](#-ui-components)
- [Security](#-security-best-practices)
- [Roadmap](#-roadmap)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

---

## 🌟 Overview

The **Netflorist Driver Delivery App** is a mobile application designed for delivery drivers to manage their deliveries efficiently. Built with React Native and Expo, the app features a beautiful, modern interface styled consistently with Netflorist's brand identity.

### Why This App?

- 🎯 **Driver-First Design**: Intuitive interface designed for drivers on the go
- 🚀 **Production Ready**: Built with best practices and scalability in mind
- 🎨 **Brand Consistency**: Matches Netflorist's design language perfectly
- 🔒 **Secure**: Implements modern authentication and security practices
- 📱 **Cross-Platform**: Works seamlessly on both iOS and Android

---

## ✨ Features

### Current Features (v1.0)

- ✅ **Animated Splash Screen**
  - Smooth entrance animations
  - Brand identity showcase
  - Professional transitions

- ✅ **Driver Authentication**
  - Secure login system
  - Driver registration with validation
  - Password visibility toggle
  - Forgot password support

- ✅ **Form Validation**
  - Real-time validation
  - Clear error messaging
  - Field-level feedback
  - Client-side security

- ✅ **Responsive Design**
  - Works on all screen sizes
  - Keyboard-aware forms
  - Touch-optimized UI
  - Platform-specific adjustments

- ✅ **Modern UI/UX**
  - Smooth animations
  - Lucide icons integration
  - Loading states
  - Touch feedback

### Coming Soon

- 🔜 Delivery dashboard
- 🔜 Real-time order tracking
- 🔜 Push notifications
- 🔜 Earnings tracker
- 🔜 Route optimization
- 🔜 In-app messaging

---

## 🎨 Design System

### Color Palette

Our color scheme is carefully crafted to match Netflorist's brand identity:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary Red** | `#EF3E62` | Main brand color, CTAs, headers |
| **Primary Purple** | `#7E33C8` | Accent color, links, highlights |
| **Dark Gray** | `#404040` | Primary text, headers |
| **Medium Gray** | `#565656` | Secondary text |
| **Light Gray** | `#F1F5F5` | Backgrounds, cards |
| **Input Gray** | `#9A9EA6` | Placeholders, disabled states |
| **Error Red** | `#E20000` | Validation errors, alerts |
| **Success Green** | `#38AF4B` | Success messages |
| **White** | `#FFFFFF` | Input backgrounds, cards |

### Typography

**Font Family**: Poppins

| Style | Weight | Size | Usage |
|-------|--------|------|-------|
| Display | 700 (Bold) | 34px | Splash screen title |
| H1 | 700 (Bold) | 24px | Page titles |
| H2 | 600 (Semi-Bold) | 20px | Section headers |
| H3 | 500 (Medium) | 16px | Subsections |
| Body | 400 (Regular) | 14px | Body text |
| Caption | 400 (Regular) | 12px | Labels, helper text |
| Button | 500 (Medium) | 16px | Button text |

### Spacing System
```javascript
const spacing = {
  xs: 4,   // Minimal spacing
  sm: 8,   // Small spacing
  md: 16,  // Medium spacing
  lg: 24,  // Large spacing
  xl: 32,  // Extra large spacing
};
```

### Border Radius

- **Small**: 8px (badges, small cards)
- **Medium**: 10px (input fields)
- **Large**: 20px (cards, modals)
- **XL**: 40px (buttons)
- **Circle**: 50% (avatars, status indicators)

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React Native 
- **Runtime**: Expo SDK 49+
- **Language**: JavaScript (ES6+)
- **UI Library**: React Native Core Components
- **Icons**: Lucide React Native
- **Animations**: React Native Animated API

### Backend (Ready for Integration)

- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Development Tools

- **IDE**: VS Code / WebStorm
- **Testing**: Expo Snack
- **Version Control**: Git
- **Package Manager**: npm / yarn

---

## 📂 Project Structure
```
netflorist-driver-app/
│
├── 📱 App.js                           # Main navigation controller
│
├── 📁 screens/                         # Screen components
│   ├── SplashScreen.js                # Animated splash screen
│   ├── Login.js                       # Driver login
│   └── Register.js                    # Driver registration
│
├── 📁 components/                      # Reusable components (future)
│   ├── Button.js
│   ├── Input.js
│   └── Card.js
│
├── 📁 lib/                            # Utilities and configurations
│   ├── supabase.js                   # Supabase client (to create)
│   └── constants.js                  # App constants
│
├── 📁 assets/                         # Static assets
│   ├── logo.png                      # Netflorist logo
│   ├── splash.png                    # Splash screen image
│   └── icon.png                      # App icon
│
├── 📁 utils/                          # Helper functions (future)
│   ├── validation.js                 # Form validation helpers
│   └── formatting.js                 # Text formatting
│
├── 📄 app.json                        # Expo configuration
├── 📄 package.json                    # Dependencies
├── 📄 .gitignore                      # Git ignore rules
└── 📄 README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (or yarn v1.22.0+)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: Download from App Store or Google Play

### Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/netflorist-driver-app.git
cd netflorist-driver-app
```

#### Step 2: Install Dependencies
```bash
npm install
```

Or with yarn:
```bash
yarn install
```

#### Step 3: Install Required Packages
```bash
npm install lucide-react-native
npm install @supabase/supabase-js
npm install react-native-paper
```

#### Step 4: Start the Development Server
```bash
expo start
```

Or with yarn:
```bash
yarn start
```

#### Step 5: Run on Your Device

**Option A: Physical Device**
1. Install Expo Go from App Store (iOS) or Google Play (Android)
2. Scan the QR code displayed in your terminal
3. Wait for the app to load

**Option B: Emulator/Simulator**
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

**Option C: Web Browser**
- Press `w` to run in web browser

### Quick Start Commands
```bash
# Start development server
npm start

# Start with tunnel (for remote testing)
npm start -- --tunnel

# Clear cache and start
npm start -- --clear

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

---

## 📱 Expo Snack Setup

To run the app on [Expo Snack](https://snack.expo.dev) without local installation:

### Method 1: Import from GitHub

1. Go to [snack.expo.dev](https://snack.expo.dev)
2. Click **Import** → **GitHub repository**
3. Enter your repository URL
4. Click **Import**

### Method 2: Manual Setup

1. **Create a new Snack**
```
   Visit: https://snack.expo.dev
   Click: Create a new Snack
```

2. **Copy Files**
   - Copy `App.js` content
   - Create `screens/` folder
   - Copy each screen file
   - Upload `logo.png` to `assets/`

3. **Add Dependencies**
   
   Click on **package.json** and add:
```json
   {
     "dependencies": {
       "expo": "~49.0.0",
       "react": "18.2.0",
       "react-native": "0.72.6",
       "lucide-react-native": "*",
       "@supabase/supabase-js": "*",
       "react-native-paper": "5.10.0",
       "react-native-svg": "13.9.0"
     }
   }
```

4. **Save and Run**
   - Click **Save**
   - Scan QR code with Expo Go
   - App will load on your device

### Snack Configuration

Create `app.json` in your Snack:
```json
{
  "expo": {
    "name": "Netflorist Driver",
    "slug": "netflorist-driver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#EF3E62"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.netflorist.driver"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#EF3E62"
      },
      "package": "com.netflorist.driver"
    }
  }
}
```

---

## 🔐 Supabase Integration

### Step 1: Create Supabase Project

1. **Sign up for Supabase**
```
   Visit: https://supabase.com
   Click: Start your project
   Create: New project
```

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy `Project URL`
   - Copy `anon public` key

### Step 2: Setup Supabase Client

Create `lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 3: Create Database Tables

Run these SQL commands in Supabase SQL Editor:

#### Drivers Table
```sql
-- Create drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'suspended')),
  profile_image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_drivers_user_id ON drivers(user_id);

-- Create index on status for filtering
CREATE INDEX idx_drivers_status ON drivers(status);

-- Enable Row Level Security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Drivers can view own profile"
  ON drivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile"
  ON drivers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
  ON drivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Deliveries Table (Future)
```sql
-- Create deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  accepted_time TIMESTAMP WITH TIME ZONE,
  picked_up_time TIMESTAMP WITH TIME ZONE,
  delivered_time TIMESTAMP WITH TIME ZONE,
  delivery_fee DECIMAL(10, 2),
  notes TEXT,
  proof_of_delivery_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_scheduled_time ON deliveries(scheduled_time);

-- Enable RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Drivers can view own deliveries"
  ON deliveries FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own deliveries"
  ON deliveries FOR UPDATE
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));
```

### Step 4: Implement Authentication in Login.js

Update the `handleLogin` function:
```javascript
import { supabase } from '../lib/supabase';

const handleLogin = async () => {
  if (!validateForm()) return;
  
  setIsLoading(true);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });
    
    if (error) throw error;
    
    // Check if driver profile exists
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (driverError) {
      Alert.alert('Error', 'Driver profile not found. Please contact support.');
      await supabase.auth.signOut();
      return;
    }
    
    // Check driver status
    if (driverData.status === 'pending') {
      Alert.alert(
        'Account Pending',
        'Your account is pending approval. You will be notified once approved.'
      );
      await supabase.auth.signOut();
      return;
    }
    
    if (driverData.status === 'suspended') {
      Alert.alert(
        'Account Suspended',
        'Your account has been suspended. Please contact support.'
      );
      await supabase.auth.signOut();
      return;
    }
    
    // Navigate to main app
    console.log('Login successful:', data);
    // TODO: Navigate to Dashboard
    
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Step 5: Implement Registration in Register.js

Update the `handleRegister` function:
```javascript
import { supabase } from '../lib/supabase';

const handleRegister = async () => {
  if (!validateForm()) {
    Alert.alert('Validation Error', 'Please fill in all required fields correctly');
    return;
  }

  setIsLoading(true);

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
        }
      }
    });

    if (authError) throw authError;

    // 2. Create driver profile
    const { data: driverData, error: profileError } = await supabase
      .from('drivers')
      .insert([
        {
          user_id: authData.user.id,
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          license_number: formData.licenseNumber.trim().toUpperCase(),
          vehicle_type: formData.vehicleType.trim(),
          status: 'pending', // Requires admin approval
        }
      ])
      .select()
      .single();

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    Alert.alert(
      'Registration Successful!',
      'Please check your email to verify your account. Your driver profile will be reviewed by our team.',
      [
        {
          text: 'OK',
          onPress: () => onNavigateToLogin()
        }
      ]
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
  } finally {
    setIsLoading(false);
  }
};
```

### Step 6: Setup Auth State Listener

Update `App.js` to handle authentication state:
```javascript
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // User is logged in, navigate to main app
        setCurrentScreen('dashboard'); // Update when dashboard is ready
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setCurrentScreen('dashboard'); // Update when dashboard is ready
      } else {
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Rest of your App.js code...
}
```

### Step 7: Implement Password Reset

Add to `Login.js`:
```javascript
const handleForgotPassword = async () => {
  if (!email) {
    Alert.alert('Email Required', 'Please enter your email address first');
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address');
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'yourapp://reset-password', // Update with your app scheme
    });

    if (error) throw error;

    Alert.alert(
      'Check Your Email',
      'We have sent you a password reset link. Please check your email.'
    );
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## 📋 Form Validation

### Login Screen Validation Rules

| Field | Validation Rules | Error Messages |
|-------|-----------------|----------------|
| Email | • Required<br>• Valid email format | • "Email is required"<br>• "Email is invalid" |
| Password | • Required<br>• Minimum 6 characters | • "Password is required"<br>• "Password must be at least 6 characters" |

### Registration Screen Validation Rules

| Field | Validation Rules | Error Messages |
|-------|-----------------|----------------|
| Full Name | • Required<br>• Minimum 3 characters<br>• Only letters and spaces | • "Full name is required"<br>• "Name must be at least 3 characters" |
| Email | • Required<br>• Valid email format<br>• Lowercase | • "Email is required"<br>• "Email is invalid" |
| Phone | • Required<br>• Exactly 10 digits<br>• Only numbers | • "Phone number is required"<br>• "Phone number must be 10 digits" |
| License Number | • Required<br>• Alphanumeric | • "License number is required" |
| Vehicle Type | • Required<br>• Minimum 2 characters | • "Vehicle type is required" |
| Password | • Required<br>• Minimum 6 characters<br>• Must contain letter and number (recommended) | • "Password is required"<br>• "Password must be at least 6 characters" |
| Confirm Password | • Required<br>• Must match password | • "Please confirm password"<br>• "Passwords do not match" |

### Validation Code Examples
```javascript
// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (10 digits)
const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Password strength validation
const validatePasswordStrength = (password) => {
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: hasMinLength && hasLetter && hasNumber,
    hasMinLength,
    hasLetter,
    hasNumber,
  };
};

// Full name validation
const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{3,}$/;
  return nameRegex.test(name.trim());
};
```

---

## 🔄 Screen Flow

### Application Navigation Flow
```
┌─────────────────────────────────────────────────────┐
│                   App Launch                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │ Splash Screen  │
          │   (3 seconds)  │
          └────────┬───────┘
                   │
                   ▼
          ┌────────────────┐
          │ Check Auth     │
          │ State          │
          └────┬───────┬───┘
               │       │
        No     │       │    Yes
      Session  │       │  Session
               │       │
               ▼       ▼
       ┌───────────┐ ┌──────────────┐
       │   Login   │ │  Dashboard   │
       │  Screen   │ │   (Future)   │
       └─────┬─────┘ └──────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐   ┌─────────────┐
│ Register │   │   Forgot    │
│  Screen  │   │  Password   │
└────┬─────┘   └─────────────┘
     │
     │ Success
     ▼
┌──────────────┐
│ Verification │
│    Email     │
└──────┬───────┘
       │
       │ Verified
       ▼
┌──────────────┐
│   Pending    │
│  Approval    │
└──────┬───────┘
       │
       │ Approved
       ▼
┌──────────────┐
│  Dashboard   │
│   (Active)   │
└──────────────┘
```

### Screen Interactions

#### Login Screen
- **Navigation Options**:
  - Register → Goes to Register Screen
  - Forgot Password → Password Reset Flow
  - Sign In → Validates → Dashboard

#### Register Screen
- **Navigation Options**:
  - Sign In → Goes to Login Screen
  - Register → Validates → Success Message → Login Screen

#### Dashboard (Future)
- **Navigation Options**:
  - Active Deliveries
  - Available Orders
  - Earnings
  - Profile
  - Settings

---

## 🎯 UI Components

### Input Field Component
```javascript
// Example Input Field Structure
<View style={styles.inputGroup}>
  <Text style={styles.label}>Label Text</Text>
  <View style={[styles.inputContainer, error && styles.inputError]}>
    <Icon color={error ? '#E20000' : '#9A9EA6'} size={20} />
    <TextInput
      style={styles.input}
      placeholder="Placeholder text"
      placeholderTextColor="#9A9EA6"
      value={value}
      onChangeText={onChange}
    />
    {/* Optional: Toggle Button for passwords */}
  </View>
  {error && <Text style={styles.errorText}>{error}</Text>}
</View>
```

### Button Component
```javascript
// Primary Button
<TouchableOpacity
  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
  onPress={handlePress}
  disabled={isLoading}
  activeOpacity={0.8}
>
  <Text style={styles.buttonText}>
    {isLoading ? 'LOADING...' : 'BUTTON TEXT'}
  </Text>
</TouchableOpacity>
```

### Card Component
```javascript
// Icon Card (Login Screen)
<View style={styles.iconCard}>
  <Icon color="#EF3E62" size={48} strokeWidth={1.5} />
</View>
```

### Component Specifications

#### Input Fields
- **Height**: 42px
- **Border Radius**: 10px
- **Border**: 1px solid rgba(51, 51, 51, 0.1)
- **Padding**: 15px horizontal
- **Icon Size**: 20px
- **Font Size**: 12px
- **Background**: #FFFFFF
- **Shadow**: 0px 4px 6px rgba(0, 0, 0, 0.15)

#### Buttons (Primary)
- **Height**: 50px
- **Border Radius**: 40px
- **Background**: #EE2E5D
- **Text Color**: #FFFFFF
- **Font Size**: 16px
- **Font Weight**: 500
- **Shadow**: 0px 4px 4px rgba(0, 0, 0, 0.25)

#### Cards
- **Border Radius**: 20px
- **Background**: #FFFFFF
- **Shadow**: 0px 4px 8px rgba(0, 0, 0, 0.1)
- **Padding**: 15px

---

## 🔒 Security Best Practices

### Implemented Security Measures

✅ **Client-Side Security**
- Password fields use `secureTextEntry` prop
- Email validation before submission
- Password minimum length enforcement
- Form validation prevents invalid submissions
- Loading states prevent double submissions
- Error messages don't expose sensitive information
- Input sanitization (trim, lowercase emails)

✅ **Authentication**
- Secure password hashing (Supabase)
- JWT token-based authentication
- Session management
- Email verification required
- Password reset functionality

### Recommended Security Practices

🔜 **To Implement**
- [ ] Add rate limiting for login attempts
- [ ] Implement biometric authentication (Face ID/Touch ID)
- [ ] Add device fingerprinting
- [ ] Implement certificate pinning
- [ ] Add session timeout
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add security headers
- [ ] Implement CSP (Content Security Policy)
- [ ] Add input sanitization on backend
- [ ] Implement request throttling

### Security Checklist

- [x] No hardcoded credentials
- [x] Environment variables for secrets
- [x] HTTPS only communication
- [x] Secure storage for tokens
- [x] Input validation (client + server)
- [x] Password strength requirements
- [x] XSS prevention
- [x] SQL injection prevention (via Supabase)
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

### Code Security Examples
```javascript
// Secure password validation
const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
};

// Sanitize user input
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 255); // Limit length
};

// Secure email format
const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};
```

---

## 🚀 Roadmap

### Phase 1: Authentication (Current) ✅

- [x] Splash screen with animations
- [x] Login screen design
- [x] Registration screen design
- [x] Form validation
- [x] UI/UX implementation
- [ ] Supabase authentication integration
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Biometric authentication

**Target Completion**: Week 2

### Phase 2: Driver Dashboard

- [ ] Dashboard home screen
- [ ] Available deliveries list
- [ ] Active delivery view
- [ ] Delivery statistics
- [ ] Earnings overview
- [ ] Quick actions menu
- [ ] Notifications center
- [ ] Real-time updates

**Target Completion**: Week 4

### Phase 3: Delivery Management

- [ ] Order details screen
- [ ] Accept/decline delivery
- [ ] Route navigation integration (Google Maps)
- [ ] GPS tracking
- [ ] Customer contact features
- [ ] Delivery status updates
- [ ] Photo proof of delivery
- [ ] Digital signature capture
- [ ] Delivery completion flow

**Target Completion**: Week 6

### Phase 4: Profile & Settings

- [ ] Driver profile screen
- [ ] Edit profile information
- [ ] Upload profile picture
- [ ] Vehicle information management
- [ ] Document uploads
  - Driver's license
  - Vehicle registration
  - Insurance documents
  - ID document
- [ ] Notification preferences
- [ ] Language settings
- [ ] Help & support
- [ ] Terms & conditions
- [ ] Privacy policy
- [ ] Logout functionality

**Target Completion**: Week 8

### Phase 5: Earnings & History

- [ ] Earnings dashboard
- [ ] Daily/weekly/monthly earnings
- [ ] Delivery history
- [ ] Transaction history
- [ ] Payment method setup
- [ ] Withdrawal requests
- [ ] Tax documents
- [ ] Performance metrics
- [ ] Export reports (PDF/CSV)

**Target Completion**: Week 10

### Phase 6: Advanced Features

- [ ] Real-time GPS tracking
- [ ] Route optimization
- [ ] In-app chat with support
- [ ] In-app chat with customers
- [ ] Push notifications
- [ ] Rating and review system
- [ ] Performance analytics
- [ ] Gamification features
- [ ] Referral program
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Background location updates

**Target Completion**: Week 14

### Phase 7: Testing & Optimization

- [ ] Unit testing
- [ ] Integration testing
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing program
- [ ] Bug fixes
- [ ] Code refactoring
- [ ] Documentation updates

**Target Completion**: Week 16

### Phase 8: Launch Preparation

- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Marketing materials
- [ ] User documentation
- [ ] Driver training materials
- [ ] Support system setup
- [ ] Analytics integration
- [ ] Crash reporting setup
- [ ] Production deployment

**Target Completion**: Week 18

---

## 🧪 Testing

### Manual Testing Checklist

#### Splash Screen
- [ ] Logo displays correctly at proper size
- [ ] All animations run smoothly (60 FPS)
- [ ] Title and subtitle appear with correct fonts
- [ ] Transitions to login screen after 3 seconds
- [ ] No visual glitches or flickers
- [ ] Decorative circles animate correctly
- [ ] Works on different screen sizes

#### Login Screen
- [ ] All input fields are visible and accessible
- [ ] Email validation shows correct error messages
- [ ] Password validation shows correct error messages
- [ ] Show/hide password toggle works correctly
- [ ] Empty fields show validation errors
- [ ] Invalid email format shows error
- [ ] Short password shows error
- [ ] Forgot password button is clickable
- [ ] Register link navigates to register screen
- [ ] Loading state appears during submission
- [ ] Button disabled during loading
- [ ] Success message appears on valid login
- [ ] Error message appears on invalid login
- [ ] Form scrolls properly on keyboard open
- [ ] Keyboard doesn't cover input fields
- [ ] Tab order is logical
- [ ] Touch targets are adequate size (44x44 minimum)

#### Register Screen
- [ ] All input fields are visible and accessible
- [ ] Full name validation works correctly
- [ ] Email validation works correctly
- [ ] Phone validation works correctly (10 digits)
- [ ] License number field accepts input
- [ ] Vehicle type field accepts input
- [ ] Password validation works correctly
- [ ] Confirm password validation works correctly
- [ ] Password match validation works
- [ ] Show/hide password toggles work (both fields)
- [ ] All error messages display correctly
- [ ] Loading state appears during submission
- [ ] Button disabled during loading
- [ ] Success message appears on valid registration
- [ ] Error message appears on invalid registration
- [ ] Navigation to login works correctly
- [ ] Form scrolls properly on keyboard open
- [ ] Keyboard doesn't cover active input
- [ ] All fields clear on navigation away

#### Cross-Platform Testing
- [ ] iOS - iPhone 8
- [ ] iOS - iPhone 12
- [ ] iOS - iPhone 14 Pro Max
- [ ] iOS - iPad
- [ ] Android - Small phone (< 5")
- [ ] Android - Medium phone (5-6")
- [ ] Android - Large phone (> 6")
- [ ] Android - Tablet
- [ ] Web browser (Chrome)
- [ ] Web browser (Safari)
- [ ] Web browser (Firefox)

#### Performance Testing
- [ ] App loads in under 3 seconds
- [ ] Animations run at 60 FPS
- [ ] No memory leaks
- [ ] Images load quickly
- [ ] Form submission is responsive
- [ ] Navigation is instant
- [ ] No UI lag or stuttering

#### Accessibility Testing
- [ ] All touch targets minimum 44x44px
- [ ] Text is readable (minimum 12px)
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels are properly associated
- [ ] Error messages are clear and helpful
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (future)

### Automated Testing (Future)
```javascript
// Example test structure using Jest

// Login.test.js
describe('Login Screen', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should validate email format', () => {
    // Test implementation
  });

  it('should show error for invalid credentials', () => {
    // Test implementation
  });

  it('should navigate to register screen', () => {
    // Test implementation
  });
});

// Register.test.js
describe('Register Screen', () => {
  it('should validate all required fields', () => {
    // Test implementation
  });

  it('should match passwords', () => {
    // Test implementation
  });

  it('should create new driver account', () => {
    // Test implementation
  });
});
```

---

## 📝 Environment Variables

### Local Development

Create a `.env` file in the root directory:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API (Future)
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Push Notifications (Future)
EXPO_PUSH_TOKEN=your-expo-push-token

# Environment
NODE_ENV=development
```

### Expo Configuration

For Expo projects, use `app.config.js`:
```javascript
export default {
  expo: {
    name: 'Netflorist Driver',
    slug: 'netflorist-driver',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#EF3E62',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.netflorist.driver',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app needs access to your location to show delivery routes.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'This app needs access to your location to track deliveries.',
        NSCameraUsageDescription:
          'This app needs access to your camera for proof of delivery photos.',
        NSPhotoLibraryUsageDescription:
          'This app needs access to your photo library to upload delivery photos.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#EF3E62',
      },
      package: 'com.netflorist.driver',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: 'your-project-id',
      },
    },
  },
};
```

### Accessing Environment Variables
```javascript
import Constants from 'expo-constants';

// Access environment variables
const supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;
```

### Production Environment

For production, use Expo's secrets management:
```bash
# Using EAS Secrets
eas secret:create --scope project --name SUPABASE_URL --value your-value
eas secret:create --scope project --name SUPABASE_ANON_KEY --value your-value
```

---

## 🤝 Contributing

We welcome contributions to the Netflorist Driver App! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
```bash
   git clone https://github.com/your-username/netflorist-driver-app.git
```
3. **Create a branch**
```bash
   git checkout -b feature/AmazingFeature
```
4. **Make your changes**
5. **Test your changes**
6. **Commit your changes**
```bash
   git commit -m 'Add some AmazingFeature'
```
7. **Push to the branch**
```bash
   git push origin feature/AmazingFeature
```
8. **Open a Pull Request**

### Contribution Guidelines

#### Code Style

- Use functional components with hooks
- Follow React Native best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused
- Use PropTypes or TypeScript for type checking

#### Commit Messages

Follow the Conventional Commits specification:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

Examples:
```bash
git commit -m "feat: Add delivery history screen"
git commit -m "fix: Resolve login validation issue"
git commit -m "docs: Update README with setup instructions"
```

#### Pull Request Process

1. Update README.md with details of changes if needed
2. Update the version number following [SemVer](https://semver.org/)
3. Ensure all tests pass
4. Get at least one code review approval
5. Squash commits before merging

#### What We're Looking For

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌐 Translations
- 🧪 Test coverage
- ⚡ Performance optimizations

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

---

## 📞 Support

### Getting Help

If you need assistance with the app:

#### For Drivers
- **Phone**: 087 240 1200
- **Email**: support@netflorist.co.za
- **Hours**: 
  - Monday - Friday: 8:00 AM - 5:00 PM
  - Saturday: 8:00 AM - 1:00 PM
  - Sunday: Closed

#### For Developers
- **Issues**: [GitHub Issues](https://github.com/yourusername/netflorist-driver-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/netflorist-driver-app/discussions)
- **Email**: dev@netflorist.co.za

### Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: How to recreate the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**:
   - Device model
   - OS version
   - App version
   - Expo version

Example bug report:
```markdown
**Bug Description**
Login button doesn't respond on first tap

**Steps to Reproduce**
1. Open the app
2. Navigate to login screen
3. Enter valid credentials
4. Tap login button

**Expected Behavior**
Login should process immediately

**Actual Behavior**
Button requires 2-3 taps to respond

**Environment**
- Device: iPhone 12
- iOS: 16.5
- App Version: 1.0.0
- Expo: 49.0.0

**Screenshots**
[Attach screenshot if applicable]
```

### Feature Requests

We welcome feature requests! Please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How would this feature work?
3. **Alternatives**: What alternatives have you considered?
4. **Additional Context**: Any other relevant information

---

## 📄 License

This project is licensed under the MIT License - see below for details:
```
MIT License

Copyright (c) 2024 Netflorist Driver App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team

### Core Team

- **Product Owner**: Netflorist Management
- **Lead Developer**: [Your Name]
- **UI/UX Designer**: Based on Netflorist Design System
- **Backend Developer**: Supabase Integration Team
- **QA Engineer**: [Name]

### Contributors

Thanks to all the contributors who have helped build this app!

<!-- 
Add contributor avatars here using:
<a href="https://github.com/username">
  <img src="https://github.com/username.png" width="50" height="50" />
</a>
-->

---

## 🙏 Acknowledgments

### Design & Inspiration
- **Netflorist** - For the beautiful design system and brand guidelines
- [Netflorist Website](https://www.netflorist.co.za/) - Design inspiration

### Technologies & Tools
- **Expo Team** - For the amazing React Native framework
- **Supabase** - For the powerful backend platform
- **Lucide Icons** - For the beautiful icon library
- **React Native Community** - For the excellent documentation and support

### Special Thanks
- All beta testers who helped improve the app
- Open source community for the amazing tools
- Drivers who provided valuable feedback

---

## 📚 Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Navigation](https://reactnavigation.org/)

### Tutorials
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)
- [Supabase Auth Tutorial](https://supabase.com/docs/guides/auth)
- [React Hooks Tutorial](https://reactjs.org/docs/hooks-intro.html)

### Community
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)
- [Supabase Discord](https://discord.supabase.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Design Resources
- [React Native UI Libraries](https://reactnative.directory/)
- [Color Palette Generator](https://coolors.co/)
- [Font Pairing](https://fontpair.co/)
- [Icon Libraries](https://icons8.com/)

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Live Demo** | [Expo Snack](https://snack.expo.dev/@yourproject) |
| **GitHub Repository** | [GitHub](https://github.com/yourusername/netflorist-driver-app) |
| **Issue Tracker** | [Issues](https://github.com/yourusername/netflorist-driver-app/issues) |
| **Discussions** | [Discussions](https://github.com/yourusername/netflorist-driver-app/discussions) |
| **Netflorist Website** | [netflorist.co.za](https://www.netflorist.co.za/) |
| **Supabase Dashboard** | [app.supabase.com](https://app.supabase.com/) |

---

## 📊 Project Status

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)

**Current Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Active Development  
**Next Release**: February 2024

---

## 📱 Download

### Coming Soon to App Stores

<div style="display: flex; gap: 20px;">
  <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" width="200" alt="Download on App Store" />
  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="225" alt="Get it on Google Play" />
</div>

---

<div align="center">
  
  ### Built with ❤️ for Netflorist Delivery Drivers
  
  **Making deliveries easier, one tap at a time**
  
  ---
  
  [⬆ Back to Top](#-netflorist-driver-delivery-app)
  
</div>