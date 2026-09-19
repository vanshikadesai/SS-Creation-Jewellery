export default function CartLoading() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12 animate-pulse">
      <div className="h-8 w-40 bg-[#F0EAD9] mx-auto mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-24 h-24 bg-[#F0EAD9]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-[#F0EAD9]" />
                <div className="h-3 w-1/3 bg-[#F0EAD9]" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 bg-[#F0EAD9]" />
      </div>
    </div>
  );
}
