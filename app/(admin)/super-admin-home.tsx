import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

const SuperAdminHome: React.FC = () => {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalGyms: 0,
    activeGyms: 0,
    totalMembers: 0,
    pendingEnrollments: 0,
    totalAdmins: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async (): Promise<void> => {
    try {
      // Fetch all gyms
      const gymsSnapshot = await getDocs(collection(db, 'gyms'));
      const gyms: Gym[] = gymsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Gym[];

      const activeGyms = gyms.filter((g) => g.isActive);

      // Fetch all enrollments
      const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
      const enrollments: Enrollment[] = enrollmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate() || null,
      })) as Enrollment[];

      const pendingEnrollments = enrollments.filter((e) => e.status === 'pending');

      // Calculate monthly revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const approvedEnrollments = enrollments.filter((e) => e.status === 'approved');
      const monthlyRevenue = approvedEnrollments
        .filter((e) => {
          const enrollDate = e.createdAt;
          return enrollDate.getMonth() === currentMonth && enrollDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      // Fetch gym admins
      const adminsQuery = query(collection(db, 'users'), where('role', '==', 'gymAdmin'));
      const adminsSnapshot = await getDocs(adminsQuery);

      setStats({
        totalGyms: gyms.length,
        activeGyms: activeGyms.length,
        totalMembers: enrollments.length,
        pendingEnrollments: pendingEnrollments.length,
        totalAdmins: adminsSnapshot.size,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching super admin data:', error);
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
            <Text style={styles.userName}>Super Admin</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#f87171" />
          </TouchableOpacity>
        </View>

        <View style={styles.roleCard}>
          <Ionicons name="shield-checkmark" size={24} color="#a855f7" />
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Super Administrator</Text>
            <Text style={styles.roleDescription}>Full system access</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
            <View style={[styles.statusDot, { backgroundColor: '#a855f7' }]} />
            <Text style={[styles.statusText, { color: '#a855f7' }]}>Active</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>System Overview</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="business-outline" size={28} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats.totalGyms}</Text>
            <Text style={styles.statLabel}>Total Gyms</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#4ade80" />
            <Text style={styles.statNumber}>{stats.activeGyms}</Text>
            <Text style={styles.statLabel}>Active Gyms</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={28} color="#fbbf24" />
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color="#f97316" />
            <Text style={styles.statNumber}>{stats.pendingEnrollments}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="shield-outline" size={28} color="#a855f7" />
            <Text style={styles.statNumber}>{stats.totalAdmins}</Text>
            <Text style={styles.statLabel}>Gym Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={28} color="#10b981" />
            <Text style={styles.statNumber}>₹{stats.monthlyRevenue}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/gyms')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="business" size={28} color="#3b82f6" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Manage Gyms</Text>
            <Text style={styles.actionSubtitle}>
              View and manage all registered gyms
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/admins')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
            <Ionicons name="shield-checkmark" size={28} color="#a855f7" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Manage Admins</Text>
            <Text style={styles.actionSubtitle}>
              View and manage gym administrators
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#64748b" />
        </TouchableOpacity>

        {stats.pendingEnrollments > 0 && (
          <View style={styles.alertCard}>
            <Ionicons name="alert-circle" size={24} color="#f97316" />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Attention Required</Text>
              <Text style={styles.alertSubtitle}>
                {stats.pendingEnrollments} enrollment{stats.pendingEnrollments !== 1 ? 's' : ''} pending across all gyms
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SuperAdminHome;

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
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: height * 0.025,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  roleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  roleDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 113, 24, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 24, 0.2)',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 14,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f97316',
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
});
