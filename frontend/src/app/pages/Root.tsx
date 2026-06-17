import { Outlet } from "react-router";
import { Flame } from "lucide-react";

export default function Root() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-900">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg blur-md opacity-50"></div>
              <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-2.5 rounded-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Fire & Smoke Detection System
              </h1>
              <p className="text-sm text-neutral-400">Real-time Computer Vision Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-neutral-300">Model Active</span>
            </div>
            <div className="px-3 py-1.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg border border-red-500/30">
              <span className="text-sm text-orange-400 font-semibold">YOLOv8</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Outlet />

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
