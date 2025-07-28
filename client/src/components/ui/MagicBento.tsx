import { useRef, useEffect, useCallback, useState } from "react";
import { gsap } from "gsap";
import { useNavigate } from 'react-router-dom';
import { Paperclip, MessageSquare, ArrowRight } from 'lucide-react';
import "./MagicBento.css";

// Card type definitions
interface BaseCard {
  color: string;
  title: string | number;
  description: string;
  label: string;
}

interface StatCard extends BaseCard {
  type: "stat";
  icon: string;
  gradient: string;
  showViewMore?: boolean;
  viewMorePath?: string;
  items?: any[];
}

interface ListCard extends BaseCard {
  type: "list";
  items: any[];
  gradient: string;
  showViewMore?: boolean;
  viewMorePath?: string;
}

interface DefaultCard extends BaseCard {
  type?: never;
  icon?: never;
  gradient?: never;
  items?: never;
  showViewMore?: never;
  viewMorePath?: never;
}

type DashboardCard = StatCard | ListCard | DefaultCard;

// Type guards
const isStatCard = (card: any): card is StatCard => card.type === 'stat';
const isListCard = (card: any): card is ListCard => card.type === 'list';

const DEFAULT_PARTICLE_COUNT = 15;
const DEFAULT_SPOTLIGHT_RADIUS = 400;
const DEFAULT_GLOW_COLOR = "255, 28, 247"; // Pink
const MOBILE_BREAKPOINT = 768;

const defaultCardData = [
  {
    color: "#0a0a0f",
    title: "Analytics",
    description: "Track user behavior and insights",
    label: "Insights",
  },
  {
    color: "#0a0a0f",
    title: "Dashboard",
    description: "Centralized data view",
    label: "Overview",
  },
  {
    color: "#0a0a0f",
    title: "Collaboration",
    description: "Work together seamlessly",
    label: "Teamwork",
  },
  {
    color: "#0a0a0f",
    title: "Automation",
    description: "Streamline workflows",
    label: "Efficiency",
  },
  {
    color: "#0a0a0f",
    title: "Integration",
    description: "Connect favorite tools",
    label: "Connectivity",
  },
  {
    color: "#0a0a0f",
    title: "Security",
    description: "Enterprise-grade protection",
    label: "Protection",
  },
];

const createDashboardCards = (dashboardData: any, isDark: boolean): DashboardCard[] => {
  const baseColor = isDark ? "#1a1a2e" : "#f8fafc";

  // Helper function to format task list for display
  const formatTaskList = (tasks: any[], maxItems: number = 3) => {
    if (!tasks || tasks.length === 0) return "No tasks";
    const displayTasks = tasks.slice(0, maxItems);
    const taskTitles = displayTasks.map((task: any) => task.title);
    if (tasks.length > maxItems) {
      taskTitles.push(`+${tasks.length - maxItems} more`);
    }
    return taskTitles.join(", ");
  };

  // Get recent completed tasks for display
  const recentCompletedTasks = dashboardData.completedTasks || [];
  const pendingTasks = dashboardData.pendingTasks || [];

  return [
    {
      color: baseColor,
      title: dashboardData.stats.completedTasks,
      description: recentCompletedTasks.length > 0
        ? formatTaskList(recentCompletedTasks, 2)
        : "No completed tasks",
      label: "Completed Tasks",
      type: "stat",
      icon: "✓",
      gradient: "from-green-500 to-emerald-600",
      showViewMore: true,
      viewMorePath: "/tasks?status=done",
      items: recentCompletedTasks
    },
    {
      color: baseColor,
      title: dashboardData.stats.pendingTasks,
      description: pendingTasks.length > 0
        ? formatTaskList(pendingTasks, 2)
        : "No pending tasks",
      label: "Pending Tasks",
      type: "stat",
      icon: "⏳",
      gradient: "from-blue-500 to-cyan-600",
      showViewMore: true,
      viewMorePath: "/tasks?status=todo,in_progress",
      items: pendingTasks
    },
    {
      color: baseColor,
      title: dashboardData.stats.longestStreak,
      description: "Days in a row",
      label: "Longest Streak",
      type: "stat",
      icon: "🔥",
      gradient: "from-orange-500 to-red-600",
      showViewMore: true,
      viewMorePath: "/habits"
    },
    {
      color: baseColor,
      title: "Upcoming Tasks",
      description: formatTaskList(dashboardData.upcomingTasks, 3),
      label: "Tasks",
      type: "list",
      items: dashboardData.upcomingTasks || [],
      gradient: "from-pink-500 to-rose-600",
      showViewMore: true,
      viewMorePath: "/tasks"
    },
    {
      color: baseColor,
      title: "Recent Activity",
      description: formatTaskList(dashboardData.recentActivity, 3),
      label: "Activity",
      type: "list",
      items: dashboardData.recentActivity || [],
      gradient: "from-indigo-500 to-purple-600",
      showViewMore: true,
      viewMorePath: "/tasks?status=done"
    }
  ];
};

const createParticleElement = (
  x: number,
  y: number,
  color = DEFAULT_GLOW_COLOR
) => {
  const el = document.createElement("div");
  el.className = "magic-particle";
  el.style.cssText = `
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${color}, 0.6) 0%, rgba(${color}, 0.4) 40%, transparent 70%);
    box-shadow:
      0 0 4px rgba(${color}, 0.4),
      0 0 8px rgba(${color}, 0.2),
      0 0 12px rgba(${color}, 0.1);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
    filter: blur(0.5px);
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        // Enhanced entrance animation
        gsap.fromTo(
          clone,
          {
            scale: 0,
            opacity: 0,
            rotation: Math.random() * 360,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)"
          }
        );

        // Floating animation with more organic movement
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 120,
          y: (Math.random() - 0.5) * 120,
          rotation: Math.random() * 720,
          duration: 3 + Math.random() * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Pulsing glow effect
        gsap.to(clone, {
          opacity: 0.1 + Math.random() * 0.2,
          scale: 0.9 + Math.random() * 0.2,
          duration: 1.5 + Math.random(),
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Spiral movement
        gsap.to(clone, {
          rotation: "+=360",
          duration: 8 + Math.random() * 4,
          ease: "none",
          repeat: -1,
        });
      }, index * 80);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

// Global Spotlight Effect
interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

const GlobalSpotlight: React.FC<GlobalSpotlightProps> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: ${spotlightRadius * 2}px;
      height: ${spotlightRadius * 2}px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll(".magic-card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          cardElement,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll(".magic-card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

// Bento Grid Component
interface BentoCardGridProps {
  children: React.ReactNode;
  gridRef: React.RefObject<HTMLDivElement>;
  isDashboard?: boolean;
}

const BentoCardGrid: React.FC<BentoCardGridProps> = ({ children, gridRef, isDashboard = false }) => (
  <div className={`magic-bento-grid bento-section ${isDashboard ? 'dashboard-grid' : ''}`} ref={gridRef}>
    {children}
  </div>
);

// Mobile Detection Hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Main MagicBento Component
interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  dashboardData?: any;
  isDark?: boolean;
}

const MagicBento: React.FC<MagicBentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  dashboardData,
  isDark = false,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  // Use dashboard data if provided, otherwise use default cards
  const cardData = dashboardData ? createDashboardCards(dashboardData, isDark) : defaultCardData;

  const handleViewMore = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef} isDashboard={!!dashboardData}>
        {cardData.map((card, index) => {
          const baseClassName = `magic-card ${textAutoHide ? "magic-card--text-autohide" : ""} ${enableBorderGlow ? "magic-card--border-glow" : ""}`;
          const cardProps = {
            className: baseClassName,
            style: {
              "--glow-color": glowColor,
            } as React.CSSProperties
          };

          if (enableStars) {
            return (
              <ParticleCard
                key={index}
                {...cardProps}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                <div className="magic-card__header">
                  <div className="magic-card__label">{card.label}</div>
                </div>
                <div className="magic-card__content">
                  {isStatCard(card) ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{card.icon}</span>
                        <h2 className={`magic-card__title text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                          {card.title}
                        </h2>
                      </div>
                      {card.items && card.items.length > 0 ? (
                        <div className="space-y-2 mt-3">
                          {card.items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-2"></span>
                                <span className="truncate">{item.title}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {(item.attachment_count && item.attachment_count > 0) && (
                                  <span className="text-xs text-blue-500 flex items-center">
                                    <Paperclip className="w-3 h-3 mr-0.5" />
                                    {item.attachment_count}
                                  </span>
                                )}
                                {item.has_notes && (
                                  <span className="text-xs text-green-500 flex items-center">
                                    <MessageSquare className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {card.items.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{card.items.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="magic-card__description">{card.description}</p>
                      )}
                      {card.showViewMore && card.viewMorePath && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMore(card.viewMorePath!);
                          }}
                          className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                        >
                          View More
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </>
                  ) : isListCard(card) ? (
                    <>
                      <h2 className={`magic-card__title bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                        {card.title}
                      </h2>
                      <div className="space-y-2 mt-3">
                        {card.items?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-2"></span>
                              {item.title || item.name || item}
                            </div>
                            <div className="flex items-center space-x-1">
                              {(item.attachment_count && item.attachment_count > 0) && (
                                <span className="text-xs text-blue-500 flex items-center">
                                  <Paperclip className="w-3 h-3 mr-0.5" />
                                  {item.attachment_count}
                                </span>
                              )}
                              {item.has_notes && (
                                <span className="text-xs text-green-500 flex items-center">
                                  <MessageSquare className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {card.items?.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{card.items.length - 3} more
                          </div>
                        )}
                      </div>
                      {card.showViewMore && card.viewMorePath && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMore(card.viewMorePath!);
                          }}
                          className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                        >
                          View More
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="magic-card__title">{card.title}</h2>
                      <p className="magic-card__description">{card.description}</p>
                    </>
                  )}
                </div>
              </ParticleCard>
            );
          }

          return (
            <div
              key={index}
              {...cardProps}
              ref={(el) => {
                if (!el) return;

                const handleMouseMove = (e: MouseEvent) => {
                  if (shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;

                  if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    gsap.to(el, {
                      rotateX,
                      rotateY,
                      duration: 0.1,
                      ease: "power2.out",
                      transformPerspective: 1000,
                    });
                  }

                  if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.05;
                    const magnetY = (y - centerY) * 0.05;
                    gsap.to(el, {
                      x: magnetX,
                      y: magnetY,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }
                };

                const handleMouseLeave = () => {
                  if (shouldDisableAnimations) return;

                  if (enableTilt) {
                    gsap.to(el, {
                      rotateX: 0,
                      rotateY: 0,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }

                  if (enableMagnetism) {
                    gsap.to(el, {
                      x: 0,
                      y: 0,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }
                };

                const handleClick = (e: MouseEvent) => {
                  if (!clickEffect) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                  );

                  const ripple = document.createElement("div");
                  ripple.style.cssText = `
                    position: absolute;
                    width: ${maxDistance * 2}px;
                    height: ${maxDistance * 2}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                    left: ${x - maxDistance}px;
                    top: ${y - maxDistance}px;
                    pointer-events: none;
                    z-index: 1000;
                  `;

                  el.appendChild(ripple);

                  gsap.fromTo(
                    ripple,
                    {
                      scale: 0,
                      opacity: 1,
                    },
                    {
                      scale: 1,
                      opacity: 0,
                      duration: 0.8,
                      ease: "power2.out",
                      onComplete: () => ripple.remove(),
                    }
                  );
                };

                el.addEventListener("mouseenter", () => {});
                el.addEventListener("mouseleave", handleMouseLeave);
                el.addEventListener("mousemove", handleMouseMove);
                el.addEventListener("click", handleClick);

                return () => {
                  el.removeEventListener("mouseenter", () => {});
                  el.removeEventListener("mouseleave", handleMouseLeave);
                  el.removeEventListener("mousemove", handleMouseMove);
                  el.removeEventListener("click", handleClick);
                };
              }}
            >
              <div className="magic-card__header">
                <div className="magic-card__label">{card.label}</div>
              </div>
              <div className="magic-card__content">
                {isStatCard(card) ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{card.icon}</span>
                      <h2 className={`magic-card__title text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                        {card.title}
                      </h2>
                    </div>
                    {card.items && card.items.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {card.items.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-2"></span>
                              <span className="truncate">{item.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {(item.attachment_count && item.attachment_count > 0) && (
                                <span className="text-xs text-blue-500 flex items-center">
                                  <Paperclip className="w-3 h-3 mr-0.5" />
                                  {item.attachment_count}
                                </span>
                              )}
                              {item.has_notes && (
                                <span className="text-xs text-green-500 flex items-center">
                                  <MessageSquare className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {card.items.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{card.items.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="magic-card__description">{card.description}</p>
                    )}
                    {card.showViewMore && card.viewMorePath && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMore(card.viewMorePath!);
                        }}
                        className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                      >
                        View More
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </>
                ) : isListCard(card) ? (
                  <>
                    <h2 className={`magic-card__title bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {card.title}
                    </h2>
                    <div className="space-y-2 mt-3">
                      {card.items?.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-2"></span>
                            {item.title || item.name || item}
                          </div>
                          <div className="flex items-center space-x-1">
                            {(item.attachment_count && item.attachment_count > 0) && (
                              <span className="text-xs text-blue-500 flex items-center">
                                <Paperclip className="w-3 h-3 mr-0.5" />
                                {item.attachment_count}
                              </span>
                            )}
                            {item.has_notes && (
                              <span className="text-xs text-green-500 flex items-center">
                                <MessageSquare className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {card.items?.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{card.items.length - 3} more
                        </div>
                      )}
                    </div>
                    {card.showViewMore && card.viewMorePath && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMore(card.viewMorePath!);
                        }}
                        className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                      >
                        View More
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="magic-card__title">{card.title}</h2>
                    <p className="magic-card__description">{card.description}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
export { ParticleCard, GlobalSpotlight, BentoCardGrid };
