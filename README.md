# AFKbotAura67426169

Bot AFK para manter o servidor Minecraft Aternos ativo, com reconexão automática e dashboard web compatível com Railway.

## Configuração aplicada

- IP: `Aurablock-0vgs.aternos.me`
- Porta: `41971`
- Nome: `AFKbotAura67426169`
- Versão informada pelo usuário: `26.1 Java`
- Configuração de protocolo: `auto` (a versão `26.1` não é um identificador aceito pelo Mineflayer)

## Atenção sobre a versão

O Mineflayer precisa reconhecer a versão no formato aceito pelo protocolo do Minecraft. Como `26.1` não é reconhecida como versão de protocolo, o projeto usa `"auto"`. Se o servidor recusar a conexão, abra `settings.json` e troque `version` pela versão exata exibida no Aternos, por exemplo `1.21.4`.

## Execução local

```bash
npm install
npm start
```

O painel ficará em `http://localhost:3000`.

## Deploy no Railway

1. Crie um repositório GitHub e envie estes arquivos.
2. No Railway, crie um projeto a partir do repositório.
3. O Railway executará `npm start` automaticamente.
4. Em **Settings > Networking**, gere um domínio para visualizar o painel.
5. No Aternos, deixe `Cracked/Pirata` ativado. Se a whitelist estiver ativa, adicione `AFKbotAura67426169`.
6. Mantenha o servidor Aternos iniciado antes de verificar o dashboard.

Não coloque senhas, tokens ou chaves no repositório.
