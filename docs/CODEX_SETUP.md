# Configuración de Codex para estas ramas

## Superficies correctas

- `AGENTS.md`: reglas duraderas y específicas del repositorio.
- Prompt de rama: resultado concreto de una única terminal.
- MCP: documentación o control de navegador externo al repositorio.
- Subagentes: exploración, pruebas y revisión independientes.
- Skill propia: no es necesaria todavía; este flujo debe demostrar repetición antes de convertirse en skill.

## MCP mínimos

Compruebe primero la configuración existente:

```bash
codex mcp list
```

Dentro de la TUI use `/mcp`.

Para este trabajo solamente son necesarios:

- Context7: documentación vigente de Next.js, React, Canvas y dependencias elegidas.
- Playwright: interacción real, responsive, accesibilidad básica, consola, red y E2E.
- GitHub: opcional para PR, checks y revisión si el repositorio remoto se gestiona allí.

No instale servidores duplicados. No active Figma, Canva, Supabase, Sentry o PostHog en estas ramas si no existe una tarea concreta que los necesite.

## Uso de subagentes

En el prompt se permite delegar análisis de solo lectura. Ejemplo:

```text
Usa tres subagentes en paralelo y espera sus resultados. Uno revisa cálculo y
validación, otro seguridad y dependencias y otro pruebas faltantes. Ninguno
puede editar archivos. Consolida sus evidencias y después implementa tú en la
rama respetando AGENTS.md.
```

Para inspeccionarlos en la TUI use `/agent`.

No use dos subagentes para editar simultáneamente el mismo worktree.

## Gestión de contexto

- Mantenga una conversación por rama.
- Use `/status` al comenzar para confirmar directorio y rama.
- Use `/review` antes del commit final.
- Use `/compact` solamente cuando el hilo sea largo y el trabajo siga siendo el mismo.
- No use `/fork` para sustituir los worktrees: una conversación separada no aísla archivos.

## Razonamiento sugerido

- Cotizador/calidad: alto, porque combina dinero, seguridad, dependencias y regresión.
- Personalizador: alto, por Canvas, memoria, táctil y pruebas.
- QA final: alto o extra alto, con subagentes de solo lectura.

No fije un modelo en archivos del repositorio si el equipo no ha acordado ese costo y disponibilidad. Selecciónelo al iniciar la sesión.

## Inicio de cada terminal

1. Confirme ruta y rama.
2. Ejecute `git status --short`.
3. Ejecute `/status` dentro de Codex.
4. Confirme que Codex cargó el `AGENTS.md` correcto.
5. Pegue el prompt completo de la rama.
6. No inicie el servidor en el mismo puerto que la otra terminal.

