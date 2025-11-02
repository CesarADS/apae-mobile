# Documentação de Paginação

## Endpoints com Paginação Implementada

### 1. Documentos Institucionais
- **Endpoint:** `GET /api/institucional/meus`
- **Permissão:** `DOCUMENTO_INSTITUCIONAL_READ`
- **Descrição:** Lista documentos institucionais enviados pelo usuário logado com paginação

### 2. Documentos de Pessoas (Alunos/Colaboradores)
- **Endpoint:** `GET /api/documentos/meus`
- **Permissão:** `DOCUMENTO_ALUNO_READ`
- **Descrição:** Lista documentos enviados pelo usuário logado com paginação

## Como usar a paginação

### Parâmetros de Query String

A paginação utiliza os seguintes parâmetros opcionais:

- **`page`**: Número da página (começa em 0)
  - Padrão: 0
  - Exemplo: `page=0`, `page=1`, `page=2`

- **`size`**: Quantidade de elementos por página
  - Padrão: 20
  - Exemplo: `size=10`, `size=50`, `size=100`

- **`sort`**: Ordenação dos resultados
  - Formato: `campo,direção` ou apenas `campo`
  - Direção: `asc` (ascendente) ou `desc` (descendente)
  - Padrão: Sem ordenação específica
  - Exemplos: 
    - `sort=titulo,asc` (ordena por título crescente)
    - `sort=dataUpload,desc` (ordena por data de upload decrescente)
    - `sort=titulo,asc&sort=dataUpload,desc` (múltiplos critérios)

### Exemplos de Requisições

#### 1. Primeira página com 10 itens
```bash
GET /api/institucional/meus?page=0&size=10
```

#### 2. Segunda página com 20 itens ordenados por título
```bash
GET /api/institucional/meus?page=1&size=20&sort=titulo,asc
```

#### 3. Documentos ordenados por data de upload (mais recentes primeiro)
```bash
GET /api/documentos/meus?sort=dataUpload,desc
```

#### 4. Terceira página com 50 itens, ordenados por título e data
```bash
GET /api/documentos/meus?page=2&size=50&sort=titulo,asc&sort=dataUpload,desc
```

### Estrutura da Resposta

A resposta paginada retorna um objeto `Page` com a seguinte estrutura:

```json
{
  "content": [
    {
      "id": 1,
      "titulo": "Documento Exemplo",
      "tipoDocumento": "Tipo A",
      "dataUpload": "2024-01-15T10:30:00",
      "nomeUsuario": "João Silva"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 47,
  "last": false,
  "first": true,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "numberOfElements": 10,
  "empty": false
}
```

### Campos Importantes da Resposta

- **`content`**: Array com os elementos da página atual
- **`totalPages`**: Total de páginas disponíveis
- **`totalElements`**: Total de elementos em todas as páginas
- **`size`**: Tamanho da página (quantos elementos por página)
- **`number`**: Número da página atual (começa em 0)
- **`first`**: `true` se for a primeira página
- **`last`**: `true` se for a última página
- **`empty`**: `true` se não houver elementos
- **`numberOfElements`**: Quantidade de elementos na página atual

## Observações Importantes

### Breaking Change - Mudança de Contrato da API

⚠️ **ATENÇÃO**: Os endpoints `/meus` agora retornam um objeto `Page` em vez de um array simples.

**Antes (versão sem paginação):**
```json
[
  { "id": 1, "titulo": "Doc 1", ... },
  { "id": 2, "titulo": "Doc 2", ... }
]
```

**Agora (versão com paginação):**
```json
{
  "content": [
    { "id": 1, "titulo": "Doc 1", ... },
    { "id": 2, "titulo": "Doc 2", ... }
  ],
  "totalPages": 1,
  "totalElements": 2,
  ...
}
```

### Migração de Código Frontend

Se você estava usando os endpoints `/meus`, precisará atualizar seu código:

**JavaScript/TypeScript - Antes:**
```javascript
const documentos = await response.json(); // Array direto
documentos.forEach(doc => console.log(doc.titulo));
```

**JavaScript/TypeScript - Agora:**
```javascript
const resultado = await response.json(); // Objeto Page
resultado.content.forEach(doc => console.log(doc.titulo));
```

### Valores Padrão

Quando você **não especificar** parâmetros de paginação, o Spring usa valores padrão:
- `page`: 0 (primeira página)
- `size`: 20 (itens por página)
- `sort`: Sem ordenação específica (ordem do banco)

Portanto, `GET /api/documentos/meus` é equivalente a `GET /api/documentos/meus?page=0&size=20`

## Campos Disponíveis para Ordenação

### Documentos Institucionais (`InstitucionalDTO`)
- `id`
- `titulo`
- `tipoDocumento`
- `dataDocumento`
- `ativo`
- `dataUpload`
- `nomeUsuario`

### Documentos de Pessoas (`DocumentDTO`)
- `id`
- `titulo`
- `tipoDocumento`
- `dataUpload`
- `isLast`
- `nomeUsuario`

## Boas Práticas

1. **Use paginação para listas grandes**: Sempre que possível, prefira os endpoints paginados para melhor performance
2. **Defina um tamanho de página adequado**: Entre 10 e 50 itens é geralmente ideal
3. **Ordene os resultados**: Use o parâmetro `sort` para garantir consistência na navegação entre páginas
4. **Valide a última página**: Use o campo `last` para saber quando parar de carregar mais páginas

## Exemplo de Implementação em JavaScript

```javascript
async function buscarDocumentosPaginados(page = 0, size = 20) {
  const response = await fetch(
    `/api/documentos/meus?page=${page}&size=${size}&sort=dataUpload,desc`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  console.log(`Página ${data.number + 1} de ${data.totalPages}`);
  console.log(`Total de documentos: ${data.totalElements}`);
  console.log(`Documentos nesta página: ${data.numberOfElements}`);
  
  // Acessar os documentos através de data.content
  data.content.forEach(doc => {
    console.log(`- ${doc.titulo} (${doc.dataUpload})`);
  });
  
  return data;
}

// Buscar primeira página
const primeiraPage = await buscarDocumentosPaginados(0, 20);

// Buscar próxima página se houver
if (!primeiraPage.last) {
  const segundaPage = await buscarDocumentosPaginados(1, 20);
}
```

## Testando com cURL

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"senha123"}' \
  | jq -r '.token')

# Buscar documentos paginados
curl -X GET "http://localhost:8080/api/documentos/meus?page=0&size=10&sort=dataUpload,desc" \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Ver apenas o total de páginas e elementos
curl -X GET "http://localhost:8080/api/institucional/meus?size=5" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{totalPages, totalElements, numberOfElements}'

# Buscar todos os documentos (primeira página com tamanho padrão 20)
curl -X GET "http://localhost:8080/api/documentos/meus" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.content | length'  # Mostra quantos documentos retornaram
```
