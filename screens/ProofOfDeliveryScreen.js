import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  MapPin,
  Package,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export default function ProofOfDeliveryScreen({
  delivery,
  driverProfile,
  session,
  onBack,
  onComplete,
}) {
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take delivery proof photo.'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open camera.');
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  }, []);

  const calculateEarnings = useCallback(() => {
    if (!driverProfile || !delivery) return delivery?.delivery_fee || 0;
    const items = delivery.items_count || 1;
    switch (driverProfile.driver_type) {
      case 'permanent':
        return (delivery.delivery_value || 0) * 0.05;
      case 'old':
        return Math.ceil(items / 2) * 30;
      case 'temporary':
        return Math.ceil(items / 2) * 50;
      default:
        return delivery.delivery_fee || 0;
    }
  }, [driverProfile, delivery]);

  const handleSubmit = useCallback(async () => {
    if (!photo) {
      Alert.alert(
        'Photo Required',
        'Please take a photo as proof of delivery.'
      );
      return;
    }
    if (!recipientName.trim()) {
      Alert.alert(
        'Recipient Required',
        'Please enter the name of the person who received the delivery.'
      );
      return;
    }

    Alert.alert('Confirm Delivery', 'Are you sure this delivery is complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setIsSubmitting(true);
          try {
            const earnedAmount = calculateEarnings();
            const now = new Date().toISOString();

            // Upload photo to Supabase Storage (if bucket exists, otherwise store URI)
            let proofUrl = photo;
            try {
              const fileExt = photo.split('.').pop();
              const fileName = `${delivery.id}_${Date.now()}.${fileExt}`;
              const response = await fetch(photo);
              const blob = await response.blob();
              const { data: uploadData, error: uploadError } =
                await supabase.storage
                  .from('delivery-proofs')
                  .upload(fileName, blob, { contentType: `image/${fileExt}` });
              if (!uploadError && uploadData) {
                const { data: urlData } = supabase.storage
                  .from('delivery-proofs')
                  .getPublicUrl(fileName);
                proofUrl = urlData.publicUrl;
              }
            } catch (uploadErr) {
              console.log('Photo upload skipped:', uploadErr.message);
            }

            // Update delivery
            const { error: deliveryError } = await supabase
              .from('deliveries')
              .update({
                status: 'delivered',
                delivered_time: now,
                proof_of_delivery_url: proofUrl,
                delivery_notes: notes.trim(),
                recipient_name: recipientName.trim(),
                delivery_fee: earnedAmount,
              })
              .eq('id', delivery.id);

            if (deliveryError) throw deliveryError;

            // Create earnings record
            await supabase.from('earnings').insert([
              {
                driver_id: driverProfile.id,
                delivery_id: delivery.id,
                amount: earnedAmount,
                type: 'delivery',
                description: `Delivery #${delivery.order_id}`,
                status: 'pending',
              },
            ]);

            // Update driver stats
            await supabase
              .from('drivers')
              .update({
                total_deliveries: (driverProfile.total_deliveries || 0) + 1,
              })
              .eq('id', driverProfile.id);

            Alert.alert(
              '✅ Delivery Complete!',
              `Delivery #${
                delivery.order_id
              } completed successfully.\nEarnings: R${earnedAmount.toFixed(2)}`,
              [{ text: 'OK', onPress: onComplete }]
            );
          } catch (e) {
            Alert.alert(
              'Error',
              'Failed to submit delivery proof. Please try again.'
            );
            console.error('Submit error:', e);
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  }, [
    photo,
    recipientName,
    notes,
    delivery,
    driverProfile,
    calculateEarnings,
    onComplete,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof of Delivery</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Delivery Summary */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Package color="#EF3E62" size={20} />
            <Text style={styles.summaryOrderId}>#{delivery?.order_id}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MapPin color="#9A9EA6" size={16} />
            <Text style={styles.summaryText} numberOfLines={2}>
              {delivery?.delivery_address}
            </Text>
          </View>
        </View>

        {/* Photo Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Photo *</Text>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeBtn} onPress={takePhoto}>
                <Camera color="#FFFFFF" size={16} />
                <Text style={styles.retakeBtnText}>RETAKE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Camera color="#EF3E62" size={32} />
                <Text style={styles.photoBtnText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={pickFromGallery}>
                <ImageIcon color="#7E33C8" size={32} />
                <Text style={styles.photoBtnText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recipient Name */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Received By *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Name of person who received delivery"
            placeholderTextColor="#9A9EA6"
            value={recipientName}
            onChangeText={setRecipientName}
            editable={!isSubmitting}
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Any additional notes about the delivery..."
            placeholderTextColor="#9A9EA6"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        {/* Earnings Preview */}
        <View style={[styles.card, styles.earningsCard]}>
          <Text style={styles.earningsLabel}>Estimated Earnings</Text>
          <Text style={styles.earningsAmount}>
            R{calculateEarnings().toFixed(2)}
          </Text>
          <Text style={styles.earningsType}>
            {driverProfile?.driver_type === 'permanent'
              ? '5% Commission'
              : driverProfile?.driver_type === 'old'
              ? `${Math.ceil((delivery?.items_count || 1) / 2)} unit(s) × R30`
              : driverProfile?.driver_type === 'temporary'
              ? `${Math.ceil((delivery?.items_count || 1) / 2)} unit(s) × R50`
              : 'Standard Rate'}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <CheckCircle color="#FFFFFF" size={22} />
              <Text style={styles.submitButtonText}>COMPLETE DELIVERY</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F5' },
  header: {
    backgroundColor: '#EF3E62',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  summaryOrderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#404040',
    marginLeft: 8,
  },
  summaryText: { fontSize: 13, color: '#565656', marginLeft: 8, flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 12,
  },
  photoActions: { flexDirection: 'row', justifyContent: 'space-around' },
  photoBtn: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  photoBtnText: { fontSize: 12, color: '#565656', marginTop: 8 },
  photoPreview: { position: 'relative' },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  retakeBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#404040',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    outlineStyle: 'none',
  },
  textArea: { height: 100 },
  earningsCard: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    alignItems: 'center',
  },
  earningsLabel: { fontSize: 12, color: '#38AF4B', marginBottom: 4 },
  earningsAmount: { fontSize: 32, fontWeight: '700', color: '#38AF4B' },
  earningsType: { fontSize: 11, color: '#68D391', marginTop: 4 },
  submitButton: {
    backgroundColor: '#38AF4B',
    borderRadius: 30,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
