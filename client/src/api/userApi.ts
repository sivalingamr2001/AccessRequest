import axiosClient from "./axiosClient";
import type { UserDetailsDto } from "../types";

export const userApi = {
  login: async (
    username: string,
    password: string,
  ): Promise<UserDetailsDto> => {
    const res = await axiosClient.post<UserDetailsDto>("/login", {
      username,
      password,
    });
    return res.data;
  },

  getAllUsers: async (): Promise<UserDetailsDto[]> => {
    const res = await axiosClient.get<UserDetailsDto[]>("/user");
    return res.data;
  },

  getUserByIdentifier: async (identifier: string): Promise<UserDetailsDto> => {
    const res = await axiosClient.get<UserDetailsDto>(
      `/user/identifier/${identifier}`,
    );
    return res.data;
  },

  getAllHods: async (): Promise<UserDetailsDto[]> => {
    const res = await axiosClient.get<UserDetailsDto[]>("/user/hods");
    return res.data;
  },

  updateUserRolesAndLocation: async (
    userId: number,
    roles: string[],
    location: string,
  ): Promise<boolean> => {
    const res = await axiosClient.put(`/user/${userId}/roles-location`, {
      roles,
      location,
    });
    return res.status === 200;
  },
};
