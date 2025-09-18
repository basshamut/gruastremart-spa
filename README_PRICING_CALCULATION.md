# 📊 Sistema de Cálculo de Precios - Grúas TreMart

## 🎯 Descripción General

El sistema de precios de Grúas TreMart se basa en **categorías de peso** y **tipo de servicio** (urbano vs extra urbano). Los precios están diseñados para ser competitivos en el mercado venezolano.

---

## ⚖️ Categorías de Peso

### **PESO 1** - Vehículos Livianos
- **Rango**: Hasta 2,500 kg
- **Ejemplos**: Carros pequeños, sedanes, hatchbacks

### **PESO 2** - Vehículos Medianos  
- **Rango**: 2,501 kg hasta 5,000 kg
- **Ejemplos**: SUVs, camionetas, vans

### **PESO 3** - Vehículos Pesados
- **Rango**: 5,001 kg hasta 7,500 kg
- **Ejemplos**: Camiones pequeños, vehículos comerciales

---

## 🏙️ Tipos de Servicio

### **Servicio Urbano**
- **Definición**: Recorridos de **8 km o menos**
- **Características**: Precio fijo por categoría
- **Aplicación**: Traslados dentro de la ciudad

### **Servicio Extra Urbano**
- **Definición**: Recorridos de **más de 8 km**
- **Características**: Precio base + costo por kilómetro adicional
- **Aplicación**: Traslados a otras ciudades o distancias largas

---

## 💰 Estructura de Precios

### **PESO 1 (≤ 2,500 kg)**

#### Urbano (≤ 8 km)
```
Precio Fijo: $30 USD
```

#### Extra Urbano (> 8 km)
```
Precio Base: $30 USD (enganche)
+ Kilómetros adicionales: $1 USD por km
```

**Ejemplo**: Recorrido de 15 km
- Base: $30 USD
- Adicional: (15 - 8) × $1 = $7 USD
- **Total: $37 USD**

---

### **PESO 2 (2,501 - 5,000 kg)**

#### Urbano (≤ 8 km)
```
Precio Fijo: $60 USD
```

#### Extra Urbano (> 8 km)
```
Precio Base: $60 USD (enganche)
+ Kilómetros adicionales: $1.50 USD por km
```

**Ejemplo**: Recorrido de 20 km
- Base: $60 USD
- Adicional: (20 - 8) × $1.50 = $18 USD
- **Total: $78 USD**

---

### **PESO 3 (5,001 - 7,500 kg)**

#### Urbano (≤ 8 km)
```
Precio Fijo: $70 USD
```

#### Extra Urbano (> 8 km)
```
Precio Base: $70 USD (enganche)
+ Kilómetros adicionales: $1.80 USD por km
```

**Ejemplo**: Recorrido de 25 km
- Base: $70 USD
- Adicional: (25 - 8) × $1.80 = $30.60 USD
- **Total: $100.60 USD**

---

## 🧮 Fórmula de Cálculo

### **Para Servicio Urbano:**
```javascript
precio_total = precio_fijo_categoria
```

### **Para Servicio Extra Urbano:**
```javascript
kilometros_extra = distancia_total - 8
precio_total = precio_base_categoria + (kilometros_extra × tarifa_por_km)
```

---

## 📱 Implementación en la Aplicación

### **1. Selección de Categoría**
El operador selecciona la categoría de peso apropiada basándose en:
- Tipo de vehículo reportado
- Peso estimado del vehículo
- Experiencia del operador

### **2. Cálculo Automático**
La aplicación calcula automáticamente:
- Distancia entre origen y destino
- Tipo de servicio (urbano vs extra urbano)
- Precio total según la categoría seleccionada

### **3. Visualización**
Se muestra al operador:
- Categoría de peso seleccionada
- Tipo de servicio aplicable
- Desglose del cálculo
- Precio total en USD

---

## 🔄 Flujo de Cálculo en la Interfaz

1. **Operador abre solicitud** → Ve detalles del vehículo
2. **Selecciona categoría de peso** → Sistema sugiere basándose en el tipo de vehículo
3. **Sistema calcula distancia** → Entre ubicación actual y destino
4. **Determina tipo de servicio** → Urbano (≤8km) o Extra urbano (>8km)
5. **Calcula precio total** → Según fórmulas establecidas
6. **Muestra desglose** → Operador confirma antes de asignar

---

## 🎯 Ventajas Competitivas

- **Transparencia**: Precios claros y predecibles
- **Competitividad**: Por debajo de la competencia actual
- **Flexibilidad**: Sistema escalable para nuevas categorías
- **Automatización**: Cálculos instantáneos sin errores manuales

---

## 📊 Tabla Resumen de Precios

| Categoría | Peso (kg) | Urbano (≤8km) | Extra Base | Por km adicional |
|-----------|-----------|---------------|------------|------------------|
| PESO 1    | ≤ 2,500   | $30 USD      | $30 USD    | $1.00 USD       |
| PESO 2    | 2,501-5,000| $60 USD      | $60 USD    | $1.50 USD       |
| PESO 3    | 5,001-7,500| $70 USD      | $70 USD    | $1.80 USD       |

---

## 🔧 Configuración Técnica

### **En la Base de Datos**
Los precios se almacenan en la tabla `crane_pricing` con:
- `weightCategory`: Categoría de peso
- `pricing.urban.fixedPriceUsd`: Precio urbano fijo
- `pricing.urban.maxDistanceKm`: Límite urbano (8 km)
- `pricing.extraUrban.basePriceUsd`: Precio base extra urbano
- `pricing.extraUrban.pricePerKmUsd`: Tarifa por km adicional

### **En el Frontend**
El cálculo se realiza en `CranePricingService.js` usando la función:
```javascript
calculateServicePrice(pricing, distance, serviceType)
```

---

## 🧮 Ejemplos de Cálculo Prácticos

### **Ejemplo 1: Sedán en la Ciudad (Servicio Urbano)**

**Vehículo**: Toyota Corolla 2018  
**Peso estimado**: 1,400 kg → **PESO 1**  
**Recorrido**: Del Centro de Caracas a Los Palos Grandes  
**Distancia**: 6 km  

#### Cálculo:
- **Categoría**: PESO 1 (≤ 2,500 kg)
- **Tipo de servicio**: Urbano (≤ 8 km)
- **Precio**: $30 USD (precio fijo)

```
💰 Total a pagar: $30 USD
```

---

### **Ejemplo 2: SUV a las Afueras (Servicio Extra Urbano)**

**Vehículo**: Toyota 4Runner 2020  
**Peso estimado**: 3,200 kg → **PESO 2**  
**Recorrido**: De Caracas a La Guaira  
**Distancia**: 18 km  

#### Cálculo:
- **Categoría**: PESO 2 (2,501 - 5,000 kg)
- **Tipo de servicio**: Extra urbano (> 8 km)
- **Precio base**: $60 USD
- **Kilómetros extra**: 18 - 8 = 10 km
- **Costo adicional**: 10 km × $1.50 = $15 USD

```
💰 Total a pagar: $60 + $15 = $75 USD
```

---

### **Ejemplo 3: Camioneta Pesada a Otra Ciudad**

**Vehículo**: Ford F-350 2019  
**Peso estimado**: 6,500 kg → **PESO 3**  
**Recorrido**: De Caracas a Valencia  
**Distancia**: 45 km  

#### Cálculo:
- **Categoría**: PESO 3 (5,001 - 7,500 kg)
- **Tipo de servicio**: Extra urbano (> 8 km)
- **Precio base**: $70 USD
- **Kilómetros extra**: 45 - 8 = 37 km
- **Costo adicional**: 37 km × $1.80 = $66.60 USD

```
💰 Total a pagar: $70 + $66.60 = $136.60 USD
```

---

## 🔍 Casos Límite

### **Ejemplo 4: Justo en el Límite Urbano**

**Vehículo**: Chevrolet Aveo  
**Peso estimado**: 1,100 kg → **PESO 1**  
**Recorrido**: Exactamente 8 km  

#### Cálculo:
- **Categoría**: PESO 1
- **Tipo de servicio**: Urbano (= 8 km)
- **Precio**: $30 USD (precio fijo)

```
💰 Total a pagar: $30 USD
```

---

### **Ejemplo 5: Un Kilómetro Más Allá del Límite**

**Vehículo**: Mismo Chevrolet Aveo  
**Recorrido**: 9 km (solo 1 km más)  

#### Cálculo:
- **Categoría**: PESO 1
- **Tipo de servicio**: Extra urbano (> 8 km)
- **Precio base**: $30 USD
- **Kilómetros extra**: 9 - 8 = 1 km
- **Costo adicional**: 1 km × $1.00 = $1 USD

```
💰 Total a pagar: $30 + $1 = $31 USD
```

---

## 📊 Comparación por Categorías

### **Recorrido de 15 km en las 3 Categorías**

| Categoría | Peso (kg) | Base | Extra (7km) | Total |
|-----------|-----------|------|-------------|-------|
| **PESO 1** | ≤ 2,500 | $30 | 7 × $1.00 = $7 | **$37** |
| **PESO 2** | 2,501-5,000 | $60 | 7 × $1.50 = $10.50 | **$70.50** |
| **PESO 3** | 5,001-7,500 | $70 | 7 × $1.80 = $12.60 | **$82.60** |

---

## 🎯 Guía para Operadores

### **¿Cómo Elegir la Categoría Correcta?**

#### **PESO 1** - Hasta 2,500 kg
✅ **Incluye**: Carros pequeños, sedanes, hatchbacks  
✅ **Ejemplos**: Corolla, Civic, Sentra, Gol, Aveo  
❌ **No incluye**: SUVs grandes, camionetas

#### **PESO 2** - 2,501 a 5,000 kg  
✅ **Incluye**: SUVs medianos, camionetas pickup, vans  
✅ **Ejemplos**: 4Runner, Hilux, Crv, Terios, Forester  
❌ **No incluye**: Camiones comerciales

#### **PESO 3** - 5,001 a 7,500 kg
✅ **Incluye**: Camionetas grandes, vehículos comerciales  
✅ **Ejemplos**: F-350, NPR, vehículos de carga  
❌ **No incluye**: Camiones de más de 7.5 toneladas

---

## 🔧 Integración con la API

### **Endpoints Disponibles**

Según la documentación de la [API de GruasTremart](https://webtechnologysoftware.net/gruastremart-core-api/v3/api-docs), el sistema cuenta con:

#### **Crane Pricing Management**
- **GET** `/v1/crane-pricing` - Obtener categorías de precio con filtros
- **Schemas disponibles**:
  - `CranePricingResponseDto`
  - `WeightCategoryDto` 
  - `PricingDto`
  - `UrbanPricingDto`
  - `ExtraUrbanPricingDto`

#### **Asignación de Categorías**
- **PATCH** `/v1/crane-demands/{id}/assign` - Asignar demanda con categoría de peso
- **Enum**: `["PESO_1","PESO_2","PESO_3"]`

### **Estructura de Datos**

```json
{
  "weightCategory": {
    "name": "PESO_1",
    "minWeightKg": 0,
    "maxWeightKg": 2500,
    "description": "Vehículos livianos"
  },
  "pricing": {
    "urban": {
      "type": "urbano",
      "maxDistanceKm": 8,
      "fixedPriceUsd": 30.00
    },
    "extraUrban": {
      "type": "extra_urbano", 
      "basePriceUsd": 30.00,
      "pricePerKmUsd": 1.00
    }
  }
}
```

---

## ⚠️ Notas Importantes

### **Para el Operador**:
- Si tienes dudas sobre el peso, es mejor **sobreestimar** la categoría
- El sistema calcula automáticamente la distancia usando GPS
- Los precios se muestran **antes** de confirmar la asignación

### **Para el Cliente**:
- Los precios son **transparentes** y se informan por adelantado
- No hay costos ocultos o sorpresas
- El pago se realiza al completar el servicio

### **Competitividad**:
- Estos precios están **por debajo** de la competencia actual
- Ofrecemos el mejor valor en el mercado venezolano
- Servicio profesional a precios justos

---

*Documento actualizado: Enero 2025*
*Sistema de precios competitivo para el mercado venezolano*
*Integrado con [API GruasTremart v3](https://webtechnologysoftware.net/gruastremart-core-api/v3/api-docs)*
