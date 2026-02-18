// screens/ForgotPassword.js
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
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function ForgotPassword({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
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

  const handleReset = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Valid email required');
      return;
    }
    setIsLoading(true);
    try {
      const { error: rErr } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: 'netfloristdriver://reset-password',
        }
      );
      if (rErr) throw rErr;
      setIsSent(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <View style={s.container}>
        <Animated.View style={[s.center, { opacity: fadeAnim }]}>
          <View style={s.checkCircle}>
            <CheckCircle color="#38AF4B" size={64} />
          </View>
          <Text style={s.successTitle}>Check Your Email</Text>
          <Text style={s.successMsg}>We've sent a password reset link to</Text>
          <Text style={s.successEmail}>{email}</Text>
          <TouchableOpacity
            style={s.btn}
            onPress={onNavigateToLogin}
            activeOpacity={0.8}>
            <Text style={s.btnTxt}>BACK TO LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsSent(false);
              setEmail('');
            }}
            style={{ marginTop: 16 }}>
            <Text style={s.resend}>Resend email</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

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
          <TouchableOpacity style={s.back} onPress={onNavigateToLogin}>
            <ArrowLeft color="#EF3E62" size={24} />
            <Text style={s.backTxt}>Back to Login</Text>
          </TouchableOpacity>
          <View style={s.header}>
            <Image
              source={require('../assets/logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.title}>Reset Password</Text>
            <Text style={s.subtitle}>
              Enter your email to receive a reset link
            </Text>
          </View>
          <View style={s.form}>
            <View style={s.group}>
              <Text style={s.label}>Email</Text>
              <View style={[s.inputWrap, error && s.inputErr]}>
                <Mail
                  color={error ? '#E20000' : '#9A9EA6'}
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
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              {error ? <Text style={s.err}>{error}</Text> : null}
            </View>
            <TouchableOpacity
              style={[s.btn, isLoading && s.btnDis]}
              onPress={handleReset}
              disabled={isLoading}
              activeOpacity={0.8}>
              <Text style={s.btnTxt}>
                {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
              </Text>
            </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backTxt: { fontSize: 14, fontWeight: '500', color: '#EF3E62', marginLeft: 8 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EE2E5D',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  subtitle: { fontSize: 14, color: '#404040', textAlign: 'center' },
  form: { marginBottom: 30 },
  group: { marginBottom: 20 },
  label: { fontSize: 12, color: '#333', marginBottom: 8 },
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
  err: { fontSize: 11, color: '#E20000', marginTop: 5 },
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
  checkCircle: { marginBottom: 24 },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 14,
    color: '#565656',
    marginBottom: 4,
    textAlign: 'center',
  },
  successEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF3E62',
    marginBottom: 32,
  },
  resend: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7E33C8',
    textDecorationLine: 'underline',
  },
});
