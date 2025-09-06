import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { spacing, colors } from '../../utils/theme';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbarMessage('Please fill in all fields');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual login logic with your backend
      // For demo purposes, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Navigate to dashboard - you could determine user type from login response
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard', params: { userType: 'landlord' } }],
      });
    } catch (error) {
      setSnackbarMessage('Login failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userType: 'landlord' | 'tenant') => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard', params: { userType } }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="home-city" 
              size={60} 
              color={theme.colors.primary} 
            />
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to your PropertyOS account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              style={styles.input}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => {/* TODO: Implement forgot password */}}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>
          </View>

          {/* Demo Login Buttons */}
          <View style={styles.demoSection}>
            <Text variant="bodyMedium" style={[styles.demoTitle, { color: theme.colors.onSurfaceVariant }]}>
              Quick Demo Access:
            </Text>
            
            <Button
              mode="outlined"
              onPress={() => handleDemoLogin('landlord')}
              icon="office-building"
              style={[styles.demoButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
            >
              Demo as Landlord
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => handleDemoLogin('tenant')}
              icon="home-account"
              style={[styles.demoButton, { borderColor: colors.secondary }]}
              labelStyle={{ color: colors.secondary }}
            >
              Demo as Tenant
            </Button>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupSection}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Don't have an account?{' '}
            </Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Signup')}
              compact
            >
              Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  loginButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  demoSection: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  demoTitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  demoButton: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});

export default LoginScreen;
