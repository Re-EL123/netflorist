// screens/NotificationsScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Package,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
  DollarSign,
  Truck,
  Star,
  XCircle,
  Navigation,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const NOTIFICATION_TYPES = {
  delivery_request: {
    icon: Package,
    color: '#EF3E62',
    bgColor: '#FFF0F3',
    label: 'New Delivery',
  },
  delivery_completed: {
    icon: CheckCircle,
    color: '#38AF4B',
    bgColor: '#F0FFF4',
    label: 'Completed',
  },
  delivery_cancelled: {
    icon: XCircle,
    color: '#E20000',
    bgColor: '#FFF5F5',
    label: 'Cancelled',
  },
  earnings: {
    icon: DollarSign,
    color: '#7E33C8',
    bgColor: '#F5F0FF',
    label: 'Earnings',
  },
  system: {
    icon: Info,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    label: 'System',
  },
  warning: {
    icon: AlertTriangle,
    color: '#F5A623',
    bgColor: '#FFFBEB',
    label: 'Warning',
  },
  activation: {
    icon: Truck,
    color: '#38AF4B',
    bgColor: '#F0FFF4',
    label: 'Activation',
  },
  rating: {
    icon: Star,
    color: '#F5A623',
    bgColor: '#FFFBEB',
    label: 'Rating',
  },
};

export default function NotificationsScreen({
  session,
  driverProfile,
  onBack,
}) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    fetchNotifications();

    // Subscribe to real-time notifications
    let subscription;
    if (driverProfile?.id) {
      subscription = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `driver_id=eq.${driverProfile.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fadeAnim, slideAnim, driverProfile?.id]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const driverId = driverProfile?.id;
      if (!driverId) {
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      } else {
        // Generate sample notifications for demo when no real data exists
        const sampleNotifications = generateSampleNotifications(driverId);
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const sampleNotifications = generateSampleNotifications(
        driverProfile?.id
      );
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter((n) => !n.is_read).length);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleNotifications = (driverId) => {
    const now = new Date();
    return [
      {
        id: 'sample-1',
        driver_id: driverId,
        type: 'delivery_request',
        title: 'New Delivery Request',
        message:
          'A new delivery is available for pickup at 123 Main Street, Sandton. 3 items to deliver to Bryanston.',
        is_read: false,
        data: { order_id: 'ORD-1001', items: 3 },
        created_at: new Date(now - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-2',
        driver_id: driverId,
        type: 'delivery_completed',
        title: 'Delivery Completed',
        message:
          'Order ORD-0998 has been marked as delivered successfully. Great job! R60.00 has been added to your earnings.',
        is_read: false,
        data: { order_id: 'ORD-0998', earnings: 60 },
        created_at: new Date(now - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-3',
        driver_id: driverId,
        type: 'earnings',
        title: 'Weekly Earnings Summary',
        message:
          'You earned R1,250.00 this week across 18 deliveries. Keep up the great work! Your next payout is scheduled for Friday.',
        is_read: false,
        data: { amount: 1250, deliveries: 18 },
        created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-4',
        driver_id: driverId,
        type: 'rating',
        title: 'New Customer Rating',
        message:
          'A customer rated your delivery 5 stars! ⭐⭐⭐⭐⭐ Your overall average rating is now 4.8.',
        is_read: true,
        data: { rating: 5 },
        created_at: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-5',
        driver_id: driverId,
        type: 'system',
        title: 'App Update Available',
        message:
          'A new version of the Netflorist Driver app is available. Please update for the best experience and latest features.',
        is_read: true,
        data: {},
        created_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-6',
        driver_id: driverId,
        type: 'activation',
        title: 'Temporary Driver Activation',
        message:
          "Peak season hiring is now active. Go online to start receiving delivery requests. There's high demand in your area!",
        is_read: true,
        data: {},
        created_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-7',
        driver_id: driverId,
        type: 'delivery_cancelled',
        title: 'Delivery Cancelled',
        message:
          'Order ORD-0995 has been cancelled by the customer before pickup. No action required from your side.',
        is_read: true,
        data: { order_id: 'ORD-0995' },
        created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-8',
        driver_id: driverId,
        type: 'warning',
        title: 'Document Expiry Reminder',
        message:
          "Your driver's license will expire in 30 days. Please renew and upload the updated document to avoid service interruption.",
        is_read: true,
        data: {},
        created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  }, [driverProfile?.id]);

  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Only update in DB if not a sample notification
    if (!notificationId.startsWith('sample-')) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    Alert.alert('Mark All as Read', 'Mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark All',
        onPress: async () => {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
          );
          setUnreadCount(0);

          try {
            const driverId = driverProfile?.id;
            if (driverId) {
              await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('driver_id', driverId)
                .eq('is_read', false);
            }
          } catch (error) {
            console.error('Error marking all as read:', error);
          }
        },
      },
    ]);
  }, [driverProfile?.id]);

  const deleteNotification = useCallback(
    (notificationId) => {
      Alert.alert(
        'Delete Notification',
        'Are you sure you want to delete this notification?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const notif = notifications.find((n) => n.id === notificationId);
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
              );
              if (notif && !notif.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }

              if (!notificationId.startsWith('sample-')) {
                try {
                  await supabase
                    .from('notifications')
                    .delete()
                    .eq('id', notificationId);
                } catch (error) {
                  console.error('Error deleting notification:', error);
                }
              }
            },
          },
        ]
      );
    },
    [notifications]
  );

  const clearAll = useCallback(() => {
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete all notifications. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setNotifications([]);
            setUnreadCount(0);
            try {
              const driverId = driverProfile?.id;
              if (driverId) {
                await supabase
                  .from('notifications')
                  .delete()
                  .eq('driver_id', driverId);
              }
            } catch (error) {
              console.error('Error clearing notifications:', error);
            }
          },
        },
      ]
    );
  }, [driverProfile?.id]);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.is_read);
      case 'read':
        return notifications.filter((n) => n.is_read);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const renderNotification = ({ item }) => {
    const typeConfig =
      NOTIFICATION_TYPES[item.type] || NOTIFICATION_TYPES.system;
    const IconComponent = typeConfig.icon;

    return (
      <Animated.View
        style={[
          styles.notificationCard,
          !item.is_read && styles.notificationUnread,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => {
            if (!item.is_read) markAsRead(item.id);
          }}
          activeOpacity={0.7}>
          {/* Icon */}
          <View
            style={[
              styles.notificationIconContainer,
              { backgroundColor: typeConfig.bgColor },
            ]}>
            <IconComponent color={typeConfig.color} size={22} />
          </View>

          {/* Content */}
          <View style={styles.notificationBody}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationTitleRow}>
                <Text
                  style={[
                    styles.notificationTitle,
                    !item.is_read && styles.notificationTitleUnread,
                  ]}
                  numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.is_read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationTime}>
                {getTimeAgo(item.created_at)}
              </Text>
            </View>

            <Text style={styles.notificationMessage} numberOfLines={3}>
              {item.message}
            </Text>

            <View style={styles.notificationFooter}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: typeConfig.bgColor },
                ]}>
                <Text
                  style={[styles.typeBadgeText, { color: typeConfig.color }]}>
                  {typeConfig.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNotification(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Trash2 color="#CCCCCC" size={16} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <BellOff color="#CCCCCC" size={60} />
      </View>
      <Text style={styles.emptyTitle}>
        {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'unread'
          ? "You've read all your notifications. Great job staying on top of things!"
          : "You don't have any notifications yet. They'll appear here when you receive delivery requests, updates, and more."}
      </Text>
      {filter !== 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}>
          <Text style={styles.emptyButtonText}>View All Notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <ArrowLeft color="#404040" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={unreadCount > 0 ? markAllAsRead : clearAll}
          activeOpacity={0.7}>
          {unreadCount > 0 ? (
            <CheckCheck color="#EF3E62" size={22} />
          ) : notifications.length > 0 ? (
            <Trash2 color="#9A9EA6" size={20} />
          ) : (
            <View style={{ width: 20 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          {
            key: 'read',
            label: 'Read',
            count: notifications.length - unreadCount,
          },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(tab.key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.filterTabText,
                filter === tab.key && styles.filterTabTextActive,
              ]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.filterCount,
                filter === tab.key && styles.filterCountActive,
              ]}>
              <Text
                style={[
                  styles.filterCountText,
                  filter === tab.key && styles.filterCountTextActive,
                ]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notification List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF3E62" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#EF3E62']}
              tintColor="#EF3E62"
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#404040',
  },
  headerBadge: {
    backgroundColor: '#EF3E62',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerAction: {
    width: 40,
    alignItems: 'flex-end',
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: '#FFF0F3',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9EA6',
  },
  filterTabTextActive: {
    color: '#EF3E62',
    fontWeight: '600',
  },
  filterCount: {
    backgroundColor: '#F1F5F5',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: '#EF3E62',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9A9EA6',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9A9EA6',
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  notificationUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF3E62',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#404040',
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF3E62',
    marginLeft: 6,
  },
  notificationTime: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9A9EA6',
  },
  notificationMessage: {
    fontSize: 12,
    fontWeight: '400',
    color: '#565656',
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9A9EA6',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#EF3E62',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});
