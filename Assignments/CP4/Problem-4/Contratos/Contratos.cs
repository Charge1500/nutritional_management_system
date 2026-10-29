using System;
using System.Collections.Generic;

namespace Contratos
{
    // Contrato compartido por todo el equipo
    public interface IEstrategiaRuta
    {
        Ruta Calcular(Punto origen, Punto destino);
    }

    // Contrato compartido 
    public class Ruta
    {
        public List<Punto> Puntos;
        public double DistanciaKm;
        public double Minutos;
    }

    // Punto mínimo provisional para probar la parte 4E
    // El compañero que integre la versión real solo debe reemplazar esta clase por la definitiva,  
    // el resto del código no cambia porque todos dependemos del contrato IEstrategiaRuta.
    public class Punto
    {
        public double X;
        public double Y;

        public Punto(double x, double y)
        {
            X = x;
            Y = y;
        }

        public double DistanciaA(Punto otro)
        {
            double dx = X - otro.X;
            double dy = Y - otro.Y;
            return Math.Sqrt(dx * dx + dy * dy);
        }
    }
}
