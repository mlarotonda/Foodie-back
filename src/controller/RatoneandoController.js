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
}

export default new RatoneandoController();
