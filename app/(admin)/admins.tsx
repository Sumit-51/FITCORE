import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
import { Gym, UserData } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

interface AdminWithGym extends UserData {
  gymName?: string;
}

const SuperAdminAdmins: React.FC = () => {
  const { userData } = useAuth();
  const [admins, setAdmins] = useState<AdminWithGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async (): Promise<void> => {
    try {
      // Fetch all gym admins
      const adminsQuery = query(collection(db, 'users'), where('role', '==', 'gymAdmin'));
      const adminsSnapshot = await getDocs(adminsQuery);
      const adminsList: AdminWithGym[] = adminsSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        enrolledAt: doc.data().enrolledAt?.toDate() || null,
      })) as AdminWithGym[];

      // Fetch all gyms to map gym names
      const gymsSnapshot = await getDocs(collection(db, 'gyms'));
      const gymsMap = new Map<string, string>();
      gymsSnapshot.docs.forEach((doc) => {
        const gymData = doc.data() as Gym;
        gymsMap.set(doc.id, gymData.name);
      });

      // Add gym names to admins
      adminsList.forEach((admin) => {
        if (admin.gymId) {
          admin.gymName = gymsMap.get(admin.gymId) || 'Unknown Gym';
        }
      });

      // Sort by created date (newest first)
      adminsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      Alert.alert('Error', 'Failed to load admins');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchAdmins();
  };

  const renderAdminCard = ({ item }: { item: AdminWithGym }) => {
    return (
      <View style={styles.adminCard}>
        <View style={styles.adminHeader}>
          <View style={styles.adminAvatarContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#a855f7" />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{item.displayName || 'Admin'}</Text>
            <Text style={styles.adminEmail} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Admin</Text>
          </View>
        </View>

        <View style={styles.adminDetails}>
          {item.gymName && (
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color="#64748b" />
              <Text style={styles.detailLabel}>Gym:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.gymName}</Text>
            </View>
          )}
          {!item.gymName && item.gymId && (
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color="#64748b" />
              <Text style={styles.detailLabel}>Gym ID:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.gymId}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Joined:</Text>
            <Text style={styles.detailValue}>
              {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>User ID:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{item.uid}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading admins...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <View style={styles.header}>
        <Text style={styles.title}>Gym Admins</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{admins.length}</Text>
          <Text style={styles.statLabel}>Total Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4ade80' }]}>
            {admins.filter((a) => a.gymId).length}
          </Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#64748b' }]}>
            {admins.filter((a) => !a.gymId).length}
          </Text>
          <Text style={styles.statLabel}>Unassigned</Text>
        </View>
      </View>

      {admins.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-outline" size={64} color="#64748b" />
          <Text style={styles.emptyText}>No admins found</Text>
          <Text style={styles.emptySubtext}>No gym administrators in the system</Text>
        </View>
      ) : (
        <FlatList
          data={admins}
          renderItem={renderAdminCard}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

export default SuperAdminAdmins;

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
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  accentCircleTwo: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
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
  adminCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminInfo: {
    flex: 1,
    marginLeft: 12,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  adminEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a855f7',
  },
  adminDetails: {
    gap: 8,
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
