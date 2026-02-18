// screens/Dashboard.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import {
  Home,
  Package,
  DollarSign,
  User,
  Bell,
  MapPin,
  Clock,
  Star,
  Truck,
  ChevronRight,
  Phone,
  LogOut,
  Navigation,
  TrendingUp,
  CheckCircle,
  Circle,
  Edit,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function Dashboard({
  session,
  driverProfile,
  setDriverProfile,
  onLogout,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    driverProfile?.online_status === 'online'
  );
  const [orderFilter, setOrderFilter] = useState('all');
  const [earningsPeriod, setEarningsPeriod] = useState('month');
  const [unreadCount, setUnreadCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!driverProfile?.id) return;
    await Promise.all([
      fetchDriverProfile(),
      fetchDeliveries(),
      fetchEarnings(),
      fetchNotifications(),
    ]);
  }, [driverProfile?.id]);

  const fetchDriverProfile = async () => {
    try {
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverProfile.id)
        .single();
      if (data) {
        setDriverProfile(data);
        setIsOnline(data.online_status === 'online');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const { data } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', driverProfile.id)
        .order('created_at', { ascending: false });
      if (data) setDeliveries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEarnings = async () => {
    try {
      const { data } = await supabase
        .from('earnings')
        .select('*')
        .eq('driver_id', driverProfile.id)
        .order('created_at', { ascending: false });
      if (data) setEarnings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('driver_id', driverProfile.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const toggleOnline = useCallback(async () => {
    if (driverProfile.driver_type === 'temporary') {
      const { data: activation } = await supabase
        .from('temporary_activation')
        .select('is_active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!activation?.is_active) {
        Alert.alert(
          'Not Available',
          'Temporary driver hiring is currently not active. Please wait for activation.'
        );
        return;
      }
    }

    const newStatus = isOnline ? 'offline' : 'online';
    try {
      await supabase
        .from('drivers')
        .update({
          online_status: newStatus,
          last_seen: new Date().toISOString(),
        })
        .eq('id', driverProfile.id);
      setIsOnline(!isOnline);
      setDriverProfile((prev) => ({ ...prev, online_status: newStatus }));
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  }, [isOnline, driverProfile]);

  const handleLogoutPress = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout },
    ]);
  }, [onLogout]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      assigned: '#3B82F6',
      accepted: '#3B82F6',
      picked_up: '#8B5CF6',
      in_transit: '#7E33C8',
      delivered: '#38AF4B',
      cancelled: '#E20000',
      declined: '#9A9EA6',
    };
    return colors[status] || '#9A9EA6';
  };

  const activeDelivery = deliveries.find(
    (d) =>
      d.status === 'accepted' ||
      d.status === 'picked_up' ||
      d.status === 'in_transit'
  );

  const todaysEarnings = earnings
    .filter((e) => {
      const today = new Date().toDateString();
      return (
        new Date(e.created_at).toDateString() === today &&
        e.status !== 'cancelled'
      );
    })
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const totalEarnings = earnings
    .filter((e) => e.status !== 'cancelled')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const completedDeliveries = deliveries.filter(
    (d) => d.status === 'delivered'
  );

  const filteredOrders =
    orderFilter === 'all'
      ? deliveries
      : deliveries.filter((d) => d.status === orderFilter);

  const filteredEarnings = earnings.filter((e) => {
    const now = new Date();
    const created = new Date(e.created_at);
    switch (earningsPeriod) {
      case 'today':
        return created.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
      }
      case 'month': {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }
      default:
        return true;
    }
  });

  const periodTotal = filteredEarnings
    .filter((e) => e.status !== 'cancelled')
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  // ================== TAB: HOME ==================
  const renderHome = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#EF3E62']}
        />
      }
      showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>
              Hello, {driverProfile?.full_name?.split(' ')[0]} 👋
            </Text>
            <Text style={styles.heroSubtext}>
              {isOnline ? 'You are online' : 'You are offline'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigate('notifications')}
            style={styles.bellBtn}>
            <Bell color="#FFF" size={22} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            isOnline ? styles.toggleOnline : styles.toggleOffline,
          ]}
          onPress={toggleOnline}
          activeOpacity={0.8}>
          {isOnline ? (
            <Wifi color="#38AF4B" size={20} />
          ) : (
            <WifiOff color="#E20000" size={20} />
          )}
          <Text
            style={[
              styles.toggleText,
              { color: isOnline ? '#38AF4B' : '#E20000' },
            ]}>
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Truck color="#EF3E62" size={22} />
          <Text style={styles.statValue}>
            {driverProfile?.total_deliveries || 0}
          </Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Star color="#F59E0B" size={22} />
          <Text style={styles.statValue}>
            {parseFloat(driverProfile?.rating || 0).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign color="#38AF4B" size={22} />
          <Text style={styles.statValue}>R{todaysEarnings.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>

      {/* Active Delivery */}
      {activeDelivery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Delivery</Text>
          <TouchableOpacity
            style={styles.activeDeliveryCard}
            onPress={() =>
              navigate('activeDelivery', { delivery: activeDelivery })
            }
            activeOpacity={0.7}>
            <View style={styles.activeDeliveryHeader}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(activeDelivery.status) + '20',
                  },
                ]}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(activeDelivery.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(activeDelivery.status) },
                  ]}>
                  {activeDelivery.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.orderId}>#{activeDelivery.order_id}</Text>
            </View>
            <View style={styles.addressRow}>
              <MapPin color="#EF3E62" size={16} />
              <Text style={styles.addressText} numberOfLines={1}>
                {activeDelivery.delivery_address}
              </Text>
            </View>
            <View style={styles.addressRow}>
              <Phone color="#7E33C8" size={16} />
              <Text style={styles.addressText}>
                {activeDelivery.customer_name} • {activeDelivery.customer_phone}
              </Text>
            </View>
            <View style={styles.navigateRow}>
              <Navigation color="#EF3E62" size={16} />
              <Text style={styles.navigateText}>TAP TO VIEW & NAVIGATE</Text>
              <ChevronRight color="#EF3E62" size={18} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Pending Requests */}
      {deliveries.filter(
        (d) => d.status === 'pending' || d.status === 'assigned'
      ).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          {deliveries
            .filter((d) => d.status === 'pending' || d.status === 'assigned')
            .slice(0, 3)
            .map((del) => (
              <TouchableOpacity
                key={del.id}
                style={styles.deliveryCard}
                onPress={() => navigate('deliveryDetail', { delivery: del })}>
                <View style={styles.deliveryCardTop}>
                  <Text style={styles.deliveryOrderId}>#{del.order_id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(del.status) + '20' },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(del.status) },
                      ]}>
                      {del.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.addressRow}>
                  <MapPin color="#9A9EA6" size={14} />
                  <Text style={styles.addressTextSmall} numberOfLines={1}>
                    {del.delivery_address}
                  </Text>
                </View>
                <View style={styles.deliveryCardBottom}>
                  <Text style={styles.deliveryItems}>
                    {del.items_count} item(s)
                  </Text>
                  <Text style={styles.deliveryFee}>
                    R{parseFloat(del.delivery_fee || 0).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Recent Deliveries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Deliveries</Text>
        {completedDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Package color="#9A9EA6" size={40} />
            <Text style={styles.emptyText}>No deliveries yet</Text>
          </View>
        ) : (
          completedDeliveries.slice(0, 5).map((del) => (
            <TouchableOpacity
              key={del.id}
              style={styles.deliveryCard}
              onPress={() => navigate('deliveryDetail', { delivery: del })}>
              <View style={styles.deliveryCardTop}>
                <Text style={styles.deliveryOrderId}>#{del.order_id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: '#38AF4B20' },
                  ]}>
                  <Text style={[styles.statusText, { color: '#38AF4B' }]}>
                    DELIVERED
                  </Text>
                </View>
              </View>
              <View style={styles.addressRow}>
                <MapPin color="#9A9EA6" size={14} />
                <Text style={styles.addressTextSmall} numberOfLines={1}>
                  {del.delivery_address}
                </Text>
              </View>
              <View style={styles.deliveryCardBottom}>
                <Text style={styles.deliveryDate}>
                  {new Date(
                    del.delivered_time || del.created_at
                  ).toLocaleDateString()}
                </Text>
                <Text style={styles.deliveryFee}>
                  R{parseFloat(del.delivery_fee || 0).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ================== TAB: ORDERS ==================
  const renderOrders = () => {
    const filters = [
      { label: 'All', value: 'all' },
      { label: 'Pending', value: 'pending' },
      { label: 'Active', value: 'accepted' },
      { label: 'Transit', value: 'in_transit' },
      { label: 'Done', value: 'delivered' },
    ];
    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#EF3E62']}
          />
        }
        showsVerticalScrollIndicator={false}>
        <Text style={styles.tabTitle}>My Orders</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                orderFilter === f.value && styles.filterChipActive,
              ]}
              onPress={() => setOrderFilter(f.value)}>
              <Text
                style={[
                  styles.filterChipText,
                  orderFilter === f.value && styles.filterChipTextActive,
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package color="#9A9EA6" size={48} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        ) : (
          filteredOrders.map((del) => (
            <TouchableOpacity
              key={del.id}
              style={styles.orderCard}
              onPress={() => navigate('deliveryDetail', { delivery: del })}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderCardId}>#{del.order_id}</Text>
                  <Text style={styles.orderCardDate}>
                    {new Date(del.created_at).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(del.status) + '20' },
                  ]}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(del.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(del.status) },
                    ]}>
                    {del.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.orderCardBody}>
                <View style={styles.addressRow}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.addressTextSmall} numberOfLines={1}>
                    {del.pickup_address}
                  </Text>
                </View>
                <View style={styles.addressLine} />
                <View style={styles.addressRow}>
                  <View style={styles.dotRed} />
                  <Text style={styles.addressTextSmall} numberOfLines={1}>
                    {del.delivery_address}
                  </Text>
                </View>
              </View>
              <View style={styles.orderCardFooter}>
                <Text style={styles.orderCardItems}>
                  {del.items_count} item(s) • {del.customer_name}
                </Text>
                <Text style={styles.orderCardFee}>
                  R{parseFloat(del.delivery_fee || 0).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // ================== TAB: EARNINGS ==================
  const renderEarnings = () => {
    const periods = [
      { label: 'Today', value: 'today' },
      { label: 'This Week', value: 'week' },
      { label: 'This Month', value: 'month' },
    ];
    const avgPerOrder =
      completedDeliveries.length > 0
        ? totalEarnings / completedDeliveries.length
        : 0;

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#EF3E62']}
          />
        }
        showsVerticalScrollIndicator={false}>
        <Text style={styles.tabTitle}>My Earnings</Text>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>R{periodTotal.toFixed(2)}</Text>
          <View style={styles.periodRow}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.periodChip,
                  earningsPeriod === p.value && styles.periodChipActive,
                ]}
                onPress={() => setEarningsPeriod(p.value)}>
                <Text
                  style={[
                    styles.periodChipText,
                    earningsPeriod === p.value && styles.periodChipTextActive,
                  ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.earningsStatsGrid}>
          <View style={styles.earningsStatItem}>
            <CheckCircle color="#38AF4B" size={20} />
            <Text style={styles.earningsStatValue}>
              {completedDeliveries.length}
            </Text>
            <Text style={styles.earningsStatLabel}>Completed</Text>
          </View>
          <View style={styles.earningsStatItem}>
            <Star color="#F59E0B" size={20} />
            <Text style={styles.earningsStatValue}>
              {parseFloat(driverProfile?.rating || 0).toFixed(1)}
            </Text>
            <Text style={styles.earningsStatLabel}>Avg Rating</Text>
          </View>
          <View style={styles.earningsStatItem}>
            <TrendingUp color="#7E33C8" size={20} />
            <Text style={styles.earningsStatValue}>
              R{avgPerOrder.toFixed(0)}
            </Text>
            <Text style={styles.earningsStatLabel}>Avg/Order</Text>
          </View>
        </View>

        {/* Driver Type Info */}
        <View style={styles.driverTypeCard}>
          <Text style={styles.driverTypeTitle}>Earning Structure</Text>
          <Text style={styles.driverTypeInfo}>
            {driverProfile?.driver_type === 'permanent'
              ? '5% commission on delivery value'
              : driverProfile?.driver_type === 'old'
              ? 'R30 per delivery unit (2 items per unit)'
              : 'R50 per delivery unit (2 items per unit)'}
          </Text>
        </View>

        {/* Transactions */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {filteredEarnings.length === 0 ? (
          <View style={styles.emptyState}>
            <DollarSign color="#9A9EA6" size={40} />
            <Text style={styles.emptyText}>
              No transactions for this period
            </Text>
          </View>
        ) : (
          filteredEarnings.map((e) => (
            <View key={e.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        e.type === 'delivery' || e.type === 'commission'
                          ? '#38AF4B20'
                          : e.type === 'bonus'
                          ? '#F59E0B20'
                          : '#E2000020',
                    },
                  ]}>
                  {e.type === 'withdrawal' ? (
                    <TrendingUp color="#E20000" size={18} />
                  ) : (
                    <DollarSign
                      color={e.type === 'bonus' ? '#F59E0B' : '#38AF4B'}
                      size={18}
                    />
                  )}
                </View>
                <View>
                  <Text style={styles.transactionDesc}>
                    {e.description || e.type}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(e.created_at).toLocaleDateString('en-ZA')}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: e.type === 'withdrawal' ? '#E20000' : '#38AF4B',
                  },
                ]}>
                {e.type === 'withdrawal' ? '-' : '+'}R
                {parseFloat(e.amount).toFixed(2)}
              </Text>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // ================== TAB: PROFILE ==================
  const renderProfile = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#EF3E62']}
        />
      }
      showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>My Profile</Text>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {driverProfile?.full_name?.charAt(0)?.toUpperCase() || 'D'}
          </Text>
        </View>
        <Text style={styles.profileName}>{driverProfile?.full_name}</Text>
        <Text style={styles.profileEmail}>
          {driverProfile?.email || session?.user?.email}
        </Text>
        <View style={styles.profileBadgeRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  driverProfile?.status === 'active'
                    ? '#38AF4B20'
                    : '#F59E0B20',
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    driverProfile?.status === 'active' ? '#38AF4B' : '#F59E0B',
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    driverProfile?.status === 'active' ? '#38AF4B' : '#F59E0B',
                },
              ]}>
              {driverProfile?.status?.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#7E33C820' }]}>
            <Text style={[styles.statusText, { color: '#7E33C8' }]}>
              {driverProfile?.driver_type?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Driver Information</Text>
        {[
          { label: 'Full Name', value: driverProfile?.full_name },
          { label: 'Phone', value: driverProfile?.phone },
          { label: 'License', value: driverProfile?.license_number },
          { label: 'Vehicle', value: driverProfile?.vehicle_type },
          { label: 'Area', value: driverProfile?.residential_area || 'N/A' },
          { label: 'Driver Type', value: driverProfile?.driver_type },
        ].map((item, i) => (
          <View key={i} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Performance */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Performance</Text>
        <View style={styles.perfRow}>
          <View style={styles.perfItem}>
            <Text style={styles.perfValue}>
              {driverProfile?.total_deliveries || 0}
            </Text>
            <Text style={styles.perfLabel}>Total Deliveries</Text>
          </View>
          <View style={styles.perfItem}>
            <Text style={styles.perfValue}>
              {parseFloat(driverProfile?.rating || 0).toFixed(1)} ⭐
            </Text>
            <Text style={styles.perfLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Edit Profile */}
      <TouchableOpacity
        style={styles.editProfileBtn}
        onPress={() => navigate('editProfile')}>
        <Edit color="#7E33C8" size={20} />
        <Text style={styles.editProfileText}>Edit Profile</Text>
        <ChevronRight color="#7E33C8" size={20} />
      </TouchableOpacity>

      {/* Support */}
      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>Support</Text>
        <TouchableOpacity
          style={styles.supportRow}
          onPress={() => Linking.openURL('tel:0872401200')}>
          <Phone color="#EF3E62" size={18} />
          <Text style={styles.supportText}>087 240 1200</Text>
        </TouchableOpacity>
        <Text style={styles.supportHours}>Mon-Fri: 8am-5pm | Sat: 8am-1pm</Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleLogoutPress}>
        <LogOut color="#E20000" size={20} />
        <Text style={styles.signOutText}>SIGN OUT</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ================== MAIN RENDER ==================
  const tabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'earnings', label: 'Earnings', icon: DollarSign },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'earnings' && renderEarnings()}
        {activeTab === 'profile' && renderProfile()}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}>
              <IconComp
                color={active ? '#EF3E62' : '#9A9EA6'}
                size={22}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {active && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F5' },
  mainContent: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 30 },
  tabContent: { flex: 1, paddingHorizontal: 16 },
  tabTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#404040',
    marginBottom: 16,
  },
  // Hero
  heroBanner: {
    backgroundColor: '#EF3E62',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroGreeting: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  heroSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  bellBtn: { padding: 6, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#EF3E62' },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 10,
    gap: 8,
  },
  toggleOnline: { backgroundColor: '#FFF' },
  toggleOffline: { backgroundColor: '#FFF' },
  toggleText: { fontSize: 14, fontWeight: '700' },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#404040',
    marginTop: 6,
  },
  statLabel: { fontSize: 11, color: '#9A9EA6', marginTop: 2 },
  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 12,
  },
  // Active Delivery
  activeDeliveryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF3E62',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activeDeliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: { fontSize: 14, fontWeight: '600', color: '#404040' },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressText: { fontSize: 13, color: '#565656', flex: 1 },
  navigateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F5',
  },
  navigateText: { fontSize: 13, fontWeight: '600', color: '#EF3E62' },
  // Delivery Cards
  deliveryCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  deliveryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryOrderId: { fontSize: 14, fontWeight: '600', color: '#404040' },
  addressTextSmall: { fontSize: 12, color: '#565656', flex: 1 },
  deliveryCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F5',
  },
  deliveryItems: { fontSize: 12, color: '#9A9EA6' },
  deliveryDate: { fontSize: 12, color: '#9A9EA6' },
  deliveryFee: { fontSize: 14, fontWeight: '600', color: '#38AF4B' },
  // Status
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },
  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#9A9EA6', marginTop: 10 },
  // Filter
  filterRow: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(51,51,51,0.1)',
  },
  filterChipActive: { backgroundColor: '#EF3E62', borderColor: '#EF3E62' },
  filterChipText: { fontSize: 12, fontWeight: '500', color: '#565656' },
  filterChipTextActive: { color: '#FFF' },
  // Order Cards
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCardId: { fontSize: 15, fontWeight: '700', color: '#404040' },
  orderCardDate: { fontSize: 11, color: '#9A9EA6', marginTop: 2 },
  orderCardBody: { marginBottom: 12 },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38AF4B',
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF3E62',
  },
  addressLine: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginLeft: 3,
    marginVertical: 2,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F5',
    paddingTop: 10,
  },
  orderCardItems: { fontSize: 12, color: '#9A9EA6' },
  orderCardFee: { fontSize: 14, fontWeight: '600', color: '#38AF4B' },
  // Earnings
  earningsCard: {
    backgroundColor: '#EF3E62',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  earningsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginVertical: 8,
  },
  periodRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  periodChipActive: { backgroundColor: '#FFF' },
  periodChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  periodChipTextActive: { color: '#EF3E62' },
  earningsStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  earningsStatItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  earningsStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#404040',
    marginTop: 6,
  },
  earningsStatLabel: { fontSize: 10, color: '#9A9EA6', marginTop: 2 },
  driverTypeCard: {
    backgroundColor: '#7E33C810',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#7E33C8',
  },
  driverTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7E33C8',
    marginBottom: 4,
  },
  driverTypeInfo: { fontSize: 13, color: '#565656' },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDesc: { fontSize: 13, fontWeight: '500', color: '#404040' },
  transactionDate: { fontSize: 11, color: '#9A9EA6', marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: '700' },
  // Profile
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF3E62',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: 20, fontWeight: '700', color: '#404040' },
  profileEmail: { fontSize: 13, color: '#9A9EA6', marginTop: 4 },
  profileBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF3E62',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F5',
  },
  infoLabel: { fontSize: 13, color: '#9A9EA6' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#404040' },
  perfRow: { flexDirection: 'row', gap: 16 },
  perfItem: { flex: 1, alignItems: 'center' },
  perfValue: { fontSize: 24, fontWeight: '700', color: '#404040' },
  perfLabel: { fontSize: 11, color: '#9A9EA6', marginTop: 4 },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  editProfileText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#7E33C8',
  },
  supportCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF3E62',
    marginBottom: 10,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  supportText: { fontSize: 16, fontWeight: '600', color: '#404040' },
  supportHours: { fontSize: 12, color: '#9A9EA6' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E20000',
    marginBottom: 20,
  },
  signOutText: { fontSize: 14, fontWeight: '600', color: '#E20000' },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F5',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabLabel: { fontSize: 10, color: '#9A9EA6', marginTop: 4 },
  tabLabelActive: { color: '#EF3E62', fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#EF3E62',
  },
});
