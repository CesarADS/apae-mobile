import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../components/layout/Layout";
import HomeAlunos from "../pages/alunos/Home";
import HomeTipoDocumento from "../pages/tipo-documento/HomeTipoDocumento";
import ProtectedRoute from "./ProtectedRoute";
import HomeUsuario from "../pages/usuario/HomeUsuario";
import DocsAlunos from "../pages/documentos/DocsAlunos.tsx";
import DocsColaboradores from "../pages/documentos/DocsColaboradores";
import DocsInstituicao from "../pages/documentos/DocsInstituicao";
import HomeColaboradores from "../pages/colaboradores/HomeColaboradores";
import HomeGroup from "../pages/group/HomeGroup";
import HomeLogs from "../pages/logs/HomeLogs";

const RotasPrivadas = (): ReactElement => (
    <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
            <Route element={<ProtectedRoute permission="ALUNO_READ" />}>
                <Route path="alunos">
                    <Route index element={<HomeAlunos />} />
                    <Route path="*" element={<Navigate to="/alunos" replace />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute permission="TIPO_DOCUMENTO" />}>
                <Route path="tipo-documento">
                    <Route index element={<HomeTipoDocumento/>} />
                    <Route path="*" element={<Navigate to="/tipo-documento" replace />} />
                </Route>
            </Route>
            
            <Route path="documentos" element={<Navigate to="/documentos/alunos" replace />} />

            <Route element={<ProtectedRoute permission="DOCUMENTO_ALUNO_READ" />}>
                <Route path="documentos/alunos" element={<DocsAlunos />} />
            </Route>

            <Route element={<ProtectedRoute permission="DOCUMENTO_COLABORADOR_READ" />}>
                <Route path="documentos/colaboradores" element={<DocsColaboradores />} />
            </Route>

            <Route element={<ProtectedRoute permission="DOCUMENTO_INSTITUCIONAL_READ" />}>
                <Route path="documentos/instituicao" element={<DocsInstituicao />} />
            </Route>

            <Route element={<ProtectedRoute permission="GERENCIAR_USUARIO" />}>
                <Route path="usuarios" element={<HomeUsuario />} />
            </Route>

            <Route element={<ProtectedRoute permission="COLABORADOR_READ" />}>
                <Route path="colaboradores" element={<HomeColaboradores />} />
            </Route>

            <Route element={<ProtectedRoute permission="GRUPOS_PERMISSOES" />}>
                <Route path="admin/grupos">
                    <Route index element={<HomeGroup />} />
                    <Route path="*" element={<Navigate to="/admin/grupos" replace />} />
                </Route>
            </Route>

            <Route path="logs">
                <Route index element={<HomeLogs />} />
                <Route path="*" element={<Navigate to="/logs" replace />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    </Routes>
);

export default RotasPrivadas;
