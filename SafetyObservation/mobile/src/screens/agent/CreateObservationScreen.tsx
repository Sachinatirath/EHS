import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card, FadeSlideIn, Icon, PrimaryButton, Screen, Skeleton } from '@/components';
import { useToast } from '@/components/Toast';
import { observationsApi, uploadsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { ObservationOptions } from '@/types';
import type { AgentStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<AgentStackParamList, 'CreateObservation'>;

interface TextFieldDef {
  key: 'observer_name' | 'observer_employee_code' | 'department' | 'observation_date' | 'plant' | 'area' | 'location' | 'observation_time';
  label: string;
  placeholder: string;
}

const REPORTER_FIELDS: TextFieldDef[] = [
  { key: 'observer_name', label: 'Observer Name', placeholder: 'Enter name' },
  { key: 'observer_employee_code', label: 'Employee ID', placeholder: 'e.g. EMP-2201' },
  { key: 'department', label: 'Department', placeholder: 'e.g. Manufacturing' },
  { key: 'observation_date', label: 'Date (YYYY-MM-DD)', placeholder: 'e.g. 2026-08-11' },
];

const DETAIL_FIELDS: TextFieldDef[] = [
  { key: 'plant', label: 'Plant / Site', placeholder: 'e.g. Main Plant' },
  { key: 'area', label: 'Area', placeholder: 'e.g. Zone B' },
  { key: 'location', label: 'Location', placeholder: 'e.g. Near Press 3' },
  { key: 'observation_time', label: 'Observation Time (HH:MM)', placeholder: 'e.g. 14:30' },
];

const EMPTY_TEXT = {
  observer_name: '',
  observer_employee_code: '',
  department: '',
  observation_date: '',
  plant: '',
  area: '',
  location: '',
  observation_time: '',
};

function OptionPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {options.map((opt) => {
            const active = value === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => onChange(opt)}
                style={{
                  paddingVertical: spacing.xs + 2,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.full,
                  backgroundColor: active ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text style={{ color: active ? colors.textOnPrimary : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '700' }}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  return new Promise((resolve) => {
    const openCamera = async () => {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return resolve(null);
      const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      resolve(res.canceled ? null : (res.assets?.[0] ?? null));
    };
    const openLibrary = async () => {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return resolve(null);
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
      resolve(res.canceled ? null : (res.assets?.[0] ?? null));
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) openCamera();
          else if (index === 2) openLibrary();
          else resolve(null);
        },
      );
    } else {
      Alert.alert('Attach Evidence', undefined, [
        { text: 'Take Photo', onPress: openCamera },
        { text: 'Choose from Library', onPress: openLibrary },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      ]);
    }
  });
}

export function CreateObservationScreen() {
  const navigation = useNavigation<Nav>();
  const { showToast } = useToast();
  const [options, setOptions] = useState<ObservationOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [text, setText] = useState(EMPTY_TEXT);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    observationsApi
      .observationOptions()
      .then((opts) => {
        setOptions(opts);
        setCategory(opts.categories[0]);
        setSeverity(opts.severity_levels[0]);
      })
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoadingOptions(false));
  }, []);

  const setTextField = (key: keyof typeof EMPTY_TEXT) => (t: string) =>
    setText((f) => ({ ...f, [key]: t }));

  const handleAddPhoto = async () => {
    const asset = await pickImage();
    if (!asset) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadsApi.uploadImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      setPhotoUrl(url);
    } catch (e) {
      Alert.alert('Upload failed', apiErrorMessage(e));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const ready = Boolean(category && severity);

  const handleSubmit = async () => {
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await observationsApi.createObservation({
        observer_name: text.observer_name || undefined,
        observer_employee_code: text.observer_employee_code || undefined,
        department: text.department || undefined,
        observation_date: text.observation_date || undefined,
        plant: text.plant || undefined,
        area: text.area || undefined,
        location: text.location || undefined,
        observation_time: text.observation_time || undefined,
        category,
        description: description || undefined,
        severity,
        corrective_action: correctiveAction || undefined,
        photo_url: photoUrl,
      });
      showToast({ message: `Safety observation ${created.observation_no} submitted.`, icon: 'checkCircle' });
      navigation.replace('ObservationDetail', { observationId: created.id });
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not submit observation. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOptions || !options) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
          <Skeleton height={120} borderRadius={radius.lg} />
          <Skeleton height={120} borderRadius={radius.lg} />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <FadeSlideIn>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
            Safety Observation Report
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            Fill in the details below and submit.
          </Text>
        </FadeSlideIn>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Reporter Information
          </Text>
          <View style={{ gap: spacing.md }}>
            {REPORTER_FIELDS.map((f) => (
              <View key={f.key} style={{ gap: 6 }}>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary }}>{f.label}</Text>
                <TextInput
                  value={text[f.key]}
                  onChangeText={setTextField(f.key)}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    paddingVertical: 10,
                    paddingHorizontal: spacing.md,
                    fontSize: fontSize.sm,
                    color: colors.textPrimary,
                  }}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Observation Details
          </Text>
          <View style={{ gap: spacing.md }}>
            {DETAIL_FIELDS.map((f) => (
              <View key={f.key} style={{ gap: 6 }}>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary }}>{f.label}</Text>
                <TextInput
                  value={text[f.key]}
                  onChangeText={setTextField(f.key)}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    paddingVertical: 10,
                    paddingHorizontal: spacing.md,
                    fontSize: fontSize.sm,
                    color: colors.textPrimary,
                  }}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Observation Information
          </Text>
          <View style={{ gap: spacing.md }}>
            <OptionPicker label="Observation Category" options={options.categories} value={category} onChange={setCategory} />
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary }}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the observation in detail..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingVertical: 10,
                  paddingHorizontal: spacing.md,
                  fontSize: fontSize.sm,
                  color: colors.textPrimary,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Risk Assessment
          </Text>
          <OptionPicker label="Severity" options={options.severity_levels} value={severity} onChange={setSeverity} />
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Immediate Corrective Action
          </Text>
          <TextInput
            value={correctiveAction}
            onChangeText={setCorrectiveAction}
            placeholder="Action taken immediately..."
            placeholderTextColor={colors.textMuted}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.sm,
              paddingVertical: 10,
              paddingHorizontal: spacing.md,
              fontSize: fontSize.sm,
              color: colors.textPrimary,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Attach Evidence
          </Text>
          <Pressable
            onPress={handleAddPhoto}
            disabled={uploadingPhoto}
            style={{
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingVertical: spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
            }}
          >
            {uploadingPhoto ? (
              <ActivityIndicator color={colors.primary} />
            ) : photoUrl ? (
              <Image source={{ uri: toAbsoluteUrl(photoUrl) }} style={{ width: 120, height: 90, borderRadius: radius.sm }} />
            ) : (
              <>
                <Icon name="camera" size={20} color={colors.textMuted} />
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' }}>
                  Tap to attach evidence photo
                </Text>
              </>
            )}
          </Pressable>
        </Card>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}

        <PrimaryButton label="Submit Observation" onPress={handleSubmit} disabled={!ready} loading={submitting} />
      </ScrollView>
    </Screen>
  );
}
