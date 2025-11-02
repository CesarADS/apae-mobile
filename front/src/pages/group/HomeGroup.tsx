import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Spinner, Container, Row, Col } from 'react-bootstrap';

import { groupService, UserGroup, Permission, GroupFormData } from '../../services/groupService';
import { useAlert } from '../../hooks/useAlert';

import ModalGenerico from '../../components/modals/ModalGenerico';
import Botao from '../../components/common/Botao';
import Icone from '../../components/common/Icone';

import '../../assets/css/pages/aluno.css';

const getModuleAndLabel = (permissionName: string) => {
    if (permissionName.startsWith('ALUNO_')) {
        const action = permissionName.split('_').pop();
        if (action === 'READ') return { module: 'Alunos', label: 'Visualizar' };
        if (action === 'WRITE') return { module: 'Alunos', label: 'Criar/Editar' };
        if (action === 'DELETE') return { module: 'Alunos', label: 'Excluir' };
    }
    if (permissionName.startsWith('COLABORADOR_')) {
        const action = permissionName.split('_').pop();
        if (action === 'READ') return { module: 'Colaboradores', label: 'Visualizar' };
        if (action === 'WRITE') return { module: 'Colaboradores', label: 'Criar/Editar' };
        if (action === 'DELETE') return { module: 'Colaboradores', label: 'Excluir' };
    }
    if (permissionName.startsWith('DOCUMENTO_ALUNO')) {
        const action = permissionName.split('_').pop();
        if (action === 'READ') return { module: 'Documentos de Alunos', label: 'Visualizar' };
        if (action === 'WRITE') return { module: 'Documentos de Alunos', label: 'Criar/Editar' };
        if (action === 'DELETE') return { module: 'Documentos de Alunos', label: 'Excluir' };
    }
    if (permissionName.startsWith('DOCUMENTO_COLABORADOR')) {
        const action = permissionName.split('_').pop();
        if (action === 'READ') return { module: 'Documentos de Colaboradores', label: 'Visualizar' };
        if (action === 'WRITE') return { module: 'Documentos de Colaboradores', label: 'Criar/Editar' };
        if (action === 'DELETE') return { module: 'Documentos de Colaboradores', label: 'Excluir' };
    }
    if (permissionName.startsWith('DOCUMENTO_INSTITUCIONAL')) {
        const action = permissionName.split('_').pop();
        if (action === 'READ') return { module: 'Documentos Institucionais', label: 'Visualizar' };
        if (action === 'WRITE') return { module: 'Documentos Institucionais', label: 'Criar/Editar' };
        if (action === 'DELETE') return { module: 'Documentos Institucionais', label: 'Excluir' };
    }
    if (permissionName === 'GERENCIAR_USUARIO') return { module: 'Usuários', label: 'Gerenciar' };
    if (permissionName === 'GRUPOS_PERMISSOES') return { module: 'Grupos', label: 'Gerenciar' };
    if (permissionName === 'TIPO_DOCUMENTO') return { module: 'Tipos de Documento', label: 'Gerenciar' };

    return { module: 'Outros', label: permissionName };
};


const HomeGroup: React.FC = () => {
    const { showAlert } = useAlert();

    const [grupos, setGrupos] = useState<UserGroup[]>([]);
    const [permissoes, setPermissoes] = useState<Permission[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');

    const [modalFormVisivel, setModalFormVisivel] = useState(false);
    const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [grupoEmEdicao, setGrupoEmEdicao] = useState<UserGroup | null>(null);
    const [grupoParaExcluir, setGrupoParaExcluir] = useState<UserGroup | null>(null);

    const [nomeForm, setNomeForm] = useState('');
    const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<Set<number>>(new Set());
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const [listaGrupos, listaPermissoes] = await Promise.all([
                groupService.listar(),
                groupService.listarPermissoes()
            ]);
            setGrupos(listaGrupos);
            setPermissoes(listaPermissoes);
        } catch (error) {
            showAlert("Não foi possível buscar os dados de grupos e permissões.", "Erro!", "error");
        } finally {
            setCarregando(false);
        }
    }, [showAlert]);

    useEffect(() => {
        buscarDados();
    }, [buscarDados]);

    const fecharModalForm = () => {
        setModalFormVisivel(false);
        setGrupoEmEdicao(null);
    };

    const abrirModalCadastro = () => {
        setGrupoEmEdicao(null);
        setNomeForm('');
        setPermissoesSelecionadas(new Set());
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (grupo: UserGroup) => {
        setGrupoEmEdicao(grupo);
        setNomeForm(grupo.nome);
        setPermissoesSelecionadas(new Set(grupo.permissions.map(p => p.id)));
        setModalFormVisivel(true);
    };

    const handlePermissionChange = (permissionId: number) => {
        const newSelection = new Set(permissoesSelecionadas);
        if (newSelection.has(permissionId)) {
            newSelection.delete(permissionId);
        } else {
            newSelection.add(permissionId);
        }
        setPermissoesSelecionadas(newSelection);
    };

    const handleSalvar = async () => {
        setIsSubmitting(true);
        const payload: GroupFormData = {
            nome: nomeForm,
            permissions: Array.from(permissoesSelecionadas).map(id => ({ id }))
        };

        try {
            if (grupoEmEdicao) {
                await groupService.atualizar(grupoEmEdicao.id, payload);
                showAlert("Grupo atualizado com sucesso!", "Sucesso!", "success");
            } else {
                await groupService.criar(payload);
                showAlert("Grupo criado com sucesso!", "Sucesso!", "success");
            }
            fecharModalForm();
            buscarDados();
        } catch (error) {
            showAlert("Erro ao salvar o grupo.", "Erro!", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const abrirModalExclusao = (grupo: UserGroup) => {
        setGrupoParaExcluir(grupo);
        setModalExcluirVisivel(true);
    };

    const handleConfirmarExclusao = async () => {
        if (!grupoParaExcluir) return;
        try {
            await groupService.deletar(grupoParaExcluir.id);
            showAlert("Grupo excluído com sucesso.", "Excluído!", "success");
            buscarDados();
        } catch (error) {
            showAlert("Não foi possível excluir o grupo.", "Erro!", "error");
        } finally {
            setModalExcluirVisivel(false);
            setGrupoParaExcluir(null);
        }
    };

    const toggleRowExpansion = (groupId: number) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(groupId)) {
            newExpandedRows.delete(groupId);
        } else {
            newExpandedRows.add(groupId);
        }
        setExpandedRows(newExpandedRows);
    };

    const gruposFiltrados = grupos.filter(g => g.nome.toLowerCase().includes(termoBusca.toLowerCase()));

    const renderGroupPermissions = (permissions: Permission[]) => {
        const permissionsByModule = permissions.reduce((acc, p) => {
            const { module, label } = getModuleAndLabel(p.nome);
            if (!acc[module]) {
                acc[module] = [];
            }
            if (!acc[module].includes(label)) {
                acc[module].push(label);
            }
            return acc;
        }, {} as Record<string, string[]>);

        const moduleOrder = ['Alunos', 'Documentos de Alunos', 'Colaboradores', 'Documentos de Colaboradores', 'Documentos Institucionais', 'Grupos', 'Tipos de Documento', 'Usuários', 'Outros'];
        const sortedModules = Object.keys(permissionsByModule).sort((a, b) => {
            const indexA = moduleOrder.indexOf(a);
            const indexB = moduleOrder.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return (
            <ul style={{ listStyleType: 'none', paddingLeft: '1rem' }}>
                {sortedModules.map(module => (
                    <li key={module} className="text-muted mb-2">
                        <strong>{module}:</strong>
                        <ul style={{ listStyleType: 'none', paddingLeft: '1rem' }}>
                            {permissionsByModule[module].map(label => <li key={label}>- {label}</li>)}
                        </ul>
                    </li>
                ))}
            </ul>
        );
    };

    const renderizarFormulario = () => {
        const groupedPermissions = permissoes.reduce<Record<string, (Permission & { label: string })[]>>((acc, permission) => {
            const { module, label } = getModuleAndLabel(permission.nome);
            if (!acc[module]) {
                acc[module] = [];
            }
            acc[module].push({ ...permission, label });
            return acc;
        }, {});

        const moduleOrder = ['Alunos', 'Documentos de Alunos', 'Colaboradores', 'Documentos de Colaboradores', 'Documentos Institucionais', 'Grupos', 'Tipos de Documento', 'Usuários', 'Outros'];
        const sortedModules = Object.keys(groupedPermissions).sort((a, b) => {
            const indexA = moduleOrder.indexOf(a);
            const indexB = moduleOrder.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return (
            <Form>
                <Form.Group className="mb-3" controlId="formGroupName">
                    <Form.Label>Nome do Grupo</Form.Label>
                    <Form.Control type="text" placeholder="Digite o nome do grupo" value={nomeForm} onChange={(e) => setNomeForm(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Permissões</Form.Label>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', padding: '1rem', borderRadius: '0.25rem' }}>
                        {sortedModules.map(moduleName => (
                            <div key={moduleName} className="mb-3 p-2 border rounded">
                                <h6 className="text-primary">{moduleName}</h6>
                                <hr className="my-2"/>
                                <Row>
                                    {groupedPermissions[moduleName].map(p => (
                                        <Col md={4} key={p.id}>
                                            <Form.Check
                                                type="switch"
                                                id={`perm-${p.id}`}
                                                label={p.label}
                                                checked={permissoesSelecionadas.has(p.id)}
                                                onChange={() => handlePermissionChange(p.id)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ))}
                    </div>
                </Form.Group>
            </Form>
        );
    };

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <h2 className="text-primary">Grupos e Permissões</h2>
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control type="text" placeholder="Pesquisar por nome..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={buscarDados} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Cadastrar Grupo" />
                </div>
            </div>

            {carregando ? (<div className="text-center my-5"><Spinner animation="border" /></div>) : (
                <Table borderless={true} hover responsive>
                    <thead className="thead-azul">
                        <tr>
                            <th style={{ width: '85%' }}>Nome do Grupo</th>
                            <th className="text-center" style={{ width: '15%' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gruposFiltrados.length > 0 ? (
                            gruposFiltrados.map(grupo => (
                                <React.Fragment key={grupo.id}>
                                    <tr className="border border-primary tr-azul-hover">
                                        <td onClick={() => abrirModalEdicao(grupo)} style={{ cursor: 'pointer' }}>
                                            {grupo.nome}
                                        </td>
                                        <td className="text-center align-middle">
                                            <Botao
                                                variant="link"
                                                className="p-0 text-primary me-2"
                                                title="Ver Permissões"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleRowExpansion(grupo.id);
                                                }}
                                                icone={<Icone nome={expandedRows.has(grupo.id) ? 'chevron-up' : 'chevron-down'} tamanho={20} />}
                                            />
                                            <Botao
                                                variant="link"
                                                className="p-0 text-danger"
                                                title="Excluir Grupo"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    abrirModalExclusao(grupo);
                                                }}
                                                icone={<Icone nome="trash" tamanho={20} />}
                                            />
                                        </td>
                                    </tr>
                                    {expandedRows.has(grupo.id) && (
                                        <tr className="border-start border-end border-bottom border-primary">
                                            <td colSpan={2} className="p-3" style={{ backgroundColor: '#f8f9fa' }}>
                                                <h6>Permissões:</h6>
                                                {renderGroupPermissions(grupo.permissions)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="text-center">Nenhum grupo encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={grupoEmEdicao ? `Editar Grupo: ${grupoEmEdicao.nome}` : "Cadastrar Novo Grupo"}
                conteudo={renderizarFormulario()}
                textoConfirmar={isSubmitting ? "Salvando..." : "Salvar"}
                textoCancelar="Cancelar"
                aoConfirmar={handleSalvar}
                aoCancelar={fecharModalForm}
                size="lg"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />
            <ModalGenerico
                visivel={modalExcluirVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o grupo "${grupoParaExcluir?.nome}"?`}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarExclusao}
                aoCancelar={() => setModalExcluirVisivel(false)}
            />
        </Container>
    );
};

export default HomeGroup;