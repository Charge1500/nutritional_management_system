using System;
using System.Collections.Generic;
using System.Text.Json;

    // Contrato compartido de la pregunta 2
public interface IBebida
{
    string GetDescripcion();
    double Costo();
}

public class Cafe : IBebida
{
    public string GetDescripcion() => "Café";
    public double Costo() => 2.00;
}

public class Te : IBebida
{
    public string GetDescripcion() => "Té";
    public double Costo() => 1.50;
}

public class Chocolate : IBebida
{
    public string GetDescripcion() => "Chocolate";
    public double Costo() => 1.50;
}

// Decorador base de la pregunta 2 
// No conoce la combinación completa de la bebida: ahi está el problema.
public abstract class AgregadoDecorator : IBebida
{
    protected IBebida _bebida;

    protected AgregadoDecorator(IBebida bebida)
    {
        _bebida = bebida ?? throw new ArgumentNullException(nameof(bebida));
    }

    public virtual string GetDescripcion() => _bebida.GetDescripcion();
    public virtual double Costo() => _bebida.Costo();
}

public class Leche : AgregadoDecorator
{
    public Leche(IBebida bebida) : base(bebida) { }
    public override string GetDescripcion() => _bebida.GetDescripcion() + ", Leche";
    public override double Costo() => _bebida.Costo() + 0.50;
}

public class Crema : AgregadoDecorator
{
    public Crema(IBebida bebida) : base(bebida) { }
    public override string GetDescripcion() => _bebida.GetDescripcion() + ", Crema";
    public override double Costo() => _bebida.Costo() + 0.75;
}

public class Canela : AgregadoDecorator
{
    public Canela(IBebida bebida) : base(bebida) { }
    public override string GetDescripcion() => _bebida.GetDescripcion() + ", Canela"; 
    public override double Costo() => _bebida.Costo() + 0.30; 
}

public class Azucar : AgregadoDecorator
{
    public Azucar(IBebida bebida) : base(bebida) { }
    public override string GetDescripcion() => _bebida.GetDescripcion() + ", Azúcar"; 
    public override double Costo() => _bebida.Costo() + 0.25; 
}

public class Sirope : AgregadoDecorator
{
    public Sirope(IBebida bebida) : base(bebida) { }
    public override string GetDescripcion() => _bebida.GetDescripcion() + ", Sirope";
    public override double Costo() => _bebida.Costo() + 0.60;
}

public class Vainilla : AgregadoDecorator
{
    public Vainilla(IBebida bebida) : base(bebida) { }
    public override string GetDescripcion() => _bebida.GetDescripcion() + ", Vainilla";
    public override double Costo() => _bebida.Costo() + 0.55;
}






