// screens/Login.js
import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Eye, EyeOff, Mail, Lock, Truck } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function Login({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email is invalid';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      const { data: driver, error: dErr } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (dErr || !driver) {
        Alert.alert(
          'Profile Not Found',
          'Driver profile not found. Contact support: 087 240 1200.'
        );
        await supabase.auth.signOut();
        return;
      }
      if (driver.status === 'pending') {
        Alert.alert('Account Pending', 'Your account is awaiting approval.');
        await supabase.auth.signOut();
        return;
      }
      if (driver.status === 'suspended') {
        Alert.alert('Account Suspended', 'Contact support: 087 240 1200.');
        await supabase.auth.signOut();
        return;
      }
      onLoginSuccess(driver);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View
          style={[
            s.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          <View style={s.header}>
            <Image
              source={require('../assets/logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.title}>Driver Login</Text>
            <Text style={s.subtitle}>Sign in to start delivering</Text>
          </View>
          <View style={s.iconCard}>
            <Truck color="#EF3E62" size={48} strokeWidth={1.5} />
          </View>
          <View style={s.form}>
            <View style={s.group}>
              <Text style={s.label}>Email</Text>
              <View style={[s.inputWrap, errors.email && s.inputErr]}>
                <Mail
                  color={errors.email ? '#E20000' : '#9A9EA6'}
                  size={20}
                  style={s.ico}
                />
                <TextInput
                  style={s.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9A9EA6"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((p) => ({ ...p, email: null }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              {errors.email && <Text style={s.err}>{errors.email}</Text>}
            </View>
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
                  placeholder="Enter your password"
                  placeholderTextColor="#9A9EA6"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: null }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eye}
                  disabled={isLoading}>
                  {showPassword ? (
                    <EyeOff color="#9A9EA6" size={20} />
                  ) : (
                    <Eye color="#9A9EA6" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={s.err}>{errors.password}</Text>}
            </View>
            <TouchableOpacity
              style={s.forgot}
              onPress={onNavigateToForgotPassword}
              disabled={isLoading}>
              <Text style={s.forgotTxt}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, isLoading && s.btnDis]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}>
              <Text style={s.btnTxt}>
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </Text>
            </TouchableOpacity>
            <View style={s.regRow}>
              <Text style={s.regTxt}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={onNavigateToRegister}
                disabled={isLoading}>
                <Text style={s.regLink}>Register here</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.footer}>
            <Text style={s.fTitle}>Need Assistance?</Text>
            <Text style={s.fPhone}>Call: 087 240 1200</Text>
            <Text style={s.fHours}>Mon-Fri: 8am-5pm | Sat: 8am-1pm</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F5' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 },
  content: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 120, height: 120, marginBottom: 15 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EE2E5D',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: '#404040', textTransform: 'uppercase' },
  iconCard: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  form: { marginBottom: 30 },
  group: { marginBottom: 20 },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
  err: { fontSize: 11, color: '#E20000', marginTop: 5 },
  forgot: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotTxt: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E20000',
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
  btn: {
    backgroundColor: '#EE2E5D',
    borderRadius: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderTopColor: 'rgba(196,157,236,0.5)',
  },
  fTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7E33C8',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  fPhone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#404040',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  fHours: { fontSize: 14, color: '#7E33C8', textTransform: 'uppercase' },
});
