package br.apae.ged.application.services;

import br.apae.ged.application.dto.tipoDocumento.TipoDocumentoRequest;
import br.apae.ged.application.dto.tipoDocumento.TipoDocumentoResponse;
import br.apae.ged.application.exceptions.BusinessException;
import br.apae.ged.application.exceptions.NotFoundException;
import br.apae.ged.domain.models.TipoDocumento;
import br.apae.ged.domain.models.User;
import br.apae.ged.domain.repositories.TipoDocumentoRepository;
import br.apae.ged.domain.repositories.specifications.TipoDocumentoSpecification;
import br.apae.ged.domain.utils.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final LogService logService;

    public TipoDocumentoResponse create(TipoDocumentoRequest request) {
        Optional<TipoDocumento> tipoExistenteOpt = tipoDocumentoRepository.findByNomeIgnoreCase(request.nome());

        if (tipoExistenteOpt.isPresent()) {

            TipoDocumento tipoExistente = tipoExistenteOpt.get();


            if (tipoExistente.getIsAtivo()) {

                throw new BusinessException("Já existe um tipo de documento ativo com este nome.");
            } else {

                User usuarioLogado = AuthenticationUtil.retriveAuthenticatedUser();
                tipoExistente.atualizarDados(request, usuarioLogado);
                tipoExistente.setIsAtivo(true);

                TipoDocumento updatedEntity = tipoDocumentoRepository.save(tipoExistente);
                logService.registrarAcao(
                        "INFO",
                        usuarioLogado.getNome(),
                        usuarioLogado.getEmail(),
                        "CREATE",
                        "Tipo de documento " + updatedEntity.getNome() + " reativado com sucesso."
                );
                return new TipoDocumentoResponse(updatedEntity);
            }
        } else {

            User usuarioLogado = AuthenticationUtil.retriveAuthenticatedUser();


            TipoDocumento novoTipoDocumento = new TipoDocumento(request, usuarioLogado);

            TipoDocumento savedEntity = tipoDocumentoRepository.save(novoTipoDocumento);
            String logMessage = String.format("Tipo de documento %s criado com sucesso.", savedEntity.getNome());
            logService.registrarAcao(
                    "INFO",
                    usuarioLogado.getNome(),
                    usuarioLogado.getEmail(),
                    "CREATE",
                    logMessage
            );
            return new TipoDocumentoResponse(savedEntity);
        }
    }

    public Page<TipoDocumentoResponse> findAll(String termoBusca, Pageable pageable) {
        Specification<TipoDocumento> spec = Specification.where(TipoDocumentoSpecification.isAtivo());

        if (termoBusca != null && !termoBusca.isBlank()) {
            spec = spec.and(TipoDocumentoSpecification.byNome(termoBusca));
        }

        return tipoDocumentoRepository.findAll(spec, pageable)
                .map(TipoDocumentoResponse::new);
    }

    public TipoDocumentoResponse findById(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de Documento não encontrado com o id: " + id));
        return new TipoDocumentoResponse(tipoDocumento);
    }


    public TipoDocumentoResponse update(Long id, TipoDocumentoRequest request) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de Documento não encontrado com o id: " + id));

        tipoDocumentoRepository.findByNomeIgnoreCase(request.nome()).ifPresent(outroTipo -> {
            if (!outroTipo.getId().equals(id)) {
                throw new BusinessException("Já existe outro tipo de documento ativo com este nome.");
            }
        });


        User user = AuthenticationUtil.retriveAuthenticatedUser();
        tipoDocumento.atualizarDados(request, user);

        TipoDocumento updatedEntity = tipoDocumentoRepository.save(tipoDocumento);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPDATE",
                "Tipo de documento " + updatedEntity.getNome() + " atualizado com sucesso."
        );

        return new TipoDocumentoResponse(updatedEntity);
    }


    public void changeStatus(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de Documento não encontrado com o id: " + id));

        tipoDocumento.setIsAtivo(!tipoDocumento.getIsAtivo());
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        tipoDocumento.setUsuarioAlteracao(user);
        tipoDocumento.setDataAlteracao(LocalDateTime.now());

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPDATE_STATUS",
                "Status do tipo de documento " + tipoDocumento.getNome() + " alterado para " + (tipoDocumento.getIsAtivo() ? "ATIVO" : "INATIVO")
        );

        tipoDocumentoRepository.save(tipoDocumento);

        
    }

    public List<TipoDocumentoResponse> findAllAtivos() {
        return tipoDocumentoRepository.findAllByIsAtivoTrueOrderByNomeAsc()
                .stream()
                .map(TipoDocumentoResponse::new)
                .collect(Collectors.toList());
    }

    public List<TipoDocumentoResponse> buscarTodosGuardaPermanente() {
        Specification<TipoDocumento> spec = Specification.where(TipoDocumentoSpecification.isAtivo())
                .and(TipoDocumentoSpecification.isGuardaPermanente())
                .and(TipoDocumentoSpecification.isNotInstitucional());
        
        return tipoDocumentoRepository.findAll(spec)
                .stream()
                .map(TipoDocumentoResponse::new)
                .collect(Collectors.toList());
    }

    public List<TipoDocumentoResponse> buscarTodosInstitucional(boolean gerar) {
        Specification<TipoDocumento> spec = Specification.where(TipoDocumentoSpecification.isAtivo())
                .and(TipoDocumentoSpecification.isInstitucional());

        if (gerar) {
            spec = spec.and(TipoDocumentoSpecification.isGeravel());
        } else {
            spec = spec.and(TipoDocumentoSpecification.isNotGeravel());
        }

        return tipoDocumentoRepository.findAll(spec)
                .stream()
                .map(TipoDocumentoResponse::new)
                .collect(Collectors.toList());
    }

    public List<TipoDocumentoResponse> buscarTodosAlunos(boolean gerar) {
        Specification<TipoDocumento> spec = Specification.where(TipoDocumentoSpecification.isAtivo())
                .and(TipoDocumentoSpecification.isNotInstitucional())
                .and(TipoDocumentoSpecification.isNotColaborador());

        if (gerar) {
            spec = spec.and(TipoDocumentoSpecification.isGeravel());
        } else {
            spec = spec.and(TipoDocumentoSpecification.isNotGeravel());
        }

        return tipoDocumentoRepository.findAll(spec)
                .stream()
                .map(TipoDocumentoResponse::new)
                .collect(Collectors.toList());
    }

    public List<TipoDocumentoResponse> buscarTodosColaboradores(boolean gerar) {
        Specification<TipoDocumento> spec = Specification.where(TipoDocumentoSpecification.isAtivo())
                .and(TipoDocumentoSpecification.isNotInstitucional())
                .and(TipoDocumentoSpecification.isColaborador());

        if (gerar) {
            spec = spec.and(TipoDocumentoSpecification.isGeravel());
        } else {
            spec = spec.and(TipoDocumentoSpecification.isNotGeravel());
        }

        return tipoDocumentoRepository.findAll(spec)
                .stream()
                .map(TipoDocumentoResponse::new)
                .collect(Collectors.toList());
    }
}