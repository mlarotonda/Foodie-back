import axios from 'axios';

class RatoneandoController {
  constructor() {}

  // Función para buscar producto en la API de Ratoneando
 async buscarProductoEnAPI(ean) {
    try {
      console.log(`Buscando producto en API Ratoneando con EAN: ${ean}`);
      const response = await axios.get(`https://api.ratoneando.ar/?q=${ean}`, {
        headers: {
          'Referer': 'https://ratoneando.ar/'
        }
      });

      const productos = response.data.products.slice(0, 15);
      if (productos.length === 0) {
        throw new Error("No se encontraron productos en la API de Ratoneando.");
      }

      console.log(`Productos encontrados en API Ratoneando: ${productos.map(producto => producto.name).join(', ')}`);
      return productos.map(producto => producto.name);
    } catch (error) {
      throw new Error(`Error al llamar a la API de Ratoneando: ${error.message}`);
    }
  }

  obtenerPrecioIngrediente = async (nombreIngrediente) => {

      try {
        const response = await axios.get(`https://api.ratoneando.ar/?q=${nombreIngrediente}`, {
          headers: {
            'Referer': 'https://ratoneando.ar/'
          }
        });
  
        const productos = response.data.products.slice(0, 4); // Tomar los primeros 10 resultados
        if (productos.length === 0) {
          throw new Error(`No se encontraron productos para el ingrediente: ${nombreIngrediente}`);
        }
  
        const precios = productos.map(producto => producto.unitPrice);
        console.log(nombreIngrediente)
        console.log(precios)
        const precioPromedio = precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
        console.log(precioPromedio)

        return precioPromedio;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 498) {
            console.error(`Error 498 al obtener el precio del ingrediente ${nombreIngrediente}: Token expirado o problema de autenticación.`);
            return null;
          } else {
            console.error(`Error ${error.response.status} al obtener el precio del ingrediente ${nombreIngrediente}:`, error.message);
            return null;
          }
        } else {
          console.error(`Error de red al obtener el precio del ingrediente ${nombreIngrediente}:`, error.message);
          return null;
        }
      }
  };
}

export default new RatoneandoController();