# 06 — Cantidades y recuentos

Este es el corazón del asset: un rumor que **deforma el dato** sin inventar el hecho.
"Eliminó a 10 bandidos con su espada" puede acabar en "eliminó a un pelotón de 1000
bandidos con las manos desnudas". El verbo y el paciente no cambian; la cifra, el
colectivo y el instrumento sí.

---

## 1. Por qué la cantidad vive en la acción

La cantidad pertenece al **hecho declarado**, no al evento. "Abatir a distancia" siempre
ocurre desde 500 m en tu juego; "diezmar a los bandidos" siempre empieza con 10. Por eso
se declara una vez en `EcosAccion` y el trigger sólo envía el id:

```csharp
EcosSystem.RegistrarEvento("A", "abatir_distancia", "objetivo", 80);
//                                       ^ el dato (500 m) ya está en la acción
```

Ventajas:

- El diseñador afina la escalera en un sitio.
- El `EcoEvento` sigue siendo pequeño e inmutable.
- Se puede probar la escalera sin escena (`Window ▸ Ecos ▸ Consola de Ecos`).

**Limitación:** la misma acción siempre tiene la misma cantidad base. Si necesitas
"robar 10" y "robar 100" con el mismo verbo, declara dos acciones
(`robar_10`, `robar_100`) o crea un compositor propio que lea la cantidad del contexto.
La primera opción es la recomendada: mantiene el dato en datos.

---

## 2. Los ocho campos

| Campo | Tipo | Efecto | Ejemplo |
| --- | --- | --- | --- |
| `CantidadBase` | int | Cifra base. `0` = la acción no lleva cantidad. | `500` |
| `UnidadCantidad` | string | Qué se cuenta. Vacío = no se muestra la cifra. | `metros` |
| `PreposicionCantidad` | string | Cómo entra en la frase cuando va aparte. | `desde` |
| `CantidadesPorNivel` | int[5] | Cifra **exacta** por nivel. Manda sobre la base. | `{500,700,900,1100,1300}` |
| `ContenedoresPorNivel` | string[5] | Colectivo que envuelve la cifra. | `un grupo de` |
| `InstrumentosPorNivel` | string[5] | Instrumento con el que ocurre. | `con su espada` |
| `CantidadComoObjeto` | bool | La cantidad **es** el objeto directo. | `true` |
| `Transitiva` | bool | Si es false, no hay objeto directo. | `true` |

Los arrays deben tener **5 posiciones**, en el orden:

```
[0] Literal  [1] Suavizado  [2] Adornado  [3] Exagerado  [4] Distorsionado
```

Si un array es más corto, las posiciones que faltan se tratan como vacías. Si una
posición de `CantidadesPorNivel` es `0` o negativa, se usa la base escalada.

---

## 3. De dónde sale la cifra

Prioridad:

1. `CantidadesPorNivel[nivel]` si existe y es `> 0`.
2. `CantidadBase × EcosNiveles.FactorMagnitud(nivel)`, redondeado.

`FactorMagnitud` es lineal: `1 + 0,4 × nivel`.

| Nivel | Factor | `CantidadBase = 500` | `CantidadBase = 10` |
| --- | --- | --- | --- |
| Literal | 1,0 | 500 | 10 |
| Suavizado | 1,4 | 700 | 14 |
| Adornado | 1,8 | 900 | 18 |
| Exagerado | 2,2 | 1100 | 22 |
| Distorsionado | 2,6 | 1300 | 26 |

La tabla explícita permite **despegar** la escalera de la lineal: 10 → 25 → 100 → 400 →
1000. Es lo que usa la hazaña de los bandidos.

> **Consejo:** para distancias usa una tabla suave (500→1300). Para recuentos usa una
> tabla agresiva (10→1000). Para objetos únicos ("un pozo") no declares cantidad.

---

## 4. Modo A — cantidad aparte

`CantidadComoObjeto = false` (por defecto).

La cifra se guarda en `EcosPlanFrase.Cantidad` y se inserta en el token `{magnitud}`:

```
PreposicionCantidad + " " + cifra + " " + UnidadCantidad
```

Ejemplo:

```csharp
new EcosAccion
{
    Id = "abatir_distancia",
    VerboSingular = "eliminó a",
    CantidadBase = 500,
    UnidadCantidad = "metros",
    PreposicionCantidad = "desde",
    CantidadesPorNivel = new[] { 500, 700, 900, 1100, 1300 }
}
```

Salida esperada por nivel (con `objetoId = objetivo`):

| Nivel | Frase |
| --- | --- |
| Literal | "eliminó al objetivo desde 500 metros" |
| Suavizado | "eliminó al objetivo desde 700 metros" |
| Adornado | "eliminó al objetivo desde 900 metros" |
| Exagerado | "eliminó al objetivo desde 1100 metros" |
| Distorsionado | "eliminó al objetivo desde 1300 metros" |

**Qué hace el compositor si la plantilla no tiene `{magnitud}`:** inserta el token justo
detrás de `{objeto}`. Por eso la cifra aparece incluso en plantillas que "omiten
detalles".

**Sin preposición:** deja `PreposicionCantidad = ""` y saldrá "... 500 metros".

---

## 5. Modo B — cantidad como objeto

`CantidadComoObjeto = true`.

La cantidad **sustituye** al objeto del eco. El objeto declarado en el trigger se ignora
(y puede ser `@Nadie`). Se compone así:

```
[ContenedorPorNivel + " "] + cifra + " " + UnidadCantidad
```

```csharp
new EcosAccion
{
    Id = "diezmar_bandidos",
    VerboSingular = "eliminó a",
    CantidadBase = 10,
    UnidadCantidad = "bandidos",
    CantidadComoObjeto = true,
    CantidadesPorNivel = new[] { 10, 25, 100, 400, 1000 },
    ContenedoresPorNivel = new[]
    {
        "un grupo de", "una banda de", "una hueste de", "un ejército de", "un pelotón de"
    }
}
```

Salida esperada:

| Nivel | Objeto compuesto | Frase |
| --- | --- | --- |
| Literal | `un grupo de 10 bandidos` | "eliminó a un grupo de 10 bandidos" |
| Suavizado | `una banda de 25 bandidos` | "eliminó a una banda de 25 bandidos" |
| Adornado | `una hueste de 100 bandidos` | "eliminó a una hueste de 100 bandidos" |
| Exagerado | `un ejército de 400 bandidos` | "eliminó a un ejército de 400 bandidos" |
| Distorsionado | `un pelotón de 1000 bandidos` | "eliminó a un pelotón de 1000 bandidos" |

**Sin contenedor:** deja `ContenedoresPorNivel` vacío y saldrá "eliminó a 10 bandidos".
Es perfectamente válido; el contenedor sólo añade sabor.

**Concordancia:** el contenedor debe concordar con la unidad. "un grupo de 10 bandidos"
(masculino plural), "una marea de 300 prisioneros" (femenino singular, pero la unidad
manda). El compositor no corrige gramática: escribe lo que declaras.

---

## 6. Instrumento

`InstrumentosPorNivel` se añade **al final del objeto** (o al objeto compuesto):

```
plan.Objeto = plan.Objeto + ", " + instrumento
```

Por eso se ve en **todas** las plantillas: el objeto es el único slot que nunca falta.

```csharp
InstrumentosPorNivel = new[]
{
    "con su espada", "con su espada", "sin ayuda de nadie",
    "con las manos desnudas", "con las manos desnudas"
}
```

Resultado completo de la hazaña:

```
v0: eliminó a un grupo de 10 bandidos, con su espada
v1: eliminó a una banda de 25 bandidos, con su espada
v2: eliminó a una hueste de 100 bandidos, sin ayuda de nadie
v3: eliminó a un ejército de 400 bandidos, con las manos desnudas
v4: eliminó a un pelotón de 1000 bandidos, con las manos desnudas
```

La plantilla del nivel puede añadir prefijos, adverbios y coletillas alrededor, pero
esas tres piezas (cifra + colectivo + instrumento) permanecen.

**Sin instrumento:** deja el array vacío. No se añade coma ni hueco.

**Ojo con la coma:** si tu plantilla ya termina el objeto con puntuación, el instrumento
quedará detrás de la coma. Ejemplo: `{objeto}.` + instrumento ⇒ "... bandidos., con su
espada". Deja la puntuación en `{sufijo}` o `{coletilla}`, no en `{objeto}`.

---

## 7. Qué ve la UI: `EcosPlanFrase`

Si necesitas pintar la frase por partes (subtítulos, color, traducción), usa
`EcosSystem.Planificar`:

| Campo | Contenido con cantidad aparte | Contenido con cantidad como objeto |
| --- | --- | --- |
| `Objeto` | "el objetivo" | "un pelotón de 1000 bandidos, con las manos desnudas" |
| `Cantidad` | "desde 1300 metros" | `""` (la cifra ya está en `Objeto`) |
| `Verbo` | "eliminó a" | "eliminó a" |

Esto es útil para localización: puedes traducir `Verbo`, `Objeto` y `Cantidad` por
separado, o reconstruir la frase con tus propias plantillas.

---

## 8. Recetas

### 8.1 Distancia que crece poco a poco

```csharp
CantidadBase = 500;
UnidadCantidad = "metros";
PreposicionCantidad = "desde";
CantidadesPorNivel = new[] { 500, 700, 900, 1100, 1300 };
```

**Esperado:** 500 → 700 → 900 → 1100 → 1300. Creíble: un tiro de 1300 m ya es épico.

### 8.2 Recuento que se dispara

```csharp
CantidadBase = 10;
UnidadCantidad = "bandidos";
CantidadComoObjeto = true;
CantidadesPorNivel = new[] { 10, 25, 100, 400, 1000 };
ContenedoresPorNivel = new[] { "un grupo de", "una banda de", "una hueste de", "un ejército de", "un pelotón de" };
```

**Esperado:** 10 → 25 → 100 → 400 → 1000, con el colectivo subiendo.

### 8.3 Recuento que se mantiene y luego explota

```csharp
CantidadBase = 12;
UnidadCantidad = "prisioneros";
CantidadComoObjeto = true;
CantidadesPorNivel = new[] { 12, 12, 40, 120, 300 };
ContenedoresPorNivel = new[] { "un grupo de", "un grupo de", "una multitud de", "una multitud de", "una marea de" };
```

**Esperado (demo `rescatar`):** "un grupo de 12 prisioneros" → "un grupo de 12
prisioneros" → "una multitud de 40 prisioneros" → "una multitud de 120 prisioneros" →
"una marea de 300 prisioneros". El salto de 12 a 40 es el momento en que el rumor
"despega".

> La unidad se conserva en todos los niveles: el compositor sólo la omite si
> `UnidadCantidad` está vacía, y en ese caso tampoco pinta la cifra.

### 8.4 Sin cantidad, sólo instrumento

```csharp
InstrumentosPorNivel = new[] { "con una daga", "con una daga", "con una daga oxidada", "con un cuchillo de cocina", "con una pluma" };
```

**Esperado:** el objeto no cambia; el instrumento se degrada de lo bélico a lo absurdo.
Recuerda: sigue siendo Cero Alucinaciones porque **tú** declaraste la escalera.

### 8.5 Cantidad sin unidad (no soportado)

No se puede mostrar una cifra sin unidad: `AplicarCantidad` exige que
`UnidadCantidad` no esté vacío. Si quieres "eliminó a 10", declara una unidad neutra
(`personas`, `enemigos`) o usa el contenedor con la unidad:

```csharp
UnidadCantidad = "enemigos";
CantidadComoObjeto = true;
ContenedoresPorNivel = new[] { "un grupo de", ... };
// -> "eliminó a un grupo de 10 enemigos"
```

Si dejas `UnidadCantidad = ""`, el compositor no pinta cifra ni contenedor (sólo el
instrumento, si lo hay).

### 8.6 Varias acciones con el mismo verbo

```csharp
Id = "robar_10",  CantidadBase = 10,  UnidadCantidad = "monedas";
Id = "robar_100", CantidadBase = 100, UnidadCantidad = "monedas";
Id = "robar_1000",CantidadBase = 1000,UnidadCantidad = "monedas";
```

Cada una tiene su propia escalera. El trigger elige el id según el botín real.

---

## 9. Gramática: las tres reglas que evitan frases rotas

1. **El verbo debe pedir la cantidad como objeto.** "eliminó a" + "un grupo de 10" es
   correcto; "quemó" + "un grupo de 10" no. Si usas `CantidadComoObjeto`, el verbo debe
   ser transitivo y aceptar "a".
2. **El contenedor concuerda con la unidad.** "un grupo de bandidos" (masc. pl.),
   "una marea de prisioneros" (fem. sing. + masc. pl.). Elige contenedores que suenen
   bien con tu unidad.
3. **La puntuación va en el sufijo/coletilla, no en el objeto.** El instrumento se pega
   con coma; si el objeto ya lleva punto, queda "bandidos., con su espada".

---

## 10. Bilingüe

La cifra no se traduce; la unidad, el contenedor y el instrumento sí:

| ES | EN |
| --- | --- |
| `UnidadCantidad = "metros"` | `"meters"` |
| `PreposicionCantidad = "desde"` | `"from"` |
| `ContenedoresPorNivel = {"un grupo de", ...}` | `{"a group of", "a band of", "a host of", "an army of", "a platoon of"}` |
| `InstrumentosPorNivel = {"con su espada", ...}` | `{"with his sword", "with his sword", "alone", "bare-handed", "bare-handed"}` |

Mantén los **mismos ids de acción** para que el mapeo semántico y las estadísticas
funcionen en ambos idiomas.

---

## 11. Depuración: "no sale el número"

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| No aparece ninguna cifra | `CantidadBase = 0` y `CantidadesPorNivel` vacío. | Declara una de las dos. |
| No aparece la cifra (ni la unidad) | `UnidadCantidad` vacío. | Rellénalo (`metros`, `bandidos`); sin unidad no se muestra la cifra. |
| Aparece "desde" pero no la cifra | La tabla tiene `0` en ese nivel y la base es 0. | Rellena la posición o la base. |
| La cifra no cambia entre niveles | `CantidadesPorNivel` tiene el mismo valor repetido. | Cambia la tabla o usa la base × factor. |
| El objeto del trigger no sale | `CantidadComoObjeto = true` lo sustituye. | Es el comportamiento esperado. |
| Sale "bandidos., con su espada" | Puntuación en el objeto/plantilla. | Mueve la puntuación a `{sufijo}`. |
| Sale el id crudo en vez del objeto | Falta la entrada en `Objetos`. | Añádela o usa `@Nadie`. |

Para verlo sin jugar: **`Window ▸ Ecos ▸ Consola de Ecos ▸ Laboratorio de frases`**.
Escribe la acción y el objeto, mueve el nivel y la intención, y pulsa **Generar**.
