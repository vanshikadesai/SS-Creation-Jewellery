"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import { slugify } from "@/lib/slugify";
import { CATEGORY_MENUS } from "@/lib/nav-data";
import { computeGoldPrice, MakingChargeType } from "@/lib/gold-pricing";

export interface ProductFormCategory {
  id: number;
  name: string;
  slug: string;
}
export interface ProductFormCollection {
  id: number;
  name: string;
  categoryId: number | null;
}

export interface ProductFormInitial {
  id?: number;
  sku: string;
  name: string;
  slug: string;
  categoryId: number | "";
  collectionId: number | "";
  material: string;
  goldPurity: string;
  goldWeightGrams: string;
  diamondWeightCt: string;
  diamondQuality: string;
  certification: string;
  gender: "WOMEN" | "MEN" | "UNISEX" | "KIDS";
  occasion: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  description: string;
  careInstructions: string;
  shippingInfo: string;
  returnInfo: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: string[];
  autoGoldPricing: boolean;
  makingChargeType: MakingChargeType;
  makingChargeValue: string;
  otherChargesAmount: string;
}

const EMPTY: ProductFormInitial = {
  sku: "",
  name: "",
  slug: "",
  categoryId: "",
  collectionId: "",
  material: "",
  goldPurity: "",
  goldWeightGrams: "",
  diamondWeightCt: "",
  diamondQuality: "",
  certification: "",
  gender: "UNISEX",
  occasion: "",
  price: "",
  originalPrice: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
  status: "ACTIVE",
  description: "",
  careInstructions: "",
  shippingInfo: "",
  returnInfo: "",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  images: [],
  autoGoldPricing: false,
  makingChargeType: "PERCENTAGE",
  makingChargeValue: "0",
  otherChargesAmount: "0",
};

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1.5">
        {label} {required && <span className="text-rosedust">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-champagne-dark";

export default function ProductForm({
  mode,
  initial,
  categories,
  collections,
  currentGoldRate,
}: {
  mode: "create" | "edit";
  initial?: ProductFormInitial;
  categories: ProductFormCategory[];
  collections: ProductFormCollection[];
  /** Current 24K gold rate (₹/gram), for the live auto-price preview. */
  currentGoldRate: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInitial>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProductFormInitial>(key: K, value: ProductFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onNameChange(name: string) {
    set("name", name);
    if (!slugTouched) set("slug", slugify(name));
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  // The Collection dropdown is category-dependent: only collections
  // scoped to the selected category are offered, exactly like the
  // frontend mega-menu's "Shop by Style" list under that same category
  // — both read from the same `collections` table (see
  // /admin/categories → Collections, or `npm run seed:collections`).
  // Collections with no category (categoryId null) are global (e.g.
  // "Diamond Collection") and always stay available regardless of
  // which category is selected.
  const availableCollections = collections.filter(
    (c) => c.categoryId === null || c.categoryId === form.categoryId
  );

  // Occasion stays a free-text field (no schema change needed for it),
  // but suggestions are pulled from the exact same CATEGORY_MENUS
  // config that drives the frontend mega-menu's occasion links, so
  // typing "Wedding" here and clicking Rings → Wedding on the storefront
  // reliably match.
  const occasionSuggestions =
    CATEGORY_MENUS.find((m) => m.slug === selectedCategory?.slug)?.occasions ?? [];

  function onCategoryChange(categoryId: number | "") {
    set("categoryId", categoryId);
    // Clear a now-invalid collection selection rather than silently
    // saving a Ring collection under Necklaces.
    const stillValid = collections.some(
      (c) => c.id === form.collectionId && (c.categoryId === null || c.categoryId === categoryId)
    );
    if (!stillValid) set("collectionId", "");
  }

  // Live preview only — the server (app/api/products & [id]/route.ts)
  // recomputes and saves the authoritative price using this exact same
  // shared function, so the admin can't drift from what actually gets
  // stored by editing the disabled Price fields.
  const goldPricePreview = form.autoGoldPricing
    ? computeGoldPrice({
        goldWeightGrams: form.goldWeightGrams ? Number(form.goldWeightGrams) : null,
        goldPurity: form.goldPurity || null,
        makingChargeType: form.makingChargeType,
        makingChargeValue: Number(form.makingChargeValue || 0),
        otherChargesAmount: Number(form.otherChargesAmount || 0),
        ratePerGram24k: currentGoldRate,
      })
    : null;

  const effectivePrice = form.autoGoldPricing ? goldPricePreview?.total ?? 0 : Number(form.price);
  const effectiveOriginalPrice = form.autoGoldPricing
    ? goldPricePreview?.total ?? 0
    : Number(form.originalPrice);

  const discountPercent =
    effectivePrice && effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
      ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 1000) / 10
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }
    if (form.autoGoldPricing) {
      if (!goldPricePreview) {
        setError(
          "Automatic gold pricing needs a valid Gold Weight and Gold Purity, and a gold rate set under Admin → Gold Rate."
        );
        return;
      }
    } else if (!form.price || !form.originalPrice) {
      setError("Please enter both selling price and original price.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        slug: slugify(form.slug),
        categoryId: Number(form.categoryId),
        collectionId: form.collectionId ? Number(form.collectionId) : null,
        material: form.material.trim(),
        goldPurity: form.goldPurity.trim() || null,
        goldWeightGrams: form.goldWeightGrams ? Number(form.goldWeightGrams) : null,
        diamondWeightCt: form.diamondWeightCt ? Number(form.diamondWeightCt) : null,
        diamondQuality: form.diamondQuality.trim() || null,
        certification: form.certification.trim() || null,
        gender: form.gender,
        occasion: form.occasion.trim() || null,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stockQuantity: Number(form.stockQuantity || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 5),
        status: form.status,
        description: form.description.trim(),
        careInstructions: form.careInstructions.trim() || null,
        shippingInfo: form.shippingInfo.trim() || null,
        returnInfo: form.returnInfo.trim() || null,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
        images: form.images,
        autoGoldPricing: form.autoGoldPricing,
        makingChargeType: form.makingChargeType,
        makingChargeValue: Number(form.makingChargeValue || 0),
        otherChargesAmount: Number(form.otherChargesAmount || 0),
      };

      const res = await fetch(mode === "create" ? "/api/products" : `/api/products/${initial?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <p className="bg-rosedust/10 border border-rosedust/40 text-rosedust text-sm px-4 py-3">{error}</p>
      )}

      {/* IMAGES */}
      <section className="bg-white border border-border p-6">
        <h2 className="font-display text-lg mb-4">Product Images</h2>
        <ImageUploader images={form.images} onChange={(urls) => set("images", urls)} uploadType="products" />
      </section>

      {/* BASIC INFORMATION */}
      <section className="bg-white border border-border p-6">
        <h2 className="font-display text-lg mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product Name" required>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </Field>
          <Field label="URL Slug" required>
            <input
              className={inputClass}
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </Field>
          <Field label="SKU" required>
            <input
              className={inputClass}
              required
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="SS-EAR-001"
            />
          </Field>
          <Field label="Category" required>
            <select
              className={inputClass}
              required
              value={form.categoryId}
              onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Collection">
            <select
              className={inputClass}
              value={form.collectionId}
              onChange={(e) => set("collectionId", e.target.value ? Number(e.target.value) : "")}
              disabled={!form.categoryId}
            >
              <option value="">{form.categoryId ? "None" : "Select a category first"}</option>
              {availableCollections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {form.categoryId && availableCollections.length === 0 && (
              <p className="text-[11px] text-charcoal/40 mt-1">
                No collections set up for {selectedCategory?.name} yet — add one under Admin →
                Categories → Collections.
              </p>
            )}
          </Field>
          <Field label="Gender / Collection">
            <select
              className={inputClass}
              value={form.gender}
              onChange={(e) => set("gender", e.target.value as ProductFormInitial["gender"])}
            >
              <option value="UNISEX">Unisex</option>
              <option value="WOMEN">Women</option>
              <option value="MEN">Men — Men's Collection</option>
              <option value="KIDS">Kids</option>
            </select>
            {form.gender === "MEN" ? (
              <p className="text-[11px] text-champagne-dark mt-1">
                This product will appear in the storefront's Men's Collection section.
              </p>
            ) : (
              <p className="text-[11px] text-charcoal/40 mt-1">
                Select "Men" to add this product to the Men's Collection. Women/Unisex/Kids products are
                unaffected.
              </p>
            )}
          </Field>
          <Field label="Product Status">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as ProductFormInitial["status"])}
            >
              <option value="ACTIVE">Active — visible on storefront</option>
              <option value="DRAFT">Draft — hidden from storefront</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
          <div className="flex items-end gap-5 pb-2.5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) => set("isNewArrival", e.target.checked)}
              />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => set("isBestSeller", e.target.checked)}
              />
              Best Seller
            </label>
          </div>
        </div>
      </section>

      {/* PRICING & INVENTORY */}
      <section className="bg-white border border-border p-6">
        <h2 className="font-display text-lg mb-4">Pricing &amp; Inventory</h2>

        <label className="flex items-start gap-2.5 text-sm mb-4 bg-[#FAF7F0] p-3 border border-border">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.autoGoldPricing}
            onChange={(e) => set("autoGoldPricing", e.target.checked)}
          />
          <span>
            <span className="font-medium">Automatic gold pricing</span>
            <span className="block text-xs text-charcoal/50 mt-0.5">
              Calculates Selling &amp; MRP price from Gold Weight × Gold Purity × the current gold rate
              (Admin → Gold Rate) + making charges below. Price updates automatically whenever the gold
              rate changes. Leave off for non-gold products or to price manually.
            </span>
          </span>
        </label>

        {form.autoGoldPricing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Field label="Making Charge Type">
              <select
                className={inputClass}
                value={form.makingChargeType}
                onChange={(e) => set("makingChargeType", e.target.value as MakingChargeType)}
              >
                <option value="PERCENTAGE">% of gold value</option>
                <option value="FLAT">Flat amount (₹)</option>
              </select>
            </Field>
            <Field label={form.makingChargeType === "PERCENTAGE" ? "Making Charge (%)" : "Making Charge (₹)"}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.makingChargeValue}
                onChange={(e) => set("makingChargeValue", e.target.value)}
              />
            </Field>
            <Field label="Other Charges (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.otherChargesAmount}
                onChange={(e) => set("otherChargesAmount", e.target.value)}
                placeholder="Diamonds, stones, etc."
              />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Selling Price (₹)" required={!form.autoGoldPricing}>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass} ${form.autoGoldPricing ? "bg-[#F5F1E8]" : ""}`}
              required={!form.autoGoldPricing}
              disabled={form.autoGoldPricing}
              value={form.autoGoldPricing ? goldPricePreview?.total ?? "" : form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder={form.autoGoldPricing ? "Auto-calculated" : undefined}
            />
          </Field>
          <Field label="Original / MRP Price (₹)" required={!form.autoGoldPricing}>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass} ${form.autoGoldPricing ? "bg-[#F5F1E8]" : ""}`}
              required={!form.autoGoldPricing}
              disabled={form.autoGoldPricing}
              value={form.autoGoldPricing ? goldPricePreview?.total ?? "" : form.originalPrice}
              onChange={(e) => set("originalPrice", e.target.value)}
              placeholder={form.autoGoldPricing ? "Auto-calculated" : undefined}
            />
          </Field>
          <Field label="Discount">
            <input
              className={`${inputClass} bg-[#F5F1E8]`}
              value={discountPercent > 0 ? `-${discountPercent}%` : "—"}
              disabled
            />
          </Field>
          <Field label="Currency">
            <input className={`${inputClass} bg-[#F5F1E8]`} value="INR (₹)" disabled />
          </Field>
          <Field label="Stock Quantity" required>
            <input
              type="number"
              min="0"
              className={inputClass}
              required
              value={form.stockQuantity}
              onChange={(e) => set("stockQuantity", e.target.value)}
            />
          </Field>
          <Field label="Low Stock Threshold">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.lowStockThreshold}
              onChange={(e) => set("lowStockThreshold", e.target.value)}
            />
          </Field>
        </div>

        {form.autoGoldPricing && !goldPricePreview && (
          <p className="text-xs text-rosedust mt-3">
            Enter a valid Gold Weight and Gold Purity below, and make sure a gold rate is set under Admin
            → Gold Rate, to see the calculated price.
          </p>
        )}
        {form.autoGoldPricing && goldPricePreview && (
          <p className="text-xs text-charcoal/50 mt-3">
            Gold value ₹{goldPricePreview.metalValue.toLocaleString("en-IN")} + making charge ₹
            {goldPricePreview.makingCharge.toLocaleString("en-IN")}
            {Number(form.otherChargesAmount) > 0 ? ` + other ₹${Number(form.otherChargesAmount).toLocaleString("en-IN")}` : ""} = ₹
            {goldPricePreview.total.toLocaleString("en-IN")} at the current rate of ₹
            {currentGoldRate.toLocaleString("en-IN")}/g (24K).
          </p>
        )}
      </section>

      {/* PRODUCT DETAILS */}
      <section className="bg-white border border-border p-6">
        <h2 className="font-display text-lg mb-4">Product Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Material" required>
            <input
              className={inputClass}
              required
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="18K Gold"
            />
          </Field>
          <Field label="Gold Purity">
            <input
              className={inputClass}
              value={form.goldPurity}
              onChange={(e) => set("goldPurity", e.target.value)}
              placeholder="18K"
            />
          </Field>
          <Field label="Gold Weight (g)">
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.goldWeightGrams}
              onChange={(e) => set("goldWeightGrams", e.target.value)}
            />
          </Field>
          <Field label="Diamond Weight (ct)">
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.diamondWeightCt}
              onChange={(e) => set("diamondWeightCt", e.target.value)}
            />
          </Field>
          <Field label="Diamond Quality">
            <input
              className={inputClass}
              value={form.diamondQuality}
              onChange={(e) => set("diamondQuality", e.target.value)}
              placeholder="VS1, G"
            />
          </Field>
          <Field label="Certification">
            <input
              className={inputClass}
              value={form.certification}
              onChange={(e) => set("certification", e.target.value)}
              placeholder="IGI Certified"
            />
          </Field>
          <Field label="Occasion">
            <input
              className={inputClass}
              list="occasion-suggestions"
              value={form.occasion}
              onChange={(e) => set("occasion", e.target.value)}
              placeholder="Daily Wear"
            />
            {occasionSuggestions.length > 0 && (
              <datalist id="occasion-suggestions">
                {occasionSuggestions.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            )}
            {occasionSuggestions.length > 0 && (
              <p className="text-[11px] text-charcoal/40 mt-1">
                Suggested for {selectedCategory?.name}: {occasionSuggestions.join(", ")} — matches the
                storefront's {selectedCategory?.name} quick filters.
              </p>
            )}
          </Field>
        </div>

        <Field label="Description" required>
          <textarea
            className={inputClass}
            rows={4}
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-4">
          <Field label="Care Instructions">
            <textarea
              className={inputClass}
              rows={2}
              value={form.careInstructions}
              onChange={(e) => set("careInstructions", e.target.value)}
            />
          </Field>
          <Field label="Shipping Information">
            <textarea
              className={inputClass}
              rows={2}
              value={form.shippingInfo}
              onChange={(e) => set("shippingInfo", e.target.value)}
            />
          </Field>
          <Field label="Return Information">
            <textarea
              className={inputClass}
              rows={2}
              value={form.returnInfo}
              onChange={(e) => set("returnInfo", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving…" : mode === "create" ? "Save Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm text-charcoal/60 hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
