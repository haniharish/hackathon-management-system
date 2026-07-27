export const ROLES = {
  ADMINISTRATOR: 'administrator',
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  PARTICIPANT: 'participant',
  JUDGE: 'judge',
};

export const hasRole = (user, role) => user?.role === role;
export const hasAnyRole = (user, roles = []) => roles.includes(user?.role);
export const isAdministrator = (user) => hasAnyRole(user, [ROLES.ADMINISTRATOR, ROLES.ADMIN]);
export const canAccessAdmin = isAdministrator;
export const canAccessOrganizer = (user) => isAdministrator(user) || hasRole(user, ROLES.ORGANIZER);
export const canAccessJudge = (user) => isAdministrator(user) || hasRole(user, ROLES.JUDGE);
export const canAccessParticipant = (user) => isAdministrator(user) || hasAnyRole(user, [ROLES.PARTICIPANT, ROLES.ORGANIZER, ROLES.JUDGE]);