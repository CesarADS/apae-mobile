# 📋 Política de Privacidade - GED APAE Mobile

**Última atualização:** 12 de novembro de 2025

---

## 1. Introdução

A **APAE** ("nós", "nosso" ou "nossa") opera o aplicativo móvel **GED APAE** (doravante referido como "Serviço").

Esta página informa você sobre nossas políticas em relação à coleta, uso e divulgação de dados pessoais quando você usa nosso Serviço e as escolhas que você tem associadas a esses dados.

Usamos seus dados para fornecer e melhorar o Serviço. Ao usar o Serviço, você concorda com a coleta e uso de informações de acordo com esta política.

---

## 2. Informações Coletadas

### 2.1. Informações Fornecidas por Você

Coletamos as seguintes informações quando você usa nosso aplicativo:

#### **Informações de Conta**
- Nome completo
- E-mail
- CPF (para autenticação)
- Perfil de acesso (permissões do sistema)

#### **Dados de Documentos**
- Informações de alunos (nome, matrícula)
- Informações de colaboradores (nome, cargo)
- Informações institucionais
- Tipo de documento
- Data do documento
- Localização física do documento

#### **Arquivos**
- Imagens capturadas pela câmera (documentos digitalizados)
- PDFs gerados a partir das imagens

### 2.2. Informações Coletadas Automaticamente

#### **Dados de Dispositivo**
- Tipo de dispositivo
- Sistema operacional e versão
- Identificador único do dispositivo
- Endereço IP

#### **Dados de Uso**
- Data e hora de acesso
- Páginas visitadas no aplicativo
- Tempo de uso
- Ações realizadas (login, upload, etc.)
- Logs de erro e crash reports

### 2.3. Permissões do Aplicativo

O aplicativo solicita as seguintes permissões:

- **📷 Câmera:** Para capturar imagens de documentos
- **📁 Armazenamento:** Para salvar temporariamente imagens antes do upload
- **🌐 Internet:** Para enviar documentos ao servidor

---

## 3. Como Usamos Suas Informações

Usamos as informações coletadas para:

### 3.1. Prestação do Serviço
- ✅ Autenticar e verificar sua identidade
- ✅ Gerenciar seu acesso ao sistema
- ✅ Processar e armazenar documentos digitalizados
- ✅ Organizar documentos por entidade (aluno, colaborador, instituição)

### 3.2. Melhorias e Manutenção
- ✅ Monitorar e analisar tendências de uso
- ✅ Detectar e prevenir problemas técnicos
- ✅ Desenvolver novos recursos e funcionalidades
- ✅ Melhorar a experiência do usuário

### 3.3. Comunicação
- ✅ Enviar notificações sobre o status de uploads
- ✅ Informar sobre atualizações do aplicativo
- ✅ Responder a suas solicitações de suporte

### 3.4. Segurança
- ✅ Proteger contra fraudes e abusos
- ✅ Verificar conformidade com nossos termos de uso
- ✅ Cumprir obrigações legais

---

## 4. Como Armazenamos Suas Informações

### 4.1. Armazenamento Local (Dispositivo)

**Token de autenticação:**
- Armazenado criptografado usando `expo-secure-store`
- Utiliza Keychain (iOS) ou EncryptedSharedPreferences (Android)
- Expira automaticamente após período de inatividade
- Removido ao fazer logout

**Imagens temporárias:**
- Salvas no cache do aplicativo durante a digitalização
- Automaticamente deletadas após upload bem-sucedido
- Nunca armazenadas permanentemente no dispositivo

### 4.2. Armazenamento no Servidor

**Banco de Dados:**
- Hospedado em servidor seguro
- Conexão criptografada via HTTPS
- Backup regular automatizado
- Acesso restrito por autenticação

**Arquivos (PDFs):**
- Armazenados em sistema de arquivos do servidor
- Organizados por entidade e tipo
- Proteção contra acesso não autorizado

---

## 5. Compartilhamento de Informações

### 5.1. Não Compartilhamos Dados com Terceiros

Seus dados pessoais **NÃO** são:
- ❌ Vendidos a terceiros
- ❌ Compartilhados com anunciantes
- ❌ Usados para marketing externo
- ❌ Transferidos para outros países

### 5.2. Compartilhamento Interno

Dados são compartilhados apenas com:
- ✅ Usuários autorizados da APAE (conforme permissões)
- ✅ Administradores do sistema (para manutenção)

### 5.3. Requisitos Legais

Podemos divulgar suas informações se:
- 📜 Exigido por lei ou ordem judicial
- 🛡️ Necessário para proteger direitos e segurança
- ⚖️ Para cumprir processos legais

---

## 6. Segurança dos Dados

Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:

### 6.1. Segurança de Transmissão
- ✅ Conexão HTTPS criptografada (TLS 1.2+)
- ✅ Certificados SSL válidos
- ✅ Validação de certificados

### 6.2. Segurança de Armazenamento
- ✅ Tokens criptografados no dispositivo
- ✅ Senhas hasheadas no servidor (bcrypt)
- ✅ Backup automático com criptografia

### 6.3. Segurança de Acesso
- ✅ Autenticação obrigatória (login/senha)
- ✅ Tokens JWT com expiração
- ✅ Validação de permissões em cada operação
- ✅ Logout automático após inatividade

### 6.4. Medidas Adicionais
- ✅ Error boundaries para prevenir vazamento de dados em crashes
- ✅ Logs sanitizados (sem dados sensíveis)
- ✅ Limpeza automática de arquivos temporários

---

## 7. Seus Direitos (LGPD)

De acordo com a **Lei Geral de Proteção de Dados (LGPD)**, você tem os seguintes direitos:

### 7.1. Direito de Acesso
- 📖 Solicitar cópia dos seus dados pessoais

### 7.2. Direito de Retificação
- ✏️ Corrigir dados pessoais incorretos ou desatualizados

### 7.3. Direito de Exclusão
- 🗑️ Solicitar a exclusão dos seus dados (sujeito a obrigações legais)

### 7.4. Direito de Portabilidade
- 📦 Receber seus dados em formato estruturado

### 7.5. Direito de Revogação de Consentimento
- 🚫 Revogar consentimento a qualquer momento

### 7.6. Direito de Informação
- ℹ️ Saber com quem seus dados foram compartilhados

### 7.7. Como Exercer Seus Direitos
Para exercer qualquer desses direitos, entre em contato:
- **E-mail:** apaesistema@gmail.com
- **Assunto:** "LGPD - Solicitação de Dados"

---

## 8. Retenção de Dados

### 8.1. Dados de Conta
- Mantidos enquanto sua conta estiver ativa
- Deletados 30 dias após encerramento da conta

### 8.2. Documentos Digitalizados
- Mantidos indefinidamente para fins de arquivo institucional
- Podem ser deletados mediante solicitação expressa

### 8.3. Logs de Acesso
- Mantidos por 6 meses para fins de segurança
- Automaticamente deletados após esse período

---

## 9. Privacidade de Menores

O aplicativo **NÃO** é destinado a menores de 18 anos.

Não coletamos intencionalmente informações de menores. Se você é pai/mãe ou responsável e acredita que seu filho nos forneceu dados pessoais, entre em contato para que possamos tomar as medidas necessárias.

---

## 10. Cookies e Tecnologias Similares

### 10.1. O Que Usamos
- ✅ Tokens de autenticação (JWT)
- ✅ Armazenamento local criptografado

### 10.2. O Que NÃO Usamos
- ❌ Cookies de rastreamento
- ❌ Cookies de publicidade
- ❌ Analytics de terceiros (Google Analytics, etc.)

---

## 11. Atualizações desta Política

Podemos atualizar nossa Política de Privacidade periodicamente.

Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a data de "Última atualização" no topo.

Recomendamos que você revise esta Política periodicamente.

---

## 12. Transferência Internacional de Dados

Seus dados são armazenados e processados **exclusivamente no Brasil**.

Não realizamos transferência internacional de dados.

---

## 13. Incidentes de Segurança

Em caso de incidente de segurança que possa afetar seus dados:

1. ✅ Você será notificado em até 72 horas
2. ✅ Autoridades competentes serão informadas
3. ✅ Medidas corretivas serão implementadas
4. ✅ Relatório de incidente será disponibilizado

---

## 14. Base Legal para Processamento

Processamos seus dados com base nas seguintes bases legais (LGPD):

- **Execução de contrato:** Para fornecer o serviço contratado
- **Obrigação legal:** Para cumprir requisitos legais e regulatórios
- **Interesses legítimos:** Para melhorar e proteger nosso serviço
- **Consentimento:** Quando aplicável e solicitado explicitamente

---

## 15. Encarregado de Dados (DPO)

Para questões relacionadas à proteção de dados, entre em contato com nosso Encarregado de Dados:

**E-mail:** apaesistema@gmail.com  
**Assunto:** "Encarregado de Dados - LGPD"

---

## 16. Contato

Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:

**E-mail:** apaesistema@gmail.com  
**Assunto:** "Política de Privacidade - GED APAE"

---

## 17. Conformidade

Este aplicativo está em conformidade com:

- ✅ **LGPD** (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)
- ✅ **Marco Civil da Internet** (Lei nº 12.965/2014)
- ✅ Boas práticas de segurança da informação

---

## 18. Consentimento

Ao usar o aplicativo GED APAE, você consente com esta Política de Privacidade.

---

**Desenvolvido por:**  
César Augusto  
GitHub: [@CesarADS](https://github.com/CesarADS)

---

**APAE - Associação de Pais e Amigos dos Excepcionais**  
Todos os direitos reservados © 2025
