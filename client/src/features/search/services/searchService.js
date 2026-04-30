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
    const response = await api.get("/owners", {
        params: {
            q: searchTerm
        }
    });
    return response.data.data;
}

export async function getOwner(ownerId) {
    const response = await api.get(`/owners/${ownerId}`);
    return response.data.data;
}

export async function getMcGillOwners(searchTerm) {
    const response = await api.get("/owners/all-mcgill", {
        params: {
            q: searchTerm
        }
    });
    return response.data.data;
}
