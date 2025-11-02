import { useEffect, useState, useCallback } from 'react';
import { getLogs } from '../../services/logsService';
import { type Log } from '../../models/Log';
import { type Page } from '../../models/Page';
import formatarDataHora from '../../helpers/formatarDataHora';
import '../../assets/css/pages/aluno.css';
import { Container, Table, Spinner, Alert, Button } from 'react-bootstrap';

const HomeLogs = (): JSX.Element => {
    const [paginaData, setPaginaData] = useState<Page<Log> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await getLogs(paginaAtual, 10);
            setPaginaData(resposta);
        } catch (err: any) {
            setErro(err.response?.data?.message || "Erro ao buscar logs.");
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual]);

    useEffect(() => {
        void buscarDados();
    }, [buscarDados]);

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <h2 className="text-primary">Logs do Sistema</h2>
                </div>
            </div>
            {carregando ? (<div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>) : erro ? (<Alert variant="danger">{erro}</Alert>) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead className="thead-azul">
                            <tr>
                                <th>Data/Hora</th>
                                <th>Nível</th>
                                <th>Logger</th>
                                <th>Mensagem</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map((log) => (
                                    <tr key={log.id} className="border border-primary tr-azul-hover">
                                        <td>{formatarDataHora(log.eventDate)}</td>
                                        <td>{log.level}</td>
                                        <td>{log.logger}</td>
                                        <td>{log.message}</td>
                                        <td>{log.nome}</td>
                                        <td>{log.email}</td>
                                        <td>{log.acao}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="text-center">Nenhum log encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p - 1)} disabled={paginaData?.first}>&larr; Anterior</Button>
                        <span>Página {paginaData ? paginaData.number + 1 : 0} de {paginaData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p + 1)} disabled={paginaData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}
        </Container>
    );
};

export default HomeLogs;
