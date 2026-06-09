
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';
import { api } from '../services/api';
import { useStore } from '../store';

// ─── Shared components ────────────────────────────────────────────────────────

const Btn = ({ label, onPress, variant = 'primary', loading = false, disabled = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.82}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[
      sh.btn,
      variant === 'secondary' && sh.btnSecondary,
      variant === 'danger' && sh.btnDanger,
      (disabled || loading) && { opacity: 0.45 },
    ]}
  >
    {loading
      ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.sage600} />
      : <Text style={[sh.btnText, variant === 'secondary' && sh.btnTextSecondary]}>{label}</Text>}
  </TouchableOpacity>
);

const Card = ({ children, style }: any) => (
  <View style={[sh.card, style]}>{children}</View>
);

const Badge = ({ label, variant = 'neutral' }: any) => {
  const bg = variant === 'success' ? '#E8F5E8'
           : variant === 'warning' ? colors.amber50
           : variant === 'danger'  ? colors.rose50
           : colors.gray50;
  const fg = variant === 'success' ? colors.sage600
           : variant === 'warning' ? '#B87A10'
           : variant === 'danger'  ? '#B83028'
           : colors.gray600;
  return (
    <View style={[sh.badge, { backgroundColor: bg }]}>
      <Text style={[sh.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
};

const ScoreRing = ({ score }: { score: number }) => {
  const color = score >= 70 ? colors.sage600 : score >= 45 ? colors.amber400 : colors.rose400;
  return (
    <View style={[sh.ring, { borderColor: color }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: score }}
    >
      <Text style={[sh.ringVal, { color }]}>{score}</Text>
      <Text style={sh.ringMax}>/100</Text>
    </View>
  );
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
export function LoginScreen() {
  const nav = useNavigation<any>();
  const { setAuth } = useStore();
  const [email, setEmail] = useState('demo@dermatrace.app');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuth(res.user, res.token);
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <View style={{ marginBottom: spacing.xxl }}>
          <Text style={sh.logo}>DermTrace</Text>
          <Text style={sh.logoSub}>Post-procedure recovery companion</Text>
        </View>

        <Card>
          <Text style={sh.label}>Email</Text>
          <TextInput
            style={sh.input} value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            accessibilityLabel="Email address"
          />
          <Text style={sh.label}>Password</Text>
          <TextInput
            style={sh.input} value={password} onChangeText={setPassword}
            secureTextEntry accessibilityLabel="Password"
          />
          <Btn label="Log in" onPress={handleLogin} loading={loading} />
          <TouchableOpacity onPress={() => nav.navigate('Register')} style={{ marginTop: spacing.md }}>
            <Text style={[sh.body, { textAlign: 'center', color: colors.sage600 }]}>
              No account? Register
            </Text>
          </TouchableOpacity>
        </Card>

        <Text style={[sh.caption, { textAlign: 'center', marginTop: spacing.xl }]}>
          Demo: demo@dermatrace.app / demo1234
        </Text>
        <Text style={[sh.disclaimer, { marginTop: spacing.sm }]}>
          Not medical advice. Consult a healthcare professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── REGISTER SCREEN ──────────────────────────────────────────────────────────
export function RegisterScreen() {
  const nav = useNavigation<any>();
  const { setAuth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || password.length < 8) {
      Alert.alert('Validation', 'Email required and password must be 8+ characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register(email, password);
      setAuth(res.user, res.token);
      nav.reset({ index: 0, routes: [{ name: 'ProcedureSetup' }] });
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.title}>Create account</Text>
        <Text style={[sh.body, { marginBottom: spacing.xl }]}>
          Step 1 of 3 — Your login details
        </Text>
        <Card>
          <Text style={sh.label}>Email</Text>
          <TextInput
            style={sh.input} value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
          />
          <Text style={sh.label}>Password (min. 8 characters)</Text>
          <TextInput style={sh.input} value={password} onChangeText={setPassword} secureTextEntry />
          <View style={sh.infoBox}>
            <Text style={sh.infoText}>🔒 GDPR-compliant. Your data is encrypted. You control deletion.</Text>
          </View>
          <Btn label="Continue →" onPress={handleRegister} loading={loading} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── PROCEDURE SETUP SCREEN ───────────────────────────────────────────────────
const PROCEDURES = [
  { id: 'microneedling',    label: 'Microneedling',     icon: '⬡' },
  { id: 'rf_microneedling', label: 'RF Microneedling',  icon: '◈' },
  { id: 'laser_resurfacing',label: 'Laser Resurfacing', icon: '◉' },
  { id: 'chemical_peel',    label: 'Chemical Peel',     icon: '⊙' },
  { id: 'injectables',      label: 'Injectables',       icon: '⊞' },
  { id: 'regenerative',     label: 'Regenerative Tx',   icon: '◍' },
];

export function ProcedureSetupScreen() {
  const nav = useNavigation<any>();
  const { setProcedure } = useStore();
  const [selected, setSelected] = useState('');
  const [procDate, setProcDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinic, setClinic] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!selected) { Alert.alert('Select a procedure first'); return; }
    setLoading(true);
    try {
      const proc = await api.createProcedure(selected, procDate, clinic || undefined);
      setProcedure(proc);
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.title}>Your procedure</Text>
        <Text style={sh.body}>We'll build your personalised 30-day recovery plan.</Text>

        <Text style={[sh.label, { marginTop: spacing.xl }]}>What did you have done?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl }}>
          {PROCEDURES.map(p => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={[sh.procCard, selected === p.id && sh.procCardActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === p.id }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</Text>
              <Text style={sh.procLabel}>{p.label}</Text>
              {selected === p.id && <View style={sh.checkDot} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={sh.label}>Procedure date</Text>
        <TextInput
          style={[sh.input, { marginBottom: spacing.lg }]}
          value={procDate} onChangeText={setProcDate}
          placeholder="YYYY-MM-DD"
          accessibilityLabel="Procedure date"
        />

        <Text style={sh.label}>Clinic name (optional)</Text>
        <TextInput
          style={[sh.input, { marginBottom: spacing.xl }]}
          value={clinic} onChangeText={setClinic}
          placeholder="e.g. Skin & Glow München"
        />

        <Btn label="Start my recovery →" onPress={handleStart} loading={loading} disabled={!selected} />
        <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>
          Not medical advice. Consult a healthcare professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── DASHBOARD SCREEN ─────────────────────────────────────────────────────────
export function DashboardScreen() {
  const nav = useNavigation<any>();
  const { procedure, user } = useStore();
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const day = procedure
    ? Math.max(1, Math.min(
        Math.floor((Date.now() - new Date(procedure.procedure_date).getTime()) / 86400000) + 1,
        30))
    : 1;

  const barrierScore = risk ? Math.max(0, 100 - risk.risk_score) : 0;
  const statusVariant = barrierScore >= 70 ? 'success' : barrierScore >= 45 ? 'warning' : 'danger';
  const statusLabel   = barrierScore >= 70 ? 'On track' : barrierScore >= 45 ? 'Monitor closely' : 'Seek advice';

  const load = useCallback(async () => {
    if (!procedure) return;
    try {
      const r = await api.getRisk(procedure.id);
      setRisk(r);
    } catch { /* use defaults */ }
    setLoading(false);
  }, [procedure?.id]);

  useEffect(() => { load(); }, [load]);

  const firstName = user?.email?.split('@')[0] ?? 'there';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <View>
            <Text style={sh.title}>Hello, {firstName}</Text>
            <Text style={sh.body}>
              {procedure?.type?.replace(/_/g, ' ') ?? 'Procedure'} · Day {day} of 30
            </Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('Alerts')} accessibilityLabel="View alerts">
            <Text style={{ fontSize: 26 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Score card */}
        <Card style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: spacing.sm }}>
              <Text style={sh.cardTitle}>Recovery score</Text>
              <Badge label={statusLabel} variant={statusVariant} />
              <Text style={sh.caption}>Expected for Day {day}: {Math.min(100, 55 + day * 1.4).toFixed(0)}</Text>
            </View>
            {loading
              ? <ActivityIndicator color={colors.sage600} />
              : <ScoreRing score={barrierScore} />}
          </View>
        </Card>

        {/* Actions */}
        <Text style={[sh.label, { marginBottom: spacing.sm }]}>Today's actions</Text>

        {[
          { label: 'Daily check-in', sub: 'Log symptoms · ~60 sec', screen: 'Checkin', icon: '📋' },
          { label: 'Scan a product', sub: 'Check ingredient safety', screen: 'Scanner', icon: '🔍' },
          { label: 'Healing timeline', sub: 'Expected vs actual progress', screen: 'Timeline', icon: '📈' },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            onPress={() => nav.navigate(item.screen)}
            style={sh.actionRow}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 22, width: 36 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={sh.cardTitle}>{item.label}</Text>
              <Text style={sh.caption}>{item.sub}</Text>
            </View>
            <Text style={{ fontSize: 20, color: colors.gray400 }}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={[sh.disclaimer, { marginTop: spacing.xl }]}>
          Recovery guidance only. Not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── DAILY CHECK-IN SCREEN ────────────────────────────────────────────────────
export function CheckinScreen() {
  const nav = useNavigation<any>();
  const { procedure, addCheckin } = useStore();
  const [values, setValues] = useState({ redness: 5, swelling: 3, flaking: 2, discomfort: 2 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const set = (key: string, val: number) => setValues(v => ({ ...v, [key]: val }));

  async function submit() {
    if (!procedure) return;
    setLoading(true);
    try {
      const checkin = await api.submitCheckin({
        procedure_id: procedure.id,
        ...values,
      });
      addCheckin(checkin);
      setResult(checkin);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const barrier = result.barrier_score;
    const v = barrier >= 70 ? 'success' : barrier >= 45 ? 'warning' : 'danger';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
        <ScrollView contentContainerStyle={[sh.screen, { alignItems: 'center' }]}>
          <Text style={{ fontSize: 56, marginBottom: spacing.lg }}>
            {barrier >= 70 ? '✅' : barrier >= 45 ? '⚠️' : '🚨'}
          </Text>
          <Text style={sh.title}>Check-in complete</Text>
          <Text style={[sh.body, { marginBottom: spacing.xl }]}>Day {result.day_number} logged</Text>
          <Card style={{ width: '100%', marginBottom: spacing.lg }}>
            <Text style={sh.label}>Barrier score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text style={{ fontSize: 40, fontWeight: '600' }}>{barrier}</Text>
              <Text style={sh.body}>/100</Text>
              <View style={{ flex: 1 }} />
              <Badge label={barrier >= 70 ? 'On track' : barrier >= 45 ? 'Monitor' : 'Seek advice'} variant={v} />
            </View>
          </Card>
          <Btn label="View timeline" onPress={() => nav.navigate('Timeline')} />
          <Btn label="Back to home" variant="secondary" onPress={() => nav.navigate('Dashboard')} style={{ marginTop: spacing.sm }} />
          <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>Not medical advice.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.title}>Daily check-in</Text>
        <Text style={[sh.body, { marginBottom: spacing.xl }]}>How is your skin today? (~60 seconds)</Text>

        {[
          { key: 'redness',    label: 'Redness',    emoji: '🔴' },
          { key: 'swelling',   label: 'Swelling',   emoji: '💧' },
          { key: 'flaking',    label: 'Flaking',    emoji: '❄️' },
          { key: 'discomfort', label: 'Discomfort', emoji: '😣' },
        ].map(({ key, label, emoji }) => (
          <Card key={key} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <Text style={sh.cardTitle}>{emoji} {label}</Text>
              <Text style={{ fontSize: 20, fontWeight: '600' }}>{(values as any)[key]}/10</Text>
            </View>
            {/* Simple tap-to-set slider for demo */}
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => set(key, n)}
                  style={{
                    flex: 1, height: 28, borderRadius: 4,
                    backgroundColor: n <= (values as any)[key]
                      ? (n <= 3 ? colors.sage400 : n <= 6 ? colors.amber400 : colors.rose400)
                      : colors.gray100,
                  }}
                  accessibilityLabel={`${label} ${n}`}
                />
              ))}
            </View>
          </Card>
        ))}

        <View style={sh.infoBox}>
          <Text style={sh.infoText}>📸 Photo upload available in the full version.</Text>
        </View>

        <Btn label="Submit check-in" onPress={submit} loading={loading} />
        <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>Not medical advice.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── TIMELINE SCREEN ──────────────────────────────────────────────────────────
export function TimelineScreen() {
  const { procedure } = useStore();
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!procedure) return;
    api.getTimeline(procedure.id)
      .then(setTimeline)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [procedure?.id]);

  const PHASES = [
    { id: 'inflammation',  label: 'Inflammation',  days: 'Days 1–5',   color: colors.rose50,   desc: 'Redness, heat, swelling — healing underway.' },
    { id: 'proliferation', label: 'Proliferation', days: 'Days 5–14',  color: colors.amber50,  desc: 'Peeling, new cell growth, barrier rebuilding.' },
    { id: 'remodelling',   label: 'Remodelling',   days: 'Days 14–30', color: colors.sage50,   desc: 'Collagen formation, skin texture refining.' },
  ];

  const currentDay = timeline?.current_day ?? 1;
  const currentPhase = currentDay <= 5 ? 'inflammation' : currentDay <= 14 ? 'proliferation' : 'remodelling';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.title}>Healing timeline</Text>
        <Text style={sh.body}>Day {currentDay} of 30</Text>

        {/* Progress bar */}
        <Card style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={sh.cardTitle}>Recovery progress</Text>
            <Text style={{ color: colors.sage600, fontWeight: '500' }}>{Math.round((currentDay / 30) * 100)}%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.gray100, borderRadius: 4 }}>
            <View style={{ width: `${(currentDay / 30) * 100}%`, height: '100%', backgroundColor: colors.sage400, borderRadius: 4 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={sh.caption}>Day 1</Text>
            <Text style={sh.caption}>Day 30</Text>
          </View>
        </Card>

        {/* Mini chart */}
        {timeline?.days && (
          <Card style={{ marginBottom: spacing.xl }}>
            <Text style={[sh.label, { marginBottom: spacing.md }]}>Barrier score history</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 }}>
              {timeline.days.map((d: any) => (
                <View key={d.day} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <View style={{
                    width: '100%',
                    height: `${Math.max(5, (d.actual_barrier ?? d.expected_barrier) * 0.8)}%`,
                    backgroundColor: d.actual_barrier ? colors.sage400 : colors.gray200,
                    borderRadius: 2,
                  }} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sage400 }} />
                <Text style={sh.caption}>Actual</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray200 }} />
                <Text style={sh.caption}>Expected</Text>
              </View>
            </View>
          </Card>
        )}

        {loading && <ActivityIndicator color={colors.sage600} style={{ marginBottom: spacing.xl }} />}

        {/* Phases */}
        <Text style={[sh.label, { marginBottom: spacing.md }]}>Recovery phases</Text>
        {PHASES.map(p => {
          const isActive = p.id === currentPhase;
          const isPast = (p.id === 'inflammation' && currentDay > 5) || (p.id === 'proliferation' && currentDay > 14);
          return (
            <View key={p.id} style={[sh.phaseCard, { backgroundColor: p.color }, isActive && sh.phaseCardActive]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={sh.cardTitle}>{p.label}</Text>
                <Badge label={isPast ? 'Complete' : isActive ? 'Active' : 'Upcoming'} variant={isPast ? 'success' : isActive ? 'warning' : 'neutral'} />
              </View>
              <Text style={[sh.caption, { marginTop: 2 }]}>{p.days}</Text>
              <Text style={[sh.body, { marginTop: spacing.xs }]}>{p.desc}</Text>
            </View>
          );
        })}

        <Text style={[sh.disclaimer, { marginTop: spacing.xl }]}>Not medical advice.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SCANNER SCREEN ───────────────────────────────────────────────────────────
const DEMO_BARCODES = [
  { label: 'La Roche-Posay Cicaplast (safe)', barcode: '3337875597951' },
  { label: 'SkinCeuticals C E Ferulic (avoid)', barcode: '3600522454595' },
  { label: 'CeraVe Moisturising (safe)', barcode: '0070501027700' },
];

export function ScannerScreen() {
  const { procedure } = useStore();
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function scan(barcode?: string, name?: string) {
    if (!procedure) { Alert.alert('No active procedure'); return; }
    setLoading(true);
    try {
      const res = await api.scan(procedure.id, barcode, name || undefined);
      setResult(res);
    } catch (e: any) {
      Alert.alert('Scan error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const statusColor = result?.overall_status === 'safe' ? colors.sage600
                    : result?.overall_status === 'caution' ? colors.amber400
                    : colors.rose400;
  const statusEmoji = result?.overall_status === 'safe' ? '✅' : result?.overall_status === 'caution' ? '⚠️' : '🚫';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.title}>Ingredient scanner</Text>
        <Text style={sh.body}>Check if a product is safe for your current recovery stage.</Text>

        {/* Search by name */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <TextInput
            style={[sh.input, { flex: 1, marginBottom: 0 }]}
            value={productName}
            onChangeText={setProductName}
            placeholder="Search by product name..."
            returnKeyType="search"
            onSubmitEditing={() => productName && scan(undefined, productName)}
          />
          <TouchableOpacity
            onPress={() => productName && scan(undefined, productName)}
            style={{ backgroundColor: colors.sage600, paddingHorizontal: spacing.lg, borderRadius: radius.md, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.white, fontWeight: '600' }}>Go</Text>
          </TouchableOpacity>
        </View>

        {/* Demo barcode buttons */}
        <Text style={[sh.label, { marginBottom: spacing.sm }]}>Demo products</Text>
        {DEMO_BARCODES.map(d => (
          <TouchableOpacity key={d.barcode} onPress={() => scan(d.barcode)} style={sh.demoBtn}>
            <Text style={sh.body}>{d.label}</Text>
            <Text style={sh.caption}>{d.barcode}</Text>
          </TouchableOpacity>
        ))}

        {loading && <ActivityIndicator color={colors.sage600} style={{ marginVertical: spacing.xl }} />}

        {/* Result */}
        {result && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={[sh.resultBanner, { borderColor: statusColor, backgroundColor: `${statusColor}18` }]}>
              <Text style={{ fontSize: 32 }}>{statusEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[sh.cardTitle, { color: statusColor }]}>
                  {result.overall_status === 'safe' ? 'Safe for your stage'
                   : result.overall_status === 'caution' ? 'Use with caution'
                   : 'Avoid at this stage'}
                </Text>
                <Text style={sh.body}>{result.product_name}</Text>
              </View>
            </View>

            {result.flagged_ingredients.length > 0 && (
              <>
                <Text style={[sh.label, { marginVertical: spacing.md }]}>Flagged ingredients</Text>
                {result.flagged_ingredients.map((f: any, i: number) => (
                  <Card key={i} style={{ marginBottom: spacing.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={sh.cardTitle}>{f.name}</Text>
                      <Badge
                        label={f.status === 'caution' ? 'Caution' : 'Avoid'}
                        variant={f.status === 'caution' ? 'warning' : 'danger'}
                      />
                    </View>
                    <Text style={[sh.body, { marginTop: spacing.xs }]}>{f.reason}</Text>
                    {f.safe_from_day && (
                      <Text style={[sh.caption, { marginTop: 4, color: colors.sage600 }]}>
                        Safe to use from Day {f.safe_from_day}
                      </Text>
                    )}
                  </Card>
                ))}
              </>
            )}

            {result.flagged_ingredients.length === 0 && (
              <Card style={{ backgroundColor: colors.sage50, marginTop: spacing.md }}>
                <Text style={{ color: colors.sage600 }}>No concerning ingredients detected for your current stage.</Text>
              </Card>
            )}

            <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>{result.disclaimer}</Text>
            <Btn label="Scan another" variant="secondary" onPress={() => setResult(null)} style={{ marginTop: spacing.md }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ALERTS SCREEN ────────────────────────────────────────────────────────────
export function AlertsScreen() {
  const { procedure } = useStore();
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!procedure) return;
    api.getRisk(procedure.id)
      .then(setRisk)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [procedure?.id]);

  const isLow = !risk || risk.level === 'low';
  const color = risk?.level === 'critical' ? colors.rose400 : risk?.level === 'high' ? colors.rose400 : colors.amber400;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.title}>Recovery alerts</Text>
        <Text style={sh.body}>Informational guidance — not medical diagnosis</Text>

        {loading && <ActivityIndicator color={colors.sage600} style={{ marginTop: spacing.xl }} />}

        {!loading && isLow && (
          <Card style={{ marginTop: spacing.xl, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>✅</Text>
            <Text style={sh.cardTitle}>All clear</Text>
            <Text style={[sh.body, { textAlign: 'center' }]}>
              No alerts right now. Keep up with your daily check-ins.
            </Text>
          </Card>
        )}

        {!loading && risk && !isLow && (
          <Card style={{ marginTop: spacing.xl, borderWidth: 1.5, borderColor: color }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 32 }}>{risk.level === 'critical' ? '🚨' : '⚠️'}</Text>
              <Badge label={`Risk ${Math.round(risk.risk_score)}/100`} variant={risk.level === 'moderate' ? 'warning' : 'danger'} />
            </View>
            <Text style={[sh.cardTitle, { marginBottom: spacing.sm }]}>{risk.title}</Text>
            <Text style={[sh.body, { marginBottom: spacing.md }]}>{risk.description}</Text>
            <Text style={[sh.cardTitle, { marginBottom: spacing.sm }]}>Recommendation</Text>
            <Text style={sh.body}>{risk.recommendation}</Text>

            {(risk.level === 'high' || risk.level === 'critical') && (
              <Btn label="Contact clinic" onPress={() => Alert.alert('Clinic', 'In the full version this opens your clinic contact.')} style={{ marginTop: spacing.lg }} />
            )}

            <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>
              Informational guidance only. Not a medical diagnosis. Consult a qualified healthcare professional.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
export function ProfileScreen() {
  const nav = useNavigation<any>();
  const { user, procedure, checkins, logout } = useStore();
  const day = procedure
    ? Math.max(1, Math.min(Math.floor((Date.now() - new Date(procedure.procedure_date).getTime()) / 86400000) + 1, 30))
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={sh.avatar}>
            <Text style={sh.avatarText}>{user?.email?.[0]?.toUpperCase() ?? 'D'}</Text>
          </View>
          <Text style={[sh.cardTitle, { marginTop: spacing.md }]}>{user?.email}</Text>
        </View>

        {procedure && (
          <Card style={{ marginBottom: spacing.xl }}>
            <Text style={sh.label}>Active procedure</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
              <Text style={sh.body}>{procedure.type.replace(/_/g, ' ')}</Text>
              <Badge label="Active" variant="success" />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg }}>
              {[
                { val: day, label: 'Current day' },
                { val: checkins.length, label: 'Check-ins' },
                { val: 30 - day, label: 'Days left' },
              ].map(s => (
                <View key={s.label} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '600' }}>{s.val}</Text>
                  <Text style={sh.caption}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Btn label="Sign out" variant="secondary" onPress={() => {
          Alert.alert('Sign out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => {
              logout();
              nav.reset({ index: 0, routes: [{ name: 'Login' }] });
            }},
          ]);
        }} />

        <Text style={[sh.disclaimer, { marginTop: spacing.xl }]}>
          DermTrace is not a medical device. All outputs are informational only.
          Under GDPR you may request data deletion by contacting support.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const sh = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxl },
  logo: { fontSize: 36, fontWeight: '700', color: colors.sage600, textAlign: 'center' },
  logoSub: { fontSize: 14, color: colors.gray600, textAlign: 'center', marginTop: 4 },
  title: { fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 4 },
  body: { fontSize: 14, color: colors.gray600, lineHeight: 21 },
  label: { fontSize: 11, fontWeight: '600', color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  caption: { fontSize: 11, color: colors.gray400 },
  disclaimer: { fontSize: 11, color: colors.gray400, textAlign: 'center', lineHeight: 16 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 0.5, borderColor: colors.gray100, marginBottom: spacing.sm, shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: colors.ink },
  btn: { height: 52, backgroundColor: colors.sage600, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.sage600 },
  btnDanger: { backgroundColor: colors.rose400 },
  btnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  btnTextSecondary: { color: colors.sage600 },
  input: { height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, paddingHorizontal: spacing.lg, fontSize: 15, color: colors.ink, backgroundColor: colors.white, marginBottom: spacing.md },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  ring: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  ringVal: { fontSize: 22, fontWeight: '600' },
  ringMax: { fontSize: 10, color: colors.gray400 },
  actionRow: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 0.5, borderColor: colors.gray100, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md },
  procCard: { width: '47%', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: colors.gray50, alignItems: 'center', position: 'relative' },
  procCardActive: { borderColor: colors.sage600, backgroundColor: colors.sage50 },
  procLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center', color: colors.ink },
  checkDot: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.sage600 },
  phaseCard: { borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1.5, borderColor: 'transparent' },
  phaseCardActive: { borderColor: colors.sage600 },
  infoBox: { backgroundColor: colors.blue50, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  infoText: { fontSize: 12, color: colors.blue600, lineHeight: 18 },
  resultBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  demoBtn: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 0.5, borderColor: colors.gray200, marginBottom: spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.sage100, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '600', color: colors.sage600 },
});
