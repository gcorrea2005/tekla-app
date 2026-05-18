<div align="center">

# Tekla Connection Manager

**Automatizacion de conexiones estructurales en Tekla Structures 2020**

![Tekla Structures](https://img.shields.io/badge/Tekla_Structures-2020-00598C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyTDIgN3YxMGwxMCA1IDEwLTVIN0w3IDE3bDUtMi41TDcgMTJsNS0yLjVINnoiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![edge-js](https://img.shields.io/badge/edge--js-.NET-512BD4?style=for-the-badge&logo=.net&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br/>

[Descripcion](#descripcion) · [Caracteristicas](#caracteristicas) · [Instalacion](#instalacion) · [Uso](#uso) · [API](#referencia-api) · [Arquitectura](#arquitectura)

</div>

---

## Descripcion

**Tekla Connection Manager** es una aplicacion web full-stack que permite aplicar y gestionar conexiones estructurales (placas de cortante, placas finales, angulos de clip, etc.) directamente desde el navegador, comunicandose en tiempo real con un modelo abierto en **Tekla Structures 2020**.

Elimina la necesidad de navegar manualmente por los menus de Tekla para cada conexion. Desde una sola interfaz puedes ver todos los elementos de tu modelo, seleccionar vigas y columnas, elegir el tipo de conexion y aplicarla con un clic — o generar cientos de conexiones en lote.

<div align="center">

```
┌─────────────┐      ┌──────────┐      ┌──────────┐      ┌─────────────────┐
│  Navegador  │ ───▶ │ Vite     │ ───▶ │ Express  │ ───▶ │ Tekla Structures│
│  React 18   │      │ :5173    │      │ :3001    │      │ 2020 Open API   │
└─────────────┘      └──────────┘      └──────────┘      └─────────────────┘
                              proxy /api      edge-js
```

</div>

---

## Caracteristicas

| Funcionalidad | Descripcion |
|:---|:---|
| **Estado en tiempo real** | Verifica la conexion con Tekla Structures y muestra el nombre del modelo activo |
| **Listado de elementos** | Carga vigas del modelo filtradas (sin columnas, placas ni concreto) con nivel, cota, perfil y marca de parte |
| **Carga por seleccion** | Carga solo los elementos seleccionados en Tekla Structures (usa UI.ModelObjectSelector) |
| **Seleccion interactiva** | Selecciona elementos haciendo clic en la tabla para usarlos en conexiones |
| **Conexion individual** | Aplica una conexion entre dos elementos con parametros personalizados (tornillo, placa) |
| **Aplicacion en lote** | Genera automaticamente conexiones Shear Tab entre todas las combinaciones viga-columna |
| **Catalogo de conexiones** | 10 tipos de conexion predefinidos: Clip Angle, End Plate, Splice Plate, Shear Tab, Column Seat, Stiffened End Plate, Bolted Bracket, Purlin Clip Angle, Sleeve Connection, Corner Bracket |
| **Resultados detallados** | Resumen visual de conexiones exitosas vs fallidas despues de cada operacion en lote |

---

## Requisitos

| Componente | Version | Notas |
|:---|:---:|:---|
| **Tekla Structures** | 2020.0 | Debe estar abierto con un modelo cargado |
| **Node.js** | 18+ | Backend Express + Frontend Vite |
| **.NET Framework** | 4.x | Pre-instalado en Windows (requerido por edge-js) |
| **edge-js** | latest | Puente Node.js → DLLs de Tekla (.NET) |

> **Nota:** Los DLLs de Tekla se encuentran en `C:\Program Files\Tekla Structures\2020.0\nt\bin\plugins\`

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/gcorrea2005/tekla-app.git
cd tekla-app
```

### 2. Instalar dependencias

```bash
cd server && npm install
cd ../client && npm install
```

---

## Uso

### Iniciar la aplicacion

```bash
npm run dev
```

Esto levanta ambos servicios simultaneamente:
- **Server (Express + edge-js):** `http://localhost:3001`
- **Client (Vite):** `http://localhost:5173`

### Flujo de trabajo

```
1. Abre Tekla Structures 2020 con tu modelo
2. Ejecuta `npm run dev` desde la raiz del proyecto
3. Abre http://localhost:5173 en tu navegador
4. Selecciona elementos en Tekla y haz clic en "Cargar Seleccionados"
5. Selecciona "Conexion Individual" o "Aplicacion en Lote"
6. Configura los parametros y aplica
```

### Conexion individual

1. Selecciona el **Elemento Primario** (columna/soporte)
2. Selecciona el **Elemento Secundario** (viga/miembro)
3. Elige el **Tipo de Conexion** del catalogo
4. Ajusta **tamano de tornillo** y **espesor de placa**
5. Haz clic en **"Aplicar Conexion"**

### Aplicacion en lote

1. Selecciona los elementos en Tekla y cargalos con "Cargar Seleccionados"
2. Cambia a la pestana **"Aplicacion en Lote"**
3. Revisa el conteo de columnas, vigas y conexiones estimadas
4. Haz clic en **"Generar y Aplicar Todas las Conexiones"**
5. Revisa el resumen de resultados

> **Advertencia:** El lote genera una conexion Shear Tab (#44) por cada combinacion viga-columna. Si tienes 10 vigas y 5 columnas, se crearan 50 conexiones.

---

## Tipos de Conexion

| # | Nombre | Categoria | Descripcion |
|:---:|:---|:---|:---|
| 1 | **Clip Angle** | Beam to Column | Angulo de clip atornillado |
| 10 | **End Plate** | Beam to Column | Placa final soldada |
| 11 | **Splice Plate** | Beam to Beam | Empalme entre vigas |
| 44 | **Shear Tab** | Beam to Column | Placa de cortante — la mas comun |
| 134 | **Column Seat** | Beam to Column | Asiento de columna |
| 142 | **Stiffened End Plate** | Beam to Column | Placa final rigidizada |
| 146 | **Bolted Bracket** | Beam to Column | Cartela atornillada |
| 80 | **Purlin Clip Angle** | Purlin to Beam | Angulo de clip para correas |
| 81 | **Sleeve Connection** | Beam to Beam | Conexion manguito |
| 82 | **Corner Bracket** | Beam to Column | Cartela de esquina |

---

## Referencia API

El backend expone los siguientes endpoints REST en `http://localhost:3001`:

### Estado

```
GET /api/status
```
Respuesta:
```json
{ "connected": true, "name": "Tekla Model" }
```

### Modelo

```
GET /api/beams           → Lista de vigas (filtradas)
GET /api/beams/selected  → Vigas seleccionadas en Tekla
GET /api/columns         → Lista de columnas
GET /api/objects         → Todos los elementos
GET /api/components      → Catalogo de tipos de conexion
```

### Conexiones

```
POST /api/connections           → Aplicar una conexion individual
POST /api/connections/advanced  → Conexion con parametros avanzados
POST /api/connections/batch     → Aplicar multiples conexiones en lote
DELETE /api/connections/:id     → Eliminar una conexion por ID
```

### Ejemplo: Aplicar conexion

```bash
curl -X POST http://localhost:3001/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "primaryId": 12345,
    "secondaryId": 67890,
    "componentNumber": 44,
    "componentName": "Shear Tab",
    "boltSize": "M16",
    "plateThickness": 10
  }'
```

Respuesta exitosa:
```json
{
  "success": true,
  "message": "Conexion aplicada correctamente",
  "connectionId": 98765
}
```

---

## Arquitectura

### Stack tecnologico

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                │
│   React 18 · Vite 5 · Axios                                    │
│   Puerto 5173                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ proxy /api
┌────────────────────────▼────────────────────────────────────────┐
│                    SERVIDOR EXPRESS                              │
│   Node.js · Express · edge-js                                   │
│   Puerto 3001                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ edge-js
┌────────────────────────▼────────────────────────────────────────┐
│                   TEKLA OPEN API 2020                            │
│   .NET DLLs → Tekla.Structures.Model                            │
│   C:\Program Files\Tekla Structures\2020.0\nt\bin\plugins\      │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura del proyecto

```
tekla-app/
│
├── client/                         # Frontend React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── tekla.js            # Capa de comunicacion con la API
│   │   ├── components/
│   │   │   ├── StatusBar.jsx       # Barra de estado de conexion
│   │   │   ├── BeamTable.jsx       # Tabla de elementos del modelo
│   │   │   ├── ConnectionForm.jsx  # Formulario de conexion individual
│   │   │   └── BatchPanel.jsx      # Panel de aplicacion en lote
│   │   ├── hooks/
│   │   │   └── useTekla.js         # Hook central de estado y logica
│   │   ├── styles/
│   │   │   └── app.css             # Estilos de la aplicacion
│   │   ├── App.jsx                 # Componente raiz
│   │   └── main.jsx                # Entry point
│   ├── index.html                  # HTML base
│   ├── vite.config.js              # Config de Vite con proxy a Express
│   └── package.json
│
├── server/                         # Backend Node.js + edge-js
│   ├── index.js                    # Servidor Express con todas las rutas
│   ├── tekla/                      # Modulos de integracion con Tekla
│   │   ├── status.js               # Conexion y estado del modelo
│   │   ├── model.js                # Consulta de elementos (vigas, columnas)
│   │   └── connection.js           # Aplicacion de conexiones
│   ├── app.py                      # (Legacy) Servidor Flask no utilizado
│   └── package.json
│
├── package.json                    # Root: `npm run dev` levanta todo
├── .gitignore
└── README.md                       # Este archivo
```

### Decisiones de diseno

| Decision | Razon |
|:---|:---|
| **Node.js + edge-js** en vez de Python | Mejor rendimiento, sin pythonnet, integracion directa con DLLs .NET |
| **Express** como backend | Ligero, sin configuracion compleja, ideal para API REST local |
| **Vite** como bundler | HMR instantaneo, proxy integrado para desarrollo |
| **UI.ModelObjectSelector** para seleccion | `model.GetModelObjectSelector()` no tiene `GetSelectedObjects()` en Tekla 2020 |
| **Filtrado en C#** | Se filtra en el edge-js para no enviar datos innecesarios al cliente |

---

## Solucion de Problemas

| Problema | Causa | Solucion |
|:---|:---|:---|
| "Desconectado" en la barra de estado | Tekla no esta abierto o sin modelo | Abre Tekla 2020 y carga un modelo |
| "No hay elementos cargados" | No se hizo clic en "Cargar Seleccionados" | Selecciona elementos en Tekla y haz clic en el boton |
| Error al aplicar conexion | IDs invalidos o elementos incompatibles | Verifica que los IDs existen y son geometricamente compatibles |
| Puerto 3001 en uso | Otra instancia del servidor corriendo | `npx kill-port 3001 5173` y reinicia |
| edge-js no encuentra DLLs | Ruta incorrecta a Tekla | Verifica la instalacion en `C:\Program Files\Tekla Structures\2020.0\` |

---

## Licencia

MIT

---

<div align="center">

**Hecho con Python, React y mucho acero estructural**

</div>
