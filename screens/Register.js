// screens/Register.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Alert,
  Modal,
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Truck,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const VEHICLE_TYPES = ['Car', 'Van', 'Motorcycle', 'Bicycle', 'Truck'];

export default function Register({ onNavigateToLogin }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    license: '',
    vehicleType: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateField = useCallback(
    (field, value) => {
      setForm((p) => ({ ...p, [field]: value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
    },
    [errors]
  );

  const validate = () => {
    const e = {};
    if (!form.fullName || form.fullName.trim().length < 3)
      e.fullName = 'Min 3 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Valid email required';
    if (!form.phone || form.phone.replace(/\s/g, '').length < 10)
      e.phone = 'Valid phone required';
    if (!form.license || form.license.trim().length < 2)
      e.license = 'License number required';
    if (!form.vehicleType) e.vehicleType = 'Select vehicle type';
    if (!form.password || form.password.length < 6)
      e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);

    const cleanEmail = form.email.trim().toLowerCase();

    try {
      // 1. Check if driver profile already exists for this email
      const { data: existingDriver } = await supabase
        .from('drivers')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingDriver) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Please sign in instead.',
          [{ text: 'Go to Login', onPress: onNavigateToLogin }]
        );
        return;
      }

      // 2. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: { data: { full_name: form.fullName.trim() } },
      });

      if (error) {
        if (
          error.message.includes('already registered') ||
          error.message.includes('User already registered')
        ) {
          Alert.alert(
            'Email Already Registered',
            'This email is already registered. Please sign in or use forgot password.',
            [{ text: 'Go to Login', onPress: onNavigateToLogin }]
          );
          return;
        }
        throw error;
      }

      if (!data?.user?.id) {
        throw new Error('Registration failed — no user returned. Please try again.');
      }

      // 3. Brief delay to let auth session establish
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 4. Create driver profile
      const { error: dErr } = await supabase.from('drivers').insert({
        user_id: data.user.id,
        full_name: form.fullName.trim(),
        email: cleanEmail,
        phone: form.phone.trim().replace(/\s/g, ''),
        license_number: form.license.trim(),
        vehicle_type: form.vehicleType,
        driver_type: 'permanent',
        status: 'pending',
        online_status: 'offline',
      });

      if (dErr) {
        console.error('Driver insert error:', dErr);

        // If it's a duplicate, the user already has a profile
        if (
          dErr.message.includes('duplicate') ||
          dErr.message.includes('unique') ||
          dErr.message.includes('already exists')
        ) {
          Alert.alert(
            'Profile Exists',
            'A driver profile already exists. Please sign in.',
            [{ text: 'Go to Login', onPress: onNavigateToLogin }]
          );
          return;
        }
        throw dErr;
      }

      // 5. Sign out so they login after admin approval
      await supabase.auth.signOut();

      // 6. Success
      Alert.alert(
        'Registration Successful! 🎉',
        'Your account has been created and is pending admin approval. You will be notified once approved.',
        [{ text: 'OK', onPress: onNavigateToLogin }]
      );
    } catch (err) {
      console.error('Registration error:', err);

      let msg = err.message || 'Please try again.';
      if (msg.includes('rate limit'))
        msg = 'Too many attempts. Wait a few minutes.';
      else if (msg.includes('network'))
        msg = 'Network error. Check your connection.';

      Alert.alert('Registration Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (label, field, icon, props = {}) => (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, errors[field] && s.inputErr]}>
        {icon}
        <TextInput
          style={s.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9A9EA6"
          value={form[field]}
          onChangeText={(t) => updateField(field, t)}
          editable={!isLoading}
          {...props}
        />
      </View>
      {errors[field] && <Text style={s.err}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            s.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={s.header}>
            <Image
              source={require('../assets/logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.title}>Driver Registration</Text>
            <Text style={s.subtitle}>Create your driver account</Text>
          </View>

          <View style={s.form}>
            {renderField(
              'Full Name',
              'fullName',
              <User
                color={errors.fullName ? '#E20000' : '#9A9EA6'}
                size={20}
                style={s.ico}
              />,
              { autoCapitalize: 'words' }
            )}
            {renderField(
              'Email',
              'email',
              <Mail
                color={errors.email ? '#E20000' : '#9A9EA6'}
                size={20}
                style={s.ico}
              />,
              { keyboardType: 'email-address', autoCapitalize: 'none' }
            )}
            {renderField(
              'Phone Number',
              'phone',
              <Phone
                color={errors.phone ? '#E20000' : '#9A9EA6'}
                size={20}
                style={s.ico}
              />,
              { keyboardType: 'phone-pad' }
            )}
            {renderField(
              'License Number',
              'license',
              <CreditCard
                color={errors.license ? '#E20000' : '#9A9EA6'}
                size={20}
                style={s.ico}
              />,
              { autoCapitalize: 'characters' }
            )}

            {/* Vehicle Type Picker */}
            <View style={s.group}>
              <Text style={s.label}>Vehicle Type</Text>
              <TouchableOpacity
                style={[s.inputWrap, errors.vehicleType && s.inputErr]}
                onPress={() => setShowPicker(true)}
                disabled={isLoading}
              >
                <Truck
                  color={errors.vehicleType ? '#E20000' : '#9A9EA6'}
                  size={20}
                  style={s.ico}
                />
                <Text
                  style={[
                    s.input,
                    {
                      paddingTop: 2,
                      color: form.vehicleType ? '#333' : '#9A9EA6',
                    },
                  ]}
                >
                  {form.vehicleType || 'Select vehicle type'}
                </Text>
                <ChevronDown color="#9A9EA6" size={20} />
              </TouchableOpacity>
              {errors.vehicleType && (
                <Text style={s.err}>{errors.vehicleType}</Text>
              )}
            </View>

            {/* Password */}
            <View style={s.group}>
              <Text style={s.label}>Password</Text>
              <View style={[s.inputWrap, errors.password && s.inputErr]}>
                <Lock
                  color={errors.password ? '#E20000' : '#9A9EA6'}
                  size={20}
                  style={s.ico}
                />
                <TextInput
                  style={s.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9A9EA6"
                  value={form.password}
                  onChangeText={(t) => updateField('password', t)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eye}
                >
                  {showPassword ? (
                    <EyeOff color="#9A9EA6" size={20} />
                  ) : (
                    <Eye color="#9A9EA6" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={s.err}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={s.group}>
              <Text style={s.label}>Confirm Password</Text>
              <View style={[s.inputWrap, errors.confirmPassword && s.inputErr]}>
                <Lock
                  color={errors.confirmPassword ? '#E20000' : '#9A9EA6'}
                  size={20}
                  style={s.ico}
                />
                <TextInput
                  style={s.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9A9EA6"
                  value={form.confirmPassword}
                  onChangeText={(t) => updateField('confirmPassword', t)}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={s.eye}
                >
                  {showConfirm ? (
                    <EyeOff color="#9A9EA6" size={20} />
                  ) : (
                    <Eye color="#9A9EA6" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={s.err}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[s.btn, isLoading && s.btnDis]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={s.btnTxt}>
                {isLoading ? 'REGISTERING...' : 'REGISTER'}
              </Text>
            </TouchableOpacity>

            <View style={s.regRow}>
              <Text style={s.regTxt}>Already have an account? </Text>
              <TouchableOpacity
                onPress={onNavigateToLogin}
                disabled={isLoading}
              >
                <Text style={s.regLink}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerTitle}>Need Assistance?</Text>
            <Text style={s.footerPhone}>Call: 087 240 1200</Text>
            <Text style={s.footerHours}>Mon-Fri: 8am-5pm | Sat: 8am-1pm</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Vehicle Type Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={s.modalContent}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Select Vehicle Type</Text>
            {VEHICLE_TYPES.map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  s.modalItem,
                  form.vehicleType === v && s.modalItemActive,
                ]}
                onPress={() => {
                  updateField('vehicleType', v);
                  setShowPicker(false);
                }}
              >
                <Text
                  style={[
                    s.modalItemTxt,
                    form.vehicleType === v && s.modalItemTxtActive,
                  ]}
                >
                  {v}
                </Text>
                {form.vehicleType === v && (
                  <Text style={s.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.modalCancel}
              onPress={() => setShowPicker(false)}
            >
              <Text style={s.modalCancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F5' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 },
  content: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EE2E5D',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: '#404040', textTransform: 'uppercase' },
  form: { marginBottom: 30 },
  group: { marginBottom: 16 },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(51,51,51,0.1)',
    paddingHorizontal: 15,
    height: 42,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputErr: { borderColor: '#E20000', borderWidth: 2 },
  ico: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    padding: 0,
    outlineStyle: 'none',
  },
  eye: { padding: 5 },
  err: { fontSize: 11, color: '#E20000', marginTop: 4 },
  btn: {
    backgroundColor: '#EE2E5D',
    borderRadius: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnDis: { opacity: 0.6 },
  btnTxt: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  regRow: { flexDirection: 'row', justifyContent: 'center' },
  regTxt: { fontSize: 12, color: '#404040', textTransform: 'uppercase' },
  regLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#404040',
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 157, 236, 0.5)',
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7E33C8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footerPhone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 2,
  },
  footerHours: { fontSize: 12, color: '#7E33C8' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F5',
  },
  modalItemActive: {
    backgroundColor: '#FFF0F3',
    borderRadius: 8,
  },
  modalItemTxt: { fontSize: 16, color: '#404040' },
  modalItemTxtActive: { color: '#EF3E62', fontWeight: '600' },
  checkMark: { fontSize: 18, color: '#EF3E62', fontWeight: '700' },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#F1F5F5',
    borderRadius: 10,
  },
  modalCancelTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF3E62',
    textAlign: 'center',
  },
});