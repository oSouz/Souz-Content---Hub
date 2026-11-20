# Souz Content Hub · Entrega 01 (v0.1.1)

Fundação do launcher desktop da Souz Content, com biblioteca para **BG Studio, Screen Capture, Grid Roll, Hunter, Lyra e LyricX**.

## O que funciona agora

- Interface desktop Electron + React + TypeScript: Início, Biblioteca, Loja, Licenças, Atualizações, Configurações.
- Catálogo inicial de 6 produtos, com filtro e pesquisa.
- Escolha e persistência de pasta **Effects Souz Content**.
- Instalação assistida de DLL local por produto FFGL, com verificação básica de cabeçalho PE, hash SHA-256 de cópia e backup da versão anterior.
- Exibição de quais plugins estão instalados (por presença de arquivo).
- Testes automatizados do mecanismo de instalação.

## O que ainda NÃO funciona

**Não há login real, ativação de licenças, pagamento, download de DLL de servidor, instalação de Lyra/LyricX ou integração automática com preferências do Resolume.** As telas desses recursos estão claramente identificadas como futuras entregas. A validação do PE não garante autenticidade nem segurança; apenas DLLs compiladas por fonte confiável devem ser instaladas. O app não verifica se as DLLs são FFGL válidas nem se o Resolume está aberto.

## Rodando no Windows

Pré-requisitos: Node.js LTS, npm, Windows 10/11.

```bash
npm install
npm run dev
```

Para compilar o frontend e testar o aplicativo empacotado em modo local:

```bash
npm run build
npm start
```

Para criar um instalador NSIS Windows (execute **em Windows**):

```bash
npm run dist:win
```

Testes:

```bash
npm test
```

## Como usar a instalação local

1. Execute o Hub, abra **Configurações** e escolha a pasta `Effects Souz Content` (ou mantenha a sugerida em Documentos).
2. No Resolume Arena, abra **Preferences → Video → FFGL Plugin Directories** e adicione a pasta configurada no Hub.
3. No Hub, abra **Biblioteca**, encontre um plugin e clique em **Instalar DLL**; selecione o DLL do build oficial do plugin correspondente.
4. Feche e reabra o Resolume para carregá-lo.

O Hub mantém as DLLs diretamente na pasta selecionada, e backups com extensão `.backup`. A pasta `Extra Effects` padrão continua sendo uma alternativa, mas o uso de pasta customizada é oficialmente suportado pelo Resolume.

## Arquitetura

```
src/                     # interface React e catálogo
 electron/main.cjs       # processo principal e operações locais
 electron/preload.cjs    # API IPC isolada (sem nodeIntegration)
 electron/install-core.cjs # rotina de instalação FFGL
 docs/                   # contrato futuro de licenciamento e roadmap
 tests/                  # testes Node
```

O frontend é isolado do Node, e operações de arquivos ficam em canais IPC explicitamente permitidos. O atualizador baixa em segundo plano e aplica a atualização do Hub ao fechar o aplicativo.

## Fonte oficial sobre diretórios FFGL
https://resolume.com/support/en/preferences

## Atualizações automáticas do Hub

Instale a versão 0.1.1 ou superior uma vez. O Hub para Windows consulta o canal estável ao iniciar e a cada quatro horas enquanto estiver aberto. A tela Atualizações acompanha a consulta, o download e a versão pronta para instalar. A atualização preserva a pasta de dados do Hub e as DLLs gerenciadas.

Para distribuir uma alteração, incremente a versão com `npm version patch --no-git-tag-version`, rode `npm ci`, `npm test` e `npm run dist:win`. Na release do GitHub com a tag correspondente (por exemplo, `v0.1.2`), publique juntos o instalador NSIS, o arquivo `latest.yml` e o `.exe.blockmap` gerados em `release/`. Use o nome do instalador indicado em `latest.yml` e o mesmo nome com sufixo `.blockmap` para o mapa de blocos. Preserve o conteúdo dos três arquivos. A release estável e seus arquivos precisam estar acessíveis sem login. Se o código ficar privado, configure um canal de distribuição público separado antes de distribuir o instalador. Credenciais de publicação ficam no ambiente de publicação.

Use assinatura Authenticode com o mesmo publicador nas versões de distribuição. O arquivo `latest.yml` inclui o SHA-512 do instalador associado. O fluxo atualiza o Hub e seu código empacotado. DLLs de produtos, Lyra e LyricX seguem seus próprios fluxos de instalação.
