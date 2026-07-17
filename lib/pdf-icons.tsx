import { Svg, Path, Circle } from "@react-pdf/renderer";

type PdfIconProps = { color: string; size?: number };

export function PdfPinIcon({ color, size = 10 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function PdfPhoneIcon({ color, size = 10 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PdfMailIcon({ color, size = 10 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PdfGlobeIcon({ color, size = 10 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M3.5 12h17M12 3c2.5 2.4 3.9 5.5 3.9 9s-1.4 6.6-3.9 9c-2.5-2.4-3.9-5.5-3.9-9S9.5 5.4 12 3z"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}
