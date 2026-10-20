# 06 — Cantidades y recuentos

Este es el corazón del asset: un rumor que **deforma el dato** sin inventar el hecho.
"Eliminó a 10 bandidos con su espada" puede acabar en "eliminó a un pelotón de ~1.100
bandidos con las manos desnudas". El verbo y el paciente no cambian; la cifra, el
colectivo y el instrumento sí.

No hay que escribir una tabla de cantidades. Declaras **un dato base** y Ecos calcula
todas las versiones del rumor con una curva automática, determinista y explicable.

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

- El diseñador declara el hecho una sola vez.
- El `EcoEvento` sigue siendo pequeño e inmutable.
- La curva se puede probar sin escena (`Window ▸ Ecos ▸ Consola de Ecos`).

**Limitación:** la misma acción siempre tiene la misma cantidad base. Si necesitas
"robar 10" y "robar 100" con el mismo verbo, declara dos acciones (`robar_10`,
`robar_100`) o crea un compositor propio que lea la cantidad del contexto. La primera
opción es la recomendada: mantiene el dato en datos.

---

## 2. Los campos que importan

| Campo | Tipo | Efecto | Ejemplo |
| --- | --- | --- | --- |
| `CantidadBase` | int | **Único dato obligatorio.** Cifra real del hecho. `0` = la acción no lleva cantidad. | `500` |
| `UnidadCantidad` | string | Qué se cuenta. Vacío = no se muestra la cifra. | `metros` |
| `PreposicionCantidad` | string | Cómo entra en la frase cuando va aparte. | `desde` |
| `CantidadComoObjeto` | bool | La cantidad **es** el objeto directo. | `true` |
| `ContenedoresPorNivel` | string[5] | Colectivo opcional que envuelve la cifra. | `un grupo de` |
| `InstrumentosPorNivel` | string[5] | Instrumento opcional con el que ocurre. | `con su espada` |
| `CantidadesPorNivel` | int[5] | **Override opcional.** Sólo si necesitas cifras exactas. | `{500,700,900,1100,1300}` |
| `Transitiva` | bool | Si es false, no hay objeto directo. | `true` |

Los arrays, cuando los uses, tienen **5 posiciones** en este orden:

```
[0] Literal  [1] Suavizado  [2] Adornado  [3] Exagerado  [4] Distorsionado
```

Si un array es más corto, las posiciones que faltan se tratan como vacías.

---

## 3. La cifra se calcula sola

`EcosEscaladorCantidades` es el responsable. Recibe la acción y el eco, y devuelve una
cifra para el nivel actual. **No necesita que el diseñador escriba los números de cada
nivel.**

La curva base depende del tipo de dato:

| Nivel | Recuento (`CantidadComoObjeto = true`) | Medida (`CantidadComoObjeto = false`) |
| --- | --- | --- |
| Literal | ×1 | ×1 |
| Suavizado | ×2,5 | ×1,35 |
| Adornado | ×8 | ×1,8 |
| Exagerado | ×30 | ×2,5 |
| Distorsionado | ×100 | ×3,6 |

Después se aplican cuatro matices pequeños:

1. **Intensidad del hecho:** entre ×0,90 y ×1,10 según `EcoEvento.Intensidad`.
2. **Intención del narrador:** alarde +8 %, amenaza +6 %, chisme +4 %, lamento −8 %.
3. **Saltos:** +1 % por boca adicional.
4. **Oyente:** ±8 % determinista si `VariacionPorOyente` está activo. El mismo hecho
   puede sonar a 980 o a 1.030 bandidos; sigue siendo reproducible con la misma semilla.

El resultado se redondea a **cifras que un narrador diría de verdad**: decenas, cincuentas
o centenas, no "1.137 bandidos".

### Ejemplo real: la distancia de la demo

```csharp
new EcosAccion
{
    Id = "abatir_distancia",
    VerboSingular = "eliminó a",
    CantidadBase = 500,
    UnidadCantidad = "metros",
    PreposicionCantidad = "desde"
    // Sin CantidadesPorNivel: la curva automática hace el resto.
}
```

Con `intensidad = 75` e `intencion = Amenaza`, la salida es:

| Nivel | Frase |
| --- | --- |
| Literal | "eliminó al objetivo desde 500 metros" |
| Suavizado | "eliminó al objetivo desde 750 metros" |
| Adornado | "eliminó al objetivo desde 1.000 metros" |
| Exagerado | "eliminó al objetivo desde 1.400 metros" |
| Distorsionado | "eliminó al objetivo desde 2.000 metros" |

La distancia crece de forma agresiva pero creíble. Si tu juego necesita un límite
distinto, usa el override de la sección 4.

### Ejemplo real: el recuento de la demo

```csharp
new EcosAccion
{
    Id = "diezmar_bandidos",
    VerboSingular = "eliminó a",
    CantidadBase = 10,
    UnidadCantidad = "bandidos",
    CantidadComoObjeto = true,
    ContenedoresPorNivel = new[]
    {
        "un grupo de", "una banda de", "una hueste de", "un ejército de", "un pelotón de"
    }
    // Sin CantidadesPorNivel.
}
```

Con `intensidad = 60` e `intencion = Alarde`, la cifra pasa por 10 → 30 → 90 → 350 →
1.100. El contenedor cambia de "grupo" a "pelotón"; el verbo y el paciente no.

> **Cero Alucinaciones:** la curva no inventa un hecho nuevo. Transforma el dato que el
> diseñador declaró. La cifra sigue siendo explicable: nivel × intensidad × intención ×
> oyente.

### ¿Y el modelo de IA?

El modelo semántico (ONNX o el proveedor hash de respaldo) **no escribe la cifra**. El
modelo clasifica el nivel de exageración y la intención; el escalador convierte esas
etiquetas en un número. Esa separación es deliberada:

- el modelo aporta la lectura semántica;
- el motor aporta la aritmética determinista;
- el diseñador aporta el dato real.

Así la cifra puede ser tan exagerada como haga falta sin que un modelo generativo invente
un número que contradiga el mundo.

---

## 4. Override opcional: cifras exactas

`CantidadesPorNivel` sigue existiendo para casos muy concretos: una distancia que no debe
superar un límite, un recuento histórico que debe ser exacto o una escalera que quieres
controlar al milímetro.

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

Si una posición es `0` o el array está vacío, esa posición cae a la curva automática. El
override **no es necesario** para que la exageración funcione; úsalo sólo cuando el dato
tenga que ser exacto por diseño.

---

## 5. Modo A — cantidad aparte

`CantidadComoObjeto = false` (por defecto).

La cifra se guarda en `EcosPlanFrase.Cantidad` y se inserta en el token `{magnitud}`:

```
PreposicionCantidad + " " + cifra + " " + UnidadCantidad
```

**Qué hace el compositor si la plantilla no tiene `{magnitud}`:** inserta el token justo
detrás de `{objeto}`. Por eso la cifra aparece incluso en plantillas que "omiten
detalles".

**Sin preposición:** deja `PreposicionCantidad = ""` y saldrá "... 500 metros".

---

## 6. Modo B — cantidad como objeto

`CantidadComoObjeto = true`.

La cantidad **sustituye** al objeto del eco. El objeto declarado en el trigger se ignora
(y puede ser `@Nadie`). Se compone así:

```
[ContenedorPorNivel + " "] + cifra + " " + UnidadCantidad
```

**Sin contenedor:** deja `ContenedoresPorNivel` vacío y saldrá "eliminó a 10 bandidos".
Es perfectamente válido; el contenedor sólo añade sabor.

**Concordancia:** el contenedor debe concordar con la unidad. "un grupo de 10 bandidos"
(masculino plural), "una marea de 1.350 prisioneros" (femenino singular, pero la unidad
manda). El compositor no corrige gramática: escribe lo que declaras.

---

## 7. Instrumento

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
v1: eliminó a una banda de 30 bandidos, con su espada
v2: eliminó a una hueste de 90 bandidos, sin ayuda de nadie
v3: eliminó a un ejército de 350 bandidos, con las manos desnudas
v4: eliminó a un pelotón de 1.100 bandidos, con las manos desnudas
```

La plantilla del nivel puede añadir prefijos, adverbios y coletillas alrededor, pero
esas tres piezas (cifra + colectivo + instrumento) permanecen.

**Sin instrumento:** deja el array vacío. No se añade coma ni hueco.

**Ojo con la coma:** si tu plantilla ya termina el objeto con puntuación, el instrumento
quedará detrás de la coma. Ejemplo: `{objeto}.` + instrumento → "... bandidos., con su
espada". Deja la puntuación en `{sufijo}` o `{coletilla}`, no en `{objeto}`.

---

## 8. Qué ve la UI: `EcosPlanFrase`

Si necesitas pintar la frase por partes (subtítulos, color, traducción), usa
`EcosSystem.Planificar`:

| Campo | Contenido con cantidad aparte | Contenido con cantidad como objeto |
| --- | --- | --- |
| `Objeto` | "el objetivo" | "un pelotón de 1.100 bandidos, con las manos desnudas" |
| `Cantidad` | "desde 2.000 metros" | `""` (la cifra ya está en `Objeto`) |
| `Verbo` | "eliminó a" | "eliminó a" |

Esto es útil para localización: puedes traducir `Verbo`, `Objeto` y `Cantidad` por
separado sin recomponer la frase.

---

## 9. Bilingüe

La cifra es un número; no se traduce. Lo que sí se traduce es la unidad, la preposición,
el contenedor y el instrumento:

| Español | Inglés |
| --- | --- |
| `UnidadCantidad = "metros"` | `"meters"` |
| `PreposicionCantidad = "desde"` | `"from"` |
| `Contenedor = "un pelotón de"` | `"a platoon of"` |
| `Instrumento = "con las manos desnudas"` | `"bare-handed"` |

Mantén los mismos ids de acción y los mismos valores base en ambas bibliotecas. La curva
es la misma; sólo cambia el vocabulario.

---

## 10. Problemas frecuentes

| Síntoma | Causa | Arreglo |
| --- | --- | --- |
| No aparece ninguna cifra | `CantidadBase = 0` y `UnidadCantidad` vacío. | Declara al menos `CantidadBase` y `UnidadCantidad`. |
| No aparece la cifra (ni la unidad) | `UnidadCantidad` vacío. | Rellénalo (`metros`, `bandidos`); sin unidad no se muestra la cifra. |
| La cifra no cambia entre niveles | `CantidadComoObjeto` o el nivel no se está actualizando. | Comprueba el nivel en la consola; usa el override sólo si hace falta. |
| La cifra es siempre la misma para todos los NPCs | `VariacionPorOyente` desactivado. | Actívalo si quieres redondeos distintos por oyente. |
| El objeto del trigger no sale | `CantidadComoObjeto = true` lo sustituye. | Es el comportamiento esperado. |
| La cifra es demasiado grande/pequeña | La curva de recuento es agresiva. | Usa `CantidadesPorNivel` como override o baja `CantidadBase`. |

---

## 11. Prueba rápida

1. Abre `Window ▸ Ecos ▸ Consola de Ecos`.
2. Emite `abatir_distancia` con intensidad 75.
3. Recorre los cinco niveles.
4. Comprueba que la cifra sube y que el verbo/paciente no cambian.

**Esperado:** 500 → 750 → 1.000 → 1.400 → 2.000 metros (sin variación por oyente).

Para un recuento, emite `diezmar_bandidos` con intensidad 60: 10 → 30 → 90 → 350 →
1.100 bandidos. El contenedor y el instrumento cambian, pero el hecho sigue siendo el
mismo.
