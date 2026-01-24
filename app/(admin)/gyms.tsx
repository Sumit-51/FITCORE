import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Gym } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const SuperAdminGyms: React.FC = () => {
  const { userData } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async (): Promise<void> => {
    try {
      const gymsSnapshot = await getDocs(collection(db, 'gyms'));
      const gymsList: Gym[] = gymsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Gym[];

      // Sort by created date (newest first)
      gymsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setGyms(gymsList);
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to load gyms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchGyms();
  };

  const toggleGymStatus = async (gymId: string, currentStatus: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, 'gyms', gymId), {
        isActive: !currentStatus,
      });

      await fetchGyms();
      Alert.alert(
        'Success',
        `Gym ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error updating gym status:', error);
      Alert.alert('Error', 'Failed to update gym status');
    }
  };

  const handleToggleStatus = (gym: Gym): void => {
    Alert.alert(
      gym.isActive ? 'Deactivate Gym' : 'Activate Gym',
      `Are you sure you want to ${gym.isActive ? 'deactivate' : 'activate'} ${gym.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: gym.isActive ? 'Deactivate' : 'Activate',
          style: gym.isActive ? 'destructive' : 'default',
          onPress: () => toggleGymStatus(gym.id, gym.isActive),
        },
      ]
    );
  };

  const renderGymCard = ({ item }: { item: Gym }) => {
    const statusColor = item.isActive ? '#4ade80' : '#64748b';

    return (
      <View style={styles.gymCard}>
        <View style={styles.gymHeader}>
          <View style={styles.gymIconContainer}>
            <Ionicons name="barbell" size={28} color="#4ade80" />
          </View>
          <View style={styles.gymInfo}>
            <Text style={styles.gymName}>{item.name}</Text>
            <View style={styles.gymDetailRow}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.gymAddress} numberOfLines={1}>{item.address}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.gymDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{item.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Monthly Fee:</Text>
            <Text style={styles.detailValue}>₹{item.monthlyFee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            item.isActive ? styles.deactivateBtn : styles.activateBtn,
          ]}
          onPress={() => handleToggleStatus(item)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={item.isActive ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={20}
            color={item.isActive ? '#f87171' : '#4ade80'}
          />
          <Text
            style={[
              styles.toggleBtnText,
              { color: item.isActive ? '#f87171' : '#4ade80' },
            ]}
          >
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading gyms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <View style={styles.header}>
        <Text style={styles.title}>All Gyms</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{gyms.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4ade80' }]}>
            {gyms.filter((g) => g.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#64748b' }]}>
            {gyms.filter((g) => !g.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {gyms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color="#64748b" />
          <Text style={styles.emptyText}>No gyms found</Text>
          <Text style={styles.emptySubtext}>No gyms registered in the system</Text>
        </View>
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGymCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

export default SuperAdminGyms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  accentCircleOne: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  accentCircleTwo: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    bottom: height * 0.3,
    left: -width * 0.15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: 16,
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: '800',
    color: '#e9eef7',
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    marginHorizontal: width * 0.05,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e9eef7',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 100,
  },
  gymCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gymHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gymIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gymName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e9eef7',
  },
  gymDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gymAddress: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gymDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e9eef7',
    flex: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  activateBtn: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  deactivateBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e9eef7',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
});
