package br.apae.ged.application.services;

import br.apae.ged.application.dto.colaborador.ColaboradorRequestDTO;
import br.apae.ged.application.dto.colaborador.ColaboradorResponseDTO;
import br.apae.ged.application.exceptions.BusinessException;
import br.apae.ged.application.exceptions.NotFoundException;
import br.apae.ged.domain.models.Colaborador;
import br.apae.ged.domain.models.Pessoa;
import br.apae.ged.domain.models.User;
import br.apae.ged.domain.repositories.ColaboradorRepository;
import br.apae.ged.domain.repositories.PessoaRepository;
import br.apae.ged.domain.utils.AuthenticationUtil;
import br.apae.ged.domain.valueObjects.CPF;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ColaboradorService {
    private final ColaboradorRepository colaboradorRepository;
    private final PessoaRepository pessoaRepository;
    private final LogService logService;

    public ColaboradorResponseDTO create(ColaboradorRequestDTO request) {
        CPF cpf = new CPF(request.cpf());
        Optional<Pessoa> pessoaExistenteOpt = pessoaRepository.findByCpf(cpf);

        if (pessoaExistenteOpt.isPresent()) {
            throw new BusinessException("Já existe uma pessoa (aluno ou colaborador) cadastrada com este CPF.");
        }

        Colaborador colaborador = new Colaborador();
        colaborador.setNome(request.nome());
        colaborador.setCpf(cpf);
        colaborador.setCargo(request.cargo());

        User user = AuthenticationUtil.retriveAuthenticatedUser();
        colaborador.setIsAtivo(true);
        colaborador.setCreatedBy(user);
        colaborador.setCreatedAt(LocalDateTime.now());

        Colaborador savedColaborador = colaboradorRepository.save(colaborador);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "CREATE",
                "Colaborador " + savedColaborador.getNome() + " criado com sucesso."
        );

        return ColaboradorResponseDTO.fromEntity(savedColaborador);
    }

    public Page<ColaboradorResponseDTO> findAll(Pageable pageable) {
        return colaboradorRepository.findAll(pageable)
                .map(ColaboradorResponseDTO::fromEntity);
    }

    public ColaboradorResponseDTO findById(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Colaborador não encontrado com o id: " + id));
        return ColaboradorResponseDTO.fromEntity(colaborador);
    }

    public ColaboradorResponseDTO update(Long id, ColaboradorRequestDTO request) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Colaborador não encontrado com o id: " + id));

        CPF cpf = new CPF(request.cpf());
        pessoaRepository.findByCpf(cpf).ifPresent(pessoa -> {
            if (!pessoa.getId().equals(colaborador.getId())) {
                throw new BusinessException("Já existe outra pessoa cadastrada com este CPF.");
            }
        });

        colaborador.setNome(request.nome());
        colaborador.setCpf(cpf);
        colaborador.setCargo(request.cargo());

        User user = AuthenticationUtil.retriveAuthenticatedUser();
        colaborador.setUpdatedBy(user);
        colaborador.setUpdatedAt(LocalDateTime.now());

        Colaborador updatedColaborador = colaboradorRepository.save(colaborador);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPDATE",
                "Colaborador " + updatedColaborador.getNome() + " atualizado com sucesso."
        );

        return ColaboradorResponseDTO.fromEntity(updatedColaborador);
    }

    public void delete(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Colaborador não encontrado com o id: " + id));

        colaboradorRepository.deleteById(id);

        User user = AuthenticationUtil.retriveAuthenticatedUser();
        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "DELETE",
                "Colaborador " + colaborador.getNome() + " deletado com sucesso."
        );
    }
}