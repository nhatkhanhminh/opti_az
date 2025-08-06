import { AnimatedTestimonials } from "@/components/ui/animated-team";
import { useTranslations } from "next-intl";

function AnimatedTestimonialsDemo() {
  const t = useTranslations("AboutPage.team.testimonials");
  
  const testimonials = [
    {
      quote: t("passa.quote"),
      name: t("passa.name"),
      designation: t("passa.designation"),
      src: "/images/team/passa.jpg",
    },
    {
      quote: t("dmitri.quote"),
      name: t("dmitri.name"),
      designation: t("dmitri.designation"),
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: t("jessica.quote"),
      name: t("jessica.name"),
      designation: t("jessica.designation"),
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: t("james.quote"),
      name: t("james.name"),
      designation: t("james.designation"),
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: t("michael.quote"),
      name: t("michael.name"),
      designation: t("michael.designation"),
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}

export { AnimatedTestimonialsDemo };
