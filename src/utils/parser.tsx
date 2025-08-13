import { JSX } from 'react';

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

  const flushText = () => {
    if (currentText) {
      result.push(
          <span style={{ color: currentColor }} key={result.length}>
          {currentText}
        </span>
      );
      currentText = '';
    }
  };

  while (i < input.length) {
    const char = input[i];

    // §x or &x hex color
    if ((char === '§' || char === '&') && input[i + 1] === 'x' && i + 13 < input.length) {
      flushText();
      const prefix = char;
      const hex = input.slice(i + 2, i + 14).split(prefix).join('');
      if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        currentColor = `#${hex}`;
      }
      i += 14;
      continue;
    }

    // Legacy codes
    if ((char === '§' || char === '&') && i + 1 < input.length) {
      const code = input[i + 1].toLowerCase();
      if (legacyColorMap[code]) {
        flushText();
        currentColor = legacyColorMap[code];
        i += 2;
        continue;
      }
    }

    // NEW: detect inline hex codes like #56dae9
    if (char === '#' && /^[0-9A-Fa-f]{6}/.test(input.slice(i + 1, i + 7))) {
      flushText();
      currentColor = `#${input.slice(i + 1, i + 7)}`;
      i += 7;
      continue;
    }

    currentText += char;
    i++;
  }

  flushText();
  return result;
};


export const parseID = (id: string) => {
  return String(id)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

export const parseUUIDToUsername = async (uuid: string): Promise<string> => {
  try {
    // Use the same endpoint pattern that works in fetchMeta
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playerdata/username/${uuid}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Adjust these based on your actual API response
    return data.username || data.displayName || data.name || 'Unknown';
  } catch (err) {
    console.error(`Username resolution failed for ${uuid}:`, err);
    return 'Unknown';
  }
};


export const parseUsernameToUUID = async (username: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mc-user/username/${username}`, {
      method: 'GET',
    });
    const data = await res.json();
    return data.id as string;
  } catch {
    return null;
  }
}

export const getStaffUserByUUID = async (uuid: string) => {
  if (uuid === undefined) {
    return 'Unknown'
  }
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${uuid}/username`, {
      method: 'GET',
      credentials: 'include'
    });
    return res.json();
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

export const parseArrayToString = (input: string): string => {
  return input.replace(/["[\]]/g, '');
};

export const parseStringToArray = (arrayString: string): string[] => {
  try {
    const parsed = JSON.parse(arrayString);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback if not JSON, clean manually
    return arrayString
      .replace(/[[\]"]/g, '') // remove brackets and quotes
      .split(',')
      .map(str => str.trim())
      .filter(Boolean);
  }
  return [];
};