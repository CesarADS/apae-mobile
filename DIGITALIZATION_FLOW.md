# Fluxo de Digitalização - Documentação

## Visão Geral
Sistema completo de digitalização de documentos com 6 etapas implementadas.

## Fluxo Completo

### 📱 Dashboard → Botão "Digitalizar Documento"
- **Arquivo**: `app/dashboard.tsx`
- **Ação**: Navega para `./digitalization/select-entity`

---

### 1️⃣ Seleção de Entidade
- **Arquivo**: `app/digitalization/select-entity.tsx`
- **Opções**:
  - 👨‍🎓 Aluno
  - 👔 Colaborador
  - 🏢 Instituição
- **Navegação**: `./form?entityType={tipo}`

---

### 2️⃣ Formulário de Dados
- **Arquivo**: `app/digitalization/form.tsx`
- **Subcomponentes**:
  - `forms/AlunoForm.tsx` - Busca aluno, tipo doc, data
  - `forms/ColaboradorForm.tsx` - Busca colaborador, tipo doc, data
  - `forms/InstituicaoForm.tsx` - Título, tipo doc, data
- **Validação**: Formulários validam campos obrigatórios
- **Navegação**: `./camera` com formData

---

### 3️⃣ Captura de Imagem
- **Arquivo**: `app/digitalization/camera.tsx`
- **Recursos**:
  - ✅ Permissões de câmera
  - ✅ Guias visuais A4 (proporção 1:1.414)
  - ✅ Cantos destacados em verde
  - ✅ Flip câmera (frontal/traseira)
  - ✅ Preview da imagem capturada
  - ✅ Opção "Tirar Outra"
- **Navegação**: `./crop` com imageUri

---

### 4️⃣ Ajuste de Imagem
- **Arquivo**: `app/digitalization/crop.tsx`
- **Processamento**:
  - ✅ Redimensionamento (max 2000px largura)
  - ✅ Compressão JPEG (0.9)
  - ✅ Conversão para base64
  - ✅ Integração com expo-image-manipulator
- **Navegação**: `./pages` com página processada

---

### 5️⃣ Gerenciamento de Páginas
- **Arquivo**: `app/digitalization/pages.tsx`
- **Funcionalidades**:
  - ✅ Grid 2 colunas com preview
  - ✅ Numeração de páginas
  - ✅ Botão remover por página
  - ✅ "Adicionar Página" (retorna à câmera)
  - ✅ "Finalizar" quando tem ≥1 página
- **Navegação**: 
  - Adicionar → volta para `./camera` com existingPages
  - Finalizar → `./upload` com todas as páginas

---

### 6️⃣ Upload do Documento
- **Arquivo**: `app/digitalization/upload.tsx`
- **Hook**: `hooks/useDocumentUpload.ts`
- **Processo**:
  1. Gera PDF com expo-print (todas as páginas)
  2. Converte PDF para base64
  3. Prepara payload conforme entidade:
     - **Aluno/Colaborador**: `POST /documentos/create/{pessoaId}`
     - **Instituição**: `POST /institucional/upload`
  4. Envia documento
  5. Limpa arquivo temporário
- **UI**:
  - ✅ Loading com barra de progresso
  - ✅ Tela de sucesso com ícone verde
  - ✅ Tela de erro com ícone vermelho
  - ✅ Opções: "Digitalizar Outro" ou "Voltar ao Início"

---

## Dependências Instaladas
```bash
npm install @react-native-picker/picker
npm install @react-native-community/datetimepicker
npm install expo-image-manipulator
npm install expo-print expo-file-system
```

## Estrutura de Arquivos
```
app/
  digitalization/
    select-entity.tsx      # Etapa 1
    form.tsx               # Etapa 2 (orquestrador)
    forms/
      AlunoForm.tsx        # Formulário específico
      ColaboradorForm.tsx  # Formulário específico
      InstituicaoForm.tsx  # Formulário específico
    camera.tsx             # Etapa 3
    crop.tsx               # Etapa 4
    pages.tsx              # Etapa 5
    upload.tsx             # Etapa 6

hooks/
  useDocumentUpload.ts     # Lógica de upload e PDF

types/
  digitalization.ts        # Tipos do fluxo
```

## Tipos Principais
```typescript
type EntityType = 'aluno' | 'colaborador' | 'instituicao';

interface CapturedPage {
  uri: string;
  base64?: string;
}

interface DocumentFormData {
  entityType: EntityType;
  formData: any;  // Varia por entidade
  pages: CapturedPage[];
}
```

## Backend Integration
- **Aluno/Colaborador**: `POST /documentos/create/{pessoaId}`
  ```json
  {
    "tipoDocumento": "string",
    "dataDocumento": "date",
    "fileBase64": "string",
    "fileName": "string"
  }
  ```

- **Instituição**: `POST /institucional/upload`
  ```json
  {
    "titulo": "string",
    "tipoDocumento": "string",
    "dataDocumento": "date",
    "fileBase64": "string",
    "fileName": "string"
  }
  ```

## Features Implementadas
✅ 6 etapas completas do fluxo
✅ Validação de formulários
✅ Captura com guias visuais
✅ Processamento de imagem
✅ Múltiplas páginas por documento
✅ Geração de PDF multi-página
✅ Upload com progresso
✅ Tratamento de erros
✅ Navegação fluida entre etapas
✅ Feedback visual em todas as etapas

## Status
🎉 **Implementação Completa** - Pronto para testes!
