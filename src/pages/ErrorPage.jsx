// src/ErrorPage.jsx
import { Link } from "react-router-dom";

function ErrorPage() {
  return (
    <div className="grid h-screen place-content-center bg-black px-4">
      <h1 className="tracking-widest text-gray-500 uppercase text-2xl">404 | Not Found</h1>
      <Link to='/' className='text-center block m-1 hover:underline'>Gå Hjem</Link>
    </div>
  );
}

export default ErrorPage;
