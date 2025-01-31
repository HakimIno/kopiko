import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { setTokens } from "@/lib/auth"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/logo"

const formSchema = z.object({
    email: z.string().trim().min(1, "Required").email(),
    password: z.string().min(8, "Password must be at least 8 characters")
})

type FormValues = z.infer<typeof formSchema>

export const SignInCard = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong')
            }

            // Store tokens
            setTokens({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            })

            toast.success('Login successful!')
            router.push('/')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign in'
            toast.error(message, {
                description: 'Please check your credentials and try again'
            })
            form.setError('root', { message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none p-4">
            <CardHeader className="flex items-center justify-center text-center">
                <CardTitle className="text-2xl flex flex-col items-center gap-3">
                    {/* <div className="p-2 bg-[#D69D78] rounded-s-3xl rounded-t-2xl border border-black">
                        <Image src={"/logo.svg"} width={70} height={70} alt="logo" />
                    </div> */}
                    <Logo scale={0.9} />
                    Sign In
                </CardTitle>
                <CardDescription>
                    Please sign in to continue
                </CardDescription>
            </CardHeader>

            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter email address"
                                            className="w-full h-10 rounded-full dark:focus:bg-black dark:focus:text-white"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Enter password"
                                            className="w-full h-10 rounded-full dark:focus:bg-black dark:focus:text-white"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full font-semibold py-2 rounded-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7 flex flex-col gap-4">
                <Button
                    variant="secondary"
                    size="lg"
                    className="w-full rounded-full font-semibold py-2 dark:bg-[#1a1a1a] dark:text-white"
                    disabled={isLoading}
                >
                    <Image src={"/icons8-google.svg"} width={24} height={24} alt="google" />
                    Login with Google
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    className="w-full rounded-full font-semibold py-2 dark:bg-[#1a1a1a] dark:text-white"
                    disabled={isLoading}
                >
                    <Image src={"/icons8-github.svg"} width={24} height={24} alt="github" />
                    Login with Github
                </Button>
            </CardContent>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2 font-anuphan text-sm">
                    <p className="text-sm">
                        ยังไม่มีบัญชีใช่ไหม?
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center"
                    >
                        <span className="text-[#D69D78] hover:text-[#B67E5C] font-medium">
                            สมัครสมาชิก
                        </span>
                        <svg
                            className="w-4 h-4 ml-1 text-[#D69D78]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}