export function hasRole(session, role) {
  if (!session || !session.user || !session.user.role) return false;
  return session.user.role.split(",").includes(role);
}
