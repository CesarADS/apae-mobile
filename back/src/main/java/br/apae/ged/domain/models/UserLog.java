package br.apae.ged.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_logs")
public class UserLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    @Column(name = "level")
    private String level;

    @Column(name = "logger")
    private String logger;

    @Column(name = "message")
    private String message;

    @Column(name = "nome")
    private String nome;

    @Column(name = "email")
    private String email;

    @Column(name = "acao")
    private String acao;
}
