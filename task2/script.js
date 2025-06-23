const input = document.getElementById("inp");
const button = document.getElementById("btn");
const productList = document.getElementById("productList");
const sortSelect = document.getElementById("sort");

let products = [];
let filteredProducts = [];

fetch("https://dummyjson.com/products")
  .then((res) => res.json())
  .then((data) => {
    products = data.products;
    filteredProducts = [...products];
    displayProducts(filteredProducts);
  })
  .catch((err) => {
    console.error("Failed to fetch products", err);
    productList.innerHTML = "<p>Error loading products.</p>";
  });

function displayProducts(items) {
  productList.innerHTML = "";
  if (items.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  items.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>Price: $${product.price}</p>
    `;
    productList.appendChild(card);
  });
}

button.addEventListener("click", () => {
  const searchTerm = input.value.toLowerCase();
  filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm)
  );
  applySort();
});

sortSelect.addEventListener("change", applySort);

function applySort() {
  const sortValue = sortSelect.value;

  let sorted = [...filteredProducts];

  switch (sortValue) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  displayProducts(sorted);
}
