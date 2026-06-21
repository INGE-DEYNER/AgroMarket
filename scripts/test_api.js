// scripts/test_api.js
const API_BASE = 'https://deydev26-agromarket-api.hf.space/api';

async function runTests() {
  console.log('=== Starting E2E API Tests ===');
  console.log('Using API Base:', API_BASE);

  let producerToken = null;
  let buyerToken = null;

  // 1. Check health
  try {
    const healthRes = await fetch('https://deydev26-agromarket-api.hf.space/actuator/health');
    const healthText = await healthRes.text();
    console.log('Actuator Health Response status:', healthRes.status, 'body:', healthText);
  } catch (err) {
    console.log('Actuator Health failed (could be blocked or different path):', err.message);
  }

  // 2. Login Producer
  console.log('\n--- 2. Logging in Producer (producer@test.com) ---');
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'producer@test.com',
        contrasena: 'Password123!'
      })
    });
    const json = await res.json();
    console.log('Producer Login status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
    if (res.ok && json.success) {
      producerToken = json.data.token;
      console.log('Producer Token acquired successfully.');
    } else {
      console.error('Failed to log in as Producer.');
    }
  } catch (err) {
    console.error('Error logging in as Producer:', err);
  }

  // 3. Login Buyer
  console.log('\n--- 3. Logging in Buyer (buyer@test.com) ---');
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'buyer@test.com',
        contrasena: 'Password123!'
      })
    });
    const json = await res.json();
    console.log('Buyer Login status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
    if (res.ok && json.success) {
      buyerToken = json.data.token;
      console.log('Buyer Token acquired successfully.');
    } else {
      console.error('Failed to log in as Buyer.');
    }
  } catch (err) {
    console.error('Error logging in as Buyer:', err);
  }

  if (!producerToken) {
    console.error('No Producer Token, skipping Producer actions.');
  } else {
    // 4. Populate catalog with stable fruit images
    console.log('\n--- 4. Populating Catalog as Producer ---');
    const fruits = [
      {
        nombre: 'Banano Urabá Premium',
        descripcion: 'Bananos frescos cultivados en la región de Urabá, alta calidad y sabor dulce natural.',
        precio: 3500.00,
        cantidadDisponible: 500,
        imagenUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800',
        tipoFruta: 'BANANO',
        enPromocion: true,
        cantidadMinimaMayorista: 50,
        precioMayorista: 3000.00
      },
      {
        nombre: 'Piña Golden Dulce',
        descripcion: 'Piña de variedad Gold, madurada al sol, con un dulzor excepcional y jugosidad inigualable.',
        precio: 4500.00,
        cantidadDisponible: 200,
        imagenUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800',
        tipoFruta: 'PINA',
        enPromocion: false,
        cantidadMinimaMayorista: 20,
        precioMayorista: 4000.00
      },
      {
        nombre: 'Mango Tommy Atkins',
        descripcion: 'Mango Tommy fresco, pulpa firme y sabor dulce con un toque de acidez perfecta.',
        precio: 2800.00,
        cantidadDisponible: 300,
        imagenUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
        tipoFruta: 'MANGO',
        enPromocion: true,
        cantidadMinimaMayorista: 40,
        precioMayorista: 2400.00
      },
      {
        nombre: 'Maracuyá de Exportación',
        descripcion: 'Fruta de la pasión con excelente aroma y alto porcentaje de pulpa para jugos.',
        precio: 5000.00,
        cantidadDisponible: 150,
        imagenUrl: 'https://images.unsplash.com/photo-1578160112054-954a67602b88?w=800',
        tipoFruta: 'MARACUYA',
        enPromocion: false,
        cantidadMinimaMayorista: 30,
        precioMayorista: 4500.00
      },
      {
        nombre: 'Limón Tahití Fresco',
        descripcion: 'Limones Tahití extra jugosos, ideales para limonadas y sazonar alimentos.',
        precio: 3000.00,
        cantidadDisponible: 400,
        imagenUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800',
        tipoFruta: 'LIMON',
        enPromocion: false,
        cantidadMinimaMayorista: 50,
        precioMayorista: 2600.00
      },
      {
        nombre: 'Naranja Valencia Jugosa',
        descripcion: 'Naranjas Valencia ricas en vitamina C, pulpa dulce y abundante zumo.',
        precio: 3200.00,
        cantidadDisponible: 600,
        imagenUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800',
        tipoFruta: 'NARANJA',
        enPromocion: true,
        cantidadMinimaMayorista: 100,
        precioMayorista: 2700.00
      },
      {
        nombre: 'Coco Playero Selecto',
        descripcion: 'Cocos seleccionados con abundante agua refrescante y deliciosa pulpa carnosa.',
        precio: 6000.00,
        cantidadDisponible: 100,
        imagenUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800',
        tipoFruta: 'COCO',
        enPromocion: false,
        cantidadMinimaMayorista: 10,
        precioMayorista: 5500.00
      }
    ];

    for (const fruit of fruits) {
      console.log(`Adding fruit: ${fruit.nombre}`);
      try {
        const res = await fetch(`${API_BASE}/productos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${producerToken}`
          },
          body: JSON.stringify(fruit)
        });
        const json = await res.json();
        console.log(`Status: ${res.status}, Success: ${json.success}, Message: ${json.message}`);
        if (json.success) {
          console.log(`Created product ID: ${json.data.id}`);
        }
      } catch (err) {
        console.error(`Failed to add fruit ${fruit.nombre}:`, err.message);
      }
    }
  }

  // 5. Retrieve products catalog
  console.log('\n--- 5. Retrieving Catalog (Public Get) ---');
  let products = [];
  try {
    const res = await fetch(`${API_BASE}/productos?size=20`);
    const json = await res.json();
    console.log('Get Products status:', res.status);
    if (json.success) {
      products = json.data.content || [];
      console.log(`Retrieved ${products.length} products from catalog.`);
      products.forEach(p => {
        console.log(`- [ID: ${p.id}] ${p.nombre} - Precio: ${p.precio} - Stock: ${p.cantidadDisponible} - Url: ${p.imagenUrl}`);
      });
    } else {
      console.error('Failed to retrieve products:', json.message);
    }
  } catch (err) {
    console.error('Error retrieving products:', err);
  }

  if (products.length > 0 && buyerToken) {
    // 6. Buy a product
    const productToBuy = products[0];
    console.log(`\n--- 6. Creating order for Product ID: ${productToBuy.id} (${productToBuy.nombre}) as Buyer ---`);
    let orderId = null;
    try {
      const res = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${buyerToken}`
        },
        body: JSON.stringify({
          productoId: productToBuy.id,
          cantidad: 5
        })
      });
      const json = await res.json();
      console.log('Create Order status:', res.status);
      console.log('Response:', JSON.stringify(json, null, 2));
      if (res.ok && json.success) {
        orderId = json.data.id;
        console.log(`Order created successfully with ID: ${orderId}`);
      } else {
        console.error('Failed to create order.');
      }
    } catch (err) {
      console.error('Error creating order:', err);
    }

    // 7. Add a review/comment to the product
    console.log(`\n--- 7. Adding a review for Product ID: ${productToBuy.id} as Buyer ---`);
    try {
      const res = await fetch(`${API_BASE}/resenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${buyerToken}`
        },
        body: JSON.stringify({
          productoId: productToBuy.id,
          calificacion: 5,
          comentario: 'Excelente producto, muy dulce y fresco. Super recomendado para toda la familia!'
        })
      });
      const json = await res.json();
      console.log('Add Review status:', res.status);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch (err) {
      console.error('Error adding review:', err);
    }

    // 8. Advance order status as Producer
    if (orderId && producerToken) {
      console.log(`\n--- 8. Advancing Order status for Order ID: ${orderId} as Producer ---`);
      try {
        const res = await fetch(`${API_BASE}/pedidos/${orderId}/avanzar`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${producerToken}`
          }
        });
        const json = await res.json();
        console.log('Advance Order status:', res.status);
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (err) {
        console.error('Error advancing order status:', err);
      }
    }
  }

  console.log('\n=== E2E API Tests Completed ===');
}

runTests();
