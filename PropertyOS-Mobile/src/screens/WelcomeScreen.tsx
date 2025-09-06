import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing } from '../utils/theme';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Welcome'>;
};

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons 
              name="home-city" 
              size={80} 
              color={colors.white} 
            />
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            PropertyOS
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Professional Property Management
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.white} />
            <Text variant="bodyMedium" style={styles.featureText}>
              Secure & Professional
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="chart-line" size={24} color={colors.white} />
            <Text variant="bodyMedium" style={styles.featureText}>
              Real-time Analytics
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="account-group" size={24} color={colors.white} />
            <Text variant="bodyMedium" style={styles.featureText}>
              Tenant & Landlord Portal
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Signup')}
            style={[styles.button, { backgroundColor: colors.white }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Get Started
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, styles.outlineButton]}
            labelStyle={{ color: colors.white }}
          >
            Sign In
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Transform your property management experience
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  features: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    color: colors.white,
    marginLeft: spacing.sm,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
    borderRadius: 12,
    paddingVertical: spacing.xs,
  },
  outlineButton: {
    borderColor: colors.white,
    borderWidth: 2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
