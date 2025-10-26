package br.apae.ged.application.dto.document;

/**
 * DTO para transferir os dados de um arquivo para download.
 *
 * @param nomeArquivo  O nome original do arquivo para o cabeçalho Content-Disposition.
 * @param conteudo     Os bytes do arquivo.
 * @param tipoConteudo O MIME type do arquivo para o cabeçalho Content-Type.
 */
public record DownloadDTO(
        String nomeArquivo,
        byte[] conteudo,
        String tipoConteudo
) {
}
