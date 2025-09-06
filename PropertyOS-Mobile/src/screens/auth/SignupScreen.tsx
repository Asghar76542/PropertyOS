import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Snackbar, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { spacing, colors } from '../../utils/theme';

type SignupScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [userType, setUserType] = useState<'landlord' | 'tenant'>('tenant');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Tenant specific
    dateOfBirth: '',
    currentAddress: '',
    // Landlord specific
    companyName: '',
    businessAddress: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarVisible(true);
      return false;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarVisible(true);
      return false;
    }

    if (password.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters');
      setSnackbarVisible(true);
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual signup logic with your backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setSnackbarMessage('Account created successfully!');
      setSnackbarVisible(true);
      
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Signup failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const userTypeButtons = [
    { 
      value: 'tenant', 
      label: 'I\'m a Tenant', 
      icon: 'home-account',
      style: { backgroundColor: userType === 'tenant' ? colors.secondary : 'transparent' }
    },
    { 
      value: 'landlord', 
      label: 'I\'m a Landlord', 
      icon: 'office-building',
      style: { backgroundColor: userType === 'landlord' ? colors.primary : 'transparent' }
    },
  ];

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
              size={50} 
              color={theme.colors.primary} 
            />
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Join PropertyOS
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Create your account to get started
            </Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeSection}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              I am a:
            </Text>
            <SegmentedButtons
              value={userType}
              onValueChange={(value) => setUserType(value as 'landlord' | 'tenant')}
              buttons={userTypeButtons}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Common Fields */}
          <View style={styles.form}>
            <View style={styles.row}>
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              style={styles.input}
            />

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
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

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
            />

            {/* User Type Specific Fields */}
            {userType === 'tenant' ? (
              <>
                <TextInput
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                  mode="outlined"
                  placeholder="DD/MM/YYYY"
                  left={<TextInput.Icon icon="calendar" />}
                  style={styles.input}
                />
                <TextInput
                  label="Current Address"
                  value={formData.currentAddress}
                  onChangeText={(value) => handleInputChange('currentAddress', value)}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  left={<TextInput.Icon icon="map-marker" />}
                  style={styles.input}
                />
              </>
            ) : (
              <>
                <TextInput
                  label="Company Name (Optional)"
                  value={formData.companyName}
                  onChangeText={(value) => handleInputChange('companyName', value)}
                  mode="outlined"
                  left={<TextInput.Icon icon="office-building" />}
                  style={styles.input}
                />
                <TextInput
                  label="Business Address"
                  value={formData.businessAddress}
                  onChangeText={(value) => handleInputChange('businessAddress', value)}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  left={<TextInput.Icon icon="map-marker" />}
                  style={styles.input}
                />
              </>
            )}

            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              style={styles.signupButton}
            >
              Create Account
            </Button>
          </View>

          {/* Sign In Link */}
          <View style={styles.signinSection}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{' '}
            </Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Login')}
              compact
            >
              Sign In
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
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  userTypeSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  form: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  signupButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  signinSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});

export default SignupScreen;
