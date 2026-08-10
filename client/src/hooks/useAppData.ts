import { useCallback, useEffect, useState } from "react";
import { folderMappingApi } from "../api/folderMappingApi";
import { userApi } from "../api/userApi";
import { workflowApi } from "../api/workflowApi";
import type {
  FolderMapping,
  ParsedFolderPathDto,
  TicketDto,
  UserDetailsDto,
} from "../types";

export function useAppData(currentUser: UserDetailsDto | null) {
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [folderPaths, setFolderPaths] = useState<ParsedFolderPathDto[]>([]);
  const [folderMappings, setFolderMappings] = useState<FolderMapping[]>([]);
  const [allHods, setAllHods] = useState<UserDetailsDto[]>([]);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const allTix = await workflowApi.getAllTickets();
      setTickets(allTix);

      const paths = await workflowApi.getParsedFolderPaths();
      setFolderPaths(paths);

      if (
        currentUser.roles.includes("Admin") ||
        currentUser.roles.includes("Hod")
      ) {
        const u = await userApi.getAllUsers();
        setUsers(u);
        const m = await folderMappingApi.getFolderMappings();
        setFolderMappings(m);
      }

      if (
        currentUser.roles.includes("Admin") ||
        currentUser.roles.includes("User") ||
        currentUser.roles.includes("Hod")
      ) {
        const hods = await userApi.getAllHods();
        setAllHods(hods);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { tickets, users, folderPaths, folderMappings, allHods, loadData };
}
