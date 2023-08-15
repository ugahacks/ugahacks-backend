import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  const { user, logOut, currEvent, userInfo, user_type } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      id: 1,
      name: "Login",
      link: "/login",
    },
    {
      id: 2,
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
    <div className="flex flex-col overflow-y-auto min-h-screen">
      <header id="nav" className="flex flex-wrap container mx-auto max-w-full items-center p-6 justify-between bg-white shadow-md flex-initial">
        <div className="flex items-center hover:text-blue-800 cursor-pointer transition duration-150 ">
          {!user.uid ? (
            <Link href="/">
              <span className="font-semibold text-lg font-sans">
                UGAHACKS
              </span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <span className="font-semibold text-lg font-sans">
                UGAHACKS
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
                    className="my-3 md:my-0 items-center mr-4 md:inline-block block"
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
                        <span className="hover:text-blue-900 transition">
                          Dashboard
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
                      <Link href="/team">
                        <span className="hover:text-blue-900 transition">
                          Team
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" &&
                    user_type !== null &&
                    user_type !== undefined &&
                    user_type == "service_writer" ? (
                      <Link href="/qrRead">
                        <span className="hover:text-blue-900 transition">
                          Scanner
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
                      <Link href="/profile">
                        <span className="hover:text-blue-900 transition">
                          Profile
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
                      <Link href="/insertDevPost">
                        <span className="hover:text-blue-900 transition">
                          Submit Devpost Link
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    <a
                      onClick={handleLogout}
                      className="hover:text-blue-900 transition cursor-pointer"
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
      <div className="flex flex-col items-center justify-center py-2 font-inter overflow-y-auto flex-auto basis-[50vh] smh:basis-[58vh] md:basis-[90vh]">
        {children}
      </div>
    </div>
  ); // last div is to offset the navbar's position since it is fixed now
};

export default Navbar;
