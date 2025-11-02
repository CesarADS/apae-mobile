import {ReactElement, useEffect, useState, useCallback, Fragment, MouseEvent} from "react";
import {Alert, Button, Container, Form, Spinner, Table, Modal} from "react-bootstrap";
import {Page} from "../../models/Page";
import {Documento} from "../../models/Documentos.ts";
import {ColaboradorResponse, colaboradorService} from "../../services/colaboradorService";
import {documentoService} from "../../services/documentosService.ts";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import {useAlert} from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";
import ModalGenerico from "../../components/modals/ModalGenerico.tsx";
import SelectColaboradores from "../../components/colaboradores/SelectColaboradores.tsx";
import {UserLoginDTO} from "../../models/User.ts";
import {CodigoAutenticacaoDTO} from "../../models/Assinatura.ts";
import { hasPermission } from "../../services/auth.ts";

interface FormState {
    colaboradorId: number | null;
    tipoDocumento: string;
    dataDocumento: string;
    file: File | null;
    validade: string;
    localizacao: string;
}

const initialFormState: FormState = {
    colaboradorId: null,
    tipoDocumento: '',
    dataDocumento: '',
    file: null,
    validade: '',
    localizacao: ''
};

const DocsColaboradores = (): ReactElement => {
    const { showAlert } = useAlert();
    const canWrite = hasPermission('DOCUMENTO_COLABORADOR_WRITE');
    const canDelete = hasPermission('DOCUMENTO_COLABORADOR_DELETE');

    const [colaboradoresData, setColaboradoresData] = useState<Page<ColaboradorResponse> | null>(null);
    const [paginaColaboradoresAtual, setPaginaColaboradoresAtual] = useState(0);
    const [carregandoColaboradores, setCarregandoColaboradores] = useState<boolean>(true);

    const [expandedColaboradorId, setExpandedColaboradorId] = useState<number | null>(null);
    const [documentosPorColaborador, setDocumentosPorColaborador] = useState<{
        [colaboradorId: number]: Page<Documento> | null
    }>({});
    const [loadingDocumentos, setLoadingDocumentos] = useState<boolean>(false);
    const [termoBuscaDocumento, setTermoBuscaDocumento] = useState('');
    const [paginaDocumentosAtual, setPaginaDocumentosAtual] = useState(0);
    const [modoPermanente, setModoPermanente] = useState<boolean>(false);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Documento | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);
    const [carregandoDownload, setCarregandoDownload] = useState<boolean>(false);

    const [documentoParaDeletar, setDocumentoParaDeletar] = useState<Documento | null>(null);
    const [modalDeletarVisivel, setModalDeletarVisivel] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [carregandoForm, setCarregandoForm] = useState<boolean>(false);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<Documento | null>(null);

    const [modalAssinarVisivel, setModalAssinarVisivel] = useState<boolean>(false);
    const [documentoParaAssinar, setDocumentoParaAssinar] = useState<Documento | null>(null);
    const [loginParaAssinar, setLoginParaAssinar] = useState<UserLoginDTO>({password: ''});
    const [carregandoAssinatura, setCarregandoAssinatura] = useState<boolean>(false);
    const [signatureStep, setSignatureStep] = useState<'options' | 'simpleConfirm' | 'simpleLogin' | 'advancedLogin' | 'advancedConfirm'>('options');
    const [codigoAutenticacao, setCodigoAutenticacao] = useState('');

    const buscarColaboradores = useCallback(async () => {
        setCarregandoColaboradores(true);
        try {
            const resposta = await colaboradorService.findAll(paginaColaboradoresAtual);
            setColaboradoresData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao carregar colaboradores.", "Erro!", "error");
        } finally {
            setCarregandoColaboradores(false);
        }
    }, [paginaColaboradoresAtual, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarColaboradores();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarColaboradores]);

    const loadAndShowDocuments = useCallback(async (colaboradorId: number, termo: string, pagina: number) => {
        setLoadingDocumentos(true);
        try {
            const resposta = modoPermanente
                ? await documentoService.listarPermanentes(colaboradorId, pagina, termo)
                : await documentoService.listarPorPessoa(colaboradorId, pagina, termo);
            setDocumentosPorColaborador(prev => ({
                ...prev,
                [colaboradorId]: resposta
            }));
        } catch (err: any) {
            showAlert("Erro ao carregar documentos do colaborador.", "Erro!", "error");
        } finally {
            setLoadingDocumentos(false);
        }
    }, [showAlert, modoPermanente]);

    useEffect(() => {
        if (expandedColaboradorId !== null) {
            const timer = setTimeout(() => {
                loadAndShowDocuments(expandedColaboradorId, termoBuscaDocumento, paginaDocumentosAtual);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [expandedColaboradorId, termoBuscaDocumento, paginaDocumentosAtual, loadAndShowDocuments]);

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

    const handleExpandToggle = (colaboradorId: number) => {
        const newId = expandedColaboradorId === colaboradorId ? null : colaboradorId;
        setExpandedColaboradorId(newId);
        if (newId !== null) {
            setTermoBuscaDocumento('');
            setPaginaDocumentosAtual(0);
        }
    };

    const refreshCollaboratorDocuments = (colaboradorId: number) => {
        const pageToLoad = expandedColaboradorId === colaboradorId ? paginaDocumentosAtual : 0;
        loadAndShowDocuments(colaboradorId, expandedColaboradorId === colaboradorId ? termoBuscaDocumento : '', pageToLoad);
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
            if (expandedColaboradorId) {
                refreshCollaboratorDocuments(expandedColaboradorId);
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
        setLoginParaAssinar({password: ''});
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
            if (expandedColaboradorId) {
                refreshCollaboratorDocuments(expandedColaboradorId);
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
            const dto: CodigoAutenticacaoDTO = {codigo: codigoAutenticacao};
            await documentoService.confirmarAssinatura(documentoParaAssinar.id, dto);
            showAlert("Documento assinado com sucesso! (Assinatura Avançada)", "Sucesso", "success");
            setModalAssinarVisivel(false);
            if (expandedColaboradorId) {
                refreshCollaboratorDocuments(expandedColaboradorId);
            }
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível confirmar a assinatura.", "Erro", "error");
        } finally {
            setCarregandoAssinatura(false);
        }
    };


    const abrirModalUpload = () => {
        setDocumentoEmEdicao(null);
        setDadosForm(initialFormState);
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (doc: Documento) => {
        setDocumentoEmEdicao(doc);
        setDadosForm({
            colaboradorId: doc.pessoa?.id || null,
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

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setDadosForm(prev => ({...prev, [name]: value}));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDadosForm(prev => ({...prev, file: e.target.files[0]}));
        }
    };

    const handleColaboradorSelect = (colaborador: ColaboradorResponse | null) => {
        setDadosForm(prev => ({...prev, colaboradorId: colaborador?.id || null}));
    };

    const handleSalvar = async () => {
        if (carregandoForm) return;

        if (!dadosForm.tipoDocumento || !dadosForm.dataDocumento) {
            showAlert("Tipo e Data do Documento são obrigatórios.", "Erro", "error");
            return;
        }

        setCarregandoForm(true);
        try {
            const formData = new FormData();
            formData.append("tipoDocumento", dadosForm.tipoDocumento);
            formData.append("dataDocumento", dadosForm.dataDocumento);
            formData.append("localizacao", dadosForm.localizacao);

            if (documentoEmEdicao) {
                if (dadosForm.file) {
                    formData.append("file", dadosForm.file);
                }
                await documentoService.atualizar(documentoEmEdicao.id, formData);
                showAlert("Documento atualizado com sucesso!", "Sucesso", "success");
            } else {
                if (!dadosForm.colaboradorId) {
                    showAlert("Por favor, selecione um colaborador.", "Erro!", "error");
                    setCarregandoForm(false);
                    return;
                }
                if (!dadosForm.file) {
                    showAlert("Por favor, selecione um arquivo.", "Erro!", "error");
                    setCarregandoForm(false);
                    return;
                }
                formData.append("file", dadosForm.file);
                await documentoService.uploadDocPessoa(dadosForm.colaboradorId, formData);
                showAlert("Documento enviado com sucesso!", "Sucesso", "success");
            }

            fecharModalForm();
            const collaboratorId = documentoEmEdicao?.pessoa?.id || dadosForm.colaboradorId;
            if (collaboratorId) {
                refreshCollaboratorDocuments(collaboratorId);
            }
        } catch (error: any) {
            showAlert(error.response?.data?.message || "Erro ao salvar documento.", "Erro!", "error");
        } finally {
            setCarregandoForm(false);
        }
    };

    const renderizarFormulario = () => (
        <Form>
            {documentoEmEdicao ? (
                <Form.Group className="mb-3">
                    <Form.Label>Colaborador</Form.Label>
                    <p className="form-control-plaintext ps-2 border rounded"
                       style={{minHeight: '38px', paddingTop: '0.375rem'}}>
                        <strong>{documentoEmEdicao.pessoa?.nome}</strong></p>
                </Form.Group>
            ) : (
                <SelectColaboradores onColaboradorSelect={handleColaboradorSelect} required/>
            )}
            <SelectTipoDocumento mode="colaborador" name="tipoDocumento" value={dadosForm.tipoDocumento}
                                 onChange={handleFormChange} required gerar={false}/>
            <Form.Group className="mb-3" controlId="dataDocumento">
                <Form.Label>Data do Documento</Form.Label>
                <Form.Control type="date" name="dataDocumento" value={dadosForm.dataDocumento}
                              onChange={handleFormChange} required/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="localizacao">
                <Form.Label>Localização</Form.Label>
                <Form.Control type="text" name="localizacao" value={dadosForm.localizacao} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="file">
                <Form.Label>{documentoEmEdicao ? "Substituir Arquivo (opcional)" : "Arquivo do Documento"}</Form.Label>
                <Form.Control type="file" name="file" onChange={handleFileChange} required={!documentoEmEdicao}/>
            </Form.Group>
        </Form>
    );

    return (
        <Container fluid>
            <h1 className="text-primary mb-4">{modoPermanente ? "Documentos Permanentes de Colaboradores" : "Documentos dos Colaboradores"}</h1>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    {/* Search bar can be added here if needed */}
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="info" onClick={() => setModoPermanente(!modoPermanente)}
                           texto={modoPermanente ? "Voltar ao Padrão" : "Arquivo Permanente"}
                           icone={<Icone nome="archive"/>}/>
                    {canWrite && <Botao variant="primary" icone={<Icone nome="upload"/>} onClick={abrirModalUpload} texto="Upload"/>}
                    {canWrite && <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar Documento"
                           icone={<Icone nome="file-earmark-pdf"/>}/>}
                </div>
            </div>

            {carregandoColaboradores ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border"/></div>
            ) : (
                <>
                    <Table borderless hover responsive>
                        <thead className="thead-azul">
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Cargo</th>
                            <th className="text-center">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {colaboradoresData?.content && colaboradoresData.content.length > 0 ? (
                            colaboradoresData.content.map(colaborador => (
                                <Fragment key={colaborador.id}>
                                    <tr className="border border-primary tr-azul-hover">
                                        <td>{colaborador.nome}</td>
                                        <td>{colaborador.cpf}</td>
                                        <td>{colaborador.cargo}</td>
                                        <td className="text-center align-middle">
                                            <Botao
                                                variant="link"
                                                onClick={() => handleExpandToggle(colaborador.id)}
                                                title="Ver Documentos"
                                                icone={<Icone
                                                    nome={expandedColaboradorId === colaborador.id ? "chevron-up" : "chevron-down"}/>}/>
                                        </td>
                                    </tr>
                                    {expandedColaboradorId === colaborador.id && (
                                        <tr className="tr-expanded">
                                            <td colSpan={4}>
                                                <div className="p-3 bg-light">
                                                    <div
                                                        className="d-flex justify-content-between align-items-center mb-3">
                                                        <h5 className="mb-0 text-primary">Documentos</h5>
                                                        <div className="d-flex align-items-center gap-2"
                                                             style={{maxWidth: '300px'}}>
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
                                                                onClick={() => refreshCollaboratorDocuments(colaborador.id)}
                                                                icone={<Icone nome="refresh"/>}
                                                                title="Recarregar documentos"
                                                            />
                                                        </div>
                                                    </div>

                                                    {loadingDocumentos ? (
                                                        <div className="text-center p-3"><Spinner
                                                            size="sm"/> Carregando...</div>
                                                    ) : documentosPorColaborador[colaborador.id]?.content && documentosPorColaborador[colaborador.id]!.content.length > 0 ? (
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
                                                                {documentosPorColaborador[colaborador.id]!.content.map(doc => (
                                                                    <tr key={doc.id}
                                                                        onClick={() => canWrite && abrirModalEdicao(doc)}
                                                                        style={{cursor: canWrite ? 'pointer' : 'default'}}>
                                                                        <td>{doc.id}</td>
                                                                        <td>{doc.titulo}</td>
                                                                        <td>{doc.tipoDocumento?.nome || 'N/A'}</td>
                                                                        <td>{formatarData(doc.dataDocumento)}</td>
                                                                        <td>{formatarData(doc.validade)}</td>
                                                                        <td>{doc.localizacao}</td>
                                                                        <td className="text-center">
                                                                            <Botao variant="link" className="p-0"
                                                                                   title="Visualizar" onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleVisualizarClick(doc);
                                                                            }} icone={<Icone nome="eye"/>}/>
                                                                            {canWrite && <Botao variant="link"
                                                                                   className="p-0 ms-2 text-success"
                                                                                   title="Assinar"
                                                                                   onClick={(e) => handleAssinarClick(e, doc)}
                                                                                   icone={<Icone nome="signature"/>}/>}
                                                                            {canDelete && <Botao variant="link"
                                                                                   className="p-0 ms-2 text-danger"
                                                                                   title="Excluir"
                                                                                   onClick={(e) => handleDeleteClick(e, doc)}
                                                                                   icone={<Icone nome="trash"/>}/>}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </Table>
                                                            <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                                <Button size="sm" variant="outline-primary"
                                                                        onClick={() => setPaginaDocumentosAtual(p => p - 1)}
                                                                        disabled={documentosPorColaborador[colaborador.id]?.first}>&larr;</Button>
                                                                <span>Página {documentosPorColaborador[colaborador.id]!.number + 1} de {documentosPorColaborador[colaborador.id]!.totalPages}</span>
                                                                <Button size="sm" variant="outline-primary"
                                                                        onClick={() => setPaginaDocumentosAtual(p => p + 1)}
                                                                        disabled={documentosPorColaborador[colaborador.id]?.last}>&rarr;</Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center text-muted p-3">Nenhum documento
                                                            encontrado para este colaborador.</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center">Nenhum colaborador encontrado.</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaColaboradoresAtual(p => p - 1)}
                                disabled={colaboradoresData?.first}>&larr; Anterior</Button>
                        <span>Página {colaboradoresData ? colaboradoresData.number + 1 : 0} de {colaboradoresData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaColaboradoresAtual(p => p + 1)}
                                disabled={colaboradoresData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}

            <DocumentGeneratorModal
                show={showGeneratorModal}
                onHide={() => setShowGeneratorModal(false)}
                onSuccess={(colaboradorId) => {
                    if (colaboradorId) refreshCollaboratorDocuments(colaboradorId);
                }}
                mode="colaborador"
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
            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    documentoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2"/> Editar Documento </>
                        : <> <Icone nome="upload" className="me-2"/> Upload de Documento </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar={carregandoForm ? "Salvando..." : "Salvar"}
                aoConfirmar={handleSalvar}
                confirmarDesabilitado={carregandoForm}
                textoCancelar="Cancelar"
                aoCancelar={fecharModalForm}
                size="lg"
            />
            <Modal show={modalAssinarVisivel} onHide={() => setModalAssinarVisivel(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Icone nome="pencil" className="me-2"/>
                        Assinar Documento: {documentoParaAssinar?.titulo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {carregandoAssinatura && <div className="text-center"><Spinner animation="border"/></div>}

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
                                    onChange={(e) => setLoginParaAssinar(prev => ({...prev, password: e.target.value}))}
                                    autoComplete="current-password"
                                />
                            </Form.Group>
                        </Form>
                    )}

                    {signatureStep === 'advancedConfirm' && !carregandoAssinatura && (
                        <Form>
                            <p>Um código de 6 dígitos foi enviado para o seu e-mail. Por favor, insira-o abaixo para
                                finalizar a assinatura.</p>
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
                            <Button variant="secondary"
                                    onClick={() => setSignatureStep('simpleConfirm')}>Voltar</Button>
                            <Button variant="primary" onClick={handleAssinarSimples} disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Assinando..." : "Assinar"}
                            </Button>
                        </>
                    )}
                    {signatureStep === 'advancedLogin' && (
                        <>
                            <Button variant="secondary" onClick={() => setSignatureStep('options')}>Voltar</Button>
                            <Button variant="primary" onClick={handleIniciarAssinaturaAvancada}
                                    disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Enviando..." : "Enviar Código"}
                            </Button>
                        </>
                    )}
                    {signatureStep === 'advancedConfirm' && (
                        <>
                            <Button variant="secondary"
                                    onClick={() => setSignatureStep('advancedLogin')}>Voltar</Button>
                            <Button variant="primary" onClick={handleConfirmarAssinaturaAvancada}
                                    disabled={carregandoAssinatura}>
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
                                <strong>IMPORTANTE:</strong> Baixe o arquivo através do botão "Baixar Arquivo Original"
                                para garantir a validade do documento.
                            </small>
                        </Alert>
                    </div>
                    <Botao
                        variant="primary"
                        onClick={() => documentoParaVisualizar && handleDownload(documentoParaVisualizar.id)}
                        disabled={carregandoDownload}
                        texto={carregandoDownload ? "Baixando..." : "Baixar Arquivo Original"}
                        icone={carregandoDownload ?
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> :
                            <Icone nome="download"/>}
                        className="ms-auto"
                    />
                </Modal.Header>
                <Modal.Body style={{height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {carregandoModal ? <Spinner
                        animation="border"/> : (documentoParaVisualizar?.documento ? (documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? (
                            <img
                                src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.documento}`}
                                alt={documentoParaVisualizar.titulo} style={{
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}/>) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? (
                                <iframe src={`data:application/pdf;base64,${documentoParaVisualizar.documento}#toolbar=0`}
                                        title={documentoParaVisualizar.titulo} width="100%" height="100%"
                                        style={{border: 'none'}}/>) :
                            <p>Pré-visualização indisponível para este tipo de arquivo.</p>) :
                        <p>Conteúdo não encontrado.</p>)}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocsColaboradores;
