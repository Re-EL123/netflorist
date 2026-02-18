// screens/EditProfileScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  Car,
  MapPin,
  Camera,
  Save,
  ChevronDown,
  Shield,
  CheckCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

const VEHICLE_TYPES = [
  'Car',
  'Motorcycle',
  'Bicycle',
  'Van',
  'Scooter',
  'Truck',
  'Bakkie',
];

export default function EditProfileScreen({
  session,
  driverProfile,
  setDriverProfile,
  onBack,
}) {
  const [formData, setFormData] = useState({
    full_name: driverProfile?.full_name || '',
    phone: driverProfile?.phone || '',
    license_number: driverProfile?.license_number || '',
    vehicle_type: driverProfile?.vehicle_type || '',
    residential_area: driverProfile?.residential_area || '',
    vehicle_registration: driverProfile?.vehicle_registration || '',
    emergency_contact_name: driverProfile?.emergency_contact_name || '',
    emergency_contact_phone: driverProfile?.emergency_contact_phone || '',
    bank_name: driverProfile?.bank_name || '',
    bank_account_number: driverProfile?.bank_account_number || '',
    bank_branch_code: driverProfile?.bank_branch_code || '',
  });
  const [profileImage, setProfileImage] = useState(
    driverProfile?.profile_image_url || null
  );
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const updateField = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setHasChanges(true);
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
      if (isSaved) setIsSaved(false);
    },
    [errors, isSaved]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.full_name || formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Full name must be at least 3 characters';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.license_number) {
      newErrors.license_number = 'License number is required';
    }
    if (!formData.vehicle_type) {
      newErrors.vehicle_type = 'Vehicle type is required';
    }
    if (
      formData.emergency_contact_phone &&
      !/^\d{10}/.test(formData.emergency_contact_phone.replace(/\s/g, ''))
    ) {
      newErrors.emergency_contact_phone = 'Phone must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const pickImage = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera roll permission is needed to change your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);
        setHasChanges(true);
        if (isSaved) setIsSaved(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, [isSaved]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take a profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);
        setHasChanges(true);
        if (isSaved) setIsSaved(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, [isSaved]);

  const showImageOptions = useCallback(() => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [takePhoto, pickImage]);

  const uploadProfileImage = async (uri) => {
    try {
      const fileName = `profile_${driverProfile.id}_${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn(
          'Image upload error (storage may not be configured):',
          error.message
        );
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-images').getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.warn('Image upload failed:', error);
      return null;
    }
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the highlighted errors before saving.'
      );
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = driverProfile?.profile_image_url;

      if (profileImage && profileImage !== driverProfile?.profile_image_url) {
        const uploadedUrl = await uploadProfileImage(profileImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const updateData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        license_number: formData.license_number.trim(),
        vehicle_type: formData.vehicle_type,
        residential_area: formData.residential_area.trim(),
        vehicle_registration: formData.vehicle_registration.trim(),
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_phone: formData.emergency_contact_phone.trim(),
        bank_name: formData.bank_name.trim(),
        bank_account_number: formData.bank_account_number.trim(),
        bank_branch_code: formData.bank_branch_code.trim(),
        updated_at: new Date().toISOString(),
      };

      if (imageUrl) {
        updateData.profile_image_url = imageUrl;
      }

      const { data, error } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', driverProfile.id)
        .select()
        .single();

      if (error) throw error;

      setDriverProfile(data);
      setHasChanges(false);
      setIsSaved(true);

      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.'
      );
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [formData, profileImage, driverProfile, validateForm, successAnim]);

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onBack },
        ]
      );
    } else {
      onBack();
    }
  }, [hasChanges, onBack]);

  const renderInput = (label, field, icon, options = {}) => {
    const IconComponent = icon;
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[styles.inputContainer, errors[field] && styles.inputError]}>
          <IconComponent
            color={errors[field] ? '#E20000' : '#9A9EA6'}
            size={18}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
            placeholderTextColor="#9A9EA6"
            value={formData[field]}
            onChangeText={(text) => updateField(field, text)}
            keyboardType={options.keyboardType || 'default'}
            autoCapitalize={options.autoCapitalize || 'none'}
            autoCorrect={false}
            editable={!isLoading && !options.disabled}
            secureTextEntry={options.secureTextEntry}
          />
        </View>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          disabled={isLoading}>
          <ArrowLeft color="#404040" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight}>
          {hasChanges && <View style={styles.unsavedDot} />}
        </View>
      </View>

      {/* Success Banner */}
      <Animated.View
        style={[
          styles.successBanner,
          {
            opacity: successAnim,
            transform: [
              {
                translateY: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}>
        <CheckCircle color="#38AF4B" size={18} />
        <Text style={styles.successText}>Profile saved successfully!</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={showImageOptions}
              activeOpacity={0.8}
              disabled={isLoading}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoInitial}>
                    {formData.full_name?.charAt(0)?.toUpperCase() || 'D'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Camera color="#FFFFFF" size={16} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Tap to change photo</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.sectionCard}>
              {renderInput('Full Name', 'full_name', User, {
                autoCapitalize: 'words',
                placeholder: 'Enter your full name',
              })}
              {renderInput('Phone Number', 'phone', Phone, {
                keyboardType: 'phone-pad',
                placeholder: '0XX XXX XXXX',
              })}

              {/* Email (read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputContainer, styles.inputDisabled]}>
                  <Mail color="#9A9EA6" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputTextDisabled]}
                    value={session?.user?.email || ''}
                    editable={false}
                  />
                  <Shield color="#9A9EA6" size={14} />
                </View>
                <Text style={styles.hintText}>
                  Email cannot be changed here
                </Text>
              </View>

              {renderInput('Residential Area', 'residential_area', MapPin, {
                autoCapitalize: 'words',
                placeholder: 'e.g., Sandton, Johannesburg',
              })}
            </View>
          </View>

          {/* Vehicle Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.sectionCard}>
              {renderInput('License Number', 'license_number', CreditCard, {
                autoCapitalize: 'characters',
                placeholder: 'Enter license number',
              })}

              {/* Vehicle Type Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    errors.vehicle_type && styles.inputError,
                  ]}
                  onPress={() => setShowVehicleDropdown(!showVehicleDropdown)}
                  disabled={isLoading}
                  activeOpacity={0.7}>
                  <Car
                    color={errors.vehicle_type ? '#E20000' : '#9A9EA6'}
                    size={18}
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.dropdownText,
                      !formData.vehicle_type && styles.placeholderText,
                    ]}>
                    {formData.vehicle_type || 'Select vehicle type'}
                  </Text>
                  <ChevronDown color="#9A9EA6" size={18} />
                </TouchableOpacity>
                {showVehicleDropdown && (
                  <View style={styles.dropdown}>
                    {VEHICLE_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dropdownItem,
                          formData.vehicle_type === type &&
                            styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          updateField('vehicle_type', type);
                          setShowVehicleDropdown(false);
                        }}>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            formData.vehicle_type === type &&
                              styles.dropdownItemTextActive,
                          ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.vehicle_type && (
                  <Text style={styles.errorText}>{errors.vehicle_type}</Text>
                )}
              </View>

              {renderInput(
                'Vehicle Registration',
                'vehicle_registration',
                Car,
                {
                  autoCapitalize: 'characters',
                  placeholder: 'e.g., GP 123-456',
                }
              )}
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.sectionCard}>
              {renderInput('Contact Name', 'emergency_contact_name', User, {
                autoCapitalize: 'words',
                placeholder: 'Emergency contact name',
              })}
              {renderInput('Contact Phone', 'emergency_contact_phone', Phone, {
                keyboardType: 'phone-pad',
                placeholder: '0XX XXX XXXX',
              })}
            </View>
          </View>

          {/* Banking Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking Details</Text>
            <View style={styles.sectionCard}>
              {renderInput('Bank Name', 'bank_name', CreditCard, {
                autoCapitalize: 'words',
                placeholder: 'e.g., FNB, Standard Bank',
              })}
              {renderInput(
                'Account Number',
                'bank_account_number',
                CreditCard,
                {
                  keyboardType: 'numeric',
                  placeholder: 'Enter account number',
                }
              )}
              {renderInput('Branch Code', 'bank_branch_code', CreditCard, {
                keyboardType: 'numeric',
                placeholder: 'Enter branch code',
              })}
            </View>
          </View>

          {/* Driver Type Info (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Status</Text>
            <View style={styles.sectionCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Driver Type</Text>
                <View style={styles.driverTypeBadge}>
                  <Text style={styles.driverTypeText}>
                    {(driverProfile?.driver_type || 'permanent').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F5',
                    paddingTop: 12,
                  },
                ]}>
                <Text style={styles.statusLabel}>Account Status</Text>
                <View
                  style={[
                    styles.accountStatusBadge,
                    {
                      backgroundColor:
                        driverProfile?.status === 'active'
                          ? '#38AF4B20'
                          : driverProfile?.status === 'approved'
                          ? '#3B82F620'
                          : '#F59E0B20',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.accountStatusText,
                      {
                        color:
                          driverProfile?.status === 'active'
                            ? '#38AF4B'
                            : driverProfile?.status === 'approved'
                            ? '#3B82F6'
                            : '#F59E0B',
                      },
                    ]}>
                    {(driverProfile?.status || 'pending').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F5',
                    paddingTop: 12,
                  },
                ]}>
                <Text style={styles.statusLabel}>Member Since</Text>
                <Text style={styles.statusValue}>
                  {driverProfile?.created_at
                    ? new Date(driverProfile.created_at).toLocaleDateString(
                        'en-ZA',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.sectionCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {driverProfile?.total_deliveries || 0}
                  </Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={[styles.statItem, styles.statItemBorder]}>
                  <Text style={styles.statValue}>
                    {driverProfile?.rating
                      ? parseFloat(driverProfile.rating).toFixed(1)
                      : '0.0'}
                  </Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {driverProfile?.status === 'active' ? '✅' : '⏸️'}
                  </Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled,
              !hasChanges && styles.saveButtonInactive,
            ]}
            onPress={handleSave}
            disabled={isLoading || !hasChanges}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Save color="#FFFFFF" size={20} />
                <Text style={styles.saveButtonText}>
                  {hasChanges ? 'SAVE CHANGES' : 'NO CHANGES'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Support Footer */}
          <View style={styles.supportFooter}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportPhone}>Call: 087 240 1200</Text>
            <Text style={styles.supportHours}>
              Mon-Fri: 8am-5pm | Sat: 8am-1pm
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#404040',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  unsavedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
  },
  successText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#38AF4B',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'visible',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#EF3E62',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EF3E62',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  photoInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7E33C8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    fontSize: 12,
    color: '#9A9EA6',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#565656',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.1)',
    paddingHorizontal: 12,
    height: 44,
  },
  inputError: {
    borderColor: '#E20000',
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F5',
    borderColor: 'rgba(51, 51, 51, 0.05)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: '#333333',
    padding: 0,
    outlineStyle: 'none',
  },
  inputTextDisabled: {
    color: '#9A9EA6',
  },
  errorText: {
    fontSize: 11,
    color: '#E20000',
    marginTop: 4,
  },
  hintText: {
    fontSize: 10,
    color: '#9A9EA6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
  },
  placeholderText: {
    color: '#9A9EA6',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F5',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF0F3',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333333',
  },
  dropdownItemTextActive: {
    color: '#EF3E62',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#565656',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#404040',
  },
  driverTypeBadge: {
    backgroundColor: '#7E33C820',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  driverTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7E33C8',
  },
  accountStatusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  accountStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F5',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EF3E62',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9A9EA6',
    textTransform: 'uppercase',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF3E62',
    borderRadius: 40,
    height: 52,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonInactive: {
    backgroundColor: '#9A9EA6',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  supportFooter: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 157, 236, 0.3)',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7E33C8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  supportPhone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 2,
  },
  supportHours: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9A9EA6',
  },
});
