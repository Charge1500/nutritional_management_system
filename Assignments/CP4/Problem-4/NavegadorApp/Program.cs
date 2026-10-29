using System;
using System.IO;
using Contratos;

namespace NavegadorApp
{
    // Contexto mínimo: no conoce ninguna estrategia concreta, solo lee estrategias.json y carga las clases por reflexión.
    // Añadir un plugin no exige recompilar esta aplicación.
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== 4-E: Estrategias como plugins por reflexión ===\n");

            string rutaJson = Path.Combine(AppContext.BaseDirectory, "estrategias.json");
            Console.WriteLine($"Configuración: {rutaJson}\n");

            var estrategias = CargadorEstrategias.CargarTodas(rutaJson);
            Console.WriteLine($"\nEstrategias disponibles: {string.Join(", ", estrategias.Keys)}\n");

            Punto origen = new Punto(0, 0);
            Punto destino = new Punto(30, 40);

            foreach (var par in estrategias)
            {
                Ruta ruta = par.Value.Calcular(origen, destino);
                Console.WriteLine($"[{par.Key}] Puntos={ruta.Puntos.Count} Distancia={ruta.DistanciaKm:F2} km Minutos={ruta.Minutos:F2}");
            }

            Console.WriteLine("\n(El contexto no se recompiló: las estrategias nuevas se cargan desde el JSON y su DLL.)");
        }
    }
}
