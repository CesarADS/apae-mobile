import { ReactElement, useEffect, useState, useCallback, Fragment, MouseEvent } from "react";
import { Alert, Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Page } from "../../models/Page";
import { Documento } from "../../models/Documentos";
import Aluno from "../../models/Aluno";
import { documentoService } from "../../services/documentosService";
import { alunoService } from "../../services/alunoService";

import SelectAlunos from "../../components/alunos/SelectAlunos";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";
import { UserLoginDTO } from "../../models/User";
import { CodigoAutenticacaoDTO } from "../../models/Assinatura.ts";
import { hasPermission } from "../../services/auth.ts";

interface FormState {
    alunoId: number | null;
    tipoDocumento: string;
    dataDocumento: string;
    file: File | null;
    localizacao: string;
}

const initialFormState: FormState = {
    alunoId: null,
    tipoDocumento: '',
    dataDocumento: '',
    file: null,
    localizacao: ''
};

const DocsAlunos = (): ReactElement => {
    const { showAlert } = useAlert();
    const canWrite = hasPermission('DOCUMENTO_ALUNO_WRITE');
    const canDelete = hasPermission('DOCUMENTO_ALUNO_DELETE');

    const [alunosData, setAlunosData] = useState<Page<Aluno> | null>(null);
    const [paginaAlunosAtual, setPaginaAlunosAtual] = useState(0);
    const [termoBuscaAluno, setTermoBuscaAluno] = useState('');
    const [carregandoAlunos, setCarregandoAlunos] = useState<boolean>(true);

    const [expandedAlunoId, setExpandedAlunoId] = useState<number | null>(null);
    const [documentosPorAluno, setDocumentosPorAluno] = useState<{ [alunoId: number]: Page<Documento> | null }>({});
    const [loadingDocumentos, setLoadingDocumentos] = useState<boolean>(false);
    const [termoBuscaDocumento, setTermoBuscaDocumento] = useState('');
    const [paginaDocumentosAtual, setPaginaDocumentosAtual] = useState(0);
    const [modoPermanente, setModoPermanente] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<Documento | null>(null);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Documento | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [carregandoDownload, setCarregandoDownload] = useState<boolean>(false);

    const [documentoParaDeletar, setDocumentoParaDeletar] = useState<Documento | null>(null);
    const [modalDeletarVisivel, setModalDeletarVisivel] = useState<boolean>(false);

    const [alunoRecemGeradoId, setAlunoRecemGeradoId] = useState<number | null>(null);

    const [modalAssinarVisivel, setModalAssinarVisivel] = useState<boolean>(false);
    const [documentoParaAssinar, setDocumentoParaAssinar] = useState<Documento | null>(null);
    const [loginParaAssinar, setLoginParaAssinar] = useState<UserLoginDTO>({ password: '' });
    const [carregandoAssinatura, setCarregandoAssinatura] = useState<boolean>(false);
    const [signatureStep, setSignatureStep] = useState<'options' | 'simpleConfirm' | 'simpleLogin' | 'advancedLogin' | 'advancedConfirm'>('options');
    const [codigoAutenticacao, setCodigoAutenticacao] = useState('');

    const buscarAlunos = useCallback(async () => {
        setCarregandoAlunos(true);
        try {
            const resposta = await alunoService.listarAlunos(paginaAlunosAtual, termoBuscaAluno);
            setAlunosData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao carregar alunos.", "Erro!", "error");
        } finally {
            setCarregandoAlunos(false);
        }
    }, [paginaAlunosAtual, termoBuscaAluno, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarAlunos();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarAlunos]);

    const abrirModalCadastro = () => {
        setDocumentoEmEdicao(null);
        setDadosForm(initialFormState);
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (doc: Documento) => {
        setDocumentoEmEdicao(doc);
        setDadosForm({
            alunoId: doc.pessoa?.id || null,
            tipoDocumento: doc.tipoDocumento?.nome || '',
            dataDocumento: doc.dataDocumento ? doc.dataDocumento.split('T')[0] : '',
            file: null,
            localizacao: doc.localizacao || ''
        });
        setModalFormVisivel(true);
    };

    const fecharModalForm = () => {
        setDocumentoEmEdicao(null);
        setModalFormVisivel(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDadosForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDadosForm(prev => ({ ...prev, file: e.target.files?.[0] || null }));
        }
    };

    const handleAlunoSelect = (alunoSelecionado: Aluno | null) => {
        setDadosForm(prev => ({ ...prev, alunoId: alunoSelecionado?.id ?? null }));
    };

    const handleSalvar = async () => {
        if (!dadosForm.tipoDocumento || !dadosForm.dataDocumento) {
            showAlert("Tipo e Data do Documento são obrigatórios.", "Erro", "error");
            return;
        }
        setCarregandoModal(true);
        try {
            const dadosParaEnviar = new FormData();
            dadosParaEnviar.append("tipoDocumento", dadosForm.tipoDocumento);
            dadosParaEnviar.append("dataDocumento", dadosForm.dataDocumento);
            dadosParaEnviar.append("localizacao", dadosForm.localizacao);

            if (documentoEmEdicao) {
                if (dadosForm.file) {
                    dadosParaEnviar.append("file", dadosForm.file);
                }
                await documentoService.atualizar(documentoEmEdicao.id, dadosParaEnviar);
                showAlert("Documento atualizado com sucesso!", "Sucesso", "success");
            } else {
                if (!dadosForm.alunoId) {
                    setCarregandoModal(false);
                    showAlert("Por favor, selecione um aluno.", "Erro!", "error");
                    return;
                }
                if (!dadosForm.file) {
                    setCarregandoModal(false);
                    showAlert("Por favor, selecione um arquivo.", "Erro!", "error");
                    return;
                }
                dadosParaEnviar.append("file", dadosForm.file);
                await documentoService.uploadDocPessoa(dadosForm.alunoId, dadosParaEnviar);
                showAlert("Documento cadastrado com sucesso!", "Sucesso!", "success");
            }

            fecharModalForm();
            const studentId = documentoEmEdicao?.pessoa?.id || dadosForm.alunoId;
            if (studentId) {
                refreshStudentDocuments(studentId);
            }
        } catch (error: any) {
            showAlert(error.response?.data || "Erro ao salvar documento.", "Erro!", "error");
        } finally {
            setCarregandoModal(false);
        }
    };

    const handleVisualizarClick = async (doc: Documento) => {
        setDocumentoParaVisualizar(doc);
        setModalVisualizarVisivel(true);
        setCarregandoModal(true);
        try {
            const docCompleto = await documentoService.buscarUm(doc.id);
            setDocumentoParaVisualizar(docCompleto);
        } catch (error) {
            showAlert("Erro ao carregar pré-visualização", "Erro", "error");
            setModalVisualizarVisivel(false);
        } finally {
            setCarregandoModal(false);
        }
    };

    const handleDownload = async (id: number) => {
        setCarregandoDownload(true);
        try {
            const downloadedFile = await documentoService.downloadDocumento(id);
            const url = window.URL.createObjectURL(downloadedFile.blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', downloadedFile.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showAlert("Erro ao baixar o documento.", "Erro", "error");
        } finally {
            setCarregandoDownload(false);
        }
    };

    const handleDeleteClick = (e: MouseEvent, doc: Documento) => {
        e.stopPropagation();
        setDocumentoParaDeletar(doc);
        setModalDeletarVisivel(true);
    };

    const handleConfirmarDelete = async () => {
        if (!documentoParaDeletar) return;
        try {
            await documentoService.mudarStatus(documentoParaDeletar.id);
            showAlert("Documento excluído com sucesso!", "Sucesso", "success");
            if (expandedAlunoId) {
                refreshStudentDocuments(expandedAlunoId);
            }
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível excluir o documento.", "Erro", "error");
        } finally {
            setDocumentoParaDeletar(null);
            setModalDeletarVisivel(false);
        }
    };

    const handleAssinarClick = (e: MouseEvent, doc: Documento) => {
        e.stopPropagation();
        setDocumentoParaAssinar(doc);
        setLoginParaAssinar({ password: '' });
        setCodigoAutenticacao('');
        setSignatureStep('options');
        setModalAssinarVisivel(true);
    };

    const handleAssinarSimples = async () => {
        if (!documentoParaAssinar || !loginParaAssinar.password) {
            showAlert("Senha é obrigatória.", "Erro", "error");
            return;
        }
        setCarregandoAssinatura(true);
        try {
            await documentoService.assinarSimples(documentoParaAssinar.id, loginParaAssinar);
            showAlert("Documento assinado com sucesso! (Assinatura Simples)", "Sucesso", "success");
            setModalAssinarVisivel(false);
            if (expandedAlunoId) {
                refreshStudentDocuments(expandedAlunoId);
            }
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível realizar a assinatura simples.", "Erro", "error");
        } finally {
            setCarregandoAssinatura(false);
        }
    };

    const handleIniciarAssinaturaAvancada = async () => {
        if (!documentoParaAssinar || !loginParaAssinar.password) {
            showAlert("Senha é obrigatória.", "Erro", "error");
            return;
        }
        setCarregandoAssinatura(true);
        try {
            await documentoService.iniciarAssinatura(documentoParaAssinar.id, loginParaAssinar);
            showAlert("Código de verificação enviado para o seu e-mail.", "Sucesso", "success");
            setSignatureStep('advancedConfirm');
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível iniciar o processo de assinatura.", "Erro", "error");
        } finally {
            setCarregandoAssinatura(false);
        }
    };

    const handleConfirmarAssinaturaAvancada = async () => {
        if (!documentoParaAssinar || !codigoAutenticacao) {
            showAlert("O código de autenticação é obrigatório.", "Erro", "error");
            return;
        }
        setCarregandoAssinatura(true);
        try {
            const dto: CodigoAutenticacaoDTO = { codigo: codigoAutenticacao };
            await documentoService.confirmarAssinatura(documentoParaAssinar.id, dto);
            showAlert("Documento assinado com sucesso! (Assinatura Avançada)", "Sucesso", "success");
            setModalAssinarVisivel(false);
            if (expandedAlunoId) {
                refreshStudentDocuments(expandedAlunoId);
            }
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível confirmar a assinatura.", "Erro", "error");
        } finally {
            setCarregandoAssinatura(false);
        }
    };

    const loadAndShowDocuments = useCallback(async (alunoId: number, termo: string, pagina: number) => {
        setLoadingDocumentos(true);
        try {
            const resposta = modoPermanente
                ? await documentoService.listarPermanentes(alunoId, pagina, termo)
                : await documentoService.listarPorPessoa(alunoId, pagina, termo);
            setDocumentosPorAluno(prev => ({
                ...prev,
                [alunoId]: resposta
            }));
        } catch (err: any) {
            showAlert("Erro ao carregar documentos do aluno.", "Erro!", "error");
        } finally {
            setLoadingDocumentos(false);
        }
    }, [showAlert, modoPermanente]);

    useEffect(() => {
        if (expandedAlunoId) {
            const timer = setTimeout(() => {
                loadAndShowDocuments(expandedAlunoId, termoBuscaDocumento, paginaDocumentosAtual);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [expandedAlunoId, termoBuscaDocumento, paginaDocumentosAtual, loadAndShowDocuments]);

    useEffect(() => {
        if (alunoRecemGeradoId) {
            const timer = setTimeout(() => {
                setAlunoRecemGeradoId(null);
            }, 3000); // 3 segundos
            return () => clearTimeout(timer);
        }
    }, [alunoRecemGeradoId]);

    const handleExpandToggle = (alunoId: number) => {
        const newId = expandedAlunoId === alunoId ? null : alunoId;
        setExpandedAlunoId(newId);
        if (newId) {
            setTermoBuscaDocumento('');
            setPaginaDocumentosAtual(0);
        }
    };

    const refreshStudentDocuments = (alunoId: number) => {
        const pageToLoad = expandedAlunoId === alunoId ? paginaDocumentosAtual : 0;
        loadAndShowDocuments(alunoId, expandedAlunoId === alunoId ? termoBuscaDocumento : '', pageToLoad);
    };

    const renderizarFormulario = () => (
        <Form>
            {documentoEmEdicao ? (
                <Form.Group className="mb-3">
                    <Form.Label>Aluno</Form.Label>
                    <p className="form-control-plaintext ps-2 border rounded" style={{ minHeight: '38px', paddingTop: '0.375rem' }}><strong>{documentoEmEdicao.pessoa?.nome || 'Carregando...'}</strong></p>
                </Form.Group>
            ) : (
                <SelectAlunos value={dadosForm.alunoId} onAlunoSelect={handleAlunoSelect} required />
            )}
            <SelectTipoDocumento mode="aluno" name="tipoDocumento" value={dadosForm.tipoDocumento} onChange={handleFormChange} required gerar={false} />

            <Form.Group className="mb-3" controlId="dataDocumento">
                <Form.Label>Data do Documento</Form.Label>
                <Form.Control type="date" name="dataDocumento" value={dadosForm.dataDocumento} onChange={handleFormChange} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="localizacao">
                <Form.Label>Localização</Form.Label>
                <Form.Control type="text" name="localizacao" value={dadosForm.localizacao} onChange={handleFormChange} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="file">
                <Form.Label>{documentoEmEdicao ? "Substituir Arquivo (opcional)" : "Arquivo do Documento"}</Form.Label>
                <Form.Control type="file" name="file" onChange={handleFileChange} required={!documentoEmEdicao} />
            </Form.Group>
        </Form>
    );

    return (
        <Container fluid>
            <h1 className="text-primary mb-4">{modoPermanente ? "Documentos Permanentes de Alunos" : "Documentos dos Alunos"}</h1>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control type="text" placeholder="Pesquisar por nome, prontuário ou CPF..." value={termoBuscaAluno} onChange={(e) => { setTermoBuscaAluno(e.target.value); setPaginaAlunosAtual(0); }} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={buscarAlunos} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="info" onClick={() => setModoPermanente(!modoPermanente)} texto={modoPermanente ? "Voltar ao Padrão" : "Arquivo Permanente"} icone={<Icone nome="archive" />} />
                    {canWrite && <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Upload" />}
                    {canWrite && <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar PDF" icone={<Icone nome="file-earmark-pdf" />} />}
                </div>
            </div>

            {carregandoAlunos ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th>Nome</th>
                                <th>Prontuário</th>
                                <th>CPF</th>
                                <th>Data de Nascimento</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alunosData?.content && alunosData.content.length > 0 ? (
                                alunosData.content.map(aluno => (
                                    <Fragment key={aluno.id}>
                                        <tr className="border border-primary tr-azul-hover">
                                            <td className={aluno.id === alunoRecemGeradoId ? 'text-success fw-bold' : ''}>{aluno.nome}</td>
                                            <td>{aluno.matricula}</td>
                                            <td>{aluno.cpf}</td>
                                            <td>{formatarData(aluno.dataNascimento)}</td>
                                            <td className="text-center align-middle">
                                                <Botao
                                                    variant="link"
                                                    onClick={() => handleExpandToggle(aluno.id)}
                                                    title="Ver Documentos"
                                                    icone={<Icone nome={expandedAlunoId === aluno.id ? "chevron-up" : "chevron-down"} />}
                                                />
                                            </td>
                                        </tr>
                                        {expandedAlunoId === aluno.id && (
                                                <tr className="tr-expanded">
                                                    <td colSpan={5}>
                                                        <div className="p-3 bg-light">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                <h5 className="mb-0 text-primary">Documentos</h5>
                                                                <div className="d-flex align-items-center gap-2" style={{ maxWidth: '300px' }}>
                                                                    <Form.Control
                                                                        type="text"
                                                                        size="sm"
                                                                        placeholder="Filtrar documentos..."
                                                                        value={termoBuscaDocumento}
                                                                        onChange={(e) => setTermoBuscaDocumento(e.target.value)}
                                                                    />
                                                                    <Botao
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => refreshStudentDocuments(aluno.id)}
                                                                        icone={<Icone nome="refresh" />}
                                                                        title="Recarregar documentos"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {loadingDocumentos ? (
                                                                <div className="text-center p-3"><Spinner size="sm" /> Carregando...</div>
                                                            ) : documentosPorAluno[aluno.id]?.content && documentosPorAluno[aluno.id]!.content.length > 0 ? (
                                                                <>
                                                                    <Table size="sm" hover responsive className="bg-white">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Número</th>
                                                                                <th>Título</th>
                                                                                <th>Tipo</th>
                                                                                <th>Data Criação</th>
                                                                                <th>Vigencia</th>
                                                                                <th>Localização</th>
                                                                                <th className="text-center">Ação</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {documentosPorAluno[aluno.id]!.content.map(doc => (
                                                                                <tr key={doc.id} onClick={() => canWrite && abrirModalEdicao(doc)} style={{ cursor: canWrite ? 'pointer' : 'default' }}>
                                                                                    <td>{doc.id}</td>
                                                                                    <td>{doc.titulo}</td>
                                                                                    <td>{doc.tipoDocumento?.nome || 'N/A'}</td>
                                                                                    <td>{formatarData(doc.dataDocumento)}</td>
                                                                                    <td>{formatarData(doc.validade)}</td>
                                                                                    <td>{doc.localizacao}</td>
                                                                                    <td className="text-center">
                                                                                        <Botao variant="link" className="p-0" title="Visualizar" onClick={(e) => { e.stopPropagation(); handleVisualizarClick(doc); }} icone={<Icone nome="eye" />} />
                                                                                        {canWrite && <Botao variant="link" className="p-0 ms-2 text-success" title="Assinar" onClick={(e) => handleAssinarClick(e, doc)} icone={<Icone nome="signature" />} />}
                                                                                        {canDelete && <Botao variant="link" className="p-0 ms-2 text-danger" title="Excluir" onClick={(e) => handleDeleteClick(e, doc)} icone={<Icone nome="trash" />} />}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </Table>
                                                                    <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                                        <Button size="sm" variant="outline-primary" onClick={() => setPaginaDocumentosAtual(p => p - 1)} disabled={documentosPorAluno[aluno.id]?.first}>&larr;</Button>
                                                                        <span>Página {documentosPorAluno[aluno.id]!.number + 1} de {documentosPorAluno[aluno.id]!.totalPages}</span>
                                                                        <Button size="sm" variant="outline-primary" onClick={() => setPaginaDocumentosAtual(p => p + 1)} disabled={documentosPorAluno[aluno.id]?.last}>&rarr;</Button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center text-muted p-3">Nenhum documento encontrado para este aluno.</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                        )}
                                    </Fragment>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center">Nenhum aluno encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaAlunosAtual(p => p - 1)} disabled={alunosData?.first}>&larr; Anterior</Button>
                        <span>Página {alunosData ? alunosData.number + 1 : 0} de {alunosData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaAlunosAtual(p => p + 1)} disabled={alunosData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}

            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    documentoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar Documento </>
                        : <> <Icone nome="plus-square" className="me-2" /> Cadastrar novo documento </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar="Salvar"
                aoConfirmar={handleSalvar}
                textoCancelar="Cancelar"
                aoCancelar={fecharModalForm}
                size="xl"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />

            <ModalGenerico
                visivel={modalDeletarVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o documento "${documentoParaDeletar?.titulo}"?`}
                textoConfirmar="Excluir"
                variantConfirmar="danger"
                aoConfirmar={handleConfirmarDelete}
                aoCancelar={() => setModalDeletarVisivel(false)}
            />

            <DocumentGeneratorModal
                show={showGeneratorModal}
                onHide={() => setShowGeneratorModal(false)}
                onSuccess={(alunoId) => {
                    if (alunoId) {
                        refreshStudentDocuments(alunoId);
                        setAlunoRecemGeradoId(alunoId);
                        if (expandedAlunoId !== alunoId) {
                            setExpandedAlunoId(alunoId);
                        }
                    }
                }}
                mode="aluno"
            />

            <Modal show={modalAssinarVisivel} onHide={() => setModalAssinarVisivel(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Icone nome="pencil" className="me-2" />
                        Assinar Documento: {documentoParaAssinar?.titulo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {carregandoAssinatura && <div className="text-center"><Spinner animation="border" /></div>}

                    {signatureStep === 'options' && !carregandoAssinatura && (
                        <div className="d-grid gap-3">
                            <p>Escolha o método de assinatura:</p>
                            <Button variant="primary" onClick={() => setSignatureStep('simpleConfirm')}>
                                Assinar de forma simples
                            </Button>
                            <Button variant="success" onClick={() => setSignatureStep('advancedLogin')}>
                                Assinar de forma avançada
                            </Button>
                        </div>
                    )}

                    {signatureStep === 'simpleConfirm' && !carregandoAssinatura && (
                        <>
                            <p><strong>Atenção:</strong> A assinatura simples não possui validade jurídica.</p>
                            <p>Está certo de que este documento não necessita de validade jurídica?</p>
                        </>
                    )}

                    {(signatureStep === 'simpleLogin' || signatureStep === 'advancedLogin') && !carregandoAssinatura && (
                        <Form>
                            <p>
                                {signatureStep === 'simpleLogin'
                                    ? "Insira sua senha para realizar a assinatura simples."
                                    : "Para iniciar a assinatura avançada, insira sua senha. Um código será enviado para seu e-mail."
                                }
                            </p>
                            <Form.Group className="mb-3">
                                <Form.Label>Senha</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Sua senha"
                                    value={loginParaAssinar.password}
                                    onChange={(e) => setLoginParaAssinar(prev => ({ ...prev, password: e.target.value }))}
                                    autoComplete="current-password"
                                />
                            </Form.Group>
                        </Form>
                    )}

                    {signatureStep === 'advancedConfirm' && !carregandoAssinatura && (
                        <Form>
                            <p>Um código de 6 dígitos foi enviado para o seu e-mail. Por favor, insira-o abaixo para finalizar a assinatura.</p>
                            <Form.Group className="mb-3">
                                <Form.Label>Código de Autenticação</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="123456"
                                    value={codigoAutenticacao}
                                    onChange={(e) => setCodigoAutenticacao(e.target.value)}
                                    maxLength={6}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {signatureStep === 'options' && (
                        <Button variant="secondary" onClick={() => setModalAssinarVisivel(false)}>Cancelar</Button>
                    )}
                    {signatureStep === 'simpleConfirm' && (
                        <>
                            <Button variant="secondary" onClick={() => setSignatureStep('options')}>Não</Button>
                            <Button variant="primary" onClick={() => setSignatureStep('simpleLogin')}>Sim</Button>
                        </>
                    )}
                    {signatureStep === 'simpleLogin' && (
                        <>
                            <Button variant="secondary" onClick={() => setSignatureStep('simpleConfirm')}>Voltar</Button>
                            <Button variant="primary" onClick={handleAssinarSimples} disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Assinando..." : "Assinar"}
                            </Button>
                        </>
                    )}
                    {signatureStep === 'advancedLogin' && (
                        <>
                            <Button variant="secondary" onClick={() => setSignatureStep('options')}>Voltar</Button>
                            <Button variant="primary" onClick={handleIniciarAssinaturaAvancada} disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Enviando..." : "Enviar Código"}
                            </Button>
                        </>
                    )}
                    {signatureStep === 'advancedConfirm' && (
                        <>
                            <Button variant="secondary" onClick={() => setSignatureStep('advancedLogin')}>Voltar</Button>
                            <Button variant="primary" onClick={handleConfirmarAssinaturaAvancada} disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Confirmando..." : "Confirmar Assinatura"}
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <Modal show={modalVisualizarVisivel} onHide={() => setModalVisualizarVisivel(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <div className="d-flex flex-column">
                        <Modal.Title>{documentoParaVisualizar?.titulo || "Carregando..."}</Modal.Title>
                        <Alert variant="warning" className="mt-2 mb-0 p-2">
                            <small>
                                <strong>IMPORTANTE:</strong> Baixe o arquivo através do botão "Baixar Arquivo Original" para garantir a validade do documento.
                            </small>
                        </Alert>
                    </div>
                    <Botao
                        variant="primary"
                        onClick={() => documentoParaVisualizar && handleDownload(documentoParaVisualizar.id)}
                        disabled={carregandoDownload}
                        texto={carregandoDownload ? "Baixando..." : "Baixar Arquivo Original"}
                        icone={carregandoDownload ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <Icone nome="download" />}
                        className="ms-auto"
                    />
                </Modal.Header>
                <Modal.Body style={{ height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {carregandoModal ? <Spinner animation="border" /> : (
                        documentoParaVisualizar?.documento ? (
                            documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? (
                                <img src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.documento}`} alt={documentoParaVisualizar.titulo} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? (
                                <iframe src={`data:application/pdf;base64,${documentoParaVisualizar.documento}#toolbar=0`} title={documentoParaVisualizar.titulo} width="100%" height="100%" style={{ border: 'none' }} />
                            ) : <p>Pré-visualização indisponível para este tipo de arquivo.</p>
                        ) : <p>Conteúdo não encontrado.</p>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocsAlunos;
