import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { documentoService, GerarDocumentoPessoaDTO } from '../../services/documentosService.ts';
import { alunoService } from '../../services/alunoService.ts';
import institucionalService from '../../services/institucionalService.ts';
import { ColaboradorResponse } from "../../services/colaboradorService.ts";
import Icone from "../common/Icone.tsx";
import SelectAlunos from "../alunos/SelectAlunos.tsx";
import Aluno from "../../models/Aluno.ts";
import SelectTipoDocumento from "../tipoDocumento/SelectTipoDocumento.tsx";
import SelectColaboradores from "../colaboradores/SelectColaboradores.tsx";
import { useAlert } from "../../hooks/useAlert.tsx";

interface DocumentoData {
    textoCorpo: string;
    instituicao: string;
    alunoId: number | null;
    colaboradorId: number | null;
    tipoDocumento: string;
    dataDocumento: string;
    titulo: string;
    localizacao: string;
}

const initialState: DocumentoData = {
    textoCorpo: '',
    instituicao: '',
    colaboradorId: null,
    alunoId: null,
    tipoDocumento: '',
    dataDocumento: '',
    titulo: '',
    localizacao: ''
};

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image',
    'align', 'script'
];

interface DocumentGeneratorModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: (id?: number) => void;
    initialData?: Partial<DocumentoData>;
    mode: 'aluno' | 'colaborador' | 'instituicao';
}

const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({ show, onHide, onSuccess, initialData, mode }) => {
    const { showAlert } = useAlert();
    const [documento, setDocumento] = useState<DocumentoData>(initialState);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorResponse | null>(null);

    useEffect(() => {
        if (show) {
            const combinedData = { ...initialState, ...initialData };
            setDocumento(combinedData);

            if (mode === 'aluno' && combinedData.alunoId) {
                alunoService.listarUmAluno(combinedData.alunoId).then(aluno => {
                    setSelectedAluno(aluno);
                }).catch(err => {
                    console.error("Erro ao buscar aluno inicial", err);
                    setSelectedAluno(null);
                });
            } else if (mode === 'colaborador' && combinedData.colaboradorId) {
            } else {
                setSelectedAluno(null);
                setSelectedColaborador(null);
            }
        } else {
            setTimeout(() => {
                setDocumento(initialState);
                setSelectedAluno(null);
                setSelectedColaborador(null);
            }, 200);
        }
    }, [show, initialData, mode]);

    const handleClose = () => {
        onHide();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDocumento(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (name: string, value: string) => {
        setDocumento(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!documento.tipoDocumento) {
            showAlert("O campo Tipo de Documento é obrigatório.", "Atenção", "warning");
            return false;
        }
        if (!documento.textoCorpo.trim()) {
            showAlert("O campo Corpo do Documento é obrigatório.", "Atenção", "warning");
            return false;
        }

        if (mode === 'aluno' && !documento.alunoId) {
            showAlert("O campo Aluno é obrigatório.", "Atenção", "warning");
            return false;
        }
        if (mode === 'colaborador' && !documento.colaboradorId) {
            showAlert("O campo Colaborador é obrigatório.", "Atenção", "warning");
            return false;
        }
        if (mode === 'instituicao') {
            if (!documento.titulo) {
                showAlert("Título do Documento é obrigatório.", "Atenção", "warning");
                return false;
            }
            if (!documento.dataDocumento) {
                showAlert("Data do Documento é obrigatório.", "Atenção", "warning");
                return false;
            }
        }
        return true;
    };

    const handleAlunoSelect = (aluno: Aluno | null) => {
        setSelectedAluno(aluno);
        setDocumento(prev => ({ ...prev, alunoId: aluno?.id || null }));
    };

    const handleColaboradorSelect = (colaborador: ColaboradorResponse | null) => {
        setSelectedColaborador(colaborador);
        setDocumento(prev => ({ ...prev, colaboradorId: colaborador?.id || null }));
    };

    const handleGenerate = async () => {
        if (!validateForm()) return;
        setIsGenerating(true);
        try {
            if (mode === 'aluno' && documento.alunoId) {
                const dto: GerarDocumentoPessoaDTO = {
                    texto: documento.textoCorpo,
                    pessoaId: documento.alunoId,
                    tipoDocumento: documento.tipoDocumento,
                    localizacao: documento.localizacao
                };
                await documentoService.salvarDocPessoa(dto);
                showAlert('Documento gerado e salvo com sucesso!', 'Sucesso', 'success');
                onSuccess?.(documento.alunoId);
            } else if (mode === 'colaborador' && documento.colaboradorId) {
                const dto: GerarDocumentoPessoaDTO = {
                    texto: documento.textoCorpo,
                    pessoaId: documento.colaboradorId,
                    tipoDocumento: documento.tipoDocumento,
                    localizacao: documento.localizacao
                };
                await documentoService.salvarDocPessoa(dto);
                showAlert('Documento gerado e salvo com sucesso!', 'Sucesso', 'success');
                onSuccess?.(documento.colaboradorId);
            } else if (mode === 'instituicao') {
                const { tipoDocumento, textoCorpo, dataDocumento, titulo, localizacao } = documento;
                await institucionalService.gerarESalvar({ texto: textoCorpo, dataDocumento, tipoDocumento, titulo, localizacao });
                showAlert('Documento institucional gerado e salvo com sucesso!', 'Sucesso', 'success');
                onSuccess?.();
            } else {
                throw new Error("Modo de geração de documento não suportado ou dados insuficientes.");
            }
            handleClose();
        } catch (error: any) {
            console.error('Erro ao gerar PDF:', error);
            let mensagemErro = 'Não foi possível gerar o documento.';
            if (error.response) {
                mensagemErro = `Erro do servidor: ${error.response.status}. Verifique o console do backend para mais detalhes.`;
            } else if (error.request) {
                mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão e o status do backend.';
            } else {
                mensagemErro = `Ocorreu um erro na aplicação: ${error.message}`;
            }
            showAlert(mensagemErro, 'Erro', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const getGenerateButtonText = () => {
        if (isGenerating) return <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> <span className="ms-2">Gerando...</span></>;
        return 'Gerar';
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <Icone nome="file-earmark-text-fill" className="me-2" />
                    Gerar Documento PDF
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {mode === 'aluno' && (
                        <Row>
                            <Col md={6}>
                                <SelectAlunos value={documento.alunoId} onAlunoSelect={handleAlunoSelect} required disabled={!!initialData?.alunoId} />
                            </Col>
                            <Col md={6}>
                                <SelectTipoDocumento mode="aluno" name="tipoDocumento" value={documento.tipoDocumento} onChange={handleInputChange} required disabled={!!initialData?.tipoDocumento} gerar={true} />
                            </Col>
                        </Row>
                    )}

                    {mode === 'instituicao' && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Título do Documento</Form.Label>
                                        <Form.Control type="text" name="titulo" value={documento.titulo} onChange={handleInputChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Data do Documento</Form.Label>
                                        <Form.Control type="date" name="dataDocumento" value={documento.dataDocumento} onChange={handleInputChange} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <SelectTipoDocumento mode="instituicao" name="tipoDocumento" value={documento.tipoDocumento} onChange={handleInputChange} required disabled={!!initialData?.tipoDocumento} gerar={true} />
                        </>
                    )}

                    {mode === 'colaborador' && (
                        <Row>
                            <Col md={6}>
                                <SelectColaboradores onColaboradorSelect={handleColaboradorSelect} required disabled={!!initialData?.colaboradorId} />
                            </Col>
                            <Col md={6}>
                                <SelectTipoDocumento mode="colaborador" name="tipoDocumento" value={documento.tipoDocumento} onChange={handleInputChange} required disabled={!!initialData?.tipoDocumento} gerar={true} />
                            </Col>
                        </Row>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Localização</Form.Label>
                        <Form.Control type="text" name="localizacao" value={documento.localizacao} onChange={handleInputChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Corpo do Documento <span className="text-danger">*</span></Form.Label>
                        <ReactQuill
                            theme="snow"
                            value={documento.textoCorpo}
                            onChange={(value) => handleEditorChange('textoCorpo', value)}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Digite o conteúdo do documento..."
                            style={{ height: '300px', marginBottom: '50px' }}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleGenerate} disabled={isGenerating}>
                    {getGenerateButtonText()}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DocumentGeneratorModal;
