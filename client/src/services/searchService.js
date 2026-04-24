import api from "./api.js";

export async function getAll(searchTerm) {
    const response = await api.get("/searchAll", {
        params: {
            q: searchTerm
        }
    });
    return response.data;
}


export async function getOwners(searchTerm) {
    const response = await api.get("/searchOwners", {
        params: {
            q: searchTerm
        }
    });
    return response.data;
}