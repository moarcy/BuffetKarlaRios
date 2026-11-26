(function (root) {
  const cardapio = {
    retirada: "Rua Paulo Gonçalves, 196",
    categorias: [
      {
        nome: "Acompanhamentos",
        itens: [
          { id: "arroz-grega", nome: "Arroz à Grega", preco: 70 },
          { id: "arroz-damasco", nome: "Arroz Damasco e Amêndoas Tostadas", preco: 70 },
          { id: "farofa", nome: "Farofa Crocante", preco: 40, medida: "500g" },
        ],
      },
      {
        nome: "Saladas",
        itens: [
          { id: "cenoura", nome: "Cenoura Agridoce", preco: 60, medida: "1kg" },
          { id: "salada-tropical", nome: "Salada Tropical", preco: 55 },
          { id: "batatas-assadas", nome: "Batatas Assadas Molho Cream Cheese e Bacon", preco: 90 },
          { id: "maionese", nome: "Maionese Festiva", preco: 90 },
          { id: "salada-thai", nome: "Salada Thai (manga/camarão/molho oriental)", preco: 120 },
          { id: "salpicao", nome: "Salpicão", preco: 115 },
        ],
      },
      {
        nome: "Principais",
        itens: [
          { id: "fricasse", nome: "Fricassê", preco: 170 },
          { id: "tiras-frango", nome: "Tiras de Frango e Creme de Batatas e Bacon", preco: 160 },
          { id: "lagarto", nome: "Lagarto Molho Madeira ou Molho de Mostarda e Mel", preco: 200 },
          { id: "assado-suino", nome: "Assado Suíno", preco: 170 },
          { id: "torta-bacalhau", nome: "Torta de Bacalhau", preco: 140 },
        ],
      },
      {
        nome: "Frios e pães",
        itens: [
          { id: "mini-salpicao", nome: "Mini Sanduíches / recheio Salpicão", preco: 70, medida: "20 unid" },
          { id: "pao-artesanal", nome: "Pão Artesanal sem recheio", preco: 35 },
          { id: "pao-metro", nome: "Pão Metro / recheio Salpicão", preco: 85 },
          { id: "terrine-abacaxi", nome: "Terrine Chutney de Abacaxi e Bacon", preco: 130 },
          { id: "terrine-queijo", nome: "Terrine de Queijo Reino e Peras ao Vinho", preco: 160 },
          { id: "vinagrete-lombinho", nome: "Vinagrete de Lombinho Canadense", preco: 130 },
          { id: "torre-rosbife", nome: "Torre de Rosbife de Paulista", preco: 180, medida: "1kg" },
        ],
      },
      {
        nome: "Tortas e quiches",
        itens: [
          { id: "torta-frango", nome: "Torta de Frango Cremoso", preco: 130, medida: "10 fatias · massa podre" },
          { id: "torta-carne-sol", nome: "Torta Carne do Sol e Banana", preco: 130, medida: "10 fatias · massa podre" },
          { id: "torta-bacalhau-cremoso", nome: "Torta de Bacalhau Cremoso", preco: 140, medida: "10 fatias · massa podre" },
          { id: "quiche-alho", nome: "Quiche Alho Poró e Bacon", preco: 110, medida: "10 fatias · massa podre" },
          { id: "quiche-peru", nome: "Quiche Peito de Peru e Tomate Seco", preco: 110, medida: "10 fatias · massa podre" },
        ],
      },
    ],
  };

  root.BUFFET_CARDAPIO = cardapio;
  if (typeof module !== "undefined" && module.exports) module.exports = cardapio;
})(typeof globalThis !== "undefined" ? globalThis : this);
