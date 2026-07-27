export const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  PARTICIPANT: 'participant',
  JUDGE: 'judge',
};

export const hasRole = (user, role) => user?.role === role;
export const hasAnyRole = (user, roles = []) => roles.includes(user?.role);
export const canAccessAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const canAccessOrganizer = (user) => hasAnyRole(user, [ROLES.ADMIN, ROLES.ORGANIZER]);
export const canAccessJudge = (user) => hasAnyRole(user, [ROLES.ADMIN, ROLES.JUDGE]);
export const canAccessParticipant = (user) => hasAnyRole(user, [ROLES.ADMIN, ROLES.PARTICIPANT, ROLES.ORGANIZER, ROLES.JUDGE]);
