export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-[#F0F2F4]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4E3C]"></div>
    </div>
  );
}
