import Link from 'next/link';

export default function EmptyState({ 
  title = "Nothing to see here", 
  description = "Try adding some items", 
  actionLink = "/", 
  actionText = "Go Shopping" 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4 bg-[#F0F2F4] rounded-lg shadow-md">
      <div className="text-[#6A4E3C] mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[#6A4E3C] mb-2">{title}</h3>
      <p className="text-[#6A4E3C] mb-6">{description}</p>
      <Link 
        href={actionLink}
        className="bg-[#6A4E3C] text-white px-4 py-2 rounded-md hover:bg-[#4E3B2D] transition-colors"
      >
        {actionText}
      </Link>
    </div>
  );
}
