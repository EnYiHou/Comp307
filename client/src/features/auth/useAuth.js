// EnYi Hou (261165635)

import { useContext } from "react";
import { AuthContext } from "./authContext.js";

export const useAuth = () => {
  return useContext(AuthContext);
};
