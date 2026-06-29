function PageLoader() {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-6">
  
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">🍽️ Khan Restaurant</h1>
            <p className="text-gray-400 text-sm mt-2">رستوران خان</p>
          </div>
  
          {/* Spinner */}
          <div className="flex gap-2 mt-4">
            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
  
        </div>
      </div>
    );
  }
  
  export default PageLoader;