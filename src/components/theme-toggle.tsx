"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isTransitioning, setIsTransitioning] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        const x = e.clientX
        const y = e.clientY
        setIsTransitioning(true)

        // Create ripple effect
        const ripple = document.createElement('div')
        ripple.style.position = 'fixed'
        ripple.style.left = `${x}px`
        ripple.style.top = `${y}px`
        ripple.style.transform = 'translate(-50%, -50%) scale(0)'
        ripple.style.width = '10px'
        ripple.style.height = '10px'
        ripple.style.borderRadius = '50%'
        ripple.style.backgroundColor = theme === 'dark'
            ? '#F6F4EE'
            : '#2B2B29'
        ripple.style.border = theme === 'dark'
            ? '2px solid rgba(246, 244, 238, 0.2)'
            : '2px solid rgba(43, 43, 41, 0.2)'
        ripple.style.boxShadow = theme === 'dark'
            ? '0 0 10px rgba(246, 244, 238, 0.2)'
            : '0 0 10px rgba(43, 43, 41, 0.2)'
        ripple.style.transition = 'all 2.5s cubic-bezier(0.25, 1, 0.5, 1)'
        ripple.style.opacity = '0.98'
        ripple.style.pointerEvents = 'none'
        ripple.style.zIndex = '9999'

        document.body.appendChild(ripple)

        // Calculate ripple scale
        const maxDim = Math.max(
            document.documentElement.clientWidth,
            document.documentElement.clientHeight
        )
        const scale = (maxDim * 4) / 10

        // Apply text color transition to all text elements
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a')
        textElements.forEach(element => {
            if (element instanceof HTMLElement) {
                element.style.transition = 'color 0.2s ease-out'
                element.style.position = 'relative'
                element.style.zIndex = '1'
            }
        })

        requestAnimationFrame(() => {
            ripple.style.transform = `translate(-50%, -50%) scale(${scale})`
            ripple.style.opacity = '1'
        })

        setTimeout(() => {
            setTheme(theme === 'dark' ? 'light' : 'dark')
            ripple.style.opacity = '0.95'
        }, 400)

        setTimeout(() => {
            if (document.body.contains(ripple)) {
                ripple.style.transition = 'opacity 0.10s ease-out'
                ripple.style.opacity = '0'
                setTimeout(() => {
                    document.body.removeChild(ripple)
                    setIsTransitioning(false)
                }, 100)
            }
        }, 400)
    }

    if (!mounted) return null

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="relative rounded-xl transition-all duration-700 ease-out
                     border-0 hover:border-opacity-80
                     dark:border-gray-200 dark:hover:border-gray-300
                     light:border-gray-800 light:hover:border-gray-900"
            disabled={isTransitioning}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-700 ease-out dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-700 ease-out dark:rotate-0 dark:scale-100" />
        </Button>
    )
}