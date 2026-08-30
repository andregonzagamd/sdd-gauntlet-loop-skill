# CLAUDE.md — repositório da skill SDD + Gauntlet Loop

Este repositório **é** uma skill de engenharia agêntica. Ele não é uma aplicação:
o produto aqui são arquivos markdown que outros agentes leem. Toda mudança é uma
mudança de instrução, não de código.

> Handoff de 30/08/2026 — construído numa sessão do Claude (Cowork) a partir de um
> brainstorm no NotebookLM. Este arquivo existe para você entrar no contexto sem
> ter que reconstruir o raciocínio.

## O que a skill faz

Junta três técnicas numa pipeline só:

| Camada | Técnica | Responde |
|---|---|---|
| Planejamento | Spec-Driven Development | o que exatamente vamos construir, e o que conta como pronto? |
| Topologia | Diamond Graph | quem trabalha em quê, em paralelo, e onde converge? |
| Qualidade | Gauntlet Loop | quem diz que está bom, e quando o loop para? |

**A regra que sustenta tudo o resto: quem escreve o código nunca decide se ele passou.**

Fases: `bootstrap → spec (sem código) → contract → fan-out de builders → gauntlet de
críticos → integração → arquivamento`.

## Mapa do repositório

```
install.sh                            # --global, --agent cursor|claude|codex|all, --no-templates
README.md                             # PT-BR, é a porta de entrada pra quem clona
skills/sdd-gauntlet-loop/
├── SKILL.md                          # a pipeline: princípios, 6 fases, paradas, anti-padrões
├── references/                       # lidos SÓ quando a fase começa (progressive disclosure)
│   ├── phase-1-spec.md
│   ├── phase-2-contract.md
│   ├── phase-3-graph-gauntlet.md     # ondas, prompts de dispatch, protocolo de estagnação
│   └── phase-4-integrate-archive.md
└── assets/                           # templates copiados pro projeto alvo pelo install.sh
    ├── AGENTS.md  contract.md  progress.md
agents/
├── spec-writer.md                    # escreve spec, proibido de escrever código
├── builder.md                        # um nó, só nos arquivos declarados, não se auto-aprova
├── harsh-critic.md                   # contexto limpo, PASS/FAIL com file:line, não edita nada
└── integrator.md                     # costura os nós, roda a suíte completa
commands/                             # uma fase por comando, pra rodar com aprovação no meio
├── sdd-spec.md  sdd-contract.md  sdd-gauntlet.md  sdd-integrate.md  sdd-archive.md
```

## Decisões já tomadas — não desfaça sem motivo

1. **OpenSpec é opcional, nunca dependência.** Se existir `openspec/` ou o CLI, a Fase 1 usa
   `/opsx propose` e a Fase 5 `/opsx archive`. Senão a skill gera os mesmos três artefatos
   sozinha. A pipeline não pode quebrar por falta de ferramenta instalada.
2. **Skill em inglês, README em PT-BR.** Instrução pra agente em inglês é mais portável entre
   Cursor / Claude Code / Codex / Gemini.
3. **Uma cópia só dos templates**, em `skills/sdd-gauntlet-loop/assets/`. Não recrie uma pasta
   `templates/` na raiz — foi removida de propósito, porque duas cópias sempre divergem.
4. **`SKILL.md` fica enxuto (~1200 palavras).** Detalhe vai pra `references/`, que só é lido
   quando a fase correspondente começa. Se o SKILL.md crescer, mova conteúdo, não acrescente.
5. **Ondas de paralelismo exigem duas condições:** independência de dependências **e** conjuntos
   de `files:` disjuntos. Conflito → worktrees separados ou ondas consecutivas.
6. **Fronteiras padrão:** 5 iterações por nó, 4 ondas, parada por estagnação após 2 rodadas sem
   melhora de nota, barra do crítico 8.5/10.
7. **`progress.md` é append-only.** É o que permite uma sessão nova retomar o loop sem repetir
   o que já falhou.
8. **`install.sh` é idempotente** e nunca sobrescreve `AGENTS.md`, `contract.md` ou `progress.md`
   já existentes. Tem fallback pra Windows: se `ln -s` falhar, cria arquivos-ponteiro.
9. **Os agentes carregam o frontmatter dos dois mundos ao mesmo tempo.** `readonly: true` pro
   Cursor e `tools:` / `disallowedTools:` pro Claude Code, no mesmo arquivo. Cada ferramenta
   ignora o campo que não conhece. Não troque um pelo outro — some a garantia numa delas.
10. **O pipeline inteiro e as fases avulsas coexistem.** `/sdd-gauntlet-loop` roda ponta a ponta;
    `commands/` tem uma fase por comando pra quando você quer aprovar no meio. Os comandos são
    finos de propósito: eles apontam pro `SKILL.md` e pra `references/` correspondente em vez de
    reexplicar a fase. Regra dura — **nenhuma regra da pipeline mora só num comando.**

## Como o read-only do crítico é garantido (era a lacuna conhecida — resolvida)

O `harsh-critic` é o coração do Gauntlet Loop: se ele puder editar o código que julga, o
pipeline inteiro perde o sentido. Hoje ele é travado em três camadas:

| Camada | Mecanismo |
|---|---|
| Cursor | `readonly: true` no frontmatter |
| Claude Code | `disallowedTools: Edit, Write, NotebookEdit, Agent` + `tools:` sem ferramenta de escrita |
| Prosa | o corpo do agente diz explicitamente que redirecionamento de shell também é edição |

A ordem importa e está documentada: o Claude Code aplica `disallowedTools` **primeiro** e só
depois resolve `tools:` contra o que sobrou, então a negação não pode ser alargada.

**Resíduo honesto:** o crítico mantém `Bash`/`PowerShell`, porque verificador que não roda não
é verificador que passou. Shell escreve arquivo. Essa última fresta é fechada só por prosa —
se um dia aparecer um jeito de dar shell somente-leitura, é aqui que entra.

Ao adicionar um agente novo, declare `tools:` explicitamente. Sem o campo, o Claude Code herda
**tudo**, inclusive `Agent` — e um builder que pode delegar quebra a premissa de que o crítico
sabe de quem é o trabalho que está julgando.

## Regras pra trabalhar neste repositório

- **`name` do frontmatter tem que bater com o nome da pasta/arquivo.** `SKILL.md` → pasta
  `sdd-gauntlet-loop`; `agents/builder.md` → `name: builder`. Quebrar isso faz a skill sumir.
- **Teste o `install.sh` depois de qualquer mudança nele.** Em pasta descartável:
  `bash -n install.sh && ./install.sh /tmp/teste --agent all` e confira a árvore.
- **Ao mudar a pipeline, mude nos dois lugares:** o resumo no `SKILL.md` e o detalhe na
  `references/` correspondente. Descrição que só existe num dos dois é bug.
- **Não encha o `SKILL.md` de exemplo.** Ele é lido inteiro toda vez que a skill ativa.
- Se adicionar um subagente novo, adicione também na tabela de papéis do template
  `assets/AGENTS.md` e na lista do `install.sh`.
- **Confirme o esquema na documentação antes de mexer em frontmatter.** Foi assim que a lacuna
  do crítico foi fechada, e é assim que ela continua fechada quando o esquema mudar:
  [subagentes](https://code.claude.com/docs/en/sub-agents) e
  [skills/comandos](https://code.claude.com/docs/en/skills).
- **Dogfood é por junction, não por cópia.** `.claude/` neste repo aponta de volta pra
  `skills/`, `agents/` e `commands/` — editar o original muda a skill instalada na hora, e não
  existe segunda cópia pra divergir (decisão #3). `.claude/`, `.cursor/` e `.codex/` estão no
  `.gitignore` justamente por isso. Recriar: `./install.sh . --agent claude --no-templates`.

### Pegadinha desta máquina (Windows)

O Git Bash **não consegue escrever** dentro de `Documents\PROJETOS\...` — `mkdir` e redirect
falham com `No such file or directory` mesmo com o caminho certo (provável Controlled Folder
Access). PowerShell escreve normalmente. Então: `bash -n install.sh` pra checar sintaxe e rodar
o instalador **numa pasta temporária** funciona; instalar dentro deste repo tem que ser via
PowerShell. Não é bug do `install.sh`.

## Estado atual

Feito e verificado (o instalador foi rodado num container, na máquina do André e de novo em
30/08/2026): estrutura completa, frontmatter YAML validado, idempotência confirmada
(`AGENTS.md` editado à mão sobrevive à reinstalação), `--global` sem lixo em `$HOME`, fallback
de symlink pro Windows funcionando, e os 5 comandos chegando nas três pastas de agente.

Fechado em 30/08/2026:

- [x] os 4 agentes adaptados ao esquema do Claude Code, com o do Cursor convivendo — ver a
      seção do read-only acima
- [x] comandos por fase: `/sdd-spec`, `/sdd-contract`, `/sdd-gauntlet`, `/sdd-integrate`,
      `/sdd-archive`, distribuídos pelo `install.sh`
- [x] dogfood: `.claude/` deste repo aponta por junction pra `skills/`, `agents/` e `commands/`

Falta:

- [ ] push (o `git init` e o primeiro commit já foram feitos; o nome do repositório remoto
      ainda não foi definido)
- [ ] rodar a pipeline num projeto real e calibrar a rubrica do crítico com o que aparecer.
      **É o único item que ainda pode mudar decisões de design** — tudo acima é estrutura,
      e estrutura não validada por uso é palpite arrumado.
- [ ] conferir e apagar `_to_delete/_bundle.zip` (André pediu pra segurar até olhar o conteúdo)

## Referências

- [Agent Skills — Cursor Docs](https://cursor.com/docs/skills)
- [Subagents — Cursor Docs](https://cursor.com/docs/subagents)
- Gauntlet Loop (objetivo / crítico severo / condição de parada): Matt Shumer
- Orchestrator-workers e evaluator-optimizer: Anthropic, *Building Effective AI Agents*
- Disciplina minimalista de `AGENTS.md`: estilo Karpathy
