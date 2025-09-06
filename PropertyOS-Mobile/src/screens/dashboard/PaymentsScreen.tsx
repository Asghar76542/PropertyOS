import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { spacing, colors } from '../../utils/theme';

const PaymentsScreen: React.FC = () => {
  const theme = useTheme();

  // Mock payments data
  const payments = [
    {
      id: 1,
      tenant: 'John Doe',
      property: 'Sunset Apartments #2A',
      amount: '$2,400.00',
      status: 'paid',
      dueDate: 'Jan 1, 2024',
      paidDate: 'Dec 30, 2023',
      method: 'Bank Transfer',
    },
    {
      id: 2,
      tenant: 'Sarah Johnson',
      property: 'Downtown Loft #5B',
      amount: '$1,800.00',
      status: 'overdue',
      dueDate: 'Jan 1, 2024',
      paidDate: null,
      method: null,
      daysOverdue: 5,
    },
    {
      id: 3,
      tenant: 'Mike Wilson',
      property: 'Garden View House',
      amount: '$3,200.00',
      status: 'pending',
      dueDate: 'Feb 1, 2024',
      paidDate: null,
      method: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      case 'overdue': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'check-circle';
      case 'pending': return 'clock-outline';
      case 'overdue': return 'alert-circle';
      default: return 'help-circle-outline';
    }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount.replace('$', '').replace(',', '')), 0);
  const totalPending = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + parseFloat(p.amount.replace('$', '').replace(',', '')), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Payments
        </Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Collected
            </Text>
            <Text variant="titleLarge" style={[styles.statValue, { color: colors.success }]}>
              ${totalPaid.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              Outstanding
            </Text>
            <Text variant="titleLarge" style={[styles.statValue, { color: colors.error }]}>
              ${totalPending.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {payments.map((payment) => (
          <Card key={payment.id} style={styles.paymentCard}>
            <Card.Content>
              <View style={styles.paymentHeader}>
                <View style={styles.tenantInfo}>
                  <Text variant="titleMedium" style={styles.tenantName}>
                    {payment.tenant}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.property, { color: theme.colors.onSurfaceVariant }]}>
                    {payment.property}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(payment.status) as any}
                    size={24}
                    color={getStatusColor(payment.status)}
                  />
                </View>
              </View>

              <View style={styles.paymentDetails}>
                <Text variant="headlineSmall" style={[styles.amount, { color: theme.colors.primary }]}>
                  {payment.amount}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(payment.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {payment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.dateInfo}>
                <View style={styles.dateItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Due Date
                  </Text>
                  <Text variant="bodyMedium" style={styles.dateValue}>
                    {payment.dueDate}
                  </Text>
                </View>
                {payment.paidDate && (
                  <View style={styles.dateItem}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Paid Date
                    </Text>
                    <Text variant="bodyMedium" style={styles.dateValue}>
                      {payment.paidDate}
                    </Text>
                  </View>
                )}
                {payment.method && (
                  <View style={styles.dateItem}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Method
                    </Text>
                    <Text variant="bodyMedium" style={styles.dateValue}>
                      {payment.method}
                    </Text>
                  </View>
                )}
              </View>

              {payment.status === 'overdue' && payment.daysOverdue && (
                <View style={styles.overdueWarning}>
                  <MaterialCommunityIcons
                    name="alert"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={[styles.overdueText, { color: colors.error }]}>
                    {payment.daysOverdue} days overdue
                  </Text>
                </View>
              )}

              {payment.status !== 'paid' && (
                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() => {/* Send reminder */}}
                    style={styles.actionButton}
                  >
                    Send Reminder
                  </Button>
                  {payment.status === 'overdue' && (
                    <Button
                      mode="contained"
                      onPress={() => {/* Mark as paid */}}
                      style={styles.actionButton}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
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
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  paymentCard: {
    marginTop: spacing.md,
    elevation: 2,
    borderRadius: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  property: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'center',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    fontWeight: 'bold',
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
  dateInfo: {
    marginBottom: spacing.md,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontWeight: '500',
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: `${colors.error}10`,
    borderRadius: 8,
  },
  overdueText: {
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

export default PaymentsScreen;
