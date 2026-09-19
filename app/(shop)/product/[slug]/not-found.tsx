import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-24 text-center">
      <h1 className="text-3xl md:text-4xl mb-4">Piece Not Found</h1>
      <p className="text-charcoal/60 mb-8">
        This item may have sold out or is no longer listed.
      </p>
      <Link href="/shop" className="btn-primary">
        Continue Shopping
      </Link>
    </div>
  );
}
