// Simple class name utility - combines class names
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ');
}
