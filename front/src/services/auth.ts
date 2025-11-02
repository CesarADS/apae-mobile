export const TOKEN_KEY: string = "@ged-apae-token";
import { jwtDecode } from "jwt-decode";


export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export interface DecodedToken {
    sub: string;
    nome?: string; 
    permissions: string[];
    exp: number;
}

export const getDecodedToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) {
        return null;
    }
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        return null;
    }
};

export const estaAutenticado = (): boolean => {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const decodedToken: { exp: number } = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
            logout(); 
            return false;
        }
    } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        logout(); 
        return false;
    }

    return true;
};

export const login = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};


export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

export const hasPermission = (permission: string): boolean => {
    const decodedToken = getDecodedToken();
    if (!decodedToken || !decodedToken.permissions) {
        return false;
    }
    const permissionsSet: Set<string> = new Set(decodedToken.permissions);
    return permissionsSet.has(permission);
};

export const hasAnyPermission = (permissions: string[]): boolean => {
    const decodedToken = getDecodedToken();
    if (!decodedToken || !decodedToken.permissions) {
        return false;
    }
    const userPermissionsSet: Set<string> = new Set(decodedToken.permissions);
    return permissions.some(permission => userPermissionsSet.has(permission));
};


export const cadastro = (token: string): void => login(token);