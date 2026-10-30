// Inciso c): descuentos por combinación (Leche + Canela = 10%)
// Reutiliza IBebida y los decoradores del inciso b) 

using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;

namespace BebidasDescuentos
{
// Receta del pedido: bebida base y cantidad de cada complemento (solo lectura)
public class DescriptorPedido
{
    public string BebidaBase { get; }
    public IReadOnlyDictionary<string, int> Complementos { get; }

    public DescriptorPedido(string bebidaBase, Dictionary<string, int> complementos)
    {
        BebidaBase = bebidaBase;
        Complementos = new Dictionary<string, int>(complementos);
    }

    public int Cantidad(string complemento) =>
        Complementos.TryGetValue(complemento, out int n) ? n : 0;
}

// Construye la cadena de decoradores y el descriptor desde la misma receta
public static class ConstructorBebida
{
    private static readonly Dictionary<string, Func<IBebida>> Bases =
        new Dictionary<string, Func<IBebida>>
        {
            ["Cafe"] = () => new Cafe(),
            ["Te"] = () => new Te(),
            ["Chocolate"] = () => new Chocolate()
        };

    // Orden fijo de envoltura (determinista): el catálogo del inciso b)
    private static readonly (string Nombre, Func<IBebida, IBebida> Decorar)[] Catalogo =
    {
        ("Leche",   b => new Leche(b)),
        ("Azucar",  b => new Azucar(b)),
        ("Crema",   b => new Crema(b)),
        ("Canela",  b => new Canela(b)),
        ("Sirope",  b => new Sirope(b)),
        ("Vainilla", b => new Vainilla(b))
    };

    public static (IBebida Bebida, DescriptorPedido Descriptor) Construir(
        string bebidaBase, Dictionary<string, int> complementos)
    {
        if (!Bases.TryGetValue(bebidaBase, out var crearBase))
            throw new ArgumentException("Bebida base desconocida: " + bebidaBase);

        foreach (var par in complementos)
        {
            if (par.Value <= 0)
                throw new ArgumentException("Cantidad no positiva: " + par.Key);
            if (!Catalogo.Any(c => c.Nombre == par.Key))
                throw new ArgumentException("Complemento desconocido: " + par.Key);
        }

        IBebida bebida = crearBase();
        foreach (var (nombre, decorar) in Catalogo)
        {
            complementos.TryGetValue(nombre, out int cantidad);
            for (int i = 0; i < cantidad; i++)
                bebida = decorar(bebida);
        }
        return (bebida, new DescriptorPedido(bebidaBase, complementos));
    }
}

public interface IReglaDescuento
{
    double CalcularDescuento(DescriptorPedido pedido, double subtotal);
}

// Leche + Canela = 10%, una sola vez por pedido (basta con >= 1 de cada una)
public class ReglaLecheCanela : IReglaDescuento
{
    public double CalcularDescuento(DescriptorPedido pedido, double subtotal) =>
        pedido.Cantidad("Leche") >= 1 && pedido.Cantidad("Canela") >= 1
            ? 0.10 * subtotal
            : 0.0;
}

public class ServicioPrecios
{
    private readonly IEnumerable<IReglaDescuento> _reglas;

    public ServicioPrecios(IEnumerable<IReglaDescuento> reglas)
    {
        _reglas = reglas;
    }

    // Cada descuento se calcula sobre el subtotal original y luego se suman
    public double Total(IBebida bebida, DescriptorPedido pedido)
    {
        double subtotal = bebida.Costo();
        return subtotal - _reglas.Sum(r => r.CalcularDescuento(pedido, subtotal));
    }
}

public static class PruebaDescuentos
{
    static string F(double x) => x.ToString("F2", CultureInfo.InvariantCulture);

    static void Probar(ServicioPrecios servicio, string baseNombre,
                       Dictionary<string, int> complementos)
    {
        var (bebida, descriptor) = ConstructorBebida.Construir(baseNombre, complementos);
        Console.WriteLine(bebida.GetDescripcion() + " -> Subtotal $" + F(bebida.Costo())
            + ", Total $" + F(servicio.Total(bebida, descriptor)));
    }

    public static void Main()
    {
        var servicio = new ServicioPrecios(new IReglaDescuento[]
        {
            new ReglaLecheCanela()
        });

        // 1. Leche + Canela: se aplica el 10%
        Probar(servicio, "Cafe", new Dictionary<string, int> { ["Leche"] = 1, ["Canela"] = 1 });

        // 2. Solo leche: no hay descuento
        Probar(servicio, "Cafe", new Dictionary<string, int> { ["Leche"] = 1 });

        // 3. Mismos complementos en otro orden: mismo resultado que el caso 1
        Probar(servicio, "Cafe", new Dictionary<string, int> { ["Canela"] = 1, ["Leche"] = 1 });

        // 4. Doble porción de ambos: el descuento se aplica una sola vez
        Probar(servicio, "Cafe", new Dictionary<string, int> { ["Leche"] = 2, ["Canela"] = 2 });

            PruebaFlyweight.Ejecutar();
    }
}
}
