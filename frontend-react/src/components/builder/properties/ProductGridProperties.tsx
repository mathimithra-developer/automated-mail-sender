import React from 'react';
import { ProductGridBlockData, ProductGridItem } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface ProductGridPropertiesProps {
  block: ProductGridBlockData;
  onChange: (updatedContent: ProductGridBlockData['content']) => void;
}

export const ProductGridProperties: React.FC<ProductGridPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    columns = 2,
    products = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        title: 'Minimalist Watch',
        price: '$120.00',
        linkUrl: '#',
      },
    ],
  } = block.content;

  const updateProp = <K extends keyof ProductGridBlockData['content']>(
    key: K,
    value: ProductGridBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  const handleAddProduct = () => {
    const newProducts: ProductGridItem[] = [
      ...products,
      {
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        title: 'New Product Item',
        price: '$49.00',
        linkUrl: '#',
      },
    ];
    updateProp('products', newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    updateProp(
      'products',
      products.filter((_, i) => i !== index)
    );
  };

  const handleUpdateProduct = (
    index: number,
    field: keyof ProductGridItem,
    value: string
  ) => {
    const newProducts = products.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateProp('products', newProducts);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Product Grid Properties
        </h4>
      </div>

      {/* Grid Columns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Grid Columns</label>
        <select
          value={columns}
          onChange={(e) => updateProp('columns', Number(e.target.value) || 2)}
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1' }}
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>

      {/* Products List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Grid Products ({products.length})
          </label>
          <button
            type="button"
            onClick={handleAddProduct}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: '#2563eb',
              background: 'rgba(37, 99, 235, 0.08)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Add Product
          </button>
        </div>

        {products.map((prod, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                Item #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(idx)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                title="Remove product"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <input
              type="text"
              value={prod.title}
              onChange={(e) => handleUpdateProduct(idx, 'title', e.target.value)}
              placeholder="Product Title"
              style={{ width: '100%', height: 30, padding: '0 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <input
                type="text"
                value={prod.price}
                onChange={(e) => handleUpdateProduct(idx, 'price', e.target.value)}
                placeholder="Price e.g. $49.00"
                style={{ width: '100%', height: 30, padding: '0 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                value={prod.imageUrl}
                onChange={(e) => handleUpdateProduct(idx, 'imageUrl', e.target.value)}
                placeholder="Image URL"
                style={{ width: '100%', height: 30, padding: '0 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
