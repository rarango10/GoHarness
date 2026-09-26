# Design — <Nombre de la feature>

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: pendiente de aprobación | aprobado (AAAA-MM-DD)
<Después de aprobado, si el documento se enmienda: `aprobado (AAAA-MM-DD) · enmendado (AAAA-MM-DD): <sección o ids>`.>

## Resumen de la solución

<Un párrafo: el enfoque elegido, en criollo. Alguien que lea solo esto tiene que entender
por dónde va la cosa antes de meterse en el detalle.>

## Superficie

<Esta feature, ¿se puede navegar? La respuesta decide si el paso 7 (`verify-e2e`) aplica o si el
ciclo salta directo al paso 8 al terminar la implementación — la decisión es por feature, no por
proyecto: un mismo proyecto puede tener features con interfaz y features sin ella.>

- **Navegable** — hay una URL o un `file://` que abrir. Decí cuál (o cómo se arma, si depende de un
  puerto o de un build) y cómo se levanta (`npm run dev`, un HTML generado por un script, un
  servidor que ya corre). `verify-e2e` lee esto para generar los tests de Playwright.
- **No navegable** — CLI, librería, motor de datos, job en background. No hay nada que Playwright
  pueda abrir, y `verify-e2e` no aplica: la feature termina en el paso 8 en cuanto sus tareas están
  en `hecho`.

<borrá la opción que no aplica.>

## Referencia visual

<Solo para una feature navegable. ¿Tiene que parecerse a algo? La respuesta sale del brainstorming,
no se decide acá, y la lee `close-feature` antes de cerrar. Es por feature, igual que la
superficie: un mismo proyecto puede tener pantallas con mockup y pantallas sin él.>

- **Ninguna** — no hay nada contra qué comparar. Antes de cerrar igual se mira la app.
- **Orientativa** — inspira, no obliga. Decí cuál es y qué se toma de ella; no hace falta tabla.
- **Normativa** — el resultado tiene que parecerse. Decí la fuente:
  - **un skill de diseño** (su nombre): los pasos que la usan invocan el skill, no una copia que
    viva en el repo, y la lista de chequeo del cierre es la del skill;
  - **un archivo** (su ruta: imagen, HTML, export de Figma): la lista de chequeo del cierre es la
    tabla de abajo.

<borrá las opciones que no aplican. Si es normativa, la tabla es obligatoria:>

| Pieza de la referencia | Decisión | Motivo |
|---|---|---|
| <componente, zona de la pantalla, interacción> | adoptar / adaptar / descartar | <por qué, si no es obvio> |

<Lo que se adapta dice a qué se adapta y qué conserva. Lo que se descarta dice qué se pierde: un
descarte sin costo declarado suele ser un olvido con buena letra. Y lo que no está en la tabla no se
construye — por eso se recorre la referencia entera, no solo lo que se habló.>

<La referencia cubre cómo se ve. Cómo se comporta —qué pasa al hacer clic, qué se muestra si algo
falla— va en los criterios de `requirements.md`, como siempre.>

## Arquitectura

<Las piezas que componen la feature y cómo se relacionan. Para cada una: qué hace, de qué
depende, y qué requisito satisface (R1, R2…). Preferí unidades chicas con una responsabilidad
clara y un límite explícito — la lógica de negocio separada de la entrada/salida, para que se
pueda testear sin tocar consola ni disco.>

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| <nombre> | <qué hace, en una línea> | <de qué depende> | R1.1, R1.2 |

## Flujo de datos

<El recorrido de la información de punta a punta: qué entra, qué transformaciones ocurre y en
qué orden, qué sale. Numerá los pasos. Si hay un diagrama que ayuda, va acá.>

1. <paso>
2. <paso>

## Interfaces

<Los contratos públicos: firmas de funciones, comandos de CLI, tipos que cruzan de una unidad a
otra. Es lo que otro código va a consumir, así que dejá claro qué recibe, qué devuelve y qué
pasa cuando algo sale mal.>

```ts
// ejemplo de firma
```

## Modelos de datos

<Las estructuras que maneja la feature, con sus campos y tipos. Aclará qué es obligatorio, qué
es opcional, y cualquier invariante que deba cumplirse siempre.>

```ts
// ejemplo de tipo
```

## Manejo de errores

<Qué puede fallar y qué hace el sistema en cada caso. Mapeá contra los criterios de tipo
IF/THEN de los requirements — esos son, casi siempre, el listado de errores a cubrir.>

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| <qué falla> | <qué hace el sistema> | R1.3 |

## Estrategia de testing

<Cómo se verifica que esto cumple los requisitos, en el orden en que conviene escribirlo (TDD:
primero el test que falla). Mapeá test ↔ criterio para que se vea qué queda cubierto y qué no.>

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| <descripción del caso> | <comportamiento esperado> | R1.1 |

<Anotá también los casos borde que vale la pena cubrir aunque no tengan un criterio propio.>

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|-------------------------|---------------------|
| <lo que se eligió> | <la otra opción> | <razón: complejidad, dependencia extra, YAGNI…> |

## Riesgos y preguntas abiertas

- <lo que podría complicarse en la implementación, o lo que sigue sin resolverse>

## Enmiendas

<Vacía hasta que el documento aprobado cambie. Una línea por enmienda, la escribe `specify`. Un
desvío que apareció al implementar se asienta en el `Registro` de la tarea y se trae acá — no se
edita el design a mano desde la tarea.>

- <AAAA-MM-DD · sección o ids · qué cambió y por qué · de dónde salió (T7, paso 7, cierre)>
