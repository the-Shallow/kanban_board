import { getAccessToken } from "./auth";

const API_BASE_URL = 'http://127.0.0.1:8000/api'

async function apiFetch(path: string,  options: RequestInit = {}) {
    const token = await getAccessToken()

    const headers = new Headers(options.headers || {})
    headers.set("Authorization", `Bearer ${token}`)
    headers.set("Content-Type", "application/json")

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    })

    if(!response.ok){
        const text = await response.text()
        throw new Error(text)
    }

    if(response.status == 204){
        return null
    }

    return response.json()
}

export const api = {
    get: (path:string) => apiFetch(path, {method:"GET"}),
    post: (path: string, body?:unknown) => apiFetch(path, {
        method:"POST",
        body: body ? JSON.stringify(body) : undefined
    }),
    patch: (path:string, body?: unknown) => apiFetch(path, {
        method:"PATCH",
        body: body ? JSON.stringify(body) : undefined,
    }),
    delete: (path:string) => apiFetch(path, {
        method:"DELETE"
    })
}