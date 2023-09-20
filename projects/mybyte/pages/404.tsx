import Image from "next/image";
function NotFoundPage() {
    const textStyle = {fontFamily: "Source Code Pro, monospace"}
    const navbarHeight = 20;    // somehow get the navbar's height programmatically? needed to get rid of the scroll bar

    return (
        <div className={`min-h-screen -mt-${navbarHeight} flex items-center justify-center`}>
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
