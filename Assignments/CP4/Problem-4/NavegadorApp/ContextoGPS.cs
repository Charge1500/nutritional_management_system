using System;
using Contratos;

namespace NavegadorApp
{
    public class ContextoGPS
    {
        private IEstrategiaRuta _estrategia;

        public ContextoGPS(IEstrategiaRuta estrategiaInicial)
        {
            _estrategia = estrategiaInicial;
        }

        public void CambiarEstrategia(IEstrategiaRuta nuevaEstrategia)
        {
            _estrategia = nuevaEstrategia;
            Console.WriteLine($"\n[GPS] Estrategia cambiada a: {nuevaEstrategia.GetType().Name}");
        }

        public Ruta CalcularRuta(Punto origen, Punto destino)
        {
            if (_estrategia == null)
                throw new InvalidOperationException("No hay estrategia definida.");
            
            return _estrategia.Calcular(origen, destino);
        }
    }
}