import { useContext } from "react";
import { AuthContext } from "./authContext.js";

export const useAuth = () => {
  return useContext(AuthContext);
};
