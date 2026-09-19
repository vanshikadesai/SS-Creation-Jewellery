export default function CheckoutLoading() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12 animate-pulse">
      <div className="h-8 w-56 bg-[#F0EAD9] mx-auto mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="h-40 bg-[#F0EAD9]" />
        <div className="h-64 bg-[#F0EAD9]" />
      </div>
    </div>
  );
}
