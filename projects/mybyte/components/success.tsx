import Link from "next/link";
import React from "react";

export default function Success({ childNames, successText, link, linkText }: { childNames: string[], successText: string, link: string, linkText: string }) {
    const names: string[] = [
        (childNames.length > 0) ? childNames[0] : "sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md",
        (childNames.length > 1) ? childNames[1] : "px-12 mt-8 text-center text-xl",
        (childNames.length > 2) ? childNames[2] : "mt-8 mb-8",
        (childNames.length > 3) ? childNames[3] : "flex justify-center text-xl",
        (childNames.length > 4) ? childNames[4] : "text-cyan-500",
    ];
    return (
        <div className={names[0]}>
            <h2 className={names[1]}>
                {successText}
            </h2>

            <div className={names[2]}>
                <div className={names[3]}>
                    <p className={names[4]}>
                        <Link href={link}>{linkText}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
