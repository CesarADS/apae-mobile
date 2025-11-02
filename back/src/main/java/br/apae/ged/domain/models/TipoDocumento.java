package br.apae.ged.domain.models;

import br.apae.ged.application.dto.tipoDocumento.TipoDocumentoRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "tb_tipo_documento")
@SQLDelete(sql = "UPDATE tb_tipo_documento SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
public class TipoDocumento extends EntityID {

        @Column(name = "nome")
        private String nome;

        @Column(name = "validade")
        private Integer validade;

        private Boolean isAtivo;

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User usuario;

        @ManyToOne
        @JoinColumn(name = "id_usuario_alteracao")
        private User usuarioAlteracao;

        @Column(name = "data_alteracao")
        private LocalDateTime dataAlteracao;

        @Column(name = "data_registro")
        private LocalDateTime dataRegistro;
        @Column
        private boolean guardaPermanente;

        @Column
        private boolean institucional;

        @Column
        private boolean documentoAssinavel;

        @Column
        private boolean podeGerarDocumento;

        @Column
        private boolean colaborador;

        public TipoDocumento(String nome, Integer validade, User usuario) {
                this.nome = nome;
                this.validade = validade;
                this.usuario = usuario;
                this.dataRegistro = LocalDateTime.now();
                this.isAtivo = true;
        }

        public void atualizarDados(TipoDocumentoRequest request, User usuario) {
                this.setNome(request.nome());
                this.setValidade(request.validade());
                this.setUsuarioAlteracao(usuario);
                this.setDataAlteracao(LocalDateTime.now());
                this.setGuardaPermanente(request.guardaPermanente());
                this.setInstitucional(request.institucional());
                this.setDocumentoAssinavel(request.documentoAssinavel());
                this.setPodeGerarDocumento(request.gerarDocumento());
        }

        public TipoDocumento(TipoDocumentoRequest entrada, User usuario) {
                this.nome = entrada.nome();
                this.validade = entrada.validade();
                this.usuario = usuario;
                this.dataRegistro = LocalDateTime.now();
                this.isAtivo = true;
                this.guardaPermanente = entrada.guardaPermanente();
                this.institucional = entrada.institucional();
                this.documentoAssinavel = entrada.documentoAssinavel();
                this.podeGerarDocumento = entrada.gerarDocumento();
                this.colaborador = entrada.colaborador();
        }
}