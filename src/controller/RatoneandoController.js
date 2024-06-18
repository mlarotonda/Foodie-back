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
}

export default new RatoneandoController();
export { buscarProductoEnAPI };
