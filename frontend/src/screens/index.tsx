
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { api } from '../services/api';
import { useStore } from '../store';

// ─── Shared components ────────────────────────────────────────────────────────

const Btn = ({ label, onPress, variant = 'primary', loading = false, disabled = false, style }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[
      sh.btn,
      variant === 'secondary' && sh.btnSecondary,
      variant === 'dark' && sh.btnDark,
      variant === 'danger' && sh.btnDanger,
      (disabled || loading) && { opacity: 0.4 },
      style,
    ]}
  >
    {loading
      ? <ActivityIndicator color={variant === 'secondary' ? colors.indigo : colors.white} />
      : <Text style={[sh.btnText, variant === 'secondary' && sh.btnTextSecondary]}>{label}</Text>}
  </TouchableOpacity>
);

const Card = ({ children, style }: any) => (
  <View style={[sh.card, style]}>{children}</View>
);

const Badge = ({ label, variant = 'neutral' }: any) => {
  const bg = variant === 'success' ? colors.successSoft
           : variant === 'warning' ? colors.warningSoft
           : variant === 'danger'  ? colors.dangerSoft
           : colors.indigoSoft;
  const fg = variant === 'success' ? colors.success
           : variant === 'warning' ? colors.warning
           : variant === 'danger'  ? colors.danger
           : colors.indigo;
  return (
    <View style={[sh.badge, { backgroundColor: bg }]}>
      <Text style={[sh.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
};

// Big tight-tracked numeral used everywhere a score needs to read as
// the single most important thing on the card — the signature motif.
const Stat = ({ value, suffix, color = colors.onDark, size = 'lg' }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
    <Text style={[size === 'lg' ? sh.statLg : sh.statSm, { color }]}>{value}</Text>
    {!!suffix && <Text style={[sh.statSuffix, { color }]}>{suffix}</Text>}
  </View>
);

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
export function LoginScreen() {
  const nav = useNavigation<any>();
  const { setAuth, setProcedure } = useStore();
  const [email, setEmail] = useState('demo@dermatrace.app');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuth(res.user, res.token);
      try {
        const proc = await api.getActiveProcedure();
        setProcedure(proc);
      } catch {
        // no active procedure yet — fine, user will go through setup
      }
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <View style={sh.heroDark}>
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
            <Text style={[sh.body, { textAlign: 'center', color: colors.indigo, fontWeight: '600' }]}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.eyebrow}>STEP 1 OF 3</Text>
        <Text style={sh.title}>Create account</Text>
        <Text style={[sh.body, { marginBottom: spacing.xl }]}>Your login details</Text>
        <Card>
          <Text style={sh.label}>Email</Text>
          <TextInput
            style={sh.input} value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
          />
          <Text style={sh.label}>Password (min. 8 characters)</Text>
          <TextInput style={sh.input} value={password} onChangeText={setPassword} secureTextEntry />
          <View style={sh.infoBox}>
            <Text style={sh.infoText}>GDPR-compliant. Your data is encrypted. You control deletion.</Text>
          </View>
          <Btn label="Continue" onPress={handleRegister} loading={loading} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── PROCEDURE SETUP SCREEN ───────────────────────────────────────────────────
const PROCEDURES = [
  { id: 'microneedling',    label: 'Microneedling' },
  { id: 'rf_microneedling', label: 'RF Microneedling' },
  { id: 'laser_resurfacing',label: 'Laser Resurfacing' },
  { id: 'chemical_peel',    label: 'Chemical Peel' },
  { id: 'injectables',      label: 'Injectables' },
  { id: 'regenerative',     label: 'Regenerative Tx' },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
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
              <Text style={[sh.procLabel, selected === p.id && { color: colors.white }]}>{p.label}</Text>
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

        <Btn label="Start my recovery" onPress={handleStart} loading={loading} disabled={!selected} />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <View>
            <Text style={sh.eyebrow}>DAY {day} OF 30</Text>
            <Text style={sh.title}>Hello, {firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('Alerts')} accessibilityLabel="View alerts" style={sh.bellBtn}>
            <Text style={{ fontSize: 18 }}>●</Text>
          </TouchableOpacity>
        </View>

        {/* Dark hero stat card — the signature element */}
        <View style={[sh.heroDark, { marginBottom: spacing.lg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={sh.heroLabel}>RECOVERY SCORE</Text>
              {loading
                ? <ActivityIndicator color={colors.onDark} style={{ marginTop: spacing.md }} />
                : <Stat value={Math.round(barrierScore)} suffix="/100" />}
            </View>
            <Badge label={statusLabel} variant={statusVariant} />
          </View>
          <View style={sh.heroDivider} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={sh.heroSubLabel}>PROCEDURE</Text>
              <Text style={sh.heroSubValue}>{procedure?.type?.replace(/_/g, ' ') ?? '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={sh.heroSubLabel}>EXPECTED TODAY</Text>
              <Text style={sh.heroSubValue}>{Math.min(100, 55 + day * 1.4).toFixed(0)}/100</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <Text style={[sh.label, { marginBottom: spacing.sm }]}>Today's actions</Text>

        {[
          { label: 'Daily check-in', sub: 'Log symptoms · ~60 sec', screen: 'Checkin' },
          { label: 'Scan a product', sub: 'Check ingredient safety', screen: 'Scanner' },
          { label: 'Healing timeline', sub: 'Expected vs actual progress', screen: 'Timeline' },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            onPress={() => nav.navigate(item.screen)}
            style={sh.actionRow}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={sh.cardTitle}>{item.label}</Text>
              <Text style={sh.caption}>{item.sub}</Text>
            </View>
            <Text style={{ fontSize: 18, color: colors.indigo, fontWeight: '700' }}>→</Text>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView contentContainerStyle={sh.screen}>
          <Text style={sh.eyebrow}>DAY {result.day_number} LOGGED</Text>
          <Text style={[sh.title, { marginBottom: spacing.xl }]}>Check-in complete</Text>

          <View style={[sh.heroDark, { alignItems: 'flex-start' }]}>
            <Text style={sh.heroLabel}>BARRIER SCORE</Text>
            <Stat value={barrier} suffix="/100" />
            <View style={{ marginTop: spacing.md }}>
              <Badge label={barrier >= 70 ? 'On track' : barrier >= 45 ? 'Monitor' : 'Seek advice'} variant={v} />
            </View>
          </View>

          <Btn label="View timeline" onPress={() => nav.navigate('Timeline')} style={{ marginTop: spacing.xl }} />
          <Btn label="Back to home" variant="secondary" onPress={() => nav.navigate('Dashboard')} style={{ marginTop: spacing.sm }} />
          <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>Not medical advice.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.eyebrow}>~60 SECONDS</Text>
        <Text style={[sh.title, { marginBottom: spacing.xl }]}>Daily check-in</Text>

        {[
          { key: 'redness',    label: 'Redness' },
          { key: 'swelling',   label: 'Swelling' },
          { key: 'flaking',    label: 'Flaking' },
          { key: 'discomfort', label: 'Discomfort' },
        ].map(({ key, label }) => (
          <Card key={key} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <Text style={sh.cardTitle}>{label}</Text>
              <Text style={sh.statSm}>{(values as any)[key]}<Text style={{ color: colors.inkFaint, fontWeight: '600', fontSize: 13 }}>/10</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => set(key, n)}
                  style={{
                    flex: 1, height: 28, borderRadius: 4,
                    backgroundColor: n <= (values as any)[key] ? colors.indigo : colors.gray100,
                    opacity: n <= (values as any)[key] ? (0.5 + (n / 20)) : 1,
                  }}
                  accessibilityLabel={`${label} ${n}`}
                />
              ))}
            </View>
          </Card>
        ))}

        <View style={sh.infoBox}>
          <Text style={sh.infoText}>Photo upload available in the full version.</Text>
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
    { id: 'inflammation',  label: 'Inflammation',  days: 'Days 1–5',   desc: 'Redness, heat, swelling — healing underway.' },
    { id: 'proliferation', label: 'Proliferation', days: 'Days 5–14',  desc: 'Peeling, new cell growth, barrier rebuilding.' },
    { id: 'remodelling',   label: 'Remodelling',   days: 'Days 14–30', desc: 'Collagen formation, skin texture refining.' },
  ];

  const currentDay = timeline?.current_day ?? 1;
  const currentPhase = currentDay <= 5 ? 'inflammation' : currentDay <= 14 ? 'proliferation' : 'remodelling';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.eyebrow}>DAY {currentDay} OF 30</Text>
        <Text style={[sh.title, { marginBottom: spacing.lg }]}>Healing timeline</Text>

        {/* Progress bar */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={sh.cardTitle}>Recovery progress</Text>
            <Text style={{ color: colors.indigo, fontWeight: '700' }}>{Math.round((currentDay / 30) * 100)}%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.gray100, borderRadius: 4 }}>
            <View style={{ width: `${(currentDay / 30) * 100}%`, height: '100%', backgroundColor: colors.indigo, borderRadius: 4 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={sh.caption}>Day 1</Text>
            <Text style={sh.caption}>Day 30</Text>
          </View>
        </Card>

        {/* Dark stat-card bar chart — echoes the dashboard hero motif */}
        {timeline?.days && (
          <View style={[sh.heroDark, { marginBottom: spacing.lg }]}>
            <Text style={sh.heroLabel}>BARRIER SCORE HISTORY</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 2, marginTop: spacing.lg }}>
              {timeline.days.map((d: any) => (
                <View key={d.day} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <View style={{
                    width: '100%',
                    height: `${Math.max(5, (d.actual_barrier ?? d.expected_barrier) * 0.85)}%`,
                    backgroundColor: d.actual_barrier ? colors.indigoLight : 'rgba(255,255,255,0.14)',
                    borderRadius: 2,
                  }} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.indigoLight }} />
                <Text style={sh.heroSubLabel}>ACTUAL</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)' }} />
                <Text style={sh.heroSubLabel}>EXPECTED</Text>
              </View>
            </View>
          </View>
        )}

        {loading && <ActivityIndicator color={colors.indigo} style={{ marginBottom: spacing.xl }} />}

        {/* Phases */}
        <Text style={[sh.label, { marginBottom: spacing.md }]}>Recovery phases</Text>
        {PHASES.map(p => {
          const isActive = p.id === currentPhase;
          const isPast = (p.id === 'inflammation' && currentDay > 5) || (p.id === 'proliferation' && currentDay > 14);
          return (
            <View key={p.id} style={[sh.phaseCard, isActive && sh.phaseCardActive]}>
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

  const statusVariant = result?.overall_status === 'safe' ? 'success'
                      : result?.overall_status === 'caution' ? 'warning' : 'danger';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.eyebrow}>INGREDIENT SAFETY</Text>
        <Text style={sh.title}>Scanner</Text>
        <Text style={[sh.body, { marginBottom: spacing.lg }]}>Check if a product is safe for your current recovery stage.</Text>

        {/* Search by name */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
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
            style={{ backgroundColor: colors.indigo, paddingHorizontal: spacing.lg, borderRadius: radius.md, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.white, fontWeight: '700' }}>Go</Text>
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

        {loading && <ActivityIndicator color={colors.indigo} style={{ marginVertical: spacing.xl }} />}

        {/* Result */}
        {result && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={[sh.heroDark, { flexDirection: 'row', alignItems: 'center', gap: spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={sh.heroLabel}>
                  {result.overall_status === 'safe' ? 'SAFE FOR YOUR STAGE'
                   : result.overall_status === 'caution' ? 'USE WITH CAUTION'
                   : 'AVOID AT THIS STAGE'}
                </Text>
                <Text style={[sh.heroSubValue, { marginTop: spacing.sm }]}>{result.product_name}</Text>
              </View>
              <Badge label={result.overall_status} variant={statusVariant} />
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
                      <Text style={[sh.caption, { marginTop: 4, color: colors.indigo, fontWeight: '600' }]}>
                        Safe to use from Day {f.safe_from_day}
                      </Text>
                    )}
                  </Card>
                ))}
              </>
            )}

            {result.flagged_ingredients.length === 0 && (
              <Card style={{ backgroundColor: colors.successSoft, marginTop: spacing.md }}>
                <Text style={{ color: colors.success, fontWeight: '600' }}>No concerning ingredients detected for your current stage.</Text>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <Text style={sh.eyebrow}>INFORMATIONAL GUIDANCE</Text>
        <Text style={sh.title}>Recovery alerts</Text>

        {loading && <ActivityIndicator color={colors.indigo} style={{ marginTop: spacing.xl }} />}

        {!loading && isLow && (
          <Card style={{ marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.xxl }}>
            <Badge label="All clear" variant="success" />
            <Text style={[sh.cardTitle, { marginTop: spacing.md }]}>No alerts right now</Text>
            <Text style={[sh.body, { textAlign: 'center', marginTop: spacing.xs }]}>
              Keep up with your daily check-ins.
            </Text>
          </Card>
        )}

        {!loading && risk && !isLow && (
          <View style={[sh.heroDark, { marginTop: spacing.xl }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
              <Text style={sh.heroLabel}>RISK LEVEL — {risk.level.toUpperCase()}</Text>
              <Badge label={`${Math.round(risk.risk_score)}/100`} variant={risk.level === 'moderate' ? 'warning' : 'danger'} />
            </View>
            <Text style={[sh.heroSubValue, { fontSize: 17, marginBottom: spacing.sm }]}>{risk.title}</Text>
            <Text style={[sh.onDarkBody, { marginBottom: spacing.lg }]}>{risk.description}</Text>
            <View style={sh.heroDivider} />
            <Text style={sh.heroSubLabel}>RECOMMENDATION</Text>
            <Text style={[sh.onDarkBody, { marginTop: spacing.xs }]}>{risk.recommendation}</Text>

            {(risk.level === 'high' || risk.level === 'critical') && (
              <Btn label="Contact clinic" onPress={() => Alert.alert('Clinic', 'In the full version this opens your clinic contact.')} style={{ marginTop: spacing.lg }} />
            )}
          </View>
        )}

        {!loading && risk && !isLow && (
          <Text style={[sh.disclaimer, { marginTop: spacing.lg }]}>
            Informational guidance only. Not a medical diagnosis. Consult a qualified healthcare professional.
          </Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={sh.screen}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={sh.avatar}>
            <Text style={sh.avatarText}>{user?.email?.[0]?.toUpperCase() ?? 'D'}</Text>
          </View>
          <Text style={[sh.cardTitle, { marginTop: spacing.md }]}>{user?.email}</Text>
        </View>

        {procedure && (
          <View style={[sh.heroDark, { marginBottom: spacing.xl }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={sh.heroLabel}>ACTIVE PROCEDURE</Text>
              <Badge label="Active" variant="success" />
            </View>
            <Text style={[sh.heroSubValue, { fontSize: 18, marginTop: spacing.xs, textTransform: 'capitalize' }]}>
              {procedure.type.replace(/_/g, ' ')}
            </Text>
            <View style={sh.heroDivider} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {[
                { val: day, label: 'Current day' },
                { val: checkins.length, label: 'Check-ins' },
                { val: 30 - day, label: 'Days left' },
              ].map(s => (
                <View key={s.label} style={{ alignItems: 'center' }}>
                  <Text style={sh.statSm}>{s.val}</Text>
                  <Text style={sh.heroSubLabel}>{s.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
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

  // Dark hero "signature" card — carries one big stat, reused across screens
  heroDark: {
    backgroundColor: colors.navy900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroLabel: { ...type.label, color: colors.onDarkMuted },
  heroSubLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: colors.onDarkMuted },
  heroSubValue: { fontSize: 14, fontWeight: '700', color: colors.onDark, marginTop: 2 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: spacing.lg },
  onDarkBody: { fontSize: 13, color: colors.onDarkMuted, lineHeight: 19 },

  statLg: { ...type.stat, marginTop: 6 },
  statSm: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: colors.ink },
  statSuffix: { fontSize: 14, fontWeight: '600', marginLeft: 4, marginBottom: 5, opacity: 0.6 },

  logo: { fontSize: 30, fontWeight: '800', color: colors.onDark, letterSpacing: -0.6 },
  logoSub: { fontSize: 13, color: colors.onDarkMuted, marginTop: 4 },

  eyebrow: { ...type.label, color: colors.indigo, marginBottom: 4 },
  title: { ...type.h1, color: colors.ink, marginBottom: 4 },
  body: { fontSize: 14, color: colors.inkMuted, lineHeight: 21 },
  label: { ...type.label, color: colors.inkFaint, textTransform: 'uppercase', marginBottom: 6 },
  caption: { fontSize: 11, color: colors.inkFaint },
  disclaimer: { fontSize: 11, color: colors.inkFaint, textAlign: 'center', lineHeight: 16 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },

  btn: { height: 52, backgroundColor: colors.indigo, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.indigo },
  btnDark: { backgroundColor: colors.navy900 },
  btnDanger: { backgroundColor: colors.danger },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  btnTextSecondary: { color: colors.indigo },

  input: {
    height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
    paddingHorizontal: spacing.lg, fontSize: 15, color: colors.ink,
    backgroundColor: colors.surface, marginBottom: spacing.md,
  },

  badge: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line,
  },

  actionRow: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.sm, gap: spacing.md,
  },

  procCard: {
    width: '47%', borderRadius: radius.md, padding: spacing.md, borderWidth: 1.5,
    borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', position: 'relative',
  },
  procCardActive: { borderColor: colors.indigo, backgroundColor: colors.navy900 },
  procLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center', color: colors.ink },
  checkDot: { position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.indigoLight },

  phaseCard: {
    borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface,
  },
  phaseCardActive: { borderColor: colors.indigo, backgroundColor: colors.indigoSoft },

  infoBox: { backgroundColor: colors.indigoSoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  infoText: { fontSize: 12, color: colors.indigoDeep, lineHeight: 18, fontWeight: '500' },

  demoBtn: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.line, marginBottom: spacing.sm,
  },

  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.navy900, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800', color: colors.onDark },
});
