package br.apae.ged.presentation.controllers;

import br.apae.ged.application.services.LogService;
import br.apae.ged.domain.models.UserLog;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping
    public ResponseEntity<Page<UserLog>> getLogs(Pageable pageable) {
        return ResponseEntity.ok(logService.getLogs(pageable));
    }
}
