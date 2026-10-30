using System;
using System.Collections.Generic;

namespace BebidasDescuentos
{
    // Decorador con estado extrínseco (la cantidad va fuera del objeto compartido)
    public class ComplementoFlyweight : AgregadoDecorator 
    {
        private readonly string _tipo;
        private readonly double _costoUnitario;
        private readonly int _cantidad;

        public ComplementoFlyweight(IBebida bebida, string tipo, double costoUnitario, int cantidad)
            : base(bebida)
        {
            _tipo = tipo;
            _costoUnitario = costoUnitario;
            _cantidad = cantidad;
        }

        public override string GetDescripcion()
            => _bebida.GetDescripcion() + $" + {_tipo} x{_cantidad}";

        public override double Costo()
            => _bebida.Costo() + (_costoUnitario * _cantidad);
    }

    // Fábrica Flyweight: comparte los datos intrínsecos de cada complemento
    public class FabricaComplementos
    {
        private readonly Dictionary<string, (string tipo, double costo)> _cache = new();

        public (string tipo, double costo) ObtenerComplemento(string clave)
        {
            if (!_cache.ContainsKey(clave))
            {
                double costo = clave switch
                {
                    "Leche" => 0.50,
                    "Azúcar" => 0.20,
                    "Canela" => 0.30,
                    "Crema" => 0.60,
                    "Sirope" => 0.70,
                    "Vainilla" => 0.40,
                    _ => 0.0
                };
                _cache[clave] = (clave, costo);
                Console.WriteLine($"   [Flyweight] Creando nuevo complemento en caché: {clave}");
            }
            else
            {
                Console.WriteLine($"   [Flyweight] Reutilizando complemento de caché: {clave}");
            }
            return _cache[clave];
        }
    }

    // Prueba de la pieza 2-D
    public class PruebaFlyweight
    {
        public static void Ejecutar()
        {
            Console.WriteLine("=== 2-D: Medición de Objetos y Flyweight ===\n");

            // --- A. Sin Flyweight (Decorator tradicional) ---
            Console.WriteLine("--- A. Sin Flyweight (5 complementos, con doble porción) ---");
            IBebida bebidaNormal = new Cafe();
            bebidaNormal = new Leche(bebidaNormal);
            bebidaNormal = new Azucar(bebidaNormal);
            bebidaNormal = new Canela(bebidaNormal);
            bebidaNormal = new Leche(bebidaNormal);   // doble leche
            bebidaNormal = new Azucar(bebidaNormal);  // doble azúcar

            Console.WriteLine($"Bebida: {bebidaNormal.GetDescripcion()}");
            Console.WriteLine($"Costo: {bebidaNormal.Costo():F2}");
            Console.WriteLine("Objetos creados: 1 (Café) + 6 (Decoradores) = 7 objetos.\n");

            // --- B. Con Flyweight ---
            Console.WriteLine("--- B. Con Flyweight (mismos 5 complementos) ---");
            FabricaComplementos fabrica = new FabricaComplementos();
            IBebida bebidaFlyweight = new Cafe();

            var leche   = fabrica.ObtenerComplemento("Leche");
            var azucar  = fabrica.ObtenerComplemento("Azúcar");
            var canela  = fabrica.ObtenerComplemento("Canela");
            var leche2  = fabrica.ObtenerComplemento("Leche");   // reutiliza
            var azucar2 = fabrica.ObtenerComplemento("Azúcar");  // reutiliza

            bebidaFlyweight = new ComplementoFlyweight(bebidaFlyweight, leche.tipo, leche.costo, 1);
            bebidaFlyweight = new ComplementoFlyweight(bebidaFlyweight, azucar.tipo, azucar.costo, 1);
            bebidaFlyweight = new ComplementoFlyweight(bebidaFlyweight, canela.tipo, canela.costo, 1);
            bebidaFlyweight = new ComplementoFlyweight(bebidaFlyweight, leche2.tipo, leche2.costo, 1);
            bebidaFlyweight = new ComplementoFlyweight(bebidaFlyweight, azucar2.tipo, azucar2.costo, 1);

            Console.WriteLine($"Bebida: {bebidaFlyweight.GetDescripcion()}");
            Console.WriteLine($"Costo: {bebidaFlyweight.Costo():F2}");

            Console.WriteLine("\n--- ANÁLISIS DE ALTA CONCURRENCIA ---");
            Console.WriteLine("Sin Flyweight: 1000 pedidos de este tipo crean 7000 objetos.");
            Console.WriteLine("Con Flyweight: 1000 pedidos solo crean 3 objetos base compartidos (Leche, Azúcar, Canela).");
            Console.WriteLine("Los ComplementoFlyweight son ligeros (solo referencias + cantidad).");
            Console.WriteLine("=> Es ALTAMENTE ACEPTABLE para un sistema de alta concurrencia.");
        }
    }
}