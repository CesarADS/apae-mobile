import { ReactElement, useState } from "react";
import { Container, Form, Spinner, Alert, Table } from "react-bootstrap";
import { verificacaoService, VerificarAssinaturaDTO } from "../../services/verificacaoService";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import formatarData from "../../helpers/formatarData.ts";

const HomeVerificacao = (): ReactElement => {
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [codigoVerificacao, setCodigoVerificacao] = useState<string>("");
    const [resultado, setResultado] = useState<VerificarAssinaturaDTO[] | null>(null);
    const [carregando, setCarregando] = useState<boolean>(false);
    const [erro, setErro] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setArquivo(event.target.files[0]);
            setResultado(null);
            setErro(null);
        }
    };

    const handleVerificar = async () => {
        if (!arquivo) {
            setErro("Por favor, selecione um arquivo PDF para verificar.");
            return;
        }
        if (!codigoVerificacao) {
            setErro("Por favor, insira o código de verificação.");
            return;
        }

        setCarregando(true);
        setErro(null);
        setResultado(null);

        try {
            const resultadoVerificacao = await verificacaoService.verificarDocumentoPublico(arquivo, codigoVerificacao);
            setResultado(resultadoVerificacao);
        } catch (error: any) {
            setErro(error.response?.data?.message || "Ocorreu um erro ao verificar o documento. Tente novamente.");
        } finally {
            setCarregando(false);
        }
    };

    const renderResultados = () => {
        if (carregando) {
            return (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Verificando...</p>
                </div>
            );
        }

        if (erro) {
            return <Alert variant="danger" className="mt-4">{erro}</Alert>;
        }

        if (resultado) {
            if (resultado.length === 0) {
                return (
                    <Alert variant="warning" className="mt-4 d-flex align-items-center">
                        <Icone nome="x-circle" className="me-3" />
                        <div>
                            <Alert.Heading>Documento Inválido ou Não Encontrado</Alert.Heading>
                            <p className="mb-0">Nenhuma assinatura válida foi encontrada para o arquivo e código de verificação enviados. O documento pode não ser autêntico ou não foi registrado em nosso sistema.</p>
                        </div>
                    </Alert>
                );
            }

            const isDocumentoValido = resultado.every(r => r.valida);

            return (
                <div className="mt-4">
                    {isDocumentoValido ? (
                        <Alert variant="success" className="d-flex align-items-center">
                            <Icone nome="check-circle-fill" className="me-3" />
                            <div>
                                <Alert.Heading>Documento Autêntico</Alert.Heading>
                                <p className="mb-0">As seguintes assinaturas válidas foram encontradas para este documento:</p>
                            </div>
                        </Alert>
                    ) : (
                        <Alert variant="danger" className="d-flex align-items-center">
                            <Icone nome="exclamation-triangle-fill" className="me-3" />
                            <div>
                                <Alert.Heading>Assinatura Inválida Detectada</Alert.Heading>
                                <p className="mb-0">O documento possui uma ou mais assinaturas que não puderam ser validadas. Verifique os detalhes abaixo.</p>
                            </div>
                        </Alert>
                    )}

                    <Table striped bordered hover responsive className="mt-3">
                        <thead className="thead-azul">
                            <tr>
                                <th>Nome do Signatário</th>
                                <th>Data da Assinatura</th>
                                <th>Tipo de Assinatura</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.map((assinatura, index) => (
                                <tr key={index}>
                                    <td>{assinatura.nomeSignatario}</td>
                                    <td>{formatarData(assinatura.dataAssinatura, true)}</td>
                                    <td>{assinatura.tipo}</td>
                                    <td>
                                        <span className={`badge bg-${assinatura.valida ? 'success' : 'danger'}`}>
                                            {assinatura.valida ? 'Válida' : 'Inválida'}
                                        </span>
                                        {!assinatura.valida && <small className="d-block text-muted">{assinatura.mensagem}</small>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            );
        }

        return null;
    };

    return (
        <Container className="py-5">
            <div className="p-5 mb-4 bg-light rounded-3 shadow-sm">
                <Container fluid className="py-3">
                    <h1 className="display-5 fw-bold text-primary">Verificação de Autenticidade</h1>
                    <p className="col-md-10 fs-4">Envie um documento em formato PDF e seu código de verificação para validar as assinaturas eletrônicas registradas em nosso sistema.</p>
                    
                     <Form.Group controlId="formCodigoVerificacao" className="my-4">
                        <Form.Label>Código de Verificação</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Insira o código de verificação"
                            value={codigoVerificacao}
                            onChange={(e) => setCodigoVerificacao(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formFileLg" className="my-4">
                        <Form.Label>Selecione o arquivo do documento (PDF)</Form.Label>
                        <Form.Control type="file" size="lg" onChange={handleFileChange} accept=".pdf" />
                    </Form.Group>

                    <Botao 
                        variant="primary" 
                        size="lg" 
                        onClick={handleVerificar} 
                        disabled={!arquivo || !codigoVerificacao || carregando}
                        texto={carregando ? 'Verificando...' : 'Verificar Documento'}
                        icone={carregando ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> : <Icone nome="shield-check" />}
                    />
                </Container>
            </div>

            {renderResultados()}

        </Container>
    );
};

export default HomeVerificacao;
