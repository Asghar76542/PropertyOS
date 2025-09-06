import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { spacing, colors } from '../../utils/theme';

const MaintenanceScreen: React.FC = () => {
  const theme = useTheme();

  // Mock maintenance requests data
  const requests = [
    {
      id: 1,
      title: 'Leaky Faucet in Bathroom',
      property: 'Sunset Apartments #2A',
      tenant: 'John Doe',
      priority: 'medium',
      status: 'pending',
      date: '2 days ago',
      description: 'Kitchen sink faucet is dripping continuously',
    },
    {
      id: 2,
      title: 'Heating System Not Working',
      property: 'Downtown Loft #5B',
      tenant: 'Sarah Johnson',
      priority: 'high',
      status: 'in_progress',
      date: '1 day ago',
      description: 'Heat not coming through vents, temperature very cold',
    },
    {
      id: 3,
      title: 'Window Lock Broken',
      property: 'Garden View House',
      tenant: 'Mike Wilson',
      priority: 'low',
      status: 'completed',
      date: '1 week ago',
      description: 'Master bedroom window lock mechanism is broken',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.gray[500];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in_progress': return 'progress-clock';
      case 'pending': return 'clock-outline';
      default: return 'help-circle-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Maintenance
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {requests.filter(r => r.status !== 'completed').length} active requests
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {requests.map((request) => (
          <Card key={request.id} style={styles.requestCard}>
            <Card.Content>
              <View style={styles.requestHeader}>
                <View style={styles.titleSection}>
                  <Text variant="titleMedium" style={styles.requestTitle}>
                    {request.title}
                  </Text>
                  <View style={styles.chips}>
                    <Chip 
                      mode="flat" 
                      style={[styles.priorityChip, { backgroundColor: `${getPriorityColor(request.priority)}20` }]}
                      textStyle={[styles.chipText, { color: getPriorityColor(request.priority) }]}
                    >
                      {request.priority.toUpperCase()}
                    </Chip>
                  </View>
                </View>
                <View style={styles.statusSection}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(request.status) as any}
                    size={24}
                    color={getStatusColor(request.status)}
                  />
                </View>
              </View>

              <Text variant="bodyMedium" style={[styles.property, { color: theme.colors.onSurfaceVariant }]}>
                📍 {request.property}
              </Text>
              
              <Text variant="bodyMedium" style={[styles.tenant, { color: theme.colors.onSurfaceVariant }]}>
                👤 {request.tenant}
              </Text>

              <Text variant="bodyMedium" style={styles.description}>
                {request.description}
              </Text>

              <View style={styles.footer}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {request.date}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {/* Navigate to create maintenance request */}}
      />
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
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  requestCard: {
    marginTop: spacing.md,
    elevation: 2,
    borderRadius: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleSection: {
    flex: 1,
  },
  requestTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
  },
  priorityChip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusSection: {
    alignItems: 'center',
  },
  property: {
    marginBottom: spacing.xs,
  },
  tenant: {
    marginBottom: spacing.sm,
  },
  description: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
  },
});

export default MaintenanceScreen;
