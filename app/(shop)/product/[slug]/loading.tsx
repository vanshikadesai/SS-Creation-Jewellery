export default function ProductLoading() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-[#F0EAD9]" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-[#F0EAD9]" />
          <div className="h-9 w-2/3 bg-[#F0EAD9]" />
          <div className="h-6 w-1/3 bg-[#F0EAD9]" />
          <div className="h-11 w-full bg-[#F0EAD9] mt-6" />
        </div>
      </div>
    </div>
  );
}
