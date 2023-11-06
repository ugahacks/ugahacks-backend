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
    "hover:text-red-500 underline underline-offset-[5px] transition";
  const nonSelectedStyles = "hover:text-red-500 transition";

  return (
    <div className="overflow-y-auto h-screen">
      <header
        id="nav"
        className="sticky top-0 z-10 flex flex-wrap container mx-auto max-w-full items-center p-6 justify-between bg-white shadow-md flex-initial"
      >
        <div className="flex items-center hover:text-red-500 cursor-pointer transition duration-150 ">
          {!user.uid ? (
            <Link href="/">
              <span className="font-semibold text-xl font-inter">UGAHACKS</span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <span className="font-semibold text-xl tracking-5px font-inter">
                UGAHACKS
              </span>
            </Link>
          )}
        </div>

        <nav className={`md:flex md:items-center font-title w-full md:w-auto`}>
          <ul className="text-md inline-block font-light">
            <>
              {!user.uid ? (
                menuItems.map((item) => {
                  let cn = "text-black-800 hover:text-red-500 transition";
                  if (
                    item.link.replace("/", "") ===
                    router.pathname.replace("/", "")
                  ) {
                    cn += " underline underline-offset-[5px]";
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
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
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
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
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
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" &&
                    user_type !== null &&
                    user_type !== undefined &&
                    user_type == "service_writer" ? (
                      <Link href="/qrRead">
                        <span
                          className={
                            "/scanner" === router.asPath
                              ? selectedStyles
                              : nonSelectedStyles
                          }
                        >
                          Scanner
                        </span>
                      </Link>
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    {userInfo.first_name != null &&
                    userInfo.first_name != "" ? (
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
                    ) : null}
                  </li>
                  <li className="my-3 md:my-0 items-center mr-4 md:inline-block block ">
                    <a
                      onClick={handleLogout}
                      className="hover:text-red-500 transition cursor-pointer"
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
        <div id="acdweafadaefd">{children}</div>
      </div>
    </div>
  ); // last div's height is to offset the navbar's position since it is sticky now
};

export default Navbar;
