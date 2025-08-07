export const NotFoundPage = () => {
  return (
    <div className='flex flex-col w-full p-4 gap-4 items-center'>
      <span>404 - Page Not Found!</span>
      <a className="border-1 py-1 px-2 rounded-sm text-sm" href="/app">Go to main app</a>
    </div>
  );
}

