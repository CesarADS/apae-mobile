# 📸 Fluxo de Digitalização - GED APAE Mobile

## Visão Geral

O fluxo de digitalização permite que usuários capturem documentos físicos usando a câmera do celular e os enviem para o servidor de forma organizada e segura.

---

## 🔄 Fluxo Completo (Passo a Passo)

### **ETAPA 1: Seleção de Entidade**
**Arquivo:** `app/digitalization/select-entity.tsx`

O usuário escolhe o tipo de documento a ser digitalizado:

```
┌─────────────────────────────────┐
│  Selecione o tipo de documento  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  👨‍🎓 Aluno               │  │
│  │  Documentos de estudantes │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  👔 Colaborador            │  │
│  │  Documentos de funcionários│ │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🏢 Institucional          │  │
│  │  Documentos da instituição │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Saída:** `entityType` (aluno | colaborador | instituicao)

---

### **ETAPA 2: Preenchimento de Formulário**
**Arquivo:** `app/digitalization/form.tsx` (wrapper)
**Formulários específicos:**
- `forms/AlunoForm.tsx`
- `forms/ColaboradorForm.tsx`
- `forms/InstituicaoForm.tsx`

#### **Formulário de Aluno**
```
┌─────────────────────────────────┐
│  Documento de Aluno             │
│                                 │
│  Localização física: __________ │
│                                 │
│  Buscar aluno: ________________ │
│  ✓ João Silva - Mat: 12345     │
│                                 │
│  Tipo de documento:             │
│  [Histórico Escolar ▼]          │
│                                 │
│  Data do documento:             │
│  [12/11/2025 📅]                │
│                                 │
│  [Continuar para Digitalização] │
└─────────────────────────────────┘
```

**Campos:**
- **Localização física** (opcional) - onde o documento está arquivado
- **Aluno** (obrigatório) - busca com autocomplete
- **Tipo de documento** (obrigatório) - filtrado por entidade
- **Data do documento** (obrigatório) - datepicker

**Validações:**
- Aluno deve estar selecionado
- Tipo de documento não pode ser vazio
- Data não pode ser futura

**Saída:** `formData` (JSON serializado)

---

### **ETAPA 3: Captura com Scanner**
**Arquivo:** `app/digitalization/camera.tsx`

Abre o scanner nativo de documentos:

```
┌─────────────────────────────────┐
│  📷                             │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   [Documento detectado]   │  │
│  │   ┌─────────────────┐     │  │
│  │   │                 │     │  │
│  │   │   DOCUMENTO     │     │  │
│  │   │                 │     │  │
│  │   └─────────────────┘     │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Capturar]  [Descartar]        │
└─────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Detecção automática de bordas
- ✅ Correção de perspectiva
- ✅ Compressão automática (70% quality)
- ✅ Limite de 1 página por captura

**Biblioteca:** `react-native-document-scanner-plugin`

**Tratamento de erros:**
```typescript
// Detecção de cancelamento
if (error.includes('cancel') || error.includes('user')) {
  router.back(); // Volta sem erro
}

// Erro de permissão
if (error.includes('permission')) {
  Alert.alert('Permissão de câmera necessária');
}
```

**Saída:** `imageUri` (caminho da imagem capturada)

---

### **ETAPA 4: Preview e Ajustes**
**Arquivo:** `app/digitalization/crop.tsx`

O usuário visualiza o documento capturado:

```
┌─────────────────────────────────┐
│  Revisar Documento              │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    [Imagem capturada]     │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Recapturar]    [Confirmar]    │
└─────────────────────────────────┘
```

**Processamento:**
```typescript
const manipResult = await ImageManipulator.manipulateAsync(
  imageUri,
  [{ resize: { width: 2000 } }], // Redimensiona se > 2000px
  {
    compress: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  }
);
```

**Saída:** Página processada adicionada ao array `pages[]`

---

### **ETAPA 5: Gerenciamento de Páginas**
**Arquivo:** `app/digitalization/pages.tsx`

O usuário gerencia múltiplas páginas do documento:

```
┌─────────────────────────────────┐
│  Páginas capturadas             │
│  2 de 20 páginas                │
│                                 │
│  ┌────────┐  ┌────────┐         │
│  │ Página │  │ Página │         │
│  │   1    │  │   2    │         │
│  │  [🗑️]  │  │  [🗑️]  │         │
│  └────────┘  └────────┘         │
│                                 │
│  [+ Adicionar Página]           │
│  [Finalizar e Continuar]        │
└─────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Visualizar miniaturas das páginas
- ✅ Remover páginas indesejadas
- ✅ Adicionar mais páginas (até 20)
- ✅ Contador de páginas
- ✅ Validação de limite

**Limite de páginas:**
```typescript
const MAX_PAGES = 20;

if (pages.length >= MAX_PAGES) {
  Alert.alert(
    'Limite atingido',
    `Máximo de ${MAX_PAGES} páginas por documento.`
  );
}
```

**Saída:** Array de `pages[]` com todas as imagens

---

### **ETAPA 6: Upload para Servidor**
**Arquivo:** `app/digitalization/upload.tsx`
**Hook:** `useDocumentUpload.ts`

Processo automático após confirmar páginas:

```
┌─────────────────────────────────┐
│  Enviando Documento             │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━ 75%      │
│                                 │
│  Convertendo imagem 3/4 para PDF│
│                                 │
│  [Por favor, aguarde...]        │
└─────────────────────────────────┘
```

#### **Processo de Upload:**

**6.1. Geração de PDF**
```typescript
// Processamento SEQUENCIAL (previne crash de memória)
for (let i = 0; i < pages.length; i++) {
  // 1. Comprimir imagem
  const compressed = await ImageManipulator.manipulateAsync(
    page.uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.6, format: 'JPEG' }
  );
  
  // 2. Converter para base64
  const base64 = await FileSystem.readAsStringAsync(
    compressed.uri, 
    { encoding: 'base64' }
  );
  
  imagesBase64.push(`data:image/jpeg;base64,${base64}`);
}

// 3. Gerar HTML com imagens
const html = `
  <html>
    <body>
      ${imagesBase64.map(img => `
        <div class="page">
          <img src="${img}" />
        </div>
      `).join('')}
    </body>
  </html>
`;

// 4. Converter para PDF
const { uri } = await Print.printToFileAsync({ html });
```

**6.2. Validação**
```typescript
const pdfInfo = await FileSystem.getInfoAsync(pdfUri);

if (!pdfInfo.exists) {
  throw new Error('PDF não foi gerado');
}

if (pdfInfo.size > 40 * 1024 * 1024) { // 40MB
  throw new Error('PDF muito grande');
}
```

**6.3. Preparação do FormData**
```typescript
const uploadFormData = new FormData();

// Metadados
uploadFormData.append('tipoDocumento', formData.tipoDocumento);
uploadFormData.append('dataDocumento', formData.dataDocumento);
uploadFormData.append('localizacao', formData.localizacao);

// Arquivo
uploadFormData.append('file', {
  uri: pdfUri,
  type: 'application/pdf',
  name: `documento_${Date.now()}.pdf`,
});
```

**6.4. Envio para API**
```typescript
const endpoint = entityType === 'instituicao' 
  ? '/institucional/upload'
  : `/documentos/create/${pessoaId}`;

const response = await api.request(endpoint, {
  method: 'POST',
  body: uploadFormData,
});
```

**6.5. Limpeza**
```typescript
// Deletar PDF temporário
await FileSystem.deleteAsync(pdfUri, { idempotent: true });

// Deletar imagens comprimidas
for (const tempUri of compressedImages) {
  await FileSystem.deleteAsync(tempUri, { idempotent: true });
}
```

---

### **ETAPA 7: Conclusão**

**Sucesso:**
```
┌─────────────────────────────────┐
│  ✅ Documento Enviado           │
│                                 │
│  Seu documento foi digitalizado │
│  e enviado com sucesso!         │
│                                 │
│  [Digitalizar Outro]            │
│  [Voltar ao Dashboard]          │
└─────────────────────────────────┘
```

**Erro:**
```
┌─────────────────────────────────┐
│  ❌ Erro no Envio               │
│                                 │
│  Não foi possível enviar o      │
│  documento. Verifique sua       │
│  conexão e tente novamente.     │
│                                 │
│  [Tentar Novamente]             │
│  [Voltar]                       │
└─────────────────────────────────┘
```

---

## 📊 Diagrama de Fluxo

```
START
  │
  ▼
┌─────────────┐
│Select Entity│ entityType
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Fill Form   │ formData
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Camera Scan │ imageUri
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Crop/Review │ processed image
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Manage Pages │ pages[] (1-20)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Upload    │
│  - Generate │
│  - Validate │
│  - Send     │
│  - Cleanup  │
└──────┬──────┘
       │
       ├─→ Success → Dashboard
       │
       └─→ Error → Retry/Cancel
```

---

## ⚙️ Configurações e Limites

| Parâmetro | Valor | Motivo |
|-----------|-------|--------|
| Max páginas | 20 | Prevenir PDFs > 40MB |
| Max tamanho PDF | 40MB | Limite de upload |
| Compress quality | 60-90% | Balancear qualidade/tamanho |
| Image resize | 1200px | Suficiente para leitura |
| Scanner quality | 70% | Otimizar detecção de bordas |
| Request timeout | 30s | Evitar espera infinita |
| Retry attempts | 3x | Resiliência de rede |

---

## 🛡️ Validações e Proteções

### **No Formulário**
- ✅ Campos obrigatórios marcados
- ✅ Validação antes de prosseguir
- ✅ Feedback visual de erros

### **No Scanner**
- ✅ Detecção de cancelamento
- ✅ Fallback para imagem original se processing falhar
- ✅ Proteção contra unmount

### **No Upload**
- ✅ Validação de número de páginas
- ✅ Validação de tamanho de PDF
- ✅ Retry automático em falha de rede
- ✅ Timeout de 30 segundos
- ✅ Limpeza garantida de temporários

---

## 🚀 Otimizações

### **Memória**
- Processamento sequencial (não parallel)
- Compressão agressiva (60-90%)
- Limpeza imediata de temporários
- Limite de páginas

### **Performance**
- Resize antes de processar
- Base64 só quando necessário
- PDF generation otimizada
- Cleanup em background

### **UX**
- Mensagens de progresso detalhadas
- Loading states em cada etapa
- Feedback imediato de erros
- Navegação intuitiva

---

## 📱 Exemplo Real

**Cenário:** Digitalizar histórico escolar de 5 páginas

1. **Select:** Aluno
2. **Form:** 
   - Localização: "Arquivo A - Pasta 123"
   - Aluno: "João Silva - Mat 12345"
   - Tipo: "Histórico Escolar"
   - Data: "15/03/2024"
3. **Scan:** 5 capturas
4. **Pages:** Visualizar e confirmar
5. **Upload:**
   - Compress 5 imagens: ~30s
   - Generate PDF: ~10s
   - Upload 2.5MB: ~5s
6. **Success:** Documento #456 criado

**Tempo total:** ~60 segundos

---

## 🔧 Troubleshooting

### **Scanner não abre**
- Verificar permissão de câmera
- Reiniciar app
- Verificar se outro app está usando câmera

### **PDF muito grande**
- Reduzir número de páginas
- Dividir em múltiplos documentos

### **Upload falha**
- Verificar conexão de internet
- Aguardar retry automático (3x)
- Verificar se servidor está online

### **Imagem cortada**
- Recapturar com melhor iluminação
- Garantir que bordas são detectadas
- Usar fundo contrastante

---

## 📚 Referências

- [react-native-document-scanner-plugin](https://github.com/websitebeaver/react-native-document-scanner)
- [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)
- [expo-print](https://docs.expo.dev/versions/latest/sdk/print/)
