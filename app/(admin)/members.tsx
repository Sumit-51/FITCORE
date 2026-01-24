import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
import { Enrollment, EnrollmentStatus } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const AdminMembers: React.FC = () => {
  const { userData } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, enrollments]);

  const fetchEnrollments = async (): Promise<void> => {
    try {
      if (!userData?.gymId) {
        setLoading(false);
        return;
      }

      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('gymId', '==', userData.gymId)
      );
      const snapshot = await getDocs(enrollmentsQuery);
      const enrollmentsList: Enrollment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate() || null,
      })) as Enrollment[];

      // Sort by created date (newest first)
      enrollmentsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setEnrollments(enrollmentsList);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      Alert.alert('Error', 'Failed to load members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (): void => {
    if (filter === 'all') {
      setFilteredEnrollments(enrollments);
    } else {
      setFilteredEnrollments(enrollments.filter((e) => e.status === filter));
    }
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchEnrollments();
  };

  const updateEnrollmentStatus = async (
    enrollmentId: string,
    userId: string,
    status: EnrollmentStatus
  ): Promise<void> => {
    try {
      // Update enrollment document
      await updateDoc(doc(db, 'enrollments', enrollmentId), {
        status,
        verifiedAt: new Date(),
        verifiedBy: userData?.uid,
      });

      // Update user document
      await updateDoc(doc(db, 'users', userId), {
        enrollmentStatus: status,
      });

      // Refresh the list
      await fetchEnrollments();
      
      Alert.alert(
        'Success',
        `Enrollment ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      );
    } catch (error) {
      console.error('Error updating enrollment:', error);
      Alert.alert('Error', 'Failed to update enrollment status');
    }
  };

  const handleApprove = (enrollment: Enrollment): void => {
    Alert.alert(
      'Approve Enrollment',
      `Approve ${enrollment.userName} to join your gym?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => updateEnrollmentStatus(enrollment.id, enrollment.userId, 'approved'),
        },
      ]
    );
  };

  const handleReject = (enrollment: Enrollment): void => {
    Alert.alert(
      'Reject Enrollment',
      `Reject ${enrollment.userName}'s enrollment request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => updateEnrollmentStatus(enrollment.id, enrollment.userId, 'rejected'),
        },
      ]
    );
  };

  const getStatusColor = (status: EnrollmentStatus): string => {
    switch (status) {
      case 'approved':
        return '#4ade80';
      case 'rejected':
        return '#f87171';
      case 'pending':
        return '#fbbf24';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: EnrollmentStatus): string => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const renderEnrollmentCard = ({ item }: { item: Enrollment }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.memberAvatarContainer}>
            <Ionicons name="person" size={24} color="#4ade80" />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.userName}</Text>
            <Text style={styles.memberEmail}>{item.userEmail}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.memberDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text style={styles.detailValue}>
              {item.paymentMethod === 'online' ? 'Online' : 'Offline'}
            </Text>
          </View>
          {item.transactionId && (
            <View style={styles.detailRow}>
              <Ionicons name="receipt-outline" size={16} color="#64748b" />
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.transactionId}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₹{item.amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Applied:</Text>
            <Text style={styles.detailValue}>
              {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApprove(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={20} color="#0a0f1a" />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#f87171" />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({enrollments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending ({enrollments.filter((e) => e.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'approved' && styles.filterBtnActive]}
          onPress={() => setFilter('approved')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'approved' && styles.filterTextActive]}>
            Approved ({enrollments.filter((e) => e.status === 'approved').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'rejected' && styles.filterBtnActive]}
          onPress={() => setFilter('rejected')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'rejected' && styles.filterTextActive]}>
            Rejected ({enrollments.filter((e) => e.status === 'rejected').length})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredEnrollments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#64748b" />
          <Text style={styles.emptyText}>No members found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all'
              ? 'No enrollment requests yet'
              : `No ${filter} enrollments`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEnrollments}
          renderItem={renderEnrollmentCard}
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

export default AdminMembers;

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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: width * 0.05,
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterBtnActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#0a0f1a',
  },
  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 100,
  },
  memberCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  memberEmail: {
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
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberDetails: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  approveBtn: {
    backgroundColor: '#4ade80',
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a0f1a',
  },
  rejectBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f87171',
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
