package br.apae.ged.application.services;

import br.apae.ged.domain.models.Permission;
import br.apae.ged.domain.repositories.PermissionRepository;
import br.apae.ged.domain.utils.AuthenticationUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.apae.ged.domain.models.User;


import java.util.List;
import java.util.Optional;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private LogService logService;

    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }

    @Transactional
    public Permission create(Permission permission) {
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        Optional<Permission> existingPermission = permissionRepository.findByNome(permission.getNome());
        if (existingPermission.isPresent()) {
            throw new IllegalArgumentException("Uma permissão com o nome '" + permission.getNome() + "' já existe.");
        }
        String logMessage = String.format("Usuário '%s' registrou uma nova permissão: '%s'", user.getNome(), permission.getNome());
        logService.registrarAcao(
            "INFO",
            user.getNome(),
            user.getEmail(),
            "REGISTER_PERMISSION",
            logMessage
        );
        return permissionRepository.save(permission);
    }

    @Transactional
    public void delete(Long id) {
            User user = AuthenticationUtil.retriveAuthenticatedUser();
        if (!permissionRepository.existsById(id)) {
            throw new EntityNotFoundException("Permissão não encontrada com o ID: " + id);
        }
        permissionRepository.deleteById(id);
        String logMessage = String.format("Usuário '%s' removeu a permissão com ID: %d", user.getNome(), id);
        logService.registrarAcao(
            "INFO",
            user.getNome(),
            user.getEmail(),
            "DELETE_PERMISSION",
            logMessage
        );
    }
}