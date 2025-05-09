import React, { JSX } from 'react';

export const parseMinecraftColorCodes = (input: string): JSX.Element[] => {
  const result: JSX.Element[] = [];
  let i = 0;
  let currentColor = '#fff'; // default
  let currentText = '';

  const legacyColorMap: Record<string, string> = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
  };

  while (i < input.length) {
    if (input[i] === '§') {
      // Flush current text
      if (currentText) {
        result.push(
          <span style={{ color: currentColor }} key={result.length}>
            {currentText}
          </span>
        );
        currentText = '';
      }

      // Check for hex format §x§R§R§G§G§B§B
      if (input[i + 1] === 'x' && i + 13 < input.length) {
        const hex = input.slice(i + 2, i + 14).split('§').join('');
        currentColor = `#${hex}`;
        i += 14;
        continue;
      }

      // Legacy format
      const code = input[i + 1];
      if (legacyColorMap[code]) {
        currentColor = legacyColorMap[code];
      }

      i += 2;
    } else {
      currentText += input[i];
      i++;
    }
  }

  // Push final chunk
  if (currentText) {
    result.push(
      <span style={{ color: currentColor }} key={result.length}>
        {currentText}
      </span>
    );
  }

  return result;
};


export const parseUUIDToUsername = async (uuid: string) => {
  try {
    const res = await fetch(`http://localhost:3001/api/mc-user/uuid/${uuid}`, {
      method: 'GET',
    });
    const data = await res.json();
    return data.name;
  } catch {
    return null;
  }
};

export const parseUsernameToUUID = async (username: string) => {
  try {
    const res = await fetch(`http://localhost:3001/api/mc-user/username/${username}`, {
      method: 'GET',
    });
    const data = await res.json();
    return data.id as string;
  } catch {
    return null;
  }
}

export const parseTime = (isoString?: string) => {
  if (!isoString) return 'Invalid date';
  const date = new Date(isoString);
  return date.toLocaleString(); // Or toLocaleDateString / toLocaleTimeString
};

export const toUpperCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};