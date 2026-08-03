import type { FolderMapping } from '../types';

const jsonStr = (obj: any) => JSON.stringify(obj);
const parseJson = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');

export const folderMappingApi = {
  getFolderMappings: async (): Promise<FolderMapping[]> => {
    return parseJson('mappings');
  },

  addFolderMapping: async (mapping: FolderMapping): Promise<boolean> => {
    const mappings: FolderMapping[] = parseJson('mappings');
    const newId = mappings.length > 0 ? Math.max(...mappings.map(m => m.id || 0)) + 1 : 1;
    mapping.id = newId;
    mappings.push(mapping);
    localStorage.setItem('mappings', jsonStr(mappings));
    return true;
  },

  updateFolderMapping: async (mapping: FolderMapping): Promise<boolean> => {
    const mappings: FolderMapping[] = parseJson('mappings');
    const idx = mappings.findIndex(m => m.id === mapping.id);
    if (idx !== -1) {
      mappings[idx] = mapping;
      localStorage.setItem('mappings', jsonStr(mappings));
      return true;
    }
    return false;
  },

  deleteFolderMapping: async (id: number): Promise<boolean> => {
    const mappings: FolderMapping[] = parseJson('mappings');
    const filtered = mappings.filter(m => m.id !== id);
    localStorage.setItem('mappings', jsonStr(filtered));
    return true;
  }
};
