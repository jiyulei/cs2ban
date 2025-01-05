import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Image
                src="/icons/gameover.png"
                alt="New Icon"
                width={40}
                height={40} 
                priority
              />
            </div>
            {/* Tabs */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  href="/banlist"
                  className={`rounded-md px-3 py-2 text-lg font-semibold ${
                    router.pathname === "/banlist"
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Banlist
                </Link>
                <Link
                  href="/admins"
                  className={`rounded-md px-3 py-2 text-lg font-semibold ${
                    router.pathname === "/admins"
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Admins
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
