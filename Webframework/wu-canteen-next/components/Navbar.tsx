"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import LoginDialog from "@/components/LoginDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,  
  faUserLock,
  faUserPlus, 
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
export default function Navbar() {
  const router = useRouter();
  const { profile, loading, clearProfile, refetch } = useStaffProfile();
  const [showLogin, setShowLogin] = useState(false);
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearProfile();
    router.push("/");
  }
  async function handleLogin() {
    setShowLogin(true);
  }
  return (
    <>
      <h1 className="text-xl font-bold">WU Canteen</h1>
      <nav>
        <ul className="flex gap-6 text-gray-900">
          <li>
            <Link
              href="/"
              className="inline-block transition-all duration-300 hover:text-purple-500 hover:scale-
105"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href="/menu"
              className="inline-block transition-all duration-300 hover:text-purple-500 hover:scale-
105"
            >
              Menu
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              className="inline-block transition-all duration-300 hover:text-purple-500

hover:scale-105"
            >
              About
            </Link>
          </li>
          {!loading && !profile && (
            <li>
              <button
                type="button"
                onClick={handleLogin}
                className="inline-block transition-all duration-300

hover:text-purple-500 hover:scale-105"
              >
                <FontAwesomeIcon icon={faUserLock} className="ml-2" />
              </button>
            </li>
          )}
          {!loading && profile && (
            <>
              <li>
                <Link
                  href="/admin"
                  className="inline-block transition-all duration-300 hover:text-purple-500 hover:scale-105"
                >
                  {profile.role === "admin" ? (
                    <FontAwesomeIcon icon={faUserTie} className="ml-2 me-2" />
                  ) : (
                    <FontAwesomeIcon icon={faUserPlus} className="ml-2 me-2" />
                  )}
                  {profile.full_name}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-block transition-all duration-300

hover:text-purple-500 hover:scale-105"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="ml-2" />
                </button>
              </li>
            </>
          )}
          {showLogin && (
            <LoginDialog
              onClose={() => setShowLogin(false)}
              onLoginSuccess={refetch}
            />
          )}
        </ul>
      </nav>
    </>
  );
}
