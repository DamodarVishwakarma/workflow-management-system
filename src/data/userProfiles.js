const AVATAR_COLORS = ['purple', 'blue', 'green'];

export function getNameInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getFallbackColor(value = '') {
  const index = [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function resolveAssignee(users, assignee) {
  const matchedUser = users.find(
    (user) => user.id === assignee || user.initials === assignee || user.name === assignee
  );

  if (matchedUser) {
    return {
      ...matchedUser,
      initials: matchedUser.initials || getNameInitials(matchedUser.name),
      avatarColor: matchedUser.avatarColor || getFallbackColor(matchedUser.name),
    };
  }

  const fallbackName = assignee || 'Unassigned';
  return {
    name: fallbackName,
    initials: getNameInitials(fallbackName),
    avatarColor: getFallbackColor(fallbackName),
  };
}
