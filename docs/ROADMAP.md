# Souz Content Hub — roteiro de produto

| Entrega | Escopo | Estado |
|---|---|---|
| 01 | Electron, UI, catálogo, pasta FFGL, instalação assistida de DLL local | Implementado em código; empacotamento Windows não validado |
| 02 | Souz ID: login, recuperação, sessões, contas | Pendente |
| 03 | Souz License Server e SDK para Lyra, LyricX e FFGL | Pendente |
| 04 | Publicador de artefatos e instalador assistido de apps | Pendente |
| 05 | Atualizações autenticadas por assinatura e rollback | Pendente |
| 06 | Souz Store com gateway de pagamentos e webhooks | Pendente |
| 07 | Souz Admin: clientes, produtos, licenças, dispositivos, releases | Pendente |
| 08 | Testes de produção, segurança, assinatura de instalador, lançamento | Pendente |

## Contrato de produto planejado

- `productId`: identificador imutável, ex.: `lyricx`, `lyra`, `bg-studio`.
- `kind`: `desktop-app` ou `ffgl-plugin`.
- `os`/`arch`: compatibilidade de plataforma e arquitetura.
- `version`: semver do release e versão mínima do Hub.
- `artifact`: URL assinada de download, bytes, SHA-256, assinatura do manifesto e publisher.
- `license`: entitlement por conta, validade, máximo de dispositivos, política offline.
- `install`: instruções de instalação por tipo, com preflight e rollback.

## Princípios

1. Licença deve ser validada pelos produtos, **não só pelo launcher**.
2. A validação offline usa tokens assinados pelo backend e carência por tipo de licença.
3. A autenticação e os segredos ficam no servidor; jamais embutir chaves privadas no app.
4. Plugins FFGL **não** devem fazer requests síncronos durante o render de frames.
5. Atualizações exigem consentimento e são bloqueadas durante o uso em programas ao vivo.
6. O número de dispositivos é vinculado à conta e à licença, com revogação auditável.
7. Nunca confiar em flags de cliente para liberar pagamentos/licenças.
