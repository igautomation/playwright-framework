/**
 * Data-driven UI tests for product catalog using CSV data
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Utility function to read CSV data
async function readCsv(filePath) {
  const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',');
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      return entry;
    });
}

test.describe('Product Catalog Tests @ui', () => {
  let products;
  
  test.beforeAll(async () => {
    // Load product data from CSV
    products = await readCsv('src/data/csv/products.csv');
  });
  
  test('Display product details from CSV data @csv', async ({ page }) => {
    // Mock product page for demonstration
    await page.setContent(`
      <html>
        <head>
          <style>
            .product-card {
              border: 1px solid #ddd;
              margin: 10px;
              padding: 15px;
              border-radius: 5px;
            }
            .featured {
              background-color: #fffbea;
            }
            .product-name {
              font-weight: bold;
              font-size: 18px;
            }
            .product-category {
              color: #666;
            }
            .product-price {
              color: #e63946;
              font-weight: bold;
            }
            .product-rating {
              color: #ffb703;
            }
            .product-stock {
              color: green;
            }
            .out-of-stock {
              color: red;
            }
          </style>
        </head>
        <body>
          <h1>Product Catalog</h1>
          <div id="product-container"></div>
          
          <script>
            // This would normally come from an API, but we'll inject it in the test
            const renderProducts = (products) => {
              const container = document.getElementById('product-container');
              products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card' + (product.featured === 'true' ? ' featured' : '');
                productCard.innerHTML = \`
                  <div class="product-name">\${product.name}</div>
                  <div class="product-category">\${product.category}</div>
                  <div class="product-price">$\${product.price}</div>
                  <div class="product-rating">Rating: \${product.rating}/5</div>
                  <div class="\${parseInt(product.stock) > 0 ? 'product-stock' : 'out-of-stock'}">
                    \${parseInt(product.stock) > 0 ? 'In Stock: ' + product.stock : 'Out of Stock'}
                  </div>
                \`;
                container.appendChild(productCard);
              });
            };
            
            // Products will be injected here in the test
          </script>
        </body>
      </html>
    `);
    
    // Inject the products data from CSV into the page
    await page.evaluate((productsData) => {
      renderProducts(productsData);
    }, products);
    
    // Verify all products from CSV are displayed
    const productCards = await page.locator('.product-card').all();
    expect(productCards.length).toBe(products.length);
    
    // Verify featured products are highlighted
    const featuredProducts = products.filter(p => p.featured === 'true');
    const featuredCards = await page.locator('.product-card.featured').all();
    expect(featuredCards.length).toBe(featuredProducts.length);
    
    // Verify individual product details for the first product
    const firstProduct = products[0];
    const firstCard = productCards[0];
    
    await expect(firstCard.locator('.product-name')).toHaveText(firstProduct.name);
    await expect(firstCard.locator('.product-category')).toHaveText(firstProduct.category);
    await expect(firstCard.locator('.product-price')).toHaveText(`$${firstProduct.price}`);
    await expect(firstCard.locator('.product-rating')).toHaveText(`Rating: ${firstProduct.rating}/5`);
    
    // Take a screenshot of the product catalog
    await page.screenshot({ path: 'test-results/product-catalog.png' });
  });
  
  test('Filter products by category @csv', async ({ page }) => {
    // Mock product page with filtering
    await page.setContent(`
      <html>
        <head>
          <style>
            .product-card {
              border: 1px solid #ddd;
              margin: 10px;
              padding: 15px;
              border-radius: 5px;
            }
            .filter-container {
              margin-bottom: 20px;
            }
            .filter-btn {
              margin-right: 10px;
              padding: 5px 10px;
              cursor: pointer;
            }
            .active {
              background-color: #4CAF50;
              color: white;
            }
          </style>
        </head>
        <body>
          <h1>Product Catalog</h1>
          
          <div class="filter-container">
            <button class="filter-btn active" data-category="all">All</button>
            <button class="filter-btn" data-category="Electronics">Electronics</button>
            <button class="filter-btn" data-category="Audio">Audio</button>
            <button class="filter-btn" data-category="Wearables">Wearables</button>
          </div>
          
          <div id="product-container"></div>
          
          <script>
            // This would normally come from an API, but we'll inject it in the test
            let allProducts = [];
            
            const renderProducts = (products) => {
              const container = document.getElementById('product-container');
              container.innerHTML = '';
              
              products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.dataset.category = product.category;
                productCard.innerHTML = \`
                  <div class="product-name">\${product.name}</div>
                  <div class="product-category">\${product.category}</div>
                  <div class="product-price">$\${product.price}</div>
                \`;
                container.appendChild(productCard);
              });
            };
            
            const setupFilters = () => {
              const filterButtons = document.querySelectorAll('.filter-btn');
              filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                  // Update active state
                  filterButtons.forEach(btn => btn.classList.remove('active'));
                  button.classList.add('active');
                  
                  // Filter products
                  const category = button.dataset.category;
                  if (category === 'all') {
                    renderProducts(allProducts);
                  } else {
                    const filtered = allProducts.filter(p => p.category === category);
                    renderProducts(filtered);
                  }
                });
              });
            };
            
            // Initialize with all products
            const initCatalog = (products) => {
              allProducts = products;
              renderProducts(products);
              setupFilters();
            };
            
            // Products will be injected here in the test
          </script>
        </body>
      </html>
    `);
    
    // Inject the products data from CSV into the page
    await page.evaluate((productsData) => {
      initCatalog(productsData);
    }, products);
    
    // Verify all products are initially displayed
    let productCards = await page.locator('.product-card').all();
    expect(productCards.length).toBe(products.length);
    
    // Get unique categories from the CSV data
    const categories = [...new Set(products.map(p => p.category))];
    
    // Test filtering for each category
    for (const category of categories) {
      // Click the category filter button
      await page.locator(`.filter-btn[data-category="${category}"]`).click();
      
      // Verify the button is now active
      await expect(page.locator(`.filter-btn[data-category="${category}"]`)).toHaveClass(/active/);
      
      // Count products in this category from CSV
      const expectedCount = products.filter(p => p.category === category).length;
      
      // Verify filtered products are displayed
      productCards = await page.locator('.product-card').all();
      expect(productCards.length).toBe(expectedCount);
      
      // Take a screenshot of the filtered results
      await page.screenshot({ path: `test-results/products-${category}.png` });
    }
    
    // Reset to all products
    await page.locator('.filter-btn[data-category="all"]').click();
    productCards = await page.locator('.product-card').all();
    expect(productCards.length).toBe(products.length);
  });
});