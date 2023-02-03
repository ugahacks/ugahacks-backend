import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  const { user, logOut, currEvent, userInfo, user_type} = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      id: 1,
      name: "Home",
      link: "/",
    },
    {
      id: 2,
      name: "Login",
      link: "/login",
    },
    {
      id: 3,
      name: "Sign Up",
      link: "/signup",
    },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <>
      <header className="flex flex-wrap container mx-auto max-w-full items-center p-6 justify-between bg-[#DC4141] shadow-md sticky top-0 z-50">
        <div className="flex items-center text-blue-900 hover:text-blue-800 cursor-pointer transition duration-150 ">
          {!user.uid ? (
            <Link href="/">
              <span className="font-semibold text-lg font-sans text-white">
                MyByte - UGA Hacks Portal
              </span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <span className="font-semibold text-lg font-sans text-white">
                MyByte - UGA Hacks Portal
              </span>
            </Link>
          )}
        </div>

        <nav className={`md:flex md:items-center font-title w-full md:w-auto`}>
          <ul className="text-lg inline-block">
            <>
              {!user.uid ? (
                menuItems.map((item) => (
                  <li
                    key={item.id}
                    className="my-3 md:my-0 items-center mr-4 md:inline-block block text-white"
                  >
                    <Link href={item?.link}>
                      <span className="text-black-800 hover:text-red-900 transition">
                        {item?.name}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
                      <Link href="/dashboard">
                        <span className="hover:text-blue-900 transition text-white">
                          Dashboard
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
                      <Link href="/team">
                        <span className="hover:text-blue-900 transition text-white">
                          Team
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null && userInfo.first_name != "" &&
                    user_type !== null && user_type != undefined &&
                    user_type == "service_writer" ? (
                      <Link href="/qrRead">
                        <span className="hover:text-blue-900 transition text-white">
                          Scanner
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
                      <Link href="/profile">
                        <span className="hover:text-blue-900 transition text-white">
                          Profile
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    <a
                      onClick={handleLogout}
                      className="text-white hover:text-blue-900 transition cursor-pointer"
                    >
                      Logout
                    </a>
                  </li>
                </>
              )}
            </>
          </ul>
        </nav>
      </header>
      {children}
    </>
  );
};

export default Navbar;
