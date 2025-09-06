import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PropertiesScreen from '../screens/dashboard/PropertiesScreen';
import MaintenanceScreen from '../screens/dashboard/MaintenanceScreen';
import PaymentsScreen from '../screens/dashboard/PaymentsScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';

export type DashboardTabParamList = {
  DashboardHome: undefined;
  Properties: undefined;
  Maintenance: undefined;
  Payments: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DashboardTabParamList>();

const DashboardTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{
          tabBarLabel: 'Properties',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Maintenance"
        component={MaintenanceScreen}
        options={{
          tabBarLabel: 'Maintenance',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wrench" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DashboardTabs;
