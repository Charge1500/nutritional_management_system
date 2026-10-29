using System.Collections.Generic;
using Contratos;

namespace NavegadorApp
{
    public class EstrategiaEcologica : IEstrategiaRuta
    {
        public Ruta Calcular(Punto origen, Punto destino)
        {
            Ruta ruta = new Ruta();
            ruta.Puntos = new List<Punto> { origen, destino };
            ruta.DistanciaKm = origen.DistanciaA(destino) * 1.05; // 5% más distancia
            ruta.Minutos = ruta.DistanciaKm / 90.0 * 60.0; // 90 km/h constante
            return ruta;
        }
    }
}