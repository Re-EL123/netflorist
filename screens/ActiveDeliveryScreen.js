// screens/ActiveDeliveryScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Package,
  Truck,
  Camera,
  X,
  Map,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

// Conditionally import MapView
let MapView, Marker;
try {
  if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  }
} catch (e) {
  MapView = null;
  Marker = null;
}

export default function ActiveDeliveryScreen({
  delivery,
  session,
  driverProfile,
  onBack,
  navigate,
}) {
  const [currentDelivery, setCurrentDelivery] = useState(delivery);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const mapRef = useRef(null);
  const locationSubRef = useRef(null);

  useEffect(() => {
    startLocationTracking();
    return () => {
      if (locationSubRef.current) locationSubRef.current.remove();
    };
  }, []);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Please enable location to track deliveries.'
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setDriverLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000,
          distanceInterval: 50,
        },
        (loc) => {
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setDriverLocation(coords);
          updateDriverLocation(coords);
        }
      );
    } catch (e) {
      console.error('Location error:', e);
    }
  };

  const updateDriverLocation = async (coords) => {
    try {
      await supabase
        .from('drivers')
        .update({
          latitude: coords.latitude,
          longitude: coords.longitude,
          last_seen: new Date().toISOString(),
        })
        .eq('id', driverProfile.id);

      await supabase.from('driver_locations').insert({
        driver_id: driverProfile.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getTargetLocation = () => {
    if (currentDelivery.status === 'accepted') {
      return {
        latitude: parseFloat(currentDelivery.pickup_latitude) || -26.2041,
        longitude: parseFloat(currentDelivery.pickup_longitude) || 28.0473,
        label: 'Pickup Location',
        address: currentDelivery.pickup_address,
      };
    }
    return {
      latitude: parseFloat(currentDelivery.delivery_latitude) || -26.2041,
      longitude: parseFloat(currentDelivery.delivery_longitude) || 28.0473,
      label: 'Delivery Location',
      address: currentDelivery.delivery_address,
    };
  };

  const openNavigationModal = (target) => {
    setNavTarget(target);
    setShowNavModal(true);
  };

  const navigateWithGoogleMaps = () => {
    setShowNavModal(false);
    const target = navTarget || getTargetLocation();
    const url = Platform.select({
      ios: `comgooglemaps://?daddr=${target.latitude},${target.longitude}&directionsmode=driving`,
      android: `google.navigation:q=${target.latitude},${target.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`
      );
    });
  };

  const navigateWithWaze = () => {
    setShowNavModal(false);
    const target = navTarget || getTargetLocation();
    Linking.openURL(
      `https://waze.com/ul?ll=${target.latitude},${target.longitude}&navigate=yes`
    ).catch(() => {
      Alert.alert('Error', 'Unable to open Waze');
    });
  };

  const navigateWithAppleMaps = () => {
    setShowNavModal(false);
    const target = navTarget || getTargetLocation();
    Linking.openURL(
      `http://maps.apple.com/?daddr=${target.latitude},${target.longitude}&dirflg=d`
    );
  };

  const updateDeliveryStatus = async (newStatus) => {
    const statusLabels = {
      picked_up: 'Mark as Picked Up',
      in_transit: 'Mark as In Transit',
      delivered: 'Mark as Delivered',
    };
    Alert.alert('Update Status', `${statusLabels[newStatus]}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setIsLoading(true);
          try {
            const updateData = { status: newStatus };
            if (newStatus === 'picked_up')
              updateData.picked_up_time = new Date().toISOString();
            if (newStatus === 'delivered')
              updateData.delivered_time = new Date().toISOString();

            const { error } = await supabase
              .from('deliveries')
              .update(updateData)
              .eq('id', currentDelivery.id);
            if (error) throw error;

            setCurrentDelivery((prev) => ({ ...prev, ...updateData }));

            if (newStatus === 'delivered') {
              navigate('proofOfDelivery', {
                delivery: { ...currentDelivery, ...updateData },
              });
            }
          } catch (e) {
            Alert.alert('Error', e.message);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const callCustomer = () => {
    Linking.openURL(`tel:${currentDelivery.customer_phone}`);
  };

  const target = getTargetLocation();

  const renderMap = () => {
    if (Platform.OS !== 'web' && MapView) {
      const region = {
        latitude: driverLocation?.latitude || target.latitude,
        longitude: driverLocation?.longitude || target.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      return (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={true}>
          {/* Pickup Marker */}
          {currentDelivery.pickup_latitude && (
            <Marker
              coordinate={{
                latitude: parseFloat(currentDelivery.pickup_latitude),
                longitude: parseFloat(currentDelivery.pickup_longitude),
              }}
              title="Pickup"
              description={currentDelivery.pickup_address}
              pinColor="green"
            />
          )}
          {/* Delivery Marker */}
          {currentDelivery.delivery_latitude && (
            <Marker
              coordinate={{
                latitude: parseFloat(currentDelivery.delivery_latitude),
                longitude: parseFloat(currentDelivery.delivery_longitude),
              }}
              title="Delivery"
              description={currentDelivery.delivery_address}
              pinColor="red"
            />
          )}
        </MapView>
      );
    }

    // Web / Fallback
    return (
      <View style={styles.mapFallback}>
        <Map color="#EF3E62" size={48} />
        <Text style={styles.mapFallbackTitle}>Map View</Text>
        <Text style={styles.mapFallbackText}>
          Use the navigation buttons below to open maps
        </Text>
        <View style={styles.coordsBox}>
          <Text style={styles.coordsLabel}>Target:</Text>
          <Text style={styles.coordsText}>
            {target.latitude.toFixed(4)}, {target.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    );
  };

  const getNextAction = () => {
    switch (currentDelivery.status) {
      case 'accepted':
        return { label: 'PICKED UP', status: 'picked_up', color: '#8B5CF6' };
      case 'picked_up':
        return { label: 'IN TRANSIT', status: 'in_transit', color: '#7E33C8' };
      case 'in_transit':
        return { label: 'DELIVERED', status: 'delivered', color: '#38AF4B' };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft color="#404040" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>#{currentDelivery.order_id}</Text>
        <TouchableOpacity onPress={callCustomer} style={styles.callBtn}>
          <Phone color="#38AF4B" size={20} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>{renderMap()}</View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Status */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor:
                  (currentDelivery.status === 'accepted'
                    ? '#3B82F6'
                    : currentDelivery.status === 'picked_up'
                    ? '#8B5CF6'
                    : currentDelivery.status === 'in_transit'
                    ? '#7E33C8'
                    : '#38AF4B') + '20',
              },
            ]}>
            <Text
              style={[
                styles.statusChipText,
                {
                  color:
                    currentDelivery.status === 'accepted'
                      ? '#3B82F6'
                      : currentDelivery.status === 'picked_up'
                      ? '#8B5CF6'
                      : currentDelivery.status === 'in_transit'
                      ? '#7E33C8'
                      : '#38AF4B',
                },
              ]}>
              {currentDelivery.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.customerNameText}>
            {currentDelivery.customer_name}
          </Text>
        </View>

        {/* Target Address */}
        <View style={styles.targetAddress}>
          <MapPin
            color={
              currentDelivery.status === 'accepted' ? '#38AF4B' : '#EF3E62'
            }
            size={18}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.targetLabel}>
              {currentDelivery.status === 'accepted'
                ? 'NAVIGATE TO PICKUP'
                : 'NAVIGATE TO DELIVERY'}
            </Text>
            <Text style={styles.targetText} numberOfLines={2}>
              {target.address}
            </Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={styles.navigateMainBtn}
          onPress={() => openNavigationModal(target)}>
          <Navigation color="#FFF" size={20} />
          <Text style={styles.navigateMainText}>NAVIGATE</Text>
        </TouchableOpacity>

        {/* Status Update */}
        {nextAction && (
          <TouchableOpacity
            style={[
              styles.statusUpdateBtn,
              { backgroundColor: nextAction.color },
            ]}
            onPress={() => updateDeliveryStatus(nextAction.status)}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                {nextAction.status === 'delivered' ? (
                  <Camera color="#FFF" size={20} />
                ) : nextAction.status === 'picked_up' ? (
                  <Package color="#FFF" size={20} />
                ) : (
                  <Truck color="#FFF" size={20} />
                )}
                <Text style={styles.statusUpdateText}>
                  MARK AS {nextAction.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

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
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Navigation App</Text>
              <TouchableOpacity onPress={() => setShowNavModal(false)}>
                <X color="#404040" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{navTarget?.address}</Text>

            <TouchableOpacity
              style={styles.navOption}
              onPress={navigateWithGoogleMaps}>
              <View
                style={[
                  styles.navOptionIcon,
                  { backgroundColor: '#4285F420' },
                ]}>
                <Map color="#4285F4" size={24} />
              </View>
              <View style={styles.navOptionInfo}>
                <Text style={styles.navOptionTitle}>Google Maps</Text>
                <Text style={styles.navOptionDesc}>
                  Turn-by-turn navigation
                </Text>
              </View>
              <Navigation color="#9A9EA6" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navOption}
              onPress={navigateWithWaze}>
              <View
                style={[
                  styles.navOptionIcon,
                  { backgroundColor: '#00CFF820' },
                ]}>
                <Navigation color="#00CFF8" size={24} />
              </View>
              <View style={styles.navOptionInfo}>
                <Text style={styles.navOptionTitle}>Waze</Text>
                <Text style={styles.navOptionDesc}>
                  Community-based navigation
                </Text>
              </View>
              <Navigation color="#9A9EA6" size={18} />
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.navOption}
                onPress={navigateWithAppleMaps}>
                <View
                  style={[
                    styles.navOptionIcon,
                    { backgroundColor: '#00000010' },
                  ]}>
                  <Map color="#333" size={24} />
                </View>
                <View style={styles.navOptionInfo}>
                  <Text style={styles.navOptionTitle}>Apple Maps</Text>
                  <Text style={styles.navOptionDesc}>Built-in navigation</Text>
                </View>
                <Navigation color="#9A9EA6" size={18} />
              </TouchableOpacity>
            )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 35,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    zIndex: 10,
    elevation: 4,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#404040' },
  callBtn: {
    padding: 8,
    backgroundColor: '#38AF4B15',
    borderRadius: 20,
  },
  // Map
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8ECEC',
    padding: 20,
  },
  mapFallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#404040',
    marginTop: 12,
  },
  mapFallbackText: {
    fontSize: 13,
    color: '#9A9EA6',
    textAlign: 'center',
    marginTop: 4,
  },
  coordsBox: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
  },
  coordsLabel: { fontSize: 12, fontWeight: '600', color: '#404040' },
  coordsText: { fontSize: 12, color: '#7E33C8' },
  // Bottom Panel
  bottomPanel: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  customerNameText: { fontSize: 14, fontWeight: '500', color: '#404040' },
  targetAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
  },
  targetLabel: { fontSize: 10, fontWeight: '600', color: '#9A9EA6' },
  targetText: { fontSize: 13, color: '#404040', marginTop: 2 },
  navigateMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF3E62',
    borderRadius: 12,
    height: 48,
    gap: 8,
    marginBottom: 10,
    elevation: 3,
  },
  navigateMainText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  statusUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 48,
    gap: 8,
    elevation: 3,
  },
  statusUpdateText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#404040' },
  modalSubtitle: {
    fontSize: 13,
    color: '#9A9EA6',
    marginBottom: 20,
  },
  navOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
    gap: 14,
  },
  navOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navOptionInfo: { flex: 1 },
  navOptionTitle: { fontSize: 15, fontWeight: '600', color: '#404040' },
  navOptionDesc: { fontSize: 12, color: '#9A9EA6', marginTop: 2 },
});
