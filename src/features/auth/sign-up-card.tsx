import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters")
})

type FormValues = z.infer<typeof formSchema>

export const SignUpCard = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/sign-up', {
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

            toast.success('Account created successfully!', {
                description: 'Please sign in with your new account'
            })
            router.push('/sign-in')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create account'
            toast.error(message, {
                description: 'Please try again with different credentials'
            })
            form.setError('root', { message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none p-4">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl flex flex-col items-center gap-3">
                    <div className="p-2 bg-[#D69D78] rounded-s-3xl rounded-t-2xl border border-black">
                        <Image src={"/logo.svg"} width={70} height={70} alt="logo" />
                    </div>
                    Sign up
                </CardTitle>
                <CardDescription>
                    By signing up, you agree to our{" "}
                    <Link href={"/policy"}>
                        <span className="text-[#D69D78]">Privacy Policy</span>
                    </Link>
                </CardDescription>
            </CardHeader>

            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter name"
                                            className="w-full h-10 rounded-lg"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                            className="w-full h-10 rounded-lg"
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
                                            className="w-full h-10 rounded-lg"
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
                            className="w-full font-semibold py-2 rounded-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign up'
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
                    className="w-full rounded-lg font-semibold py-2"
                    disabled={isLoading}
                >
                    <Image src={"/icons8-google.svg"} width={24} height={24} alt="google" />
                    Sign up with Google
                </Button>
                <Button 
                    variant="tertiary" 
                    size="lg" 
                    className="w-full rounded-lg text-black font-semibold py-2"
                    disabled={isLoading}
                >
                    <Image src={"/icons8-github.svg"} width={24} height={24} alt="github" />
                    Sign up with Github
                </Button>
            </CardContent>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7 flex items-center justify-center">
                <p className="text-sm">
                    Already have an account? {"    "}
                    <Link href={"/sign-in"}>
                        <span className=" text-[#D69D78]">Sign In</span>
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}