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
    ],
  };

  root.BUFFET_CARDAPIO = cardapio;
  if (typeof module !== "undefined" && module.exports) module.exports = cardapio;
})(typeof globalThis !== "undefined" ? globalThis : this);
