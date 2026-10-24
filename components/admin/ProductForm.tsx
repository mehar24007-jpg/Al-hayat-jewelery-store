"use client";

import { useActionState, useState } from "react";
import ImageUploader from "./ImageUploader";
import { saveProduct, type AdminState } from "@/app/admin/actions";

type Product = {
  id: string | null;
  name: string;
  category_id: string;
  description: string;
  retail_price: number | "";
  wholesale_price: number | "";
  moq: number | "";
  stock: number | "";
  tag: string;
  tone: string;
  is_active: boolean;
  images: string[];
  slabs: { min_qty: number; unit_price: number }[];
  compare_at_price: number | "";
  sizes: string;
};

export default function ProductForm({ product, categories, defaultMoq }: { product: Product; categories: { id: string; name: string }[]; defaultMoq: number }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveProduct.bind(null, product.id), null);
  const [slabs, setSlabs] = useState(product.slabs);

  return (
    <form action={action} className="grid gap-5">
      <div><span className="label">Photos</span><ImageUploader initial={product.images} /></div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">Product name</label>
          <input id="name" name="name" className="input" defaultValue={product.name} required maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="category_id">Category</label>
          <select id="category_id" name="category_id" className="input" defaultValue={product.category_id} required>
            <option value="" disabled>Choose a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tag">Tag (optional)</label>
          <input id="tag" name="tag" className="input" defaultValue={product.tag} maxLength={20} placeholder="New, Bestseller, Bridal" />
        </div>
        <div>
          <label className="label" htmlFor="retail_price">Retail price</label>
          <input id="retail_price" name="retail_price" type="number" min={0} step="any" inputMode="decimal" className="input" defaultValue={product.retail_price} required />
        </div>
        <div>
          <label className="label" htmlFor="compare_at_price">Old price (optional)</label>
          <input id="compare_at_price" name="compare_at_price" type="number" min={0} step="any" inputMode="decimal" className="input" defaultValue={product.compare_at_price} placeholder="Shown crossed out, makes a Sale" />
          <p className="note mt-1">Must be higher than the retail price. The shop shows the % off.</p>
        </div>
        <div>
          <label className="label" htmlFor="sizes">Sizes (optional)</label>
          <input id="sizes" name="sizes" className="input" defaultValue={product.sizes} placeholder="2.2, 2.4, 2.6, 2.8" />
          <p className="note mt-1">Separate with commas. Customers must pick one. Leave empty for one size.</p>
        </div>
        <div>
          <label className="label" htmlFor="stock">Stock quantity</label>
          <input id="stock" name="stock" type="number" min={0} step={1} inputMode="numeric" className="input" defaultValue={product.stock === "" ? 0 : product.stock} required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="input min-h-28" defaultValue={product.description} placeholder="Material, weight, size, finish." />
        </div>
      </div>

      <fieldset className="card grid gap-4 p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-semibold text-gold">Wholesale (dealers only)</legend>
        <div>
          <label className="label" htmlFor="wholesale_price">Wholesale price</label>
          <input id="wholesale_price" name="wholesale_price" type="number" min={0} step="any" inputMode="decimal" className="input" defaultValue={product.wholesale_price} placeholder="Leave empty to hide from wholesale" />
        </div>
        <div>
          <label className="label" htmlFor="moq">Minimum quantity</label>
          <input id="moq" name="moq" type="number" min={1} step={1} inputMode="numeric" className="input" defaultValue={product.moq} placeholder={`Default: ${defaultMoq}`} />
        </div>
        <div className="sm:col-span-2">
          <span className="label">Quantity discounts</span>
          <input type="hidden" name="slabs" value={JSON.stringify(slabs)} />
          <div className="grid gap-2">
            {slabs.map((s, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input className="input max-w-28" type="number" min={2} step={1} value={s.min_qty || ""} placeholder="From qty" aria-label="From quantity" onChange={(e) => setSlabs((c) => c.map((x, j) => (j === i ? { ...x, min_qty: Number(e.target.value) } : x)))} />
                <span className="text-muted">pieces or more, price each</span>
                <input className="input max-w-32" type="number" min={0} step="any" value={s.unit_price || ""} placeholder="Price" aria-label="Price each" onChange={(e) => setSlabs((c) => c.map((x, j) => (j === i ? { ...x, unit_price: Number(e.target.value) } : x)))} />
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setSlabs((c) => c.filter((_, j) => j !== i))}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm w-fit" onClick={() => setSlabs((c) => [...c, { min_qty: 0, unit_price: 0 }])}>Add a discount tier</button>
            <p className="note">Example: 12 pieces or more at a lower price each. Each tier must be cheaper than the wholesale price.</p>
          </div>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tone">Drawing colour (shown when there is no photo)</label>
          <select id="tone" name="tone" className="input" defaultValue={product.tone}>
            <option value="gold">Gold</option><option value="rose">Rose gold</option><option value="silver">Silver</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5">
          <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="h-4 w-4 accent-gold" /> Visible in the shop
        </label>
      </div>

      {state?.error && <p className="err" role="alert">{state.error}</p>}
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-gold" disabled={pending}>{pending ? "Saving" : product.id ? "Save changes" : "Add product"}</button>
        <a href="/admin/products" className="btn">Cancel</a>
      </div>
    </form>
  );
}
