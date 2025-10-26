package br.apae.ged.application.services;

import br.apae.ged.domain.models.UserLog;
import br.apae.ged.domain.repositories.UserLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LogService {

    private final UserLogRepository userLogRepository;
    private static final Logger userLogger = LoggerFactory.getLogger("UserLogger");

    public void registrarAcao(String level,String nome, String email, String acao, String message) {
        // Log to database
        UserLog userLog = new UserLog();
        userLog.setEventDate(LocalDateTime.now());
        userLog.setLevel(level);
        userLog.setLogger("UserLogger");
        userLog.setMessage(message);
        userLog.setNome(nome);
        userLog.setEmail(email);
        userLog.setAcao(acao);
        userLogRepository.save(userLog);

        // Log to file
        userLogger.info(message);
    }

    public org.springframework.data.domain.Page<UserLog> getLogs(org.springframework.data.domain.Pageable pageable) {
        return userLogRepository.findAll(pageable);
    }
}
