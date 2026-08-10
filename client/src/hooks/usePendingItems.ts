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
          const mapping = folderMappings.find(
            (m) => m.folderPath.toLowerCase() === i.folderPath.toLowerCase(),
          );
          const isOwner =
            mapping &&
            (mapping.primaryFolderOwner.toLowerCase() ===
              currentUser.userName.toLowerCase() ||
              mapping.secondaryFolderOwner?.toLowerCase() ===
                currentUser.userName.toLowerCase());
          if (isOwner) list.push({ ticket: t, item: i });
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
