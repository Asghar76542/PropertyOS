import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { spacing, colors } from '../../utils/theme';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();

  // Mock user data
  const user = {
    name: 'Alex Smith',
    email: 'alex.smith@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Property Manager',
    company: 'PropertyOS Management',
    avatar: null,
    joinDate: 'January 2023',
  };

  const stats = [
    { label: 'Properties', value: '12', icon: 'home-group' },
    { label: 'Tenants', value: '8', icon: 'account-group' },
    { label: 'Active Requests', value: '3', icon: 'clipboard-list' },
    { label: 'Total Revenue', value: '$24,000', icon: 'currency-usd' },
  ];

  const menuItems = [
    { title: 'Account Settings', icon: 'cog', onPress: () => {} },
    { title: 'Notifications', icon: 'bell', onPress: () => {} },
    { title: 'Documents', icon: 'file-document', onPress: () => {} },
    { title: 'Support', icon: 'help-circle', onPress: () => {} },
    { title: 'Privacy Policy', icon: 'shield-check', onPress: () => {} },
    { title: 'Terms of Service', icon: 'file-document-outline', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={user.name.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.userName}>
                  {user.name}
                </Text>
                <Text variant="bodyLarge" style={[styles.userRole, { color: theme.colors.primary }]}>
                  {user.role}
                </Text>
                <Text variant="bodyMedium" style={[styles.userCompany, { color: theme.colors.onSurfaceVariant }]}>
                  {user.company}
                </Text>
              </View>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="email" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.contactText}>
                  {user.email}
                </Text>
              </View>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="phone" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.contactText}>
                  {user.phone}
                </Text>
              </View>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.contactText}>
                  Member since {user.joinDate}
                </Text>
              </View>
            </View>

            <Button 
              mode="outlined" 
              onPress={() => {/* Edit profile */}}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Overview
          </Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <MaterialCommunityIcons 
                    name={stat.icon as any} 
                    size={28} 
                    color={theme.colors.primary}
                    style={styles.statIcon}
                  />
                  <Text variant="headlineMedium" style={styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {stat.label}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Settings
            </Text>
            {menuItems.map((item, index) => (
              <View key={index}>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={24} 
                      color={theme.colors.onSurfaceVariant}
                      style={styles.menuItemIcon}
                    />
                    <Text variant="bodyLarge" style={styles.menuItemText}>
                      {item.title}
                    </Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                {index < menuItems.length - 1 && <Divider style={styles.menuDivider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button 
            mode="contained" 
            onPress={() => {/* Sign out */}}
            style={[styles.signOutButton, { backgroundColor: colors.error }]}
            textColor="white"
          >
            Sign Out
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            PropertyOS Mobile v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  profileCard: {
    margin: spacing.lg,
    elevation: 2,
    borderRadius: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  userRole: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userCompany: {
    fontSize: 14,
  },
  contactInfo: {
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  editButton: {
    marginTop: spacing.sm,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    elevation: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    textAlign: 'center',
  },
  menuCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuDivider: {
    marginLeft: 48, // Icon width + margin
  },
  signOutContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  signOutButton: {
    paddingVertical: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

export default ProfileScreen;
