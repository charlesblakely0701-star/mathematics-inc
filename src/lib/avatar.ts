// Derives a deterministic avatar color from a user's name. Uses a simple
// character-code sum hash to pick from 8 HSL hues. Inline styles avoid
// Tailwind content-scan uncertainty for dynamically-constructed class strings.

const HUES = [200, 280, 340, 30, 160, 260, 16, 50] as const;

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h + name.charCodeAt(i)) % HUES.length;
  }
  return h;
}

export function getAvatarStyle(name: string): React.CSSProperties {
  const hue = HUES[nameHash(name)];
  return {
    backgroundColor: `hsl(${hue} 65% 88%)`,
    color: `hsl(${hue} 55% 28%)`,
  };
}
