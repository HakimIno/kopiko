import { cn } from "@/lib/utils"



interface DottedSeparatorPorps {
    className?: string
    color?: string
    height?: string
    dotSize?: string
    gapSize?: string
    direction?: "horizontal" | "vertical"
}


export const DottedSeparator = ({
    className,
    color = "#d4d4d8",
    height = "2px",
    dotSize = "2px",
    gapSize = "2px",
    direction = "horizontal"
}: DottedSeparatorPorps) => {
    const isHorizontal = direction === "horizontal";

    return (
        <div className={cn(isHorizontal ? " w-full flex items-center" : "flex flex-col h-full items-center", className)}>
            <div
                className={isHorizontal ? "flex-grow" : "flex-grow-0"}
                style={{
                    width: isHorizontal ? "100%" : height,
                    height: isHorizontal ? height : "100%",
                    backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
                    backgroundSize: isHorizontal ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}` : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
                    backgroundRepeat: isHorizontal ? 'repeat-x' : 'repeat-y',
                    backgroundPosition: 'center'

                }}
            >

            </div>
        </div>
    )

}
