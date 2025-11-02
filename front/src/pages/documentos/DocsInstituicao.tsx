import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import { Page } from "../../models/Page";
import institucionalService, { CodigoAutenticacaoDTO, InstitucionalResponse } from "../../services/institucionalService";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";
import { UserLoginDTO } from "../../models/User.ts";
import { hasPermission } from "../../services/auth";

interface FormState {
    titulo: string;
    tipoDocumento: string;
    dataDocumento: string;
    file: File | null;
    localizacao: string;
}

const initialFormState: FormState = {
    titulo: '',
    tipoDocumento: '',
    dataDocumento: '',
    file: null,
    localizacao: ''
};

const DocsInstituicao = (): ReactElement => {
    const { showAlert } = useAlert();
    const canRead = hasPermission('DOCUMENTO_INSTITUCIONAL_READ');
    const canWrite = hasPermission('DOCUMENTO_INSTITUCIONAL_WRITE');
    const canDelete = hasPermission('DOCUMENTO_INSTITUCIONAL_DELETE');

    const [paginaData, setPaginaData] = useState<Page<InstitucionalResponse> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState<boolean>(true);
    const [modoPermanente, setModoPermanente] = useState<boolean>(false);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<InstitucionalResponse | null>(null);
    const [documentoParaInativar, setDocumentoParaInativar] = useState<number | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [modalInativarVisivel, setModalInativarVisivel] = useState<boolean>(false);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);
    const [carregandoDownload, setCarregandoDownload] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [carregandoForm, setCarregandoForm] = useState<boolean>(false);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<InstitucionalResponse | null>(null);

    const [modalAssinarVisivel, setModalAssinarVisivel] = useState<boolean>(false);
    const [documentoParaAssinar, setDocumentoParaAssinar] = useState<InstitucionalResponse | null>(null);
    const [loginParaAssinar, setLoginParaAssinar] = useState<UserLoginDTO>({ password: '' });
    const [carregandoAssinatura, setCarregandoAssinatura] = useState<boolean>(false);
    const [etapaAssinatura, setEtapaAssinatura] = useState<'senha' | 'codigo'>('senha');
    const [codigoAutenticacao, setCodigoAutenticacao] = useState('');


    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const resposta = modoPermanente
                ? await institucionalService.listarPermanentes(paginaAtual, 10, termoBusca)
                : await institucionalService.listar({ termoBusca }, paginaAtual);
            setPaginaData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao carregar documentos.", "Erro!", "error");
        } finally {
            setCarregando(false);
        }
    }, [termoBusca, paginaAtual, showAlert, modoPermanente]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarDados]);

    const handleVisualizarClick = async (doc: InstitucionalResponse) => {
        setDocumentoParaVisualizar(doc);
        setModalVisualizarVisivel(true);
        setCarregandoModal(true);
        try {
            const docCompleto = await institucionalService.visualizarUm(doc.id);
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
            const downloadedFile = await institucionalService.downloadDocumento(id);
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

    const handleInativarClick = (e: MouseEvent, id: number) => {
        e.stopPropagation();
        setDocumentoParaInativar(id);
        setModalInativarVisivel(true);
    };

    const handleConfirmarInativacao = async () => {
        if (!documentoParaInativar) return;
        try {
            await institucionalService.deletar(documentoParaInativar);
            showAlert("Documento excluído com sucesso.", "Sucesso!", "success");
            buscarDados();
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível excluir o documento.", "Erro", "error");
        } finally {
            setDocumentoParaInativar(null);
            setModalInativarVisivel(false);
        }
    };

    const handleAssinarClick = (e: MouseEvent, doc: InstitucionalResponse) => {
        e.stopPropagation();
        setDocumentoParaAssinar(doc);
        setLoginParaAssinar({ password: '' });
        setCodigoAutenticacao('');
        setEtapaAssinatura('senha');
        setModalAssinarVisivel(true);
    };

    const handleIniciarAssinatura = async () => {
        if (!documentoParaAssinar || !loginParaAssinar.password) {
            showAlert("Senha é obrigatória.", "Erro", "error");
            return;
        }
        setCarregandoAssinatura(true);
        try {
            await institucionalService.solicitarCodigoAssinatura(documentoParaAssinar.id, loginParaAssinar);
            showAlert("Código de verificação enviado para o seu e-mail.", "Sucesso", "success");
            setEtapaAssinatura('codigo');
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível iniciar o processo de assinatura.", "Erro", "error");
        } finally {
            setCarregandoAssinatura(false);
        }
    };

    const handleConfirmarAssinatura = async () => {
        if (!documentoParaAssinar || !codigoAutenticacao) {
            showAlert("O código de autenticação é obrigatório.", "Erro", "error");
            return;
        }
        setCarregandoAssinatura(true);
        try {
            const dto: CodigoAutenticacaoDTO = { codigo: codigoAutenticacao };
            await institucionalService.confirmarAssinatura(documentoParaAssinar.id, dto);
            showAlert("Documento assinado com sucesso!", "Sucesso", "success");
            setModalAssinarVisivel(false);
            buscarDados();
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível confirmar a assinatura.", "Erro", "error");
        } finally {
            setCarregandoAssinatura(false);
        }
    };


    const abrirModalNovo = () => {
        setDocumentoEmEdicao(null);
        setDadosForm(initialFormState);
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (doc: InstitucionalResponse) => {
        setDocumentoEmEdicao(doc);
        setDadosForm({
            titulo: doc.titulo,
            tipoDocumento: doc.tipoDocumento,
            dataDocumento: doc.dataCriacao ? doc.dataCriacao.split('T')[0] : '',
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
        const { name, value } = e.target;
        setDadosForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDadosForm(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleSalvar = async () => {
        if (carregandoForm) return;

        if (!dadosForm.titulo || !dadosForm.tipoDocumento || !dadosForm.dataDocumento) {
            showAlert("Título, Tipo e Data do Documento são obrigatórios.", "Erro", "error");
            return;
        }

        if (!documentoEmEdicao && !dadosForm.file) {
            showAlert("O arquivo é obrigatório para novos uploads.", "Erro", "error");
            return;
        }

        setCarregandoForm(true);
        try {
            const formData = new FormData();
            formData.append('titulo', dadosForm.titulo);
            formData.append('tipoDocumento', dadosForm.tipoDocumento);
            formData.append('dataDocumento', dadosForm.dataDocumento);
            formData.append('localizacao', dadosForm.localizacao);
            if (dadosForm.file) {
                formData.append('file', dadosForm.file);
            }

            if (documentoEmEdicao) {
                await institucionalService.atualizar(documentoEmEdicao.id, formData);
                showAlert("Documento atualizado com sucesso!", "Sucesso", "success");
            } else {
                await institucionalService.upload(formData);
                showAlert("Documento enviado com sucesso!", "Sucesso", "success");
            }
            fecharModalForm();
            buscarDados();
        } catch (error: any) {
            showAlert(error.response?.data?.message || "Erro ao enviar documento.", "Erro!", "error");
        } finally {
            setCarregandoForm(false);
        }
    };

    const renderizarFormulario = () => (
        <Form>
            <Form.Group className="mb-3" controlId="titulo">
                <Form.Label>Título do Documento</Form.Label>
                <Form.Control type="text" name="titulo" value={dadosForm.titulo} onChange={handleFormChange} required />
            </Form.Group>
            <SelectTipoDocumento mode="instituicao" name="tipoDocumento" value={dadosForm.tipoDocumento} onChange={handleFormChange} required />
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
            <h1 className="text-primary mb-4">{modoPermanente ? "Documentos Permanentes da Instituição" : "Documentos da Instituição"}</h1>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control type="text" placeholder="Pesquisar por título..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPaginaAtual(0); }} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={() => buscarDados()} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="info" onClick={() => setModoPermanente(!modoPermanente)} texto={modoPermanente ? "Voltar ao Padrão" : "Arquivo Permanente"} icone={<Icone nome="archive" />} />
                    {canWrite && <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalNovo} texto="Upload" />}
                    {canWrite && <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar Documento" icone={<Icone nome="file-earmark-pdf" />} />}
                </div>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th>Número</th>
                                <th>Título do Documento</th>
                                <th>Tipo</th>
                                <th>Data de Criação</th>
                                <th>Validade</th>
                                <th>Localização</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(doc => (
                                    <tr key={doc.id} className="border border-primary tr-azul-hover" style={{ cursor: canWrite ? 'pointer' : 'default' }} onClick={() => canWrite && abrirModalEdicao(doc)}>
                                        <td>{doc.id}</td>
                                        <td>{doc.titulo}</td>
                                        <td>{doc.tipoDocumento || 'N/A'}</td>
                                        <td>{formatarData(doc.dataCriacao || null)}</td>
                                        <td>{formatarData(doc.validade || null)}</td>
                                        <td>{doc.localizacao || 'N/A'}</td>
                                        <td className="text-center align-middle">
                                            {canRead && <Botao variant="link" className="p-0" title="Visualizar" onClick={(e) => { e.stopPropagation(); handleVisualizarClick(doc); }} icone={<Icone nome="eye" tamanho={20} />} />}
                                            {canWrite && <Botao variant="link" className="p-0 ms-2 text-success" title="Assinar" onClick={(e) => handleAssinarClick(e, doc)} icone={<Icone nome="signature" tamanho={20} />} />}
                                            {canDelete && <Botao variant="link" className="p-0 ms-2 text-danger" title="Excluir" onClick={(e) => handleInativarClick(e, doc.id)} icone={<Icone nome="trash" tamanho={20} />} />}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center">Nenhum documento encontrado.</td></tr>
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

            <ModalGenerico visivel={modalInativarVisivel} titulo="Confirmar Exclusão" mensagem="Deseja realmente excluir este documento? Esta ação não pode ser desfeita." textoConfirmar="Excluir" aoConfirmar={handleConfirmarInativacao} textoCancelar="Cancelar" aoCancelar={() => setModalInativarVisivel(false)} variantConfirmar="danger" />
            <DocumentGeneratorModal show={showGeneratorModal} onHide={() => setShowGeneratorModal(false)} onSuccess={buscarDados} mode="instituicao" />
            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    documentoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar Documento Institucional </>
                        : <> <Icone nome="plus-square" className="me-2" /> Enviar Novo Documento </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar={carregandoForm ? "Salvando..." : "Salvar"}
                aoConfirmar={handleSalvar}
                confirmarDesabilitado={carregandoForm}
                textoCancelar="Cancelar"
                aoCancelar={fecharModalForm}
                size="lg"
            />
            <Modal show={modalVisualizarVisivel} onHide={() => setModalVisualizarVisivel(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{documentoParaVisualizar?.titulo || "Carregando..."}</Modal.Title>
                    <Botao
                        variant="primary"
                        onClick={() => documentoParaVisualizar && handleDownload(documentoParaVisualizar.id)}
                        disabled={carregandoDownload}
                        texto={carregandoDownload ? "Baixando..." : "Baixar Arquivo"}
                        icone={carregandoDownload ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> : <Icone nome="download"/>}
                        className="ms-auto"
                    />
                </Modal.Header>
                <Modal.Body style={{ height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {carregandoModal ? <Spinner animation="border" /> : ( documentoParaVisualizar?.doc ? ( documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? ( <img src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.doc}`} alt={documentoParaVisualizar.titulo} style={{ maxWidth: '100%', maxHeight: '100%' }} /> ) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? ( <iframe src={`data:application/pdf;base64,${documentoParaVisualizar.doc}#toolbar=0`} title={documentoParaVisualizar.titulo} width="100%" height="100%" style={{ border: 'none' }} /> ) : <p>Pré-visualização indisponível para este tipo de arquivo.</p> ) : <p>Conteúdo não encontrado.</p> )}
                </Modal.Body>
            </Modal>
            <Modal show={modalAssinarVisivel} onHide={() => setModalAssinarVisivel(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Icone nome="pen" className="me-2" />
                        Assinar Documento: {documentoParaAssinar?.titulo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {carregandoAssinatura && <div className="text-center"><Spinner animation="border" /></div>}

                    {etapaAssinatura === 'senha' && !carregandoAssinatura && (
                        <Form>
                            <p>Para iniciar a assinatura, insira sua senha. Um código será enviado para seu e-mail.</p>
                            <Form.Group className="mb-3">
                                <Form.Label>Senha</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Sua senha"
                                    value={loginParaAssinar.password}
                                    onChange={(e) => setLoginParaAssinar({ password: e.target.value })}
                                    autoComplete="current-password"
                                />
                            </Form.Group>
                        </Form>
                    )}

                    {etapaAssinatura === 'codigo' && !carregandoAssinatura && (
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
                    {etapaAssinatura === 'senha' && (
                        <>
                            <Button variant="secondary" onClick={() => setModalAssinarVisivel(false)}>Cancelar</Button>
                            <Button variant="primary" onClick={handleIniciarAssinatura} disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Enviando..." : "Enviar Código"}
                            </Button>
                        </>
                    )}
                    {etapaAssinatura === 'codigo' && (
                        <>
                            <Button variant="secondary" onClick={() => setEtapaAssinatura('senha')}>Voltar</Button>
                            <Button variant="primary" onClick={handleConfirmarAssinatura} disabled={carregandoAssinatura}>
                                {carregandoAssinatura ? "Confirmando..." : "Confirmar Assinatura"}
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DocsInstituicao;