
export const Circle = ({height, width, color="bg-primary-500", opacity="opacity-[89%]"}: { height: string, width: string, color?: string, opacity?: string }) => {
    let names = `${height} ${width} ${color} absolute rounded-full ${opacity} z-[-1]`;
    return (
        <div className={names}></div>
    );
}
