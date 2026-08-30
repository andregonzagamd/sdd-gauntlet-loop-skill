# 🛡️ SDD + Gauntlet Loop

Uma skill de engenharia agêntica que junta três técnicas numa pipeline só:

| Camada | Técnica | Responde |
|---|---|---|
| Planejamento | **Spec-Driven Development** | *o que exatamente vamos construir, e o que conta como pronto?* |
| Topologia | **Diamond Graph** | *quem trabalha em quê, em paralelo, e onde tudo converge?* |
| Qualidade | **Gauntlet Loop** | *quem diz que está bom, e quando o loop para?* |

A regra que sustenta tudo o resto: **quem escreve o código nunca decide se ele passou.**

Funciona no **Cursor**, e também no Claude Code, Codex e Gemini CLI — a mesma skill, os mesmos arquivos de estado.

---

## Instalação

```bash
git clone https://github.com/<seu-usuario>/sdd-gauntlet-loop.git
cd sdd-gauntlet-loop

./install.sh ~/code/meu-projeto      # instala num projeto
./install.sh --global                # disponível em todos os projetos
./install.sh --agent all             # Cursor + Claude Code + Codex
```

O instalador coloca a skill em `.cursor/skills/`, os subagentes em `.cursor/agents/`, os comandos de fase em `.cursor/commands/`, e cria na raiz do projeto os três arquivos de estado (`AGENTS.md`, `contract.md`, `progress.md`) — sem sobrescrever nada que já exista. `CLAUDE.md` e `GEMINI.md` viram symlinks para o mesmo `AGENTS.md`, então todo agente lê a mesma constituição.

Depois, preencha os `[colchetes]` do `AGENTS.md` — principalmente a seção **Commands**, porque é dela que saem os verificadores do contrato.

## Uso

No chat do agente:

```
/sdd-gauntlet-loop implementar autenticação JWT com refresh token
```

E o pipeline roda:

```
[0] BOOTSTRAP   garante AGENTS.md, contract.md, progress.md
        |
[1] SPEC        proposal.md → design.md → tasks.md          ← nenhuma linha de código
        |
[2] CONTRACT    objetivo + verificadores + rubrica + fronteiras
        |
  ____ [3] FAN-OUT ____                                     ← topo do diamante
 /        |        |     \
builder builder builder builder                             ← em paralelo, arquivos disjuntos
 \        |        |     /
  \__ critic  critic  critic __/                            ← contexto limpo, read-only
        |
   FAIL → volta ao builder daquele nó (com limite de iterações)
        |
[4] INTEGRATE   suíte completa + crítico da mudança inteira
        |
[5] ARCHIVE     a spec vira a documentação viva do projeto
```

### Uma fase de cada vez

Se você quiser aprovar entre as fases em vez de soltar o pipeline inteiro, cada uma tem seu próprio comando:

```
/sdd-spec       implementar autenticação JWT com refresh token   → para na spec, pede aprovação
/sdd-contract   jwt-auth                                          → verificadores + rubrica + fronteiras
/sdd-gauntlet   jwt-auth                                          → builders em onda, críticos, loop limitado
/sdd-integrate  jwt-auth                                          → costura as pontas + suíte completa
/sdd-archive    jwt-auth                                          → arquiva a spec e fecha o progress.md
```

São as mesmas regras do pipeline completo — os comandos apontam pro `SKILL.md` e pra `references/` em vez de reescrever a fase, então não existe versão divergente das regras.

## Por que ele para de gerar código medíocre

**O crítico tem contexto limpo.** Ele recebe o `contract.md` e o diff — nunca a narrativa do builder, nem a auto-avaliação, nem o "isso foi difícil por causa de X". Sem essa separação, o agente convence a si mesmo de que passou.

**O crítico é read-only — e não por educação.** Se ele consertasse o que encontrou, estaria corrigindo a própria prova. Então o frontmatter dele tira a ferramenta de edição: `readonly: true` no Cursor, `disallowedTools: Edit, Write, NotebookEdit` no Claude Code. Ele mantém o shell, porque verificador que não roda não é verificador que passou — e o próprio agente é instruído de que redirecionamento de shell também conta como edição.

**O estado mora no disco.** `progress.md` é append-only. A janela de contexto apodrece com o tempo; o arquivo não. Uma sessão nova lê `AGENTS.md` + `contract.md` + `progress.md` e sabe exatamente onde retomar.

**O loop tem freio.** Máximo de iterações por nó, regra de estagnação (duas rodadas sem melhora → escala pro humano), e uma lista de ações proibidas. Loop sem fronteira não é autônomo, é sem supervisão.

**Paralelismo só onde é seguro.** Dois nós entram na mesma onda apenas se forem independentes **e** tocarem arquivos disjuntos. Se precisarem do mesmo arquivo: worktrees separados ou ondas consecutivas.

## O que tem no repositório

```
sdd-gauntlet-loop/
├── install.sh
├── skills/sdd-gauntlet-loop/
│   ├── SKILL.md                      # a pipeline: princípios, fases, condições de parada
│   ├── references/
│   │   ├── phase-1-spec.md           # como escrever proposal/design/tasks
│   │   ├── phase-2-contract.md       # verificadores, rubrica, fronteiras
│   │   ├── phase-3-graph-gauntlet.md # ondas, prompts de dispatch, protocolo de estagnação
│   │   └── phase-4-integrate-archive.md
│   └── assets/
│       ├── AGENTS.md                 # template da constituição
│       ├── contract.md               # template do contrato
│       └── progress.md               # template do log
├── agents/
│   ├── spec-writer.md                # escreve a spec, não escreve código
│   ├── builder.md                    # constrói um nó, nos arquivos dele, e não se auto-aprova
│   ├── harsh-critic.md               # read-only, contexto limpo, PASS/FAIL com evidência
│   └── integrator.md                 # costura os nós e roda a suíte completa
└── commands/                         # uma fase por comando, pra aprovar no meio do caminho
    ├── sdd-spec.md
    ├── sdd-contract.md
    ├── sdd-gauntlet.md
    ├── sdd-integrate.md
    └── sdd-archive.md
```

Os arquivos em `references/` só são lidos quando a fase correspondente começa — o `SKILL.md` fica enxuto e o contexto não é gasto à toa.

## Os três arquivos de estado

| Arquivo | Papel | Muda quando |
|---|---|---|
| `AGENTS.md` | constituição do repositório: regras que sobrevivem a qualquer mudança | raramente |
| `contract.md` | objetivo, verificadores, rubrica do crítico, fronteiras | a cada mudança |
| `progress.md` | log append-only de onda, nó, iteração e veredito | a cada iteração |

## OpenSpec (opcional)

Se o projeto tiver `openspec/` ou o CLI `openspec` instalado, a Fase 1 usa `/opsx propose` e a Fase 5 usa `/opsx archive`. Se não tiver, a skill gera os mesmos três artefatos sozinha. **A pipeline nunca depende de uma ferramenta específica estar instalada.**

## Publicar no seu GitHub

```bash
cd sdd-gauntlet-loop
git init && git add . && git commit -m "feat: SDD + Gauntlet Loop skill"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/sdd-gauntlet-loop.git
git push -u origin main
```

## Créditos

Gauntlet Loop (objetivo / crítico severo / condição de parada) popularizado por Matt Shumer. Orchestrator-workers e avaliador-otimizador descritos pela Anthropic em *Building Effective AI Agents*. Disciplina minimalista de `CLAUDE.md`/`AGENTS.md` no estilo Karpathy. Spec-Driven Development na linha do OpenSpec.

MIT.
