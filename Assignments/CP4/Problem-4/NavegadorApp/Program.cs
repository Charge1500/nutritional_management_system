using System;
using System.Collections.Generic;
using Contratos;

namespace NavegadorApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== 4-B: Implementación de las 5 Estrategias y cambio dinámico ===\n");

            Punto origen = new Punto(0, 0);
            Punto destino = new Punto(30, 40);

            // 1. Instanciamos las estrategias
            var estrategias = new Dictionary<string, IEstrategiaRuta>
            {
                { "Rápida", new EstrategiaRapida() },
                { "Corta", new EstrategiaCorta() },
                { "Evitar Autopistas", new EstrategiaEvitarAutopistas() },
                { "Evitar Peajes", new EstrategiaEvitarPeajes() },
                { "Ecológica", new EstrategiaEcologica() }
            };

            // 2. Probamos cada estrategia individualmente
            Console.WriteLine("--- Prueba de las 5 Estrategias ---");
            foreach (var par in estrategias)
            {
                Ruta ruta = par.Value.Calcular(origen, destino);
                Console.WriteLine($"[{par.Key}] Distancia: {ruta.DistanciaKm:F2} km | Tiempo: {ruta.Minutos:F2} min");
            }

            // 3. Demostración del cambio dinámico en tiempo de ejecución
            Console.WriteLine("\n--- Demostración del Contexto Dinámico ---");
            ContextoGPS gps = new ContextoGPS(new EstrategiaRapida());
            
            Console.WriteLine("Usuario inicia con ruta Rápida:");
            MostrarRuta(gps.CalcularRuta(origen, destino));

            Console.WriteLine("\n¡El usuario recibe alerta de tráfico! Cambiando a ruta Ecológica...");
            gps.CambiarEstrategia(new EstrategiaEcologica());
            MostrarRuta(gps.CalcularRuta(origen, destino));

            Console.WriteLine("\nEl usuario decide evitar peajes a mitad del viaje...");
            gps.CambiarEstrategia(new EstrategiaEvitarPeajes());
            MostrarRuta(gps.CalcularRuta(origen, destino));

            Console.WriteLine("\n=== Análisis de Extensibilidad (Pieza 4-B) ===");
            Console.WriteLine("Para añadir una sexta estrategia (ej. 'Ruta con menos semáforos'):");
            Console.WriteLine("1. Se crea la clase 'EstrategiaMenosSemaforos' implementando IEstrategiaRuta.");
            Console.WriteLine("2. Se añade la entrada al archivo 'estrategias.json'.");
            Console.WriteLine("3. NO se modifica el ContextoGPS, ni las estrategias existentes, ni el cargador.");
            Console.WriteLine("=> El sistema es ABIERTO a extensión y CERRADO a modificación (Principio Open/Closed).");

            // 4. Prueba del cargador por reflexión (Meyli)
            Console.WriteLine("\n--- Prueba del Cargador por Reflexión (JSON) ---");
            try
            {
                string rutaJson = System.IO.Path.Combine(AppContext.BaseDirectory, "estrategias.json");
                var cargadas = CargadorEstrategias.CargarTodas(rutaJson);
                Console.WriteLine($"Estrategias cargadas desde JSON: {string.Join(", ", cargadas.Keys)}");
                
                foreach (var par in cargadas)
                {
                    Ruta ruta = par.Value.Calcular(origen, destino);
                    Console.WriteLine($"[{par.Key}] Distancia: {ruta.DistanciaKm:F2} km | Tiempo: {ruta.Minutos:F2} min");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al cargar estrategias desde JSON: {ex.Message}");
            }
        }

        private static void MostrarRuta(Ruta ruta)
        {
            Console.WriteLine($"   -> Distancia: {ruta.DistanciaKm:F2} km | Tiempo: {ruta.Minutos:F2} min");
        }
    }
}
