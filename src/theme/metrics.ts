import { Colors } from './colors';

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: Colors.text },
  h2: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  h4: { fontSize: 16, fontWeight: '800' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: Colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: Colors.textMuted },
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};
