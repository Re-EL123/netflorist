// screens/DeliveryDetailScreen.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Package,
  Clock,
  User,
  Navigation,
  ChevronRight,
  Star,
  MessageCircle,
  CheckCircle,
  Truck,
  Calendar,
  DollarSign,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const STATUS_COLORS = {
  pending: '#FFA500',
  assigned: '#2196F3',
  accepted: '#17A2B8',
  picked_up: '#7E33C8',
  in_transit: '#7E33C8',
  delivered: '#38AF4B',
  cancelled: '#E20000',
  failed: '#E20000',
};

const STATUS_STEPS = [
  'assigned',
  'accepted',
  'picked_up',
  'in_transit',
  'delivered',
];

export default function DeliveryDetailScreen({
  delivery: initialDelivery,
  driverProfile,
  session,
  onBack,
  onStartDelivery,
}) {
  const [delivery, setDelivery] = useState(initialDelivery);
  const [showNavModal, setShowNavModal] = useState(false);
  const [navTarget, setNavTarget] = useState('delivery'); // 'pickup' or 'delivery'

  const currentStepIndex = STATUS_STEPS.indexOf(delivery.status);

  const openNavigation = useCallback(
    (app) => {
      const lat =
        navTarget === 'pickup'
          ? delivery.pickup_latitude || -33.9249
          : delivery.delivery_latitude || -33.918;
      const lng =
        navTarget === 'pickup'
          ? delivery.pickup_longitude || 18.4241
          : delivery.delivery_longitude || 18.4233;
      let url;
      if (app === 'waze') {
        url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      } else if (app === 'google') {
        url = Platform.select({
          ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
          android: `google.navigation:q=${lat},${lng}`,
          default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        });
      } else {
        url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
      }
      Linking.canOpenURL(url).then((supported) => {
        if (supported) Linking.openURL(url);
        else
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
          );
      });
      setShowNavModal(false);
    },
    [delivery, navTarget]
  );

  const callCustomer = () => {
    if (delivery.customer_phone) {
      Linking.openURL(`tel:${delivery.customer_phone}`);
    }
  };

  const handleAccept = async () => {
    Alert.alert('Accept Delivery', 'Accept this delivery order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('deliveries')
              .update({
                status: 'accepted',
                accepted_time: new Date().toISOString(),
              })
              .eq('id', delivery.id);
            if (error) throw error;
            setDelivery((prev) => ({
              ...prev,
              status: 'accepted',
              accepted_time: new Date().toISOString(),
            }));
            Alert.alert('✅ Accepted!', 'Navigate to the pickup location.');
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleStartActive = () => {
    onStartDelivery(delivery);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order ID & Status */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{delivery.order_id}</Text>
            <Text style={styles.orderDate}>
              {new Date(delivery.created_at).toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  (STATUS_COLORS[delivery.status] || '#999') + '20',
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[delivery.status] || '#999' },
              ]}>
              {delivery.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperCard}>
          <Text style={styles.cardTitle}>Delivery Progress</Text>
          <View style={styles.stepper}>
            {STATUS_STEPS.map((step, i) => (
              <View key={step} style={styles.stepItem}>
                <View style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepCircle,
                      i <= currentStepIndex
                        ? styles.stepCircleActive
                        : styles.stepCircleInactive,
                    ]}>
                    {i <= currentStepIndex && (
                      <CheckCircle color="#FFF" size={14} />
                    )}
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        i < currentStepIndex
                          ? styles.stepLineActive
                          : styles.stepLineInactive,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    i <= currentStepIndex && styles.stepLabelActive,
                  ]}>
                  {step.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.infoRow}>
            <User color="#EF3E62" size={18} />
            <Text style={styles.infoText}>{delivery.customer_name}</Text>
          </View>
          <TouchableOpacity style={styles.infoRow} onPress={callCustomer}>
            <Phone color="#38AF4B" size={18} />
            <Text style={[styles.infoText, { color: '#38AF4B' }]}>
              {delivery.customer_phone}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Addresses */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Addresses</Text>
          <TouchableOpacity
            style={styles.addressBlock}
            onPress={() => {
              setNavTarget('pickup');
              setShowNavModal(true);
            }}>
            <View style={[styles.addressDot, { backgroundColor: '#EF3E62' }]} />
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>PICKUP</Text>
              <Text style={styles.addressValue}>{delivery.pickup_address}</Text>
            </View>
            <Navigation color="#EF3E62" size={18} />
          </TouchableOpacity>
          <View style={styles.addressConnector}>
            <View style={styles.connectorLine} />
          </View>
          <TouchableOpacity
            style={styles.addressBlock}
            onPress={() => {
              setNavTarget('delivery');
              setShowNavModal(true);
            }}>
            <View style={[styles.addressDot, { backgroundColor: '#38AF4B' }]} />
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>DELIVER TO</Text>
              <Text style={styles.addressValue}>
                {delivery.delivery_address}
              </Text>
            </View>
            <Navigation color="#38AF4B" size={18} />
          </TouchableOpacity>
        </View>

        {/* Order Details */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Order Info</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Package color="#565656" size={16} />
              <Text style={styles.detailLabel}>Items</Text>
              <Text style={styles.detailValue}>{delivery.items_count}</Text>
            </View>
            <View style={styles.detailItem}>
              <DollarSign color="#565656" size={16} />
              <Text style={styles.detailLabel}>Value</Text>
              <Text style={styles.detailValue}>
                R{parseFloat(delivery.delivery_value || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Truck color="#565656" size={16} />
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={[styles.detailValue, { color: '#38AF4B' }]}>
                R{parseFloat(delivery.delivery_fee || 0).toFixed(2)}
              </Text>
            </View>
            {delivery.distance_km && (
              <View style={styles.detailItem}>
                <MapPin color="#565656" size={16} />
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>
                  {delivery.distance_km} km
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {delivery.notes && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{delivery.notes}</Text>
          </View>
        )}

        {/* Customer Rating */}
        {delivery.customer_rating && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Customer Rating</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  color={s <= delivery.customer_rating ? '#FFA500' : '#E0E0E0'}
                  fill={s <= delivery.customer_rating ? '#FFA500' : 'none'}
                  size={24}
                />
              ))}
            </View>
            {delivery.customer_feedback && (
              <Text style={styles.feedbackText}>
                "{delivery.customer_feedback}"
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionArea}>
          {delivery.status === 'assigned' && (
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}>
              <CheckCircle color="#FFF" size={20} />
              <Text style={styles.acceptButtonText}>ACCEPT DELIVERY</Text>
            </TouchableOpacity>
          )}
          {['accepted', 'picked_up', 'in_transit'].includes(
            delivery.status
          ) && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartActive}>
              <Truck color="#FFF" size={20} />
              <Text style={styles.startButtonText}>MANAGE DELIVERY</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Navigation Modal */}
      <Modal
        visible={showNavModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNavModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNavModal(false)}>
          <View style={styles.navModalContent}>
            <View style={styles.navModalHandle} />
            <Text style={styles.navModalTitle}>
              Navigate to {navTarget === 'pickup' ? 'Pickup' : 'Delivery'}
            </Text>
            <Text style={styles.navModalAddress}>
              {navTarget === 'pickup'
                ? delivery.pickup_address
                : delivery.delivery_address}
            </Text>

            <TouchableOpacity
              style={styles.navOption}
              onPress={() => openNavigation('google')}>
              <View
                style={[styles.navOptionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{ fontSize: 24 }}>🗺️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navOptionTitle}>Google Maps</Text>
                <Text style={styles.navOptionSub}>Turn-by-turn navigation</Text>
              </View>
              <ChevronRight color="#9A9EA6" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navOption}
              onPress={() => openNavigation('waze')}>
              <View
                style={[styles.navOptionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Text style={{ fontSize: 24 }}>🚗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navOptionTitle}>Waze</Text>
                <Text style={styles.navOptionSub}>
                  Real-time traffic updates
                </Text>
              </View>
              <ChevronRight color="#9A9EA6" size={20} />
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.navOption}
                onPress={() => openNavigation('apple')}>
                <View
                  style={[
                    styles.navOptionIcon,
                    { backgroundColor: '#F3E5F5' },
                  ]}>
                  <Text style={{ fontSize: 24 }}>🍎</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.navOptionTitle}>Apple Maps</Text>
                </View>
                <ChevronRight color="#9A9EA6" size={20} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.navCancelBtn}
              onPress={() => setShowNavModal(false)}>
              <Text style={styles.navCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF3E62',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  content: { flex: 1, padding: 16 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: { fontSize: 18, fontWeight: '700', color: '#333' },
  orderDate: { fontSize: 12, color: '#9A9EA6', marginTop: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  stepperCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  stepper: { flexDirection: 'row', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircleActive: { backgroundColor: '#38AF4B' },
  stepCircleInactive: { backgroundColor: '#E0E0E0' },
  stepLine: {
    position: 'absolute',
    height: 3,
    left: '50%',
    right: '-50%',
    top: 12,
  },
  stepLineActive: { backgroundColor: '#38AF4B' },
  stepLineInactive: { backgroundColor: '#E0E0E0' },
  stepLabel: {
    fontSize: 9,
    color: '#9A9EA6',
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  stepLabelActive: { color: '#38AF4B', fontWeight: '600' },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: { fontSize: 14, color: '#333', fontWeight: '500' },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addressDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  addressContent: { flex: 1 },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A9EA6',
    letterSpacing: 1,
  },
  addressValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },
  addressConnector: { paddingLeft: 5, height: 20, justifyContent: 'center' },
  connectorLine: { width: 2, height: 20, backgroundColor: '#E0E0E0' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  detailLabel: { fontSize: 12, color: '#9A9EA6' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#333' },
  notesText: { fontSize: 13, color: '#565656', lineHeight: 20 },
  ratingRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  feedbackText: { fontSize: 13, color: '#565656', fontStyle: 'italic' },
  actionArea: { marginTop: 8 },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: '#38AF4B',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  acceptButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#EF3E62',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  navModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 12,
  },
  navModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  navModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  navModalAddress: {
    fontSize: 13,
    color: '#9A9EA6',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  navOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F5',
  },
  navOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  navOptionTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  navOptionSub: { fontSize: 12, color: '#9A9EA6', marginTop: 2 },
  navCancelBtn: {
    marginTop: 16,
    backgroundColor: '#F1F5F5',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCancelText: { fontSize: 15, fontWeight: '600', color: '#565656' },
});
