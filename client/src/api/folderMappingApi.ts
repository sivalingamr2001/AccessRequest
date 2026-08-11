import axiosClient from "./axiosClient";
import type { FolderMapping } from "../types";

const jsonStr = (obj: any) => JSON.stringify(obj);
const parseJson = (key: string) =>
  JSON.parse(localStorage.getItem(key) || "[]");

export const folderMappingApi = {
  getFolderMappings: async (): Promise<FolderMapping[]> => {
    try {
      const res = await axiosClient.get<FolderMapping[]>("/workflow/folder-mappings");
      if (res.data && res.data.length > 0) {
        localStorage.setItem("mappings", jsonStr(res.data));
        return res.data;
      }
      return parseJson("mappings");
    } catch {
      return parseJson("mappings");
    }
  },

  addFolderMapping: async (mapping: FolderMapping): Promise<boolean> => {
    try {
      await axiosClient.post("/workflow/folder-mappings", mapping);
    } catch (err) {
      console.warn("Backend add folder mapping failed, writing locally:", err);
    }
    const mappings: FolderMapping[] = parseJson("mappings");
    const newId =
      mappings.length > 0 ? Math.max(...mappings.map((m) => m.id || 0)) + 1 : 1;
    mapping.id = mapping.id || newId;
    mappings.push(mapping);
    localStorage.setItem("mappings", jsonStr(mappings));
    return true;
  },

  updateFolderMapping: async (mapping: FolderMapping): Promise<boolean> => {
    try {
      if (mapping.id) {
        await axiosClient.put(`/workflow/folder-mappings/${mapping.id}`, mapping);
      }
    } catch (err) {
      console.warn("Backend update folder mapping failed, updating locally:", err);
    }
    const mappings: FolderMapping[] = parseJson("mappings");
    const idx = mappings.findIndex((m) => m.id === mapping.id);
    if (idx !== -1) {
      mappings[idx] = mapping;
      localStorage.setItem("mappings", jsonStr(mappings));
      return true;
    }
    return false;
  },

  deleteFolderMapping: async (id: number): Promise<boolean> => {
    try {
      await axiosClient.delete(`/workflow/folder-mappings/${id}`);
    } catch (err) {
      console.warn("Backend delete folder mapping failed, deleting locally:", err);
    }
    const mappings: FolderMapping[] = parseJson("mappings");
    const filtered = mappings.filter((m) => m.id !== id);
    localStorage.setItem("mappings", jsonStr(filtered));
    return true;
  },
};

