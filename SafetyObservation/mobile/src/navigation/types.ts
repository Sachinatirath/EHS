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
  CreateObservation: undefined;
  ObservationDetail: { observationId: number };
};

export type HodTabParamList = {
  Dashboard: undefined;
  Observations: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HodStackParamList = {
  Tabs: undefined;
  ObservationDetail: { observationId: number };
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
