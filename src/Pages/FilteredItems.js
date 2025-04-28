import React from 'react';

const FilteredItems = ({ products }) => {
  console.log(products); 
  return (
    <div className="product-list">
      {products.length === 0 ? (
        <p>No products match the filter criteria</p>
      ) : (
        products.map((product, index) => (
          <div key={index} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default FilteredItems;
