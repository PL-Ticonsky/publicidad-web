# Propagplast — trabajo paralelo con Codex

Este paquete prepara dos ramas de implementación independientes:

- `fix/cotizador-calidad`: cálculo, validación, WhatsApp, seguridad y pruebas.
- `feat/personalizador-browser`: personalización local de llaveros y mouse pads.

La identidad visual y el rediseño general del frontend quedan fuera de estas dos ramas.

## 1. Instalación en el repositorio

Copie en la raíz de `publicidad-web`:

- `AGENTS.md`
- la carpeta `docs/`
- la carpeta `prompts/`

Revise y confirme primero los cambios actuales del repositorio. No cree worktrees desde un estado que todavía no pueda reproducirse.

```bash
cd /home/ticonksy/publicidad-web
git status --short
npm run lint
npx tsc --noEmit
npm run build
```

Cuando el estado actual sea correcto, cree un checkpoint intencional y la rama de integración:

```bash
git add -p
git commit -m "chore: checkpoint before Propagplast parallel work"
git switch -c integration/propagplast-v1
```

Añada este paquete al repositorio y confírmelo antes de crear las ramas. De ese modo, ambas terminales cargarán las mismas reglas.

```bash
git add AGENTS.md docs prompts
git commit -m "docs: define Propagplast parallel work contracts"
```

## 2. Crear los dos worktrees

```bash
mkdir -p ../propagplast-worktrees

git worktree add ../propagplast-worktrees/cotizador \
  -b fix/cotizador-calidad integration/propagplast-v1

git worktree add ../propagplast-worktrees/personalizador \
  -b feat/personalizador-browser integration/propagplast-v1
```

Terminal 1:

```bash
cd /home/ticonksy/propagplast-worktrees/cotizador
npm ci
codex
```

Terminal 2:

```bash
cd /home/ticonksy/propagplast-worktrees/personalizador
npm ci
codex
```

Si la ruta padre real no es `/home/ticonksy`, use la ruta que haya creado Git.

## 3. Prompts

- Terminal de cotizador: `prompts/01-cotizador-calidad.md`.
- Terminal de personalizador: `prompts/02-personalizador-browser.md`.
- Rama de integración: `prompts/03-integracion.md`.
- Auditoría final: `prompts/04-qa-final.md`.

Revise además `docs/CODEX_SETUP.md` antes de iniciar y use `docs/HANDOFF_TEMPLATE.md` para que cada terminal devuelva información integrable.

Pegue el prompt completo. No reduzca el prompt a “implementa lo anterior”; cada terminal debe conservar su contrato de archivos y criterios de terminado.

## 4. Puertos sugeridos

```bash
# Cotizador
npm run dev -- --port 3001

# Personalizador
npm run dev -- --port 3002

# Integración final
npm run dev -- --port 3000
```

## 5. Integración

No mezcle una rama mientras Codex todavía escribe en ella. Cuando ambas hayan terminado y tengan commits verificables:

```bash
cd /home/ticonksy/publicidad-web
git switch integration/propagplast-v1

git merge --no-ff fix/cotizador-calidad
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build

git merge --no-ff feat/personalizador-browser
```

Después del segundo merge use `prompts/03-integracion.md`. La integración es responsable de conectar el personalizador con el cotizador; ninguna de las dos ramas paralelas debe anticipar esa edición compartida.

## 6. Regla operativa

Use subagentes dentro de una terminal solamente para exploración, pruebas, revisión o análisis de logs. No delegue ediciones simultáneas sobre los mismos archivos.
