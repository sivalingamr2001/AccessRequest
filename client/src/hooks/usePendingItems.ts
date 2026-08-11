import { useMemo } from "react";
import type {
  FolderMapping,
  PendingItemRecord,
  TicketDto,
  UserDetailsDto,
} from "../types";

export function usePendingItems(
  tickets: TicketDto[],
  users: UserDetailsDto[],
  folderMappings: FolderMapping[],
  currentUser: UserDetailsDto | null,
) {
  const pendingHodItems = useMemo<PendingItemRecord[]>(() => {
    const list: PendingItemRecord[] = [];
    if (!currentUser) return list;
    tickets.forEach((t) => {
      t.items?.forEach((i) => {
        if (i.status === "PENDING_DEPT_HOD") {
          const creatorUser = users.find(
            (u) => u.userName.toLowerCase() === t.createdBy.toLowerCase(),
          );
          const isDeptMatch =
            creatorUser && creatorUser.deptId === currentUser.deptId;
          const isReqToMatch =
            t.reqTo.toLowerCase() === currentUser.userName.toLowerCase();
          if (isDeptMatch || isReqToMatch) list.push({ ticket: t, item: i });
        } else if (i.status === "PENDING_FOLDER_OWNER") {
          const normItemPath = i.folderPath.replace(/\//g, "\\").trim().toLowerCase();
          const mapping = folderMappings.find((m) => {
            const normMapPath = m.folderPath.replace(/\//g, "\\").trim().toLowerCase();
            return (
              normItemPath === normMapPath ||
              normItemPath.startsWith(normMapPath + "\\")
            );
          });
          const isOwner =
            mapping &&
            ((mapping.primaryFolderOwner &&
              mapping.primaryFolderOwner.toLowerCase() ===
                currentUser.userName.toLowerCase()) ||
              (mapping.secondaryFolderOwner &&
                mapping.secondaryFolderOwner.toLowerCase() ===
                  currentUser.userName.toLowerCase()));

          const ownerUser = mapping?.primaryFolderOwner
            ? users.find(
                (u) =>
                  u.userName.toLowerCase() ===
                  mapping.primaryFolderOwner.toLowerCase(),
              )
            : null;
          const isOwnerHod =
            ownerUser &&
            currentUser.roles.some((r) => r.toLowerCase() === "hod") &&
            ownerUser.deptId === currentUser.deptId;

          if (isOwner || isOwnerHod) list.push({ ticket: t, item: i });
        }
      });
    });
    return list;
  }, [tickets, users, folderMappings, currentUser]);

  const pendingOperatorItems = useMemo<PendingItemRecord[]>(() => {
    const list: PendingItemRecord[] = [];
    tickets.forEach((t) => {
      t.items?.forEach((i) => {
        if (i.status === "PENDING_OPERATOR") list.push({ ticket: t, item: i });
      });
    });
    return list;
  }, [tickets]);

  const grantedOperatorItems = useMemo<PendingItemRecord[]>(() => {
    const list: PendingItemRecord[] = [];
    tickets.forEach((t) => {
      t.items?.forEach((i) => {
        if (i.status === "ACCESS_GRANTED") list.push({ ticket: t, item: i });
      });
    });
    return list;
  }, [tickets]);

  return { pendingHodItems, pendingOperatorItems, grantedOperatorItems };
}
