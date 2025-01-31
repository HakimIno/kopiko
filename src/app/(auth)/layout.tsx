"use client";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <main className=" bg-background min-h-screen">
            <div className=" mx-auto max-w-screen-2xl p4">
                {/* <nav className=" flex justify-between items-center p-2">
                    <div className="flex gap-2 items-center">
                        <div className="p-1.5 bg-[#D69D78] rounded-s-2xl rounded-t-2xl border border-black">
                            <Image src={"/logo.svg"} width={30} height={60} alt="logo" />
                        </div>
                        <span className="text-2xl font-semibold">
                            Kopiko
                        </span>
                    </div>
                    <div className=" flex items-center gap-2">
                        <Button variant={"secondary"} className=" rounded-lg font-semibold">
                            Sign Up
                        </Button>
                    </div>
                </nav> */}
                <div className="flex flex-col items-center justify-center pt-8 md:pt-32">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout
