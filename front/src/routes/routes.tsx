import { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import RotasPrivadas from "./RotasPrivadas";
import { estaAutenticado } from "../services/auth";
import EsqueciSenha from "../pages/EsqueciSenha";
import RedefinirSenha from "../pages/RedefinirSenha";
import { AlertProvider } from "../contexts/AlertContext";
import HomeVerificacao from "../pages/verificacao/HomeVerificacao";

const Rotas = (): ReactElement => {
  const autenticado = estaAutenticado();

  return (
    <BrowserRouter>
    <AlertProvider>
      <Routes>
        <Route path="/verificacao" element={<HomeVerificacao />} />
        {autenticado ? (
          <Route path="/*" element={<RotasPrivadas />} />
        ) : (
          <>
            <Route path="/entrar" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          </>
        )}
        
        <Route path="*" element={<Navigate to={autenticado ? "/" : "/entrar"} replace />} />
      </Routes>
      </AlertProvider>
    </BrowserRouter>
  );
};

export default Rotas;
