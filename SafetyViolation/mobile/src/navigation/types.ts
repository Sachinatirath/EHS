import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AgentTabParamList = {
  Home: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type AgentStackParamList = {
  Tabs: undefined;
  CreateViolation: undefined;
  ViolationDetail: { violationId: number };
};

export type HodTabParamList = {
  Dashboard: undefined;
  Violations: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HodStackParamList = {
  Tabs: undefined;
  ViolationDetail: { violationId: number };
};

export type RootStackParamList = {
  Login: undefined;
  AgentApp: undefined;
  HodApp: undefined;
};

export type AgentTabNavProp<T extends keyof AgentTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<AgentTabParamList, T>,
  NativeStackNavigationProp<AgentStackParamList>
>;

export type HodTabNavProp<T extends keyof HodTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<HodTabParamList, T>,
  NativeStackNavigationProp<HodStackParamList>
>;
