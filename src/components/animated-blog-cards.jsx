import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnimatedBlogCards({ blogs }) {
  const containerRef = useRef(null)
  const [visibleCards, setVisibleCards] = useState([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = Number.parseInt(entry.target.getAttribute("data-blog-id") || "0")
            setVisibleCards((prev) => [...new Set([...prev, cardId])])
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    const cardElements = containerRef.current?.querySelectorAll("[data-blog-id]")
    cardElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Stacking Animation Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {blogs.map((blog, index) => {
          const isVisible = visibleCards.includes(blog.id)

          return (
            <div
              key={blog.id}
              data-blog-id={blog.id}
              className="relative"
              style={{
                zIndex: blogs.length - index,
              }}
            >
              <Card
                className={`group hover:shadow-xl transition-all duration-700 ease-out cursor-pointer transform ${
                  isVisible
                    ? "translate-y-0 opacity-100 scale-100 rotate-0"
                    : "translate-y-20 opacity-0 scale-95 rotate-1"
                } hover:-translate-y-2 hover:rotate-0`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                  transformOrigin: "center bottom",
                }}
              >
                <div className="aspect-video overflow-hidden rounded-t-lg relative">
                  <img
                    src={blog.image || "/placeholder.svg"}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardHeader className="relative">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{blog.location}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {blog.title}
                  </CardTitle>
                  <CardDescription className="text-card-foreground line-clamp-2">{blog.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{blog.date}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-foreground hover:bg-primary transform hover:scale-105 transition-all duration-200"
                    >
                      Read More
                    </Button>
                  </div>
                </CardContent>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-secondary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
              </Card>
            </div>
          )
        })}
      </div>

      {/* Floating animation elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
      <div className="absolute top-32 right-20 w-3 h-3 bg-secondary/30 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-accent/30 rounded-full animate-pulse delay-2000" />
    </div>
  )
}
