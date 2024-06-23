import axios from 'axios';

class RatoneandoController {
  constructor() {}

  getProduct = async (req, res) => {
    try {
      const { q } = req.query;
      const headers = {
        'Referer': 'https://ratoneando.ar/'
      };
      const response = await axios.get('https://api.ratoneando.ar/?q='+q, { headers });

      const first20Products = response.data.products.slice(0, 20);
      const filteredProducts = first20Products.filter(product => 
        product.source === 'coto' || 
        product.source === 'carrefour' || 
        product.source === 'diaonline'
      );

      const firstProduct = filteredProducts.length > 0 ? filteredProducts[0] : response.data.products[0];

      res.status(response.status).send({ product: firstProduct });
    } catch (error) {
      res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa' });
    }
  };

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
    const maxRetries = 5;
    const delayBetweenRetries = 2000; // 2 segundos
  
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.get(`https://api.ratoneando.ar/?q=${nombreIngrediente}`, {
          headers: {
            'Referer': 'https://ratoneando.ar/'
          }
        });
  
        const productos = response.data.products.slice(0, 5); // Tomar los primeros 10 resultados
        if (productos.length === 0) {
          throw new Error(`No se encontraron productos para el ingrediente: ${nombreIngrediente}`);
        }
  
        const precios = productos.map(producto => producto.price);
        const precioPromedio = precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
  
        return precioPromedio;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 429) {
            console.error(`Error 429 al obtener el precio del ingrediente ${nombreIngrediente}: Demasiadas solicitudes, reintentando...`);
            await delay(delayBetweenRetries);
          } else if (error.response.status === 498) {
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
    }
    console.error(`Error al obtener el precio del ingrediente ${nombreIngrediente}: Se alcanzó el número máximo de reintentos`);
    return null;
  };
  

}

export default new RatoneandoController();
