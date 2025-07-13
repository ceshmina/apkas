interface HamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
}

const HamburgerIcon = ({ isOpen, onClick }: HamburgerIconProps) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      aria-label="メニューを開く"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 transform ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 mt-1 transform ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </div>
    </button>
  );
};

export default HamburgerIcon;