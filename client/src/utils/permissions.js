export const getUserRole = (room, userId) => {

  if (!room || !userId) return null;


  if (room.owner?._id === userId) {
    return "owner";
  }

  
  const collaborator = room.users?.find(
    (u) => u.user?._id === userId
  );

  return collaborator?.role || null;

};

export const canEdit = (room, userId) => {

  const role = getUserRole(room, userId);

  console.log(role);

  return role === "owner" || role === "editor";

};

export const isViewer = (room, userId) => {

  return getUserRole(room, userId) === "viewer";

};