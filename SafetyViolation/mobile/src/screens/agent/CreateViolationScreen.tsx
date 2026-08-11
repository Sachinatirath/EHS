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
import { SignaturePad, serializeSignature, type SignatureValue } from '@/components/SignaturePad';
import { useToast } from '@/components/Toast';
import { violationsApi, uploadsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { ViolationOptions } from '@/types';
import type { AgentStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius, shadow } from '@/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<AgentStackParamList, 'CreateViolation'>;

interface TextFieldDef {
  key: 'violation_date' | 'company' | 'supervisor' | 'employee_name' | 'employee_code' | 'job_title';
  label: string;
  placeholder: string;
}

const TEXT_FIELDS: TextFieldDef[] = [
  { key: 'violation_date', label: 'Date (YYYY-MM-DD)', placeholder: 'e.g. 2026-08-11' },
  { key: 'company', label: 'Company / Contractor', placeholder: 'e.g. Acme Manufacturing Pvt Ltd' },
  { key: 'supervisor', label: 'Supervisor Name', placeholder: 'Supervisor name' },
  { key: 'employee_name', label: 'Employee Name', placeholder: 'Employee name' },
  { key: 'employee_code', label: 'Employee Code', placeholder: 'e.g. EMP-2201' },
  { key: 'job_title', label: 'Job Title', placeholder: 'e.g. Line Operator' },
];

const EMPTY_TEXT = {
  violation_date: '',
  company: '',
  supervisor: '',
  employee_name: '',
  employee_code: '',
  job_title: '',
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
      Alert.alert('Add Evidence Photo', undefined, [
        { text: 'Take Photo', onPress: openCamera },
        { text: 'Choose from Library', onPress: openLibrary },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      ]);
    }
  });
}

export function CreateViolationScreen() {
  const navigation = useNavigation<Nav>();
  const { showToast } = useToast();
  const [options, setOptions] = useState<ViolationOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [text, setText] = useState(EMPTY_TEXT);
  const [department, setDepartment] = useState('');
  const [violationType, setViolationType] = useState('');
  const [offence, setOffence] = useState('');
  const [actions, setActions] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState('');
  const [explanation, setExplanation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signature, setSignature] = useState<SignatureValue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    violationsApi
      .violationOptions()
      .then((opts) => {
        setOptions(opts);
        setDepartment(opts.departments[0]);
        setViolationType(opts.violation_types[0]);
        setOffence(opts.offence_levels[0]);
      })
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoadingOptions(false));
  }, []);

  const setTextField = (key: keyof typeof EMPTY_TEXT) => (t: string) =>
    setText((f) => ({ ...f, [key]: t }));

  const toggleAction = (item: string) => {
    setActions((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

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

  const ready = Boolean(department && violationType && offence && signature);

  const handleSubmit = async () => {
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await violationsApi.createViolation({
        violation_date: text.violation_date || undefined,
        company: text.company || undefined,
        department,
        supervisor: text.supervisor || undefined,
        employee_name: text.employee_name || undefined,
        employee_code: text.employee_code || undefined,
        job_title: text.job_title || undefined,
        violation_type: violationType,
        offence,
        corrective_actions: Array.from(actions),
        description: description || undefined,
        explanation: explanation || undefined,
        photo_url: photoUrl,
        signature_data: serializeSignature(signature),
      });
      showToast({ message: `Safety violation ${created.violation_no} submitted to HOD.`, icon: 'checkCircle' });
      navigation.replace('ViolationDetail', { violationId: created.id });
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not submit violation notice. Please try again.'));
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
            Safety Violation Notice
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            Fill in the details below and submit to HOD for review.
          </Text>
        </FadeSlideIn>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Violation Information
          </Text>
          <View style={{ gap: spacing.md }}>
            {TEXT_FIELDS.map((f) => (
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
            <OptionPicker label="Department" options={options.departments} value={department} onChange={setDepartment} />
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Violation Details
          </Text>
          <View style={{ gap: spacing.md }}>
            <OptionPicker label="Violation Type" options={options.violation_types} value={violationType} onChange={setViolationType} />
            <OptionPicker label="Offence" options={options.offence_levels} value={offence} onChange={setOffence} />
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Corrective Action
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {options.corrective_actions.map((item) => {
              const active = actions.has(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggleAction(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.full,
                    backgroundColor: active ? colors.primaryLight : colors.background,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  {active ? <Icon name="check" size={13} color={colors.primaryDark} /> : null}
                  <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: active ? colors.primaryDark : colors.textSecondary }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter violation description..."
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
            Employee Explanation
          </Text>
          <TextInput
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Enter employee explanation..."
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
            Evidence Photo
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
                  Tap to add evidence photo
                </Text>
              </>
            )}
          </Pressable>
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
            Digital Signature
          </Text>
          <SignaturePad value={signature} onChange={setSignature} />
        </Card>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}

        <PrimaryButton label="Submit to HOD" onPress={handleSubmit} disabled={!ready} loading={submitting} />
      </ScrollView>
    </Screen>
  );
}
