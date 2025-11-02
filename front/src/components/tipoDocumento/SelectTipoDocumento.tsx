import { ChangeEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { tipoDocumentoService } from '../../services/tipoDocumentoService';
import { TipoDocumentoResponse } from '../../models/TipoDocumento';

type Props = {
    name: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    required?: boolean;
    disabled?: boolean;
    mode: 'aluno' | 'colaborador' | 'instituicao';
    gerar: boolean;
};

const SelectTipoDocumento = ({ name, value, onChange, required, disabled, mode, gerar }: Props) => {
    const [tipos, setTipos] = useState<TipoDocumentoResponse[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        const fetchTiposDocumento = async () => {
            if (!mode) {
                setTipos([]);
                return;
            }

            setCarregando(true);
            setErro(null);
            try {
                let response: TipoDocumentoResponse[];
                switch (mode) {
                    case 'aluno':
                        response = await tipoDocumentoService.buscarTodosAlunos(gerar);
                        break;
                    case 'colaborador':
                        response = await tipoDocumentoService.buscarTodosColaboradores(gerar);
                        break;
                    case 'instituicao':
                        response = await tipoDocumentoService.buscarTodosInstitucional(gerar);
                        break;
                }
                setTipos(response);
            } catch (error) {
                console.error(`Erro ao buscar tipos de documento para o modo '${mode}':`, error);
                setErro("Não foi possível carregar os tipos.");
                setTipos([]);
            } finally {
                setCarregando(false);
            }
        };

        fetchTiposDocumento();
    }, [mode, gerar]);

    return (
        <Form.Group className="mb-3" controlId={name}>
            <Form.Label>Tipo de Documento</Form.Label>
            <Form.Control
                as="select"
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled || carregando || !!erro}
                required={required}
            >
                <option value="">
                    {carregando && "Carregando..."}
                    {erro && erro}
                    {!carregando && !erro && "Selecione o tipo de documento"}
                </option>

                {tipos.map(tipo => (
                    <option key={tipo.id} value={tipo.nome}>
                        {tipo.nome}
                    </option>
                ))}
            </Form.Control>
        </Form.Group>
    );
};

export default SelectTipoDocumento;
