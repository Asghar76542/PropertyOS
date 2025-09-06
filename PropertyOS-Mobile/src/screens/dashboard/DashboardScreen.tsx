import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, colors } from '../../utils/theme';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const theme = useTheme();

  // Mock data - replace with real data from your API
  const stats = [
    { 
      title: 'Total Properties', 
      value: '12', 
      icon: 'home-variant',
      color: colors.primary,
      change: '+2 this month'
    },
    { 
      title: 'Total Rent Collected', 
      value: '$45,600', 
      icon: 'currency-usd',
      color: colors.secondary,
      change: '+12% from last month'
    },
    { 
      title: 'Maintenance Requests', 
      value: '8', 
      icon: 'wrench',
      color: colors.warning,
      change: '3 pending'
    },
    { 
      title: 'Occupancy Rate', 
      value: '92%', 
      icon: 'chart-line',
      color: colors.success,
      change: '+5% from last month'
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Rent Payment Received',
      description: 'John Doe - Apartment 3B',
      time: '2 hours ago',
      icon: 'credit-card',
      color: colors.secondary,
    },
    {
      id: 2,
      title: 'Maintenance Request',
      description: 'Kitchen sink leak - Unit 2A',
      time: '5 hours ago',
      icon: 'wrench',
      color: colors.warning,
    },
    {
      id: 3,
      title: 'New Tenant Application',
      description: 'Sarah Wilson applied for Unit 1C',
      time: '1 day ago',
      icon: 'account-plus',
      color: colors.info,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, '#4F46E5']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={styles.welcomeText}>
                Welcome Back!
              </Text>
              <Text variant="bodyLarge" style={styles.subtitleText}>
                Here's your property overview
              </Text>
            </View>
            <View style={styles.profileIcon}>
              <MaterialCommunityIcons name="account-circle" size={50} color={colors.white} />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={[styles.statCard, { width: (width - spacing.lg * 3) / 2 }]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
                    <MaterialCommunityIcons 
                      name={stat.icon as any} 
                      size={24} 
                      color={stat.color} 
                    />
                  </View>
                </View>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {stat.value}
                </Text>
                <Text variant="bodySmall" style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>
                  {stat.title}
                </Text>
                <Text variant="bodySmall" style={[styles.statChange, { color: stat.color }]}>
                  {stat.change}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => {/* Navigate to add property */}}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              Add Property
            </Button>
            <Button
              mode="contained"
              icon="file-document"
              onPress={() => {/* Navigate to reports */}}
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            >
              View Reports
            </Button>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Activities
          </Text>
          {recentActivities.map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <Card.Content>
                <View style={styles.activityContent}>
                  <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                    <MaterialCommunityIcons 
                      name={activity.icon as any} 
                      size={20} 
                      color={activity.color} 
                    />
                  </View>
                  <View style={styles.activityText}>
                    <Text variant="bodyLarge" style={styles.activityTitle}>
                      {activity.title}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {activity.description}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {activity.time}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  profileIcon: {
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    marginBottom: spacing.md,
    elevation: 2,
    borderRadius: 16,
  },
  statContent: {
    paddingVertical: spacing.md,
  },
  statHeader: {
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statTitle: {
    marginBottom: spacing.xs,
  },
  statChange: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  activityCard: {
    marginBottom: spacing.sm,
    elevation: 1,
    borderRadius: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

export default DashboardScreen;
