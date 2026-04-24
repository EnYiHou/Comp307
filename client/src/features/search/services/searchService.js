import api from "../../../shared/api/api.js";

export async function getAll(searchTerm) {
    const response = await api.get("/dashboard/searchAll", {
        params: {
            q: searchTerm
        }
    });
    return response.data;
}


export async function getOwners(searchTerm) {
    const response = await api.get("/dashboard/searchOwners", {
        params: {
            q: searchTerm
        }
    });
    return response.data;
}
