# Demostración práctica del Principio de Inversión de Dependencias (DIP)

## 1. Descripción

Este proyecto presenta una implementación práctica del Principio de Inversión de Dependencias (*Dependency Inversion Principle*, DIP), uno de los principios SOLID del diseño orientado a objetos.

El ejemplo modela la validación de una dirección durante el procesamiento de un pedido. Su objetivo es demostrar cómo separar la lógica de negocio de los detalles de comunicación con servicios externos mediante abstracciones e inyección de dependencias.

Este trabajo se desarrolla como material complementario de la pregunta 4 del seminario **«Un Análisis Comparativo de Estilos Basados en Capas y Dominio»**.

## 2. Objetivos

- Identificar el problema de depender directamente de implementaciones concretas.
- Aplicar el DIP mediante una interfaz que representa una necesidad de la lógica de negocio.
- Separar el núcleo de la infraestructura encargada de la comunicación HTTP.
- Demostrar cómo las pruebas unitarias pueden utilizar implementaciones simuladas para comprobar la lógica de negocio de forma aislada.

## 3. Arquitectura del ejemplo

El proyecto se organiza en tres partes:

### Núcleo (`Pregunta4DIP.Core`)

Contiene la lógica de negocio y las abstracciones principales.

- `IAddressValidator.cs`: define el contrato para validar direcciones.
- `OrderProcessor.cs`: utiliza la interfaz para comprobar la validez de una dirección.

### Infraestructura (`Pregunta4DIP.Infrastructure`)

Contiene los detalles técnicos de comunicación con servicios externos.

- `HttpAddressValidatorAdapter.cs`: implementa `IAddressValidator` mediante peticiones HTTP.

El adaptador es ilustrativo y presupone la existencia de un servicio externo compatible. No se incluye un servidor real de validación de direcciones.

### Pruebas (`Pregunta4DIP.Tests`)

Contiene las pruebas unitarias realizadas con xUnit.

- `FakeAddressValidator.cs`: simula la validación y permite controlar el resultado.
- `OrderProcessorTests.cs`: comprueba el comportamiento del procesador ante direcciones válidas e inválidas.

## 4. Principio de Inversión de Dependencias

La clase `OrderProcessor` no depende directamente de `HttpAddressValidatorAdapter`. En su lugar, depende de la abstracción `IAddressValidator`, que recibe mediante inyección por constructor.

De esta forma, la implementación de infraestructura puede sustituirse por otra que cumpla el mismo contrato sin modificar la lógica de negocio.

Esta separación facilita las pruebas unitarias, reduce el acoplamiento y permite cambiar los mecanismos técnicos sin afectar directamente al núcleo.

## 5. Tecnologías utilizadas

- C#
- .NET 10
- xUnit
- `HttpClient` para la comunicación HTTP del adaptador

## 6. Requisitos previos

- Tener instalado el SDK de .NET 10.
- Disponer de acceso a los paquetes NuGet necesarios para restaurar las dependencias.

## 7. Cómo ejecutar el proyecto

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Assignments/SemArqCapas-1/Codigos P4
```

Restaurar las dependencias:

```bash
dotnet restore
```

Ejecutar las pruebas unitarias:

```bash
dotnet test
```

Las pruebas verifican dos escenarios: una dirección válida, para la que no debe producirse una excepción, y una dirección inválida, para la que se espera una `ArgumentException`.

No es necesario disponer de un servicio HTTP externo para ejecutar estas pruebas, ya que utilizan `FakeAddressValidator`.

## 8. Alcance y limitaciones

La implementación se centra en ilustrar el DIP y las pruebas unitarias de la lógica de validación. No constituye un sistema completo de gestión de pedidos y no implementa el almacenamiento ni la finalización real de estos.

La comunicación HTTP requiere un servicio externo compatible y una configuración adecuada de `HttpClient`, aspectos que no forman parte de las pruebas unitarias incluidas.

