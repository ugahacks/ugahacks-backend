import Image from "next/image";
function NotFoundPage() {
    const textStyle = {fontFamily: "Source Code Pro, monospace"}

    return (
        <div className={`min-h-0 mt-10 flex items-center justify-center`}>
            <div className="text-center">
                <Image className="mb-5" src="/404.png" alt="not found" height={300} width={300} />
                <p className="mb-10" style={textStyle}>Where are you, homie?</p>
                <div className="rounded-md overflow-hidden">
                    <Image src="/404.gif" alt="not found" height={300} width={300} />
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage;
