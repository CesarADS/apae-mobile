package br.apae.ged.domain.models;


import br.apae.ged.application.dto.aluno.AlunoRequestDTO;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Entity(name = "tb_endereco")
@SQLDelete(sql = "UPDATE tb_endereco SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
public class Endereco extends EntityID{

    private String bairro;
    private String rua;
    private int numero;
    private String complemento;
    private String cep;
    private LocalDateTime deletedAt;

    @OneToOne
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Alunos aluno;
    @ManyToOne
    @JoinColumn(name = "cidade_id", referencedColumnName = "id")
    private Cidade cidade;


    public Endereco(Cidade cidade,
                    String bairro,
                    String rua,
                    int numero,
                    String complemento,
                    String cep) {
        this.cidade = cidade;
        this.bairro = bairro;
        this.rua = rua;
        this.numero = numero;
        this.complemento = complemento;
        this.cep = cep;
    }

    public static Endereco paraEntidade(AlunoRequestDTO requestDTO, Cidade cidade){
        return new Endereco(
                cidade,
                requestDTO.bairro(),
                requestDTO.rua(),
                requestDTO.numero(),
                requestDTO.complemento(),
                requestDTO.cep()
        );
    }

    public void atualizarDados(AlunoRequestDTO atualizacao, Cidade cidade) {
        this.setBairro(atualizacao.bairro());
        this.setRua(atualizacao.rua());
        this.setNumero(atualizacao.numero());
        this.setCep(atualizacao.cep());
        this.setCidade(cidade);
        this.setComplemento(atualizacao.complemento());
    }
}
