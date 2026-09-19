export default function ShopLoading() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12 animate-pulse">
      <div className="h-8 w-48 bg-[#F0EAD9] mx-auto mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        <div className="hidden lg:block space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-[#F0EAD9]" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-[#F0EAD9] mb-3" />
              <div className="h-3 w-1/2 bg-[#F0EAD9] mb-2" />
              <div className="h-4 w-3/4 bg-[#F0EAD9]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
