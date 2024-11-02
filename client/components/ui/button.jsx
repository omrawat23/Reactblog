const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`rounded-2xl border-2 text-white border-black px-6 py-3 font-semibold uppercase transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-0 active:translate-y-0 active:rounded-2xl active:shadow-none ${className}`}
      style={{ backgroundColor: '#743beb' }} // Set the background color here
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
