import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Gym } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const AdminSettings: React.FC = () => {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');

  useEffect(() => {
    fetchGymDetails();
  }, []);

  const fetchGymDetails = async (): Promise<void> => {
    try {
      if (!userData?.gymId) {
        setLoading(false);
        return;
      }

      const gymDoc = await getDoc(doc(db, 'gyms', userData.gymId));
      if (gymDoc.exists()) {
        const gymData = {
          id: gymDoc.id,
          ...gymDoc.data(),
          createdAt: gymDoc.data().createdAt?.toDate() || new Date(),
        } as Gym;
        
        setGym(gymData);
        setName(gymData.name);
        setAddress(gymData.address);
        setPhone(gymData.phone);
        setEmail(gymData.email);
        setUpiId(gymData.upiId);
        setMonthlyFee(gymData.monthlyFee.toString());
      }
    } catch (error) {
      console.error('Error fetching gym details:', error);
      Alert.alert('Error', 'Failed to load gym details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!gym || !userData?.gymId) return;

    if (!name.trim() || !address.trim() || !phone.trim() || !email.trim() || !monthlyFee.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const fee = parseFloat(monthlyFee);
    if (isNaN(fee) || fee <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly fee');
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, 'gyms', userData.gymId), {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        upiId: upiId.trim(),
        monthlyFee: fee,
      });

      await fetchGymDetails();
      setEditing(false);
      Alert.alert('Success', 'Gym details updated successfully');
    } catch (error) {
      console.error('Error updating gym:', error);
      Alert.alert('Error', 'Failed to update gym details');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    if (gym) {
      setName(gym.name);
      setAddress(gym.address);
      setPhone(gym.phone);
      setEmail(gym.email);
      setUpiId(gym.upiId);
      setMonthlyFee(gym.monthlyFee.toString());
    }
    setEditing(false);
  };

  const handleLogout = async (): Promise<void> => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading settings...</Text>
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
          <Text style={styles.title}>Settings</Text>
          {!editing && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditing(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={20} color="#4ade80" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gym Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gym Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={name}
              onChangeText={setName}
              placeholder="Enter gym name"
              placeholderTextColor="#64748b"
              editable={editing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, !editing && styles.inputDisabled]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter gym address"
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              editable={editing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              editable={editing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={editing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>UPI ID</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="Enter UPI ID"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              editable={editing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Monthly Fee (₹)</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={monthlyFee}
              onChangeText={setMonthlyFee}
              placeholder="Enter monthly fee"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              editable={editing}
            />
          </View>
        </View>

        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#0a0f1a" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.8}>
            <View style={styles.settingIcon}>
              <Ionicons name="person-outline" size={22} color="#3b82f6" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Profile</Text>
              <Text style={styles.settingSubtitle}>{userData?.displayName || 'Admin'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
              <Ionicons name="log-out-outline" size={22} color="#f87171" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: '#f87171' }]}>Logout</Text>
              <Text style={styles.settingSubtitle}>Sign out of your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        {gym && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Gym Status</Text>
              <Text style={styles.infoSubtitle}>
                Your gym is {gym.isActive ? 'active' : 'inactive'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminSettings;

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
    paddingBottom: height * 0.05,
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
    marginBottom: 24,
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: '800',
    color: '#e9eef7',
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#e9eef7',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputDisabled: {
    opacity: 0.7,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e9eef7',
  },
  saveBtn: {
    backgroundColor: '#4ade80',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a0f1a',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9eef7',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
});
