import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";
import { useLayoutEffect } from "react";

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

  const isElementXPercentInViewport = function(el: Element, percentVisible: number) {
    let
      rect = el.getBoundingClientRect(),
      windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  
    return !(
      Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-rect.height) * 100)) < percentVisible ||
      Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
    )
  };

  useLayoutEffect(() => {
    let element = document.getElementById("acdweafadaefd");
    if (element !== null && element !== undefined && isElementXPercentInViewport(element, 100)) {
      let parent = element.parentElement;
      if (parent !== null) {
        parent.style.display = "grid";
        parent.style.alignItems = "center";
      }
    }
  });

  return (
    <div className="overflow-y-auto h-screen">
      <header id="nav" className="sticky top-0 z-10 flex flex-wrap container mx-auto max-w-full items-center p-6 justify-between bg-white shadow-md flex-initial">
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
                      <span className="text-black-800 hover:text-red-500 transition">
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
      <div className="font-inter h-[calc(100%-168px)] md:h-[calc(100%-76px)]">
        <div id="acdweafadaefd">
          {children}
        </div>
      </div>
    </div>
  ); // last div's height is to offset the navbar's position since it is sticky now
};

export default Navbar;
