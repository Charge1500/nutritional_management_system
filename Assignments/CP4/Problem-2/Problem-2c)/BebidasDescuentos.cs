using System;
using System.Collections.Generic;
using System.Text.Json;

namespace BebidasDescuentos
{
    // Contrato compartido de la pregunta 2
    public interface IBebida
    {
        string ObtenerDescripcion();
        double ObtenerCosto();
    }

    // Decorador base de la pregunta 2 
    // No conoce la combinación completa de la bebida: ahi está el problema.
    public abstract class DecoradorBebida : IBebida
    {
        protected IBebida bebida;

        protected DecoradorBebida(IBebida bebida)
        {
            this.bebida = bebida;
        }

        public virtual string ObtenerDescripcion()
        {
            return bebida.ObtenerDescripcion();
        }

        public virtual double ObtenerCosto()
        {
            return bebida.ObtenerCosto();
        }
    }

    // Bebida base y complementos mínimos para 2c
    public class Cafe : IBebida
    {
        public string ObtenerDescripcion() { return "Café"; }
        public double ObtenerCosto() { return 2.00; }
    }

    public class Leche : DecoradorBebida
    {
        public Leche(IBebida bebida) : base(bebida) { }
        public override string ObtenerDescripcion() { return bebida.ObtenerDescripcion() + " + Leche"; }
        public override double ObtenerCosto() { return bebida.ObtenerCosto() + 0.50; }
    }

    public class Canela : DecoradorBebida
    {
        public Canela(IBebida bebida) : base(bebida) { }
        public override string ObtenerDescripcion() { return bebida.ObtenerDescripcion() + " + Canela"; }
        public override double ObtenerCosto() { return bebida.ObtenerCosto() + 0.30; }
    }

    public class Azucar : DecoradorBebida
    {
        public Azucar(IBebida bebida) : base(bebida) { }
        public override string ObtenerDescripcion() { return bebida.ObtenerDescripcion() + " + Azúcar"; }
        public override double ObtenerCosto() { return bebida.ObtenerCosto() + 0.20; }
    }

    // Descriptor del pedido: complementos con cantidades y vista de solo lectura: las reglas de descuento consultan cantidades
    // Este registro es también lo que se persistiría en la base de datos: serializar el descriptor, no la cadena de decoradores.
    public class DescriptorPedido
    {
        public string BebidaBase { get; set; }

        private readonly Dictionary<string, int> complementos = new Dictionary<string, int>();

        public IReadOnlyDictionary<string, int> Complementos
        {
            get { return complementos; }
        }

        internal void Agregar(string tipo, int cantidad)
        {
            complementos[tipo] = complementos.GetValueOrDefault(tipo) + cantidad;
        }

        public int ObtenerCantidad(string tipo)
        {
            return complementos.GetValueOrDefault(tipo);
        }

        public string AJson()
        {
            var copia = new Dictionary<string, int>(complementos);
            return JsonSerializer.Serialize(new { BebidaBase, Complementos = copia },
                new JsonSerializerOptions { WriteIndented = true });
        }
    }


    // Constructor de bebidas: crea la cadena de decoradores Y el descriptor desde la misma especificación validada, en una sola operación
    // Si algo no está soportado, se rechaza antes de modificar nada (así el descriptor nunca queda con datos que la cadena no refleja).

    public class ConstructorBebida
    {
        private static readonly HashSet<string> BebidasSoportadas = new HashSet<string> { "Café" };
        private static readonly HashSet<string> ComplementosSoportados = new HashSet<string> { "Leche", "Canela", "Azúcar" };

        public IBebida Bebida { get; private set; }
        public DescriptorPedido Descriptor { get; } = new DescriptorPedido();

        public ConstructorBebida(string bebidaBase)
        {
            if (!BebidasSoportadas.Contains(bebidaBase))
            {
                throw new ArgumentException($"Bebida base no soportada: {bebidaBase}");
            }
            Descriptor.BebidaBase = bebidaBase;
            Bebida = new Cafe();
        }

        public ConstructorBebida ConComplemento(string tipo, int cantidad)
        {
            if (!ComplementosSoportados.Contains(tipo))
            {
                throw new ArgumentException($"Complemento no soportado: {tipo}");
            }
            if (cantidad <= 0)
            {
                throw new ArgumentException("La cantidad debe ser positiva");
            }

            // Misma especificación alimenta al descriptor y a la cadena.
            Descriptor.Agregar(tipo, cantidad);
            for (int i = 0; i < cantidad; i++)
            {
                Bebida = tipo switch
                {
                    "Leche" => new Leche(Bebida),
                    "Canela" => new Canela(Bebida),
                    "Azúcar" => new Azucar(Bebida),
                    _ => Bebida // inalcanzable: ya validado arriba
                };
            }
            return this;
        }
    }

    // Servicio de precios: las promociones por combinación aquí, fuera de los decoradores. 
    // Recibe el subtotal de la bebida (IBebida.ObtenerCosto()) y el descriptor, y decide  el descuento una sola vez por pedido.
    // los descuentos de varias reglas se suman, cada uno calculado sobre el subtotal original.
    public interface IReglaDescuento
    {
        string Nombre { get; }
        double CalcularDescuento(double subtotal, DescriptorPedido pedido);
    }

    // Regla del enunciado: Leche + Canela = 10% de descuento.
    // Se aplica una sola vez aunque haya doble porción y es independiente del orden de los decoradores.
    public class ReglaLecheCanela : IReglaDescuento
    {
        public string Nombre { get { return "LECHE_CANELA_10"; } }

        public double CalcularDescuento(double subtotal, DescriptorPedido pedido)
        {
            bool tieneLeche = pedido.ObtenerCantidad("Leche") >= 1;
            bool tieneCanela = pedido.ObtenerCantidad("Canela") >= 1;
            if (tieneLeche && tieneCanela)
            {
                return subtotal * 0.10;
            }
            return 0.0;
        }
    }

    public class ServicioPrecios
    {
        private readonly List<IReglaDescuento> reglas = new List<IReglaDescuento>();

        public ServicioPrecios AgregarRegla(IReglaDescuento regla)
        {
            reglas.Add(regla);
            return this;
        }

        public double CalcularTotal(IBebida bebida, DescriptorPedido pedido)
        {
            double subtotal = bebida.ObtenerCosto();
            double descuento = 0.0;
            foreach (IReglaDescuento regla in reglas)
            {
                descuento += regla.CalcularDescuento(subtotal, pedido);
            }
            return subtotal - descuento;
        }
    }

    // Prueba de casos del inciso 2c.
    public class Program
    {
        public static void Main()
        {
            var precios = new ServicioPrecios().AgregarRegla(new ReglaLecheCanela());

            Console.WriteLine("=== 2c: Decorator y descuentos por combinación ===\n");

            Caso(precios, "Caso 1: se añade Leche y después Canela → envoltura Canela(Leche(Café))",
                 b => b.ConComplemento("Leche", 1).ConComplemento("Canela", 1));
            Caso(precios, "Caso 2: se añade Canela y después Leche → envoltura Leche(Canela(Café))",
                 b => b.ConComplemento("Canela", 1).ConComplemento("Leche", 1));
            Caso(precios, "Caso 3: Café + Leche ",
                 b => b.ConComplemento("Leche", 1));
            Caso(precios, "Caso 4: Café + Leche x2 + Canela (doble porción y descuento solo una vez)",
                 b => b.ConComplemento("Leche", 2).ConComplemento("Canela", 1));

            Console.WriteLine("=== Persistencia (restricción del ejercicio) ===");
            Console.WriteLine("Se guarda el descriptor, no la cadena de decoradores:");
            ConstructorBebida cb = new ConstructorBebida("Café")
                .ConComplemento("Leche", 1)
                .ConComplemento("Azúcar", 2);
            Console.WriteLine(cb.Descriptor.AJson());
            Console.WriteLine("Para reconstruir: leer el JSON y envolver la base con un decorador por cada porción (estos complementos son aditivos)");
            PruebaFlyweight.Ejecutar();
        }

        private static void Caso(ServicioPrecios precios, string titulo,
                                 Func<ConstructorBebida, ConstructorBebida> configurar)
        {
            ConstructorBebida constructor = configurar(new ConstructorBebida("Café"));
            double subtotal = constructor.Bebida.ObtenerCosto();
            double total = precios.CalcularTotal(constructor.Bebida, constructor.Descriptor);
            Console.WriteLine(titulo);
            Console.WriteLine($"  Cadena: {constructor.Bebida.ObtenerDescripcion()}");
            Console.WriteLine($"  Subtotal: {subtotal:F2} | Total con descuento: {total:F2}\n");
        }
    }
}
