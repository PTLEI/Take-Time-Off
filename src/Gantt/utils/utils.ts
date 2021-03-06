const rgbPattern = /^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/;

export function getComponents(inColor: string): {
  red: number;
  green: number;
  blue: number;
  alpha: number;
} {
  let color = inColor;

  // RGB color
  const match = rgbPattern.exec(color);
  if (match) {
    return {
      red: parseInt(match[1], 10),
      green: parseInt(match[2], 10),
      blue: parseInt(match[3], 10),
      alpha: match[4] ? parseFloat(match[4]) : 1,
    };
  }

  // Hex color
  if (color[0] === '#') {
    color = color.slice(1);
  }

  if (color.length === 3) {
    const tempColor = color;
    color = '';

    color += tempColor[0] + tempColor[0];
    color += tempColor[1] + tempColor[1];
    color += tempColor[2] + tempColor[2];
  }

  return {
    red: parseInt(color.substring(0, 2), 16),
    green: parseInt(color.substring(2, 4), 16),
    blue: parseInt(color.substring(4, 6), 16),
    alpha: 1,
  };
}

export function changeOpacity(oldColor: string, opacity: number): string {
  const { red, green, blue, alpha } = getComponents(oldColor);

  return `rgba(${red},${green},${blue},${alpha * opacity})`;
}
