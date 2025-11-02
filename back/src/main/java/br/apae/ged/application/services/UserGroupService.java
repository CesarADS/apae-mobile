package br.apae.ged.application.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.apae.ged.domain.models.Permission;
import br.apae.ged.domain.models.User;
import br.apae.ged.domain.models.UserGroup;
import br.apae.ged.domain.repositories.PermissionRepository;
import br.apae.ged.domain.repositories.UserGroupRepository;
import br.apae.ged.domain.utils.AuthenticationUtil;
import jakarta.persistence.EntityNotFoundException;

@Service
public class UserGroupService {

    @Autowired
    private UserGroupRepository userGroupRepository;
    @Autowired
    private PermissionRepository permissionRepository;
    @Autowired
    private LogService logService;

    @Transactional
    public List<UserGroup> findAll() {
        return userGroupRepository.findAll();
    }

    @Transactional
    public UserGroup findById(Long id) {
        return userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Grupo não encontrado com o ID: " + id));
    }

    @Transactional
    public UserGroup create(UserGroup userGroup) {
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        String logMessage = String.format("Usuário '%s' registrou um novo grupo: '%s'", user.getNome(), userGroup.getNome());
        logService.registrarAcao(
            "INFO",
            user.getNome(),
            user.getEmail(),
            "REGISTER_GROUP",
            logMessage
        );
        return userGroupRepository.save(userGroup);
    }

    @Transactional
    public UserGroup update(Long id, UserGroup groupDetails) {
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        
        UserGroup existingGroup = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Grupo não encontrado com o ID: " + id));


        existingGroup.setNome(groupDetails.getNome());

        List<Permission> updatedPermissions = new ArrayList<>();
        if (groupDetails.getPermissions() != null && !groupDetails.getPermissions().isEmpty()) {

            List<Long> permissionIds = groupDetails.getPermissions().stream()
                    .map(Permission::getId)
                    .collect(Collectors.toList());


            updatedPermissions = permissionRepository.findAllById(permissionIds);


            if (updatedPermissions.size() != permissionIds.size()) {
                throw new EntityNotFoundException("Uma ou mais permissões não foram encontradas.");
            }
        }


        existingGroup.setPermissions(updatedPermissions);
        String logMessage = String.format("Usuário '%s' atualizou o grupo: '%s'", user.getNome(), groupDetails.getNome());
        logService.registrarAcao(
            "INFO",
            user.getNome(),
            user.getEmail(),
            "UPDATE_GROUP",
            logMessage
        );


        return userGroupRepository.save(existingGroup);
        
    }

    @Transactional
    public void delete(Long id) {
        findById(id);
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        String logMessage = String.format("Usuário '%s' excluiu o grupo com ID: %d", user.getNome(), id);
        logService.registrarAcao(
            "INFO",
            user.getNome(),
            user.getEmail(),
            "DELETE_GROUP",
            logMessage
        );
        userGroupRepository.deleteById(id);
    }
}