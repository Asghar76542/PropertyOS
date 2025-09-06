import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { spacing, colors } from '../../utils/theme';

const PropertiesScreen: React.FC = () => {
  const theme = useTheme();

  // Mock properties data
  const properties = [
    {
      id: 1,
      name: 'Sunset Apartments',
      address: '123 Main St, Apt 2A',
      rent: '$2,400',
      tenant: 'John Doe',
      status: 'occupied',
      image: '🏠',
    },
    {
      id: 2,
      name: 'Downtown Loft',
      address: '456 Oak Ave, Unit 5B',
      rent: '$1,800',
      tenant: 'Sarah Johnson',
      status: 'occupied',
      image: '🏢',
    },
    {
      id: 3,
      name: 'Garden View House',
      address: '789 Pine Rd',
      rent: '$3,200',
      tenant: null,
      status: 'vacant',
      image: '🏡',
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'occupied' ? colors.success : colors.warning;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          My Properties
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {properties.length} total properties
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {properties.map((property) => (
          <Card key={property.id} style={styles.propertyCard}>
            <Card.Content>
              <View style={styles.propertyContent}>
                <View style={styles.propertyIcon}>
                  <Text style={styles.emoji}>{property.image}</Text>
                </View>
                <View style={styles.propertyInfo}>
                  <Text variant="titleMedium" style={styles.propertyName}>
                    {property.name}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.address, { color: theme.colors.onSurfaceVariant }]}>
                    {property.address}
                  </Text>
                  <View style={styles.propertyDetails}>
                    <Text variant="bodyLarge" style={styles.rent}>
                      {property.rent}/month
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(property.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(property.status) }]}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {property.tenant && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Tenant: {property.tenant}
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {/* Navigate to add property */}}
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
  propertyCard: {
    marginTop: spacing.md,
    elevation: 2,
    borderRadius: 16,
  },
  propertyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyIcon: {
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  address: {
    marginBottom: spacing.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rent: {
    fontWeight: 'bold',
    color: colors.primary,
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

export default PropertiesScreen;
