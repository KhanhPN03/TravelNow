import { Link, useNavigate } from "react-router-dom";

const NoPermission = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-red-600">🚫 Access Denied</h1>
        <p className="text-lg text-gray-700 mt-4">
          You do not have permission to access this page.
        </p>
        <button onClick={()=> navigate(-1)}>
            <h3>Go back</h3>
        </button>
      </div>
    </div>
  );
};

export default NoPermission;
