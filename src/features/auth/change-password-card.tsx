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
import { fetchWithAuth } from "@/lib/auth"

const formSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type FormValues = z.infer<typeof formSchema>

export const ChangePasswordCard = () => {
    const router = useRouter()
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await fetchWithAuth('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong')
            }

            toast.success('Password changed successfully!')
            router.push('/sign-in')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to change password')
        }
    }

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none p-4">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl flex flex-col items-center gap-3">
                    <div className="p-2 bg-[#D69D78] rounded-s-3xl rounded-t-2xl border border-black">
                        <Image src={"/logo.svg"} width={70} height={70} alt="logo" />
                    </div>
                    Change Password
                </CardTitle>
                <CardDescription>
                    Please enter your current password and new password
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
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Current password"
                                            className="w-full h-10 rounded-lg"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="New password"
                                            className="w-full h-10 rounded-lg"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="w-full h-10 rounded-lg"
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
                        >
                            Change Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
} 