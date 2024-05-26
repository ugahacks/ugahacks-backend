import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";
import { useLayoutEffect, useState } from "react";

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

  const isElementXPercentInViewport = function (
    el: Element,
    percentVisible: number
  ) {
    let rect = el.getBoundingClientRect(),
      windowHeight =
        window.innerHeight || document.documentElement.clientHeight;

    return !(
      Math.floor(100 - ((rect.top >= 0 ? 0 : rect.top) / +-rect.height) * 100) <
        percentVisible ||
      Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) <
        percentVisible
    );
  };

  useLayoutEffect(() => {
    let element = document.getElementById("acdweafadaefd");
    if (
      element !== null &&
      element !== undefined &&
      isElementXPercentInViewport(element, 100)
    ) {
      let parent = element.parentElement;
      if (parent !== null) {
        parent.style.display = "grid";
        parent.style.alignItems = "center";
      }
    }
  });

  const selectedStyles =
    "font-light hover:text-red-500 underline underline-offset-2 transition";
  const nonSelectedStyles = "font-light hover:text-red-500 transition";

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="shadow-md">
      <div
        className={
          (router.asPath !== "/register" ? "h-screen" : "") +
          " overflow-y-auto font-inter"
        }
      >
        <nav className="bg-white border-gray-200 shadow-md top-0 sticky z-10">
          <div className="flex flex-wrap items-center justify-between mx-auto py-6">
            <Link href={!user.uid ? "/" : "/dashboard"}>
              <span className="font-semibold uppercase text-xl tracking-5px px-5 hover:text-red-500 transition">
                UGAHacks
              </span>
            </Link>

            {/* Hamburger menu for mobile view */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center p-2 mr-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-200 dark:focus:ring-gray-600"
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            <div
              className={`${
                isMenuOpen ? "block" : "hidden"
              } px-5 w-full md:block md:w-auto`}
              id="navbar-default"
            >
              <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-100 md:flex-row md:space-x-5 md:mt-0 md:border-0 md:bg-white">
                <>
                  {!user.uid ? (
                    menuItems.map((item) => {
                      let cn =
                        "font-light text-black-800 hover:text-red-500 transition";
                      if (
                        item.link.replace("/", "") ===
                        router.pathname.replace("/", "")
                      ) {
                        cn += "underline underline-offset-[5px]";
                      }
                      return (
                        <li
                          key={item.id}
                          className="my-3 md:my-0 items-center mr-4 md:inline-block block"
                        >
                          <Link href={item?.link}>
                            <span className={cn}>{item?.name}</span>
                          </Link>
                        </li>
                      );
                    })
                  ) : (
                    <>
                      {userInfo.first_name != null &&
                      userInfo.first_name != "" ? (
                        <li>
                          <Link href="/dashboard">
                            <span
                              className={
                                "/dashboard" === router.asPath
                                  ? selectedStyles
                                  : nonSelectedStyles
                              }
                            >
                              Dashboard
                            </span>
                          </Link>
                        </li>
                      ) : null}

                      {/* {userInfo.first_name != null &&
                      userInfo.first_name != "" ? (
                        <li>
                          <Link href="/team">
                            <span
                              className={
                                "/team" === router.asPath
                                  ? selectedStyles
                                  : nonSelectedStyles
                              }
                            >
                              Team
                            </span>
                          </Link>
                        </li>
                      ) : null} */}

                      {/* TODO: Why are we doing the first_name check */}

                      {userInfo.first_name != null &&
                      userInfo.first_name != "" &&
                      user_type !== null &&
                      user_type !== undefined &&
                      user_type == "service_writer" ? (
                        <li>
                          <Link href="/qrRead">
                            <span
                              className={
                                "/qrRead" === router.asPath
                                  ? selectedStyles
                                  : nonSelectedStyles
                              }
                            >
                              Scanner
                            </span>
                          </Link>
                        </li>
                      ) : null}

                      {/* TODO: why are we checking first_name? */}
                      {/* {userInfo.first_name != null &&
                      userInfo.first_name != "" ? (
                        <li>
                          <Link href="/insertDevPost">
                            <span
                              className={
                                "/insertDevPost" === router.asPath
                                  ? selectedStyles
                                  : nonSelectedStyles
                              }
                            >
                              Submit Devpost Link
                            </span>
                          </Link>
                        </li>
                      ) : null} */}

                      <li>
                        <a onClick={handleLogout} className={nonSelectedStyles}>
                          Logout
                        </a>
                      </li>
                    </>
                  )}
                </>
              </ul>
            </div>
          </div>
        </nav>
        <div
          className={
            router.asPath === "/register" || router.asPath === "/esports"
              ? "fixed"
              : "font-inter h-[calc(100%-168px)] md:h-[calc(100%-76px)]"
          }
        >
          <div id={router.asPath !== "/register" ? "acdweafadaefd" : ""}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
