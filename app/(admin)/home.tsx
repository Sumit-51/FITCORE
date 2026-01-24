import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Enrollment, Gym } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const AdminHome: React.FC = () => {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingRequests: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async (): Promise<void> => {
    try {
      if (!userData?.gymId) {
        setLoading(false);
        return;
      }

      // Fetch gym details
      const gymDoc = await getDoc(doc(db, 'gyms', userData.gymId));
      if (gymDoc.exists()) {
        setGym({
          id: gymDoc.id,
          ...gymDoc.data(),
          createdAt: gymDoc.data().createdAt?.toDate() || new Date(),
        } as Gym);
      }

      // Fetch enrollments for this gym
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('gymId', '==', userData.gymId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrollments: Enrollment[] = enrollmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate() || null,
      })) as Enrollment[];

      // Calculate stats
      const approved = enrollments.filter((e) => e.status === 'approved');
      const pending = enrollments.filter((e) => e.status === 'pending');
      
      // Calculate monthly revenue (approved enrollments from current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = approved
        .filter((e) => {
          const enrollDate = e.createdAt;
          return enrollDate.getMonth() === currentMonth && enrollDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      setStats({
        totalMembers: enrollments.length,
        activeMembers: approved.length,
        pendingRequests: pending.length,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/login');
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userData?.displayName || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#f87171" />
          </TouchableOpacity>
        </View>

        {gym && (
          <View style={styles.gymCard}>
            <Ionicons name="barbell-outline" size={24} color="#4ade80" />
            <View style={styles.gymInfo}>
              <Text style={styles.gymName}>{gym.name}</Text>
              <Text style={styles.gymAddress}>{gym.address}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{gym.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={28} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#4ade80" />
            <Text style={styles.statNumber}>{stats.activeMembers}</Text>
            <Text style={styles.statLabel}>Active Members</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color="#f97316" />
            <Text style={styles.statNumber}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={28} color="#a855f7" />
            <Text style={styles.statNumber}>₹{stats.monthlyRevenue}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {stats.pendingRequests > 0 && (
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(admin)/members')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="people" size={28} color="#f97316" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Review Member Requests</Text>
              <Text style={styles.actionSubtitle}>
                {stats.pendingRequests} request{stats.pendingRequests !== 1 ? 's' : ''} waiting for approval
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/members')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="list" size={28} color="#3b82f6" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>View All Members</Text>
            <Text style={styles.actionSubtitle}>
              Manage your gym members and their enrollment
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/settings')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="settings" size={28} color="#a855f7" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Gym Settings</Text>
            <Text style={styles.actionSubtitle}>
              Update gym information and preferences
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#64748b" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminHome;

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
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
  },
  accentCircleOne: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
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
    marginBottom: height * 0.025,
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
  },
  userName: {
    fontSize: isSmall ? 24 : 28,
    fontWeight: '700',
    color: '#e9eef7',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: height * 0.025,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gymInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  gymAddress: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ade80',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e9eef7',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
});
