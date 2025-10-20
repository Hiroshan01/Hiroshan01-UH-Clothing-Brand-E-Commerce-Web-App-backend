export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role !== "admin") {
    return false;
  }
  return true;
}
