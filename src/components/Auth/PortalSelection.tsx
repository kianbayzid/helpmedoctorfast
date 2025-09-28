import React from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ArrowRight } from "lucide-react";

const PortalSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
            <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Doctor Portal</h1>
            <div className="w-16 h-1 bg-white/30 rounded-full mx-auto"></div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 text-center">
            <p className="text-gray-600 leading-relaxed mb-8 text-base">
              Manage patient communications, organize messages by category, and streamline your healthcare workflow efficiently.
            </p>

            {/* Action Button */}
            <button
              onClick={() => navigate("/login")}
              className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Access Doctor Portal
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Decorative Elements */}
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Secure • Efficient • Professional
        </p>
      </div>
    </div>
  );
};

export default PortalSelection;