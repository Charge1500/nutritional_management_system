using System.Collections.Generic;
using Contratos;

namespace NavegadorApp
{
    public class EstrategiaEvitarPeajes : IEstrategiaRuta
    {
        public Ruta Calcular(Punto origen, Punto destino)
        {
            Ruta ruta = new Ruta();
            ruta.Puntos = new List<Punto> { origen, destino };
            ruta.DistanciaKm = origen.DistanciaA(destino) * 1.25; // 25% más distancia
            ruta.Minutos = ruta.DistanciaKm / 80.0 * 60.0; // 80 km/h
            return ruta;
        }
    }
}