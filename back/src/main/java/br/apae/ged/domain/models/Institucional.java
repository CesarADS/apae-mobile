package br.apae.ged.domain.models;

import br.apae.ged.application.dto.documentoIstitucional.UploadInstitucionalRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Getter @Setter @Table(name = "tb_documentos_institucionais")
@SQLDelete(sql = "UPDATE tb_documentos_institucionais SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
public class Institucional extends EntityID {

    private String titulo;
    private String tipoConteudo;
    private String localizacao;
    private LocalDateTime dataUpload;
    private LocalDateTime dataDownload;
    private LocalDateTime dataUpdate;
    private LocalDate dataDocumento;
    @Column(name = "is_ativo", nullable = false)
    private boolean isAtivo = true;
    @ManyToOne
    @JoinColumn(name = "document_type_id")
    private TipoDocumento tipoDocumento;
    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
    @ManyToOne
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    @ManyToOne
    @JoinColumn
    private User createdBy;
    @JoinColumn
    private User downloadedBy;
    private LocalDate validade;

    @OneToOne(mappedBy = "institucional", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private InstitucionalContent institucionalContent;

    @OneToMany(mappedBy = "institucional", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AssinaturaInstitucional> assinaturas = new ArrayList<>();


    public Institucional() {}

    public Institucional (UploadInstitucionalRequest entrada, String base64, String tConteudo, TipoDocumento tipoDoc, User user){
        if (entrada.nome() == null || entrada.nome().isBlank()) {
            String tipo = tipoDoc != null ? tipoDoc.getNome() : "Documento";
            String data = LocalDate.now().toString();
            this.titulo = tipo + "_" + data;
        } else {
            this.titulo = entrada.nome();
        }
        this.tipoConteudo = tConteudo;
        this.isAtivo = true;
        this.dataUpload = LocalDateTime.now();
        this.dataDocumento = entrada.dataCriacao();
        this.tipoDocumento = tipoDoc;
        if (tipoDoc != null && tipoDoc.getValidade() != null) {
            this.validade = entrada.dataCriacao().plusDays(tipoDoc.getValidade());
        }
        this.uploadedBy = user;
        this.createdBy = user;

        InstitucionalContent content = new InstitucionalContent();
        content.setConteudo(base64);
        content.setInstitucional(this);
        this.setInstitucionalContent(content);
    }
}
